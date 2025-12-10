import type { AudioDevice } from '../../hooks/useAudioDevices';

interface AudioSelectorProps {
  devices: AudioDevice[];
  selectedDeviceId: string | null;
  onDeviceChange: (deviceId: string) => void;
  disabled?: boolean;
}

export function AudioSelector({
  devices,
  selectedDeviceId,
  onDeviceChange,
  disabled = false,
}: AudioSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-400 whitespace-nowrap">Audio:</label>
      <select
        value={selectedDeviceId || ''}
        onChange={(e) => onDeviceChange(e.target.value)}
        disabled={disabled}
        className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600
                   focus:border-blue-500 focus:outline-none disabled:opacity-50
                   disabled:cursor-not-allowed min-w-[150px]"
      >
        <option value="">Select audio input...</option>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
}
