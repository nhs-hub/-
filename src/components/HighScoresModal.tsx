import React from 'react';
import { ArrowLeft, Shield, Trophy } from 'lucide-react';
import { HighScore } from '../types/game';
import { FIGHTERS } from '../utils/storage';

interface HighScoresModalProps {
  scores: HighScore[];
  onClose: () => void;
}

export const HighScoresModal: React.FC<HighScoresModalProps> = ({ scores, onClose }) => {
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
          <Trophy className="w-5 h-5 text-amber-400" /> PILOT RANKING
        </h2>

        <div className="w-10" />
      </div>

      {/* Scores Table */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2 my-auto">
        {scores.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono">NO RECORDS FOUND</div>
        ) : (
          scores.map((item, index) => {
            const ship = FIGHTERS.find(f => f.id === item.fighterId) || FIGHTERS[0];
            const isTop3 = index < 3;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  index === 0
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : index === 1
                    ? 'bg-slate-800/40 border-slate-600/40'
                    : index === 2
                    ? 'bg-orange-950/30 border-orange-600/30'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {/* Rank Badge & Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center font-mono ${
                      index === 0
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                        : index === 1
                        ? 'bg-slate-300 text-slate-950'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      {item.name}
                      <Shield className="w-3 h-3" style={{ color: ship.color }} />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      STAGE {item.stage} • {item.date}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right font-mono font-black text-sm text-cyan-400">
                  {item.score.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Done Button */}
      <div className="w-full max-w-md mx-auto mt-6">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-sm uppercase tracking-wider transition-all"
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
};
