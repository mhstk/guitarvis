import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export function useCamera() {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const selectedDeviceId = useAppStore((s) => s.vision.deviceId);
  const setVisionDevice = useAppStore((s) => s.setVisionDevice);

  // Enumerate available cameras
  const enumerateDevices = useCallback(async () => {
    try {
      // First request permission to get labeled devices
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');

      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceInfos
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        }));

      setDevices(videoDevices);

      // Auto-select first device if none selected
      if (!selectedDeviceId && videoDevices.length > 0) {
        setVisionDevice(videoDevices[0].deviceId);
      }

      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setPermissionState('denied');
          setError('Camera permission denied. Please allow camera access.');
        } else {
          setError(`Failed to access camera: ${err.message}`);
        }
      }
    }
  }, [selectedDeviceId, setVisionDevice]);

  // Initialize on mount
  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  // Start camera stream for selected device
  const startStream = useCallback(async (deviceId: string) => {
    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(newStream);
      setError(null);
      return newStream;
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to start camera: ${err.message}`);
      }
      return null;
    }
  }, [stream]);

  // Select a different camera
  const selectDevice = useCallback(async (deviceId: string) => {
    setVisionDevice(deviceId);
    await startStream(deviceId);
  }, [startStream, setVisionDevice]);

  // Stop camera stream
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    devices,
    selectedDeviceId,
    stream,
    error,
    permissionState,
    selectDevice,
    startStream,
    stopStream,
    refreshDevices: enumerateDevices,
  };
}
