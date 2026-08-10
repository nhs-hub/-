import React from 'react';
import { Flame, Heart, Pause, Shield, Zap } from 'lucide-react';

interface HUDProps {
  score: number;
  highScore: number;
  wave: number;
  lives: number;
  health: number;
  maxHealth: number;
  bombs: number;
  bossHealth?: { current: number; max: number };
  onPause: () => void;
  onUseBomb: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  wave,
  lives,
  health,
  maxHealth,
  bombs,
  bossHealth,
  onPause,
  onUseBomb,
}) => {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between z-10 select-none">
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        {/* Score & Wave Badge */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">SCORE</span>
            <span className="text-xl font-black font-mono text-white tracking-wider drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            HI: <span className="text-slate-200">{Math.max(highScore, score).toLocaleString()}</span>
          </div>
        </div>

        {/* Center Wave Badge */}
        <div className="bg-slate-900/80 border border-cyan-500/30 backdrop-blur px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-cyan-300 tracking-wider">WAVE {wave}</span>
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="pointer-events-auto p-2 bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shadow-md"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>

      {/* Boss Health Bar (If Boss Active) */}
      {bossHealth && (
        <div className="w-full max-w-sm mx-auto bg-slate-950/90 border border-rose-500/50 p-2 rounded-xl backdrop-blur-md shadow-2xl flex flex-col gap-1 my-2">
          <div className="flex justify-between items-center text-[11px] font-bold text-rose-400 tracking-wider">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-bounce" /> ALIEN FLAGSHIP BOSS
            </span>
            <span>{Math.ceil((bossHealth.current / bossHealth.max) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-rose-950">
            <div
              className="bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400 h-full transition-all duration-150 rounded-full"
              style={{ width: `${(bossHealth.current / bossHealth.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Status Row */}
      <div className="flex items-end justify-between">
        {/* Lives & Health Bar */}
        <div className="flex flex-col gap-1.5 w-36 sm:w-44 bg-slate-900/80 p-2 rounded-xl border border-slate-800 backdrop-blur shadow-md">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> HULL
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: lives }).map((_, i) => (
                <Heart key={i} className="w-3 h-3 text-rose-500 fill-rose-500" />
              ))}
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-200 rounded-full ${
                healthPercent > 50
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  : healthPercent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Smart Bomb Button */}
        <button
          onClick={onUseBomb}
          disabled={bombs <= 0}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
            bombs > 0
              ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border border-rose-400/50 hover:brightness-110 shadow-rose-900/50'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>BOMB ({bombs})</span>
        </button>
      </div>
    </div>
  );
};
