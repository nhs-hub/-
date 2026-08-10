import React from 'react';
import { ArrowLeft, Gamepad2, Settings, Smartphone, Volume2, VolumeX, Zap } from 'lucide-react';
import { ControlMode, GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleControlModeChange = (mode: ControlMode) => {
    onUpdateSettings({ ...settings, controlMode: mode });
  };

  const handleToggleAutoFire = () => {
    onUpdateSettings({ ...settings, autoFire: !settings.autoFire });
  };

  const handleToggleVibration = () => {
    onUpdateSettings({ ...settings, vibration: !settings.vibration });
  };

  const handleToggleSound = () => {
    onUpdateSettings({
      ...settings,
      audio: { ...settings.audio, soundEnabled: !settings.audio.soundEnabled },
    });
  };

  const handleToggleMusic = () => {
    onUpdateSettings({
      ...settings,
      audio: { ...settings.audio, musicEnabled: !settings.audio.musicEnabled },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white p-6 overflow-y-auto select-none">
      {/* Header Bar */}
      <div className="w-full max-w-md mx-auto flex justify-between items-center mb-6">
        <button
          onClick={onClose}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" /> GAME SETTINGS
        </h2>

        <div className="w-10" />
      </div>

      {/* Settings Form */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-5 my-auto">
        {/* Mobile Control Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            CONTROL SCHEME
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleControlModeChange('DIRECT_TOUCH')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                settings.controlMode === 'DIRECT_TOUCH'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-bold">DIRECT TOUCH</span>
              <span className="text-[10px] text-slate-400">Drag finger directly</span>
            </button>

            <button
              onClick={() => handleControlModeChange('KEYBOARD_MOUSE')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                settings.controlMode === 'KEYBOARD_MOUSE'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-xs font-bold">KEYBOARD / D-PAD</span>
              <span className="text-[10px] text-slate-400">WASD / Arrow Keys</span>
            </button>
          </div>
        </div>

        {/* Toggles List */}
        <div className="flex flex-col gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          {/* Auto Fire */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">AUTO FIRE</span>
              <span className="text-xs text-slate-400">Continuous shooting without rapid tapping</span>
            </div>
            <button
              onClick={handleToggleAutoFire}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.autoFire ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.autoFire ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Haptic Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">HAPTIC VIBRATION</span>
              <span className="text-xs text-slate-400">Tactile feedback on hits & explosions</span>
            </div>
            <button
              onClick={handleToggleVibration}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.vibration ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.vibration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Sound Effects */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">SOUND EFFECTS</span>
              <span className="text-xs text-slate-400">Lasers, explosions, & powerup chimes</span>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.audio.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.audio.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-800" />

          {/* BGM Music */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">BACKGROUND BGM</span>
              <span className="text-xs text-slate-400">Chiptune arcade space theme</span>
            </div>
            <button
              onClick={handleToggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.audio.musicEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.audio.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <div className="w-full max-w-md mx-auto mt-6">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm uppercase tracking-wider transition-all"
        >
          SAVE SETTINGS
        </button>
      </div>
    </div>
  );
};
