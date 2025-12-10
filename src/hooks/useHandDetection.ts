import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useAppStore } from '../store/useAppStore';
import { PositionSmoother, Landmark, getHandPositionX } from '../utils/handTracking';
import { estimateFret, isInDetectionZone } from '../utils/calibration';

export interface HandDetectionState {
  isLoading: boolean;
  isDetecting: boolean;
  error: string | null;
}

export function useHandDetection(videoElement: HTMLVideoElement | null) {
  const [state, setState] = useState<HandDetectionState>({
    isLoading: true,
    isDetecting: false,
    error: null,
  });

  const setVisionState = useAppStore((s) => s.setVisionState);
  const calibration = useAppStore((s) => s.calibration);
  const calibrationStep = useAppStore((s) => s.calibrationStep);

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const smootherRef = useRef<PositionSmoother>(new PositionSmoother(5));
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);

  // Initialize MediaPipe Hand Landmarker
  useEffect(() => {
    let isMounted = true;

    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2, // Detect both hands so we can filter out the picking hand
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isMounted) {
          handLandmarkerRef.current = handLandmarker;
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
          setVisionState({ isLoading: false });
        }
      } catch (err) {
        console.error('Failed to initialize hand landmarker:', err);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to initialize hand detection',
          }));
          setVisionState({ isLoading: false });
        }
      }
    };

    initHandLandmarker();

    return () => {
      isMounted = false;
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setVisionState]);

  // Process detection results
  const processResults = useCallback((results: HandLandmarkerResult) => {
    if (results.landmarks && results.landmarks.length > 0) {
      // Find a hand that's in the valid detection zone (not in picking zone)
      let validLandmarks: Landmark[] | null = null;
      let validWristX: number | null = null;

      for (const handLandmarks of results.landmarks) {
        const landmarks = handLandmarks as Landmark[];
        const wristX = getHandPositionX(landmarks);

        // If we have calibration AND we're not in calibration mode, check if this hand is in the valid zone
        // During calibration, we want to detect all hands (including the picking hand for step 1)
        if (calibration && calibrationStep === 'none') {
          if (isInDetectionZone(wristX, calibration)) {
            validLandmarks = landmarks;
            validWristX = wristX;
            break; // Use the first valid hand
          }
        } else {
          // No calibration yet OR we're in calibration mode - use the first hand detected
          validLandmarks = landmarks;
          validWristX = wristX;
          break;
        }
      }

      if (validLandmarks && validWristX !== null) {
        const smoothedX = smootherRef.current.add(validWristX);

        // Calculate estimated fret if calibrated
        let estFret = 0;
        if (calibration) {
          estFret = estimateFret(smoothedX, calibration);
        }

        setState(prev => ({
          ...prev,
          isDetecting: true,
        }));

        setVisionState({
          isTracking: true,
          handDetected: true,
          landmarks: validLandmarks,
          smoothedWristX: smoothedX,
          estimatedFret: estFret,
        });
      } else {
        // All detected hands are in the picking zone or no valid hand found
        // Keep the last known position - don't reset smoother or clear values
        // This prevents flickering when hand detection briefly fails
        setState(prev => ({
          ...prev,
          isDetecting: false,
        }));

        // Only update handDetected to false, keep other values (smoothedWristX, estimatedFret)
        setVisionState({
          handDetected: false,
          landmarks: null,
          // smoothedWristX and estimatedFret are intentionally NOT cleared
        });
      }
    } else {
      // No landmarks detected at all
      // Keep the last known position to prevent flickering
      setState(prev => ({
        ...prev,
        isDetecting: false,
      }));

      setVisionState({
        handDetected: false,
        landmarks: null,
        // smoothedWristX and estimatedFret are intentionally NOT cleared
      });
    }
  }, [calibration, calibrationStep, setVisionState]);

  // Detection loop
  const runDetection = useCallback(() => {
    if (!handLandmarkerRef.current || !videoElement || videoElement.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    const now = performance.now();
    // Target ~15-20 FPS (every ~50-66ms)
    if (now - lastDetectionTimeRef.current < 50) {
      animationFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    lastDetectionTimeRef.current = now;

    try {
      const results = handLandmarkerRef.current.detectForVideo(videoElement, now);
      processResults(results);
    } catch (err) {
      console.error('Detection error:', err);
    }

    animationFrameRef.current = requestAnimationFrame(runDetection);
  }, [videoElement, processResults]);

  // Start/stop detection based on video element
  useEffect(() => {
    if (videoElement && !state.isLoading && handLandmarkerRef.current) {
      setVisionState({ isTracking: true });
      animationFrameRef.current = requestAnimationFrame(runDetection);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement, state.isLoading, runDetection, setVisionState]);

  // Reset smoother when needed
  const resetSmoother = useCallback(() => {
    smootherRef.current.reset();
  }, []);

  return {
    ...state,
    resetSmoother,
  };
}
