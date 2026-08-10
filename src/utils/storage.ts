import { FighterId, FighterSpec, GameSettings, HighScore } from '../types/game';

const HIGH_SCORES_KEY = 'galaxy_shooter_high_scores';
const SETTINGS_KEY = 'galaxy_shooter_settings';
const UNLOCKS_KEY = 'galaxy_shooter_unlocked_fighters';

export const FIGHTERS: FighterSpec[] = [
  {
    id: 'FALCON',
    name: 'Galaxy Falcon',
    description: 'Balanced classic fighter with standard energy cannons.',
    speed: 6.5,
    maxHealth: 100,
    attackPower: 1.0,
    specialAbility: 'Rapid Dual Shot',
    color: '#38bdf8',
    accentColor: '#0284c7',
    unlocked: true,
    scoreRequired: 0,
  },
  {
    id: 'PHOENIX',
    name: 'Phoenix Red',
    description: 'High firepower heavy fighter with built-in 3-way spread lasers.',
    speed: 5.5,
    maxHealth: 120,
    attackPower: 1.25,
    specialAbility: '3-Way Spread Fire',
    color: '#f87171',
    accentColor: '#dc2626',
    unlocked: false,
    scoreRequired: 5000,
  },
  {
    id: 'AEGIS',
    name: 'Aegis Sentinel',
    description: 'Defense-oriented flagship equipped with a front force shield.',
    speed: 5.0,
    maxHealth: 160,
    attackPower: 0.9,
    specialAbility: 'Front Shield & Barrier',
    color: '#4ade80',
    accentColor: '#16a34a',
    unlocked: false,
    scoreRequired: 12000,
  },
  {
    id: 'VOID',
    name: 'Void Interceptor',
    description: 'Hyper-fast stealth fighter armed with piercing plasma beams.',
    speed: 8.0,
    maxHealth: 90,
    attackPower: 1.4,
    specialAbility: 'Piercing Plasma Beam',
    color: '#c084fc',
    accentColor: '#9333ea',
    unlocked: false,
    scoreRequired: 25000,
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  controlMode: 'DIRECT_TOUCH',
  autoFire: true,
  vibration: true,
  sensitivity: 1.2,
  audio: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.8,
  },
};

export const DEFAULT_HIGH_SCORES: HighScore[] = [
  { id: '1', name: 'COMMANDER_ACE', score: 28500, stage: 12, date: '2026-08-01', fighterId: 'VOID' },
  { id: '2', name: 'STAR_LORD', score: 19200, stage: 9, date: '2026-08-03', fighterId: 'PHOENIX' },
  { id: '3', name: 'GALAGA_PRO', score: 12400, stage: 6, date: '2026-08-05', fighterId: 'FALCON' },
  { id: '4', name: 'PILOT_NOVA', score: 8500, stage: 4, date: '2026-08-08', fighterId: 'AEGIS' },
  { id: '5', name: 'CADET_SKY', score: 3200, stage: 2, date: '2026-08-09', fighterId: 'FALCON' },
];

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function loadHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return DEFAULT_HIGH_SCORES;
}

export function saveHighScore(newEntry: Omit<HighScore, 'id' | 'date'>): HighScore[] {
  const scores = loadHighScores();
  const entry: HighScore = {
    ...newEntry,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
  };
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, 10);
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(trimmed));
  } catch {}
  return trimmed;
}

export function loadUnlockedFighters(): Record<FighterId, boolean> {
  const defaults: Record<FighterId, boolean> = {
    FALCON: true,
    PHOENIX: false,
    AEGIS: false,
    VOID: false,
  };
  try {
    const raw = localStorage.getItem(UNLOCKS_KEY);
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch {}
  return defaults;
}

export function checkAndUnlockFighters(highScore: number): FighterId[] {
  const currentUnlocks = loadUnlockedFighters();
  const newlyUnlocked: FighterId[] = [];

  FIGHTERS.forEach(fighter => {
    if (!currentUnlocks[fighter.id] && highScore >= fighter.scoreRequired) {
      currentUnlocks[fighter.id] = true;
      newlyUnlocked.push(fighter.id);
    }
  });

  if (newlyUnlocked.length > 0) {
    try {
      localStorage.setItem(UNLOCKS_KEY, JSON.stringify(currentUnlocks));
    } catch {}
  }

  return newlyUnlocked;
}
