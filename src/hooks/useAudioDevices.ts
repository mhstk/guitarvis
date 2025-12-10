import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export interface UseAudioDevicesReturn {
  devices: AudioDevice[];
  selectedDeviceId: string | null;
  setSelectedDeviceId: (deviceId: string) => void;
  permissionState: 'prompt' | 'granted' | 'denied' | 'error';
  errorMessage: string | null;
  requestPermission: () => Promise<boolean>;
  refreshDevices: () => Promise<void>;
}

export function useAudioDevices(): UseAudioDevicesReturn {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'error'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedDeviceId = useAppStore((s) => s.audio.deviceId);
  const setAudioDevice = useAppStore((s) => s.setAudioDevice);

  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter(device => device.kind === 'audioinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${index + 1}`,
        }));

      setDevices(audioInputs);

      // If no device is selected, select the first one
      if (!selectedDeviceId && audioInputs.length > 0) {
        setAudioDevice(audioInputs[0].deviceId);
      }

      // Verify selected device still exists
      if (selectedDeviceId && !audioInputs.find(d => d.deviceId === selectedDeviceId)) {
        if (audioInputs.length > 0) {
          setAudioDevice(audioInputs[0].deviceId);
        } else {
          setAudioDevice(null);
        }
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setErrorMessage('Failed to list audio devices');
    }
  }, [selectedDeviceId, setAudioDevice]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setErrorMessage(null);

      // Request permission by getting a temporary stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Stop the temporary stream
      stream.getTracks().forEach(track => track.stop());

      setPermissionState('granted');
      await enumerateDevices();
      return true;
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage('Microphone permission denied. Please allow access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setPermissionState('error');
        setErrorMessage('No audio input devices found. Please connect a microphone or audio interface.');
      } else {
        setPermissionState('error');
        setErrorMessage(`Failed to access microphone: ${error.message}`);
      }
      return false;
    }
  }, [enumerateDevices]);

  const setSelectedDeviceId = useCallback((deviceId: string) => {
    setAudioDevice(deviceId);
  }, [setAudioDevice]);

  const refreshDevices = useCallback(async () => {
    await enumerateDevices();
  }, [enumerateDevices]);

  // Listen for device changes
  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, [enumerateDevices]);

  // Request permission on mount (like camera does)
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Request permission by getting a temporary stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        // Stop the temporary stream
        stream.getTracks().forEach(track => track.stop());
        setPermissionState('granted');
        await enumerateDevices();
      } catch (err) {
        const error = err as Error;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionState('denied');
          setErrorMessage('Microphone permission denied. Please allow access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setPermissionState('error');
          setErrorMessage('No audio input devices found.');
        } else {
          // Try to enumerate anyway
          enumerateDevices();
        }
      }
    };

    initializeAudio();
  }, [enumerateDevices]);

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    permissionState,
    errorMessage,
    requestPermission,
    refreshDevices,
  };
}
