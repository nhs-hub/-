import React from 'react';
import { Home, Play, Volume2, VolumeX } from 'lucide-react';
import { GameSettings } from '../types/game';

interface PauseModalProps {
  settings: GameSettings;
  onResume: () => void;
  onHome: () => void;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  settings,
  onResume,
  onHome,
  onToggleSound,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center gap-5">
        <h2 className="text-2xl font-black tracking-wider text-cyan-400">GAME PAUSED</h2>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-950/50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME MISSION</span>
          </button>

          <button
            onClick={onToggleSound}
            className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700/60 hover:bg-slate-700/60 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            {settings.audio.soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>SOUND: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>SOUND: OFF</span>
              </>
            )}
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>ABORT TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
