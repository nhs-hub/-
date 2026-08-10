import React, { useState } from 'react';
import { Crosshair, RotateCcw, Trophy, Zap } from 'lucide-react';
import { FighterId, GameStats } from '../types/game';

interface GameOverModalProps {
  stats: GameStats;
  highScore: number;
  fighterId: FighterId;
  onRestart: () => void;
  onHome: () => void;
  onSubmitHighScore: (name: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  onRestart,
  onHome,
  onSubmitHighScore,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isNewHighScore = stats.score > highScore;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    onSubmitHighScore(playerName.trim().toUpperCase().slice(0, 12));
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white flex flex-col gap-5">
        {/* Header Title */}
        <div className="text-center">
          {isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 animate-bounce">
              <Trophy className="w-3.5 h-3.5" /> NEW HIGH SCORE!
            </div>
          ) : (
            <div className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">
              MISSION FAILED
            </div>
          )}

          <h2 className="text-3xl font-black tracking-tight text-white">GAME OVER</h2>
        </div>

        {/* Score Display */}
        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 text-center">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">FINAL SCORE</div>
          <div className="text-4xl font-black font-mono text-cyan-400 mt-1 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> WAVE
            </span>
            <span className="text-sm font-bold text-white mt-0.5">{stats.wave}</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-slate-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-rose-400" /> ACCURACY
            </span>
            <span className="text-sm font-bold text-white mt-0.5">{stats.accuracy}%</span>
          </div>
        </div>

        {/* High Score Submission Form */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-xs text-slate-300 font-medium">ENTER PILOT CALLSIGN:</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={12}
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="ACE_PILOT"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm font-mono uppercase tracking-wider text-white outline-none"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                SAVE
              </button>
            </div>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-950/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
