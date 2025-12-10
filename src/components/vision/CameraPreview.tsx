import { useRef, useEffect } from 'react';
import { Landmark, HAND_CONNECTIONS } from '../../utils/handTracking';

interface CameraPreviewProps {
  stream: MediaStream | null;
  landmarks: Landmark[] | null;
  onVideoRef: (video: HTMLVideoElement | null) => void;
  mirrored?: boolean;
  compact?: boolean;
  maxHeight?: string; // e.g., '45vh'
}

export function CameraPreview({
  stream,
  landmarks,
  onVideoRef,
  mirrored = true,
  compact = false,
  maxHeight,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      onVideoRef(videoRef.current);
    }
    return () => {
      onVideoRef(null);
    };
  }, [stream, onVideoRef]);

  // Draw landmarks on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    const updateCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    const drawLandmarks = () => {
      updateCanvasSize();

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!landmarks || landmarks.length === 0) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw connections
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;

      for (const [start, end] of HAND_CONNECTIONS) {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];

        if (startLandmark && endLandmark) {
          const startX = startLandmark.x * width;
          const startY = startLandmark.y * height;
          const endX = endLandmark.x * width;
          const endY = endLandmark.y * height;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      // Draw landmark points
      for (let i = 0; i < landmarks.length; i++) {
        const landmark = landmarks[i];
        const x = landmark.x * width;
        const y = landmark.y * height;

        // Wrist is highlighted differently
        if (i === 0) {
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillStyle = '#00ff00';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    };

    drawLandmarks();
  }, [landmarks]);

  const containerClass = compact
    ? 'w-48 h-36 rounded-lg overflow-hidden shadow-lg'
    : 'w-full rounded-lg overflow-hidden';

  const containerStyle = maxHeight ? { maxHeight } : undefined;

  return (
    <div className={`relative bg-black ${containerClass}`} style={containerStyle}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full ${maxHeight ? 'object-contain' : 'object-cover'} ${mirrored ? 'scale-x-[-1]' : ''}`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full pointer-events-none ${
          mirrored ? 'scale-x-[-1]' : ''
        }`}
      />
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <span className="text-gray-400 text-sm">No camera</span>
        </div>
      )}
    </div>
  );
}
