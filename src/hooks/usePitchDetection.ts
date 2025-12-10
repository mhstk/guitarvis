import { useState, useEffect, useRef, useCallback } from 'react';
import { PitchDetector } from 'pitchy';
import { useAppStore } from '../store/useAppStore';
import { frequencyToNoteInfo, isGuitarRange } from '../utils/musicTheory';

export type ConnectionStatus = 'idle' | 'connecting' | 'listening' | 'error';

export interface UsePitchDetectionReturn {
  status: ConnectionStatus;
  errorMessage: string | null;
  sampleRate: number | null;
  startListening: (deviceId: string) => Promise<void>;
  stopListening: () => void;
  startTestTone: (frequency: number) => void;
}

const CLARITY_THRESHOLD = 0.9;
const FFT_SIZE = 4096;
const MIN_VOLUME_THRESHOLD = 0.01;

export function usePitchDetection(): UsePitchDetectionReturn {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sampleRate, setSampleRate] = useState<number | null>(null);

  const setAudioState = useAppStore((s) => s.setAudioState);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const stopListening = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop oscillator if running
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    detectorRef.current = null;
    dataArrayRef.current = null;

    setStatus('idle');
    setAudioState({
      isListening: false,
      currentNote: null,
      inputLevel: 0,
      clarity: 0,
    });
  }, [setAudioState]);

  const startListening = useCallback(async (deviceId: string) => {
    // Clean up any existing audio
    stopListening();

    setStatus('connecting');
    setErrorMessage(null);

    try {
      // Get audio stream with clean guitar signal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;

      // Create audio context and nodes
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      console.log('AudioContext sample rate:', audioContext.sampleRate);
      setSampleRate(audioContext.sampleRate);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Initialize pitch detector
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
      dataArrayRef.current = new Float32Array(analyser.fftSize);

      setStatus('listening');
      setAudioState({ isListening: true });

      // Start detection loop
      const detectPitch = () => {
        if (!analyserRef.current || !detectorRef.current || !dataArrayRef.current || !audioContextRef.current) {
          return;
        }

        // Get time domain data
        analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);

        // Calculate input level (RMS)
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i] * dataArrayRef.current[i];
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);
        const inputLevel = Math.min(rms * 5, 1);

        // Only detect pitch if there's enough signal
        if (rms > MIN_VOLUME_THRESHOLD) {
          const [pitch, pitchClarity] = detectorRef.current.findPitch(
            dataArrayRef.current,
            audioContextRef.current.sampleRate
          );

          if (pitchClarity >= CLARITY_THRESHOLD && pitch > 0 && isGuitarRange(pitch)) {
            const noteInfo = frequencyToNoteInfo(pitch);
            setAudioState({
              currentNote: noteInfo,
              inputLevel,
              clarity: pitchClarity,
            });
          } else {
            setAudioState({
              currentNote: null,
              inputLevel,
              clarity: pitchClarity,
            });
          }
        } else {
          setAudioState({
            currentNote: null,
            inputLevel,
            clarity: 0,
          });
        }

        animationFrameRef.current = requestAnimationFrame(detectPitch);
      };

      detectPitch();
    } catch (err) {
      const error = err as Error;
      setStatus('error');
      setErrorMessage(`Failed to start audio: ${error.message}`);
      stopListening();
    }
  }, [stopListening, setAudioState]);

  // Start a test tone at a known frequency (for debugging)
  const startTestTone = useCallback((frequency: number) => {
    // Clean up any existing audio
    stopListening();

    setStatus('connecting');
    setErrorMessage(null);

    try {
      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      console.log('Test tone - AudioContext sample rate:', audioContext.sampleRate);
      console.log('Test tone - Target frequency:', frequency, 'Hz');
      setSampleRate(audioContext.sampleRate);

      // Create analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyserRef.current = analyser;

      // Create oscillator with known frequency
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillatorRef.current = oscillator;

      // Connect oscillator -> analyser (not to destination, so no sound output)
      oscillator.connect(analyser);

      // Start oscillator
      oscillator.start();

      // Initialize pitch detector
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
      dataArrayRef.current = new Float32Array(analyser.fftSize);

      setStatus('listening');
      setAudioState({ isListening: true });

      // Start detection loop
      const detectPitch = () => {
        if (!analyserRef.current || !detectorRef.current || !dataArrayRef.current || !audioContextRef.current) {
          return;
        }

        analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);

        // Calculate input level (RMS)
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i] * dataArrayRef.current[i];
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);
        const inputLevel = Math.min(rms * 5, 1);

        if (rms > MIN_VOLUME_THRESHOLD) {
          const [pitch, pitchClarity] = detectorRef.current.findPitch(
            dataArrayRef.current,
            audioContextRef.current.sampleRate
          );

          console.log('Test tone - Detected:', pitch.toFixed(2), 'Hz, clarity:', pitchClarity.toFixed(3));

          if (pitchClarity >= CLARITY_THRESHOLD && pitch > 0) {
            const noteInfo = frequencyToNoteInfo(pitch);
            setAudioState({
              currentNote: noteInfo,
              inputLevel,
              clarity: pitchClarity,
            });
          } else {
            setAudioState({
              currentNote: null,
              inputLevel,
              clarity: pitchClarity,
            });
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectPitch);
      };

      detectPitch();
    } catch (err) {
      const error = err as Error;
      setStatus('error');
      setErrorMessage(`Failed to start test tone: ${error.message}`);
      stopListening();
    }
  }, [stopListening, setAudioState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    status,
    errorMessage,
    sampleRate,
    startListening,
    stopListening,
    startTestTone,
  };
}
