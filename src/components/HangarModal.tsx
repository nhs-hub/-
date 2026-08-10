import React from 'react';
import { ArrowLeft, Check, Lock, Shield, Sparkles, Zap } from 'lucide-react';
import { FighterId } from '../types/game';
import { FIGHTERS, loadUnlockedFighters } from '../utils/storage';

interface HangarModalProps {
  selectedFighter: FighterId;
  highScore: number;
  onSelectFighter: (id: FighterId) => void;
  onClose: () => void;
}

export const HangarModal: React.FC<HangarModalProps> = ({
  selectedFighter,
  highScore,
  onSelectFighter,
  onClose,
}) => {
  const unlocks = loadUnlockedFighters();

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
          <Sparkles className="w-5 h-5 text-cyan-400" /> FIGHTER HANGAR
        </h2>

        <div className="w-10" />
      </div>

      {/* Fighters Grid */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-4 my-auto">
        {FIGHTERS.map(fighter => {
          const isUnlocked = unlocks[fighter.id] || highScore >= fighter.scoreRequired;
          const isSelected = selectedFighter === fighter.id;

          return (
            <div
              key={fighter.id}
              onClick={() => {
                if (isUnlocked) onSelectFighter(fighter.id);
              }}
              className={`p-4 rounded-2xl border transition-all ${
                isUnlocked
                  ? isSelected
                    ? 'bg-slate-900/90 border-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 cursor-pointer'
                  : 'bg-slate-950/60 border-slate-900 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner"
                    style={{ backgroundColor: `${fighter.color}15`, borderColor: fighter.color }}
                  >
                    <Shield className="w-6 h-6" style={{ color: fighter.color }} />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      {fighter.name}
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{fighter.description}</p>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    <span>{fighter.scoreRequired.toLocaleString()} PTS</span>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-mono">SPEED</span>
                  <span className="font-bold text-slate-200">{fighter.speed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-mono">ATTACK</span>
                  <span className="font-bold text-slate-200">{fighter.attackPower}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-mono">HULL</span>
                  <span className="font-bold text-slate-200">{fighter.maxHealth} HP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Select Confirm Button */}
      <div className="w-full max-w-md mx-auto mt-6">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm uppercase tracking-wider transition-all"
        >
          CONFIRM SELECTION
        </button>
      </div>
    </div>
  );
};
