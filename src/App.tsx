import React, { useEffect, useState } from 'react';
import { GameOverModal } from './components/GameOverModal';
import { GameCanvas } from './components/GameCanvas';
import { HangarModal } from './components/HangarModal';
import { HighScoresModal } from './components/HighScoresModal';
import { HUD } from './components/HUD';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { StartMenu } from './components/StartMenu';
import { FighterId, GameSettings, GameStats, HighScore } from './types/game';
import { soundEngine } from './utils/audio';
import {
  checkAndUnlockFighters,
  loadHighScores,
  loadSettings,
  saveHighScore,
  saveSettings,
} from './utils/storage';

export default function App() {
  const [status, setStatus] = useState<'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'HANGAR' | 'SETTINGS' | 'HIGHSCORES'>('MENU');
  const [fighterId, setFighterId] = useState<FighterId>('FALCON');
  const [settings, setSettings] = useState<GameSettings>(loadSettings());
  const [highScores, setHighScores] = useState<HighScore[]>(loadHighScores());

  // Current In-Game Stats for HUD
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [bombs, setBombs] = useState(2);
  const [bossHealth, setBossHealth] = useState<{ current: number; max: number } | undefined>(undefined);
  const [lastGameOverStats, setLastGameOverStats] = useState<GameStats | null>(null);

  const highestScore = highScores.length > 0 ? Math.max(...highScores.map(s => s.score)) : 0;

  // Persist settings changes
  useEffect(() => {
    saveSettings(settings);
    soundEngine.setSoundEnabled(settings.audio.soundEnabled);
    soundEngine.setMusicEnabled(settings.audio.musicEnabled);
  }, [settings]);

  // Handle BGM playback state
  useEffect(() => {
    if (status === 'PLAYING') {
      soundEngine.startBGM();
    } else {
      soundEngine.stopBGM();
    }
  }, [status]);

  const handleStartGame = () => {
    soundEngine.playStageClear();
    setStatus('PLAYING');
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
    }
  };

  const handleResume = () => {
    setStatus('PLAYING');
  };

  const handleGameOver = (finalStats: GameStats) => {
    setLastGameOverStats(finalStats);
    setStatus('GAMEOVER');

    // Check if new fighter unlocked
    checkAndUnlockFighters(finalStats.score);
  };

  const handleUpdateStats = (
    cScore: number,
    cWave: number,
    cLives: number,
    cHealth: number,
    cMaxHealth: number,
    cBombs: number,
    cBossHealth?: { current: number; max: number }
  ) => {
    setScore(cScore);
    setWave(cWave);
    setLives(cLives);
    setHealth(cHealth);
    setMaxHealth(cMaxHealth);
    setBombs(cBombs);
    setBossHealth(cBossHealth);
  };

  const handleSubmitHighScore = (name: string) => {
    if (!lastGameOverStats) return;
    const updated = saveHighScore({
      name,
      score: lastGameOverStats.score,
      stage: lastGameOverStats.wave,
      fighterId,
    });
    setHighScores(updated);
  };

  const handleToggleSound = () => {
    const updated = {
      ...settings,
      audio: { ...settings.audio, soundEnabled: !settings.audio.soundEnabled },
    };
    setSettings(updated);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* Game Canvas Container */}
      {status !== 'MENU' && status !== 'HANGAR' && status !== 'SETTINGS' && status !== 'HIGHSCORES' && (
        <GameCanvas
          fighterId={fighterId}
          settings={settings}
          onGameOver={handleGameOver}
          onPause={handlePause}
          isPaused={status === 'PAUSED'}
          onUpdateStats={handleUpdateStats}
        />
      )}

      {/* Playing HUD Overlay */}
      {(status === 'PLAYING' || status === 'PAUSED') && (
        <HUD
          score={score}
          highScore={highestScore}
          wave={wave}
          lives={lives}
          health={health}
          maxHealth={maxHealth}
          bombs={bombs}
          bossHealth={bossHealth}
          onPause={handlePause}
          onUseBomb={() => {
            // Trigger bomb via keyboard event trigger in canvas or direct handling
            const event = new KeyboardEvent('keydown', { code: 'KeyB' });
            window.dispatchEvent(event);
          }}
        />
      )}

      {/* Main Start Menu */}
      {status === 'MENU' && (
        <StartMenu
          selectedFighter={fighterId}
          settings={settings}
          highScore={highestScore}
          onStartGame={handleStartGame}
          onOpenHangar={() => setStatus('HANGAR')}
          onOpenHighScores={() => setStatus('HIGHSCORES')}
          onOpenSettings={() => setStatus('SETTINGS')}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Pause Modal */}
      {status === 'PAUSED' && (
        <PauseModal
          settings={settings}
          onResume={handleResume}
          onHome={() => setStatus('MENU')}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Game Over Modal */}
      {status === 'GAMEOVER' && lastGameOverStats && (
        <GameOverModal
          stats={lastGameOverStats}
          highScore={highestScore}
          fighterId={fighterId}
          onRestart={handleStartGame}
          onHome={() => setStatus('MENU')}
          onSubmitHighScore={handleSubmitHighScore}
        />
      )}

      {/* Hangar Modal */}
      {status === 'HANGAR' && (
        <HangarModal
          selectedFighter={fighterId}
          highScore={highestScore}
          onSelectFighter={id => setFighterId(id)}
          onClose={() => setStatus('MENU')}
        />
      )}

      {/* Settings Modal */}
      {status === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setStatus('MENU')}
        />
      )}

      {/* High Scores Leaderboard */}
      {status === 'HIGHSCORES' && (
        <HighScoresModal
          scores={highScores}
          onClose={() => setStatus('MENU')}
        />
      )}
    </div>
  );
}
