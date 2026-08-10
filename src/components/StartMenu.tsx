import React from 'react';
import { Gamepad2, Play, Settings, Shield, Smartphone, Trophy, Volume2, VolumeX } from 'lucide-react';
import { FighterId, GameSettings } from '../types/game';
import { FIGHTERS } from '../utils/storage';

interface StartMenuProps {
  selectedFighter: FighterId;
  settings: GameSettings;
  highScore: number;
  onStartGame: () => void;
  onOpenHangar: () => void;
  onOpenHighScores: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  selectedFighter,
  settings,
  highScore,
  onStartGame,
  onOpenHangar,
  onOpenHighScores,
  onOpenSettings,
  onToggleSound,
}) => {
  const currentShip = FIGHTERS.find(f => f.id === selectedFighter) || FIGHTERS[0];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-slate-950 text-white overflow-y-auto select-none">
      {/* Decorative Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center z-10">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-cyan-500/20">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>BEST: {highScore.toLocaleString()}</span>
        </div>

        <button
          onClick={onToggleSound}
          className="p-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
        >
          {settings.audio.soundEnabled ? (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-rose-400" />
          )}
        </button>
      </div>

      {/* Title & Banner */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-md w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-3 animate-pulse">
          <Smartphone className="w-3.5 h-3.5" /> MOBILE TOUCH OPTIMIZED
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
          GALAXY SHOOTER
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          Classic Galaga Arcade Space Action
        </p>

        {/* Selected Ship Preview Card */}
        <div
          onClick={onOpenHangar}
          className="w-full mt-6 p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner"
              style={{ backgroundColor: `${currentShip.color}15`, borderColor: currentShip.color }}
            >
              <Shield className="w-6 h-6" style={{ color: currentShip.color }} />
            </div>

            <div className="text-left">
              <div className="text-xs text-slate-400 uppercase font-mono">ACTIVE FIGHTER</div>
              <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {currentShip.name}
              </div>
              <div className="text-[11px] text-cyan-400 font-medium">{currentShip.specialAbility}</div>
            </div>
          </div>

          <span className="text-xs text-slate-400 group-hover:text-cyan-400 font-bold tracking-wider uppercase underline underline-offset-4">
            CHANGE &gt;
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 mt-6">
          <button
            onClick={onStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-lg tracking-wider shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>START MISSION</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onOpenHighScores}
              className="py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>RANKING</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>SETTINGS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Hint Footer */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center text-[11px] text-slate-400 z-10 flex items-center justify-center gap-2">
        <Gamepad2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          <strong className="text-slate-200">Mobile:</strong> Touch & Drag finger |{' '}
          <strong className="text-slate-200">Desktop:</strong> Arrow Keys / WASD + Space
        </span>
      </div>
    </div>
  );
};
