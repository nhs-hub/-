export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY' | 'HANGAR';

export type ControlMode = 'DIRECT_TOUCH' | 'VIRTUAL_JOYSTICK' | 'KEYBOARD_MOUSE';

export type FighterId = 'FALCON' | 'PHOENIX' | 'AEGIS' | 'VOID';

export interface FighterSpec {
  id: FighterId;
  name: string;
  description: string;
  speed: number; // Base movement speed
  maxHealth: number; // Max health points
  attackPower: number; // Base damage multiplier
  specialAbility: string;
  color: string;
  accentColor: string;
  unlocked: boolean;
  scoreRequired: number;
}

export type PowerUpType = 'SPREAD' | 'LASER' | 'SHIELD' | 'BOMB' | 'DRONE' | 'REPAIR' | 'SPEED';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  radius: number;
  duration?: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPlayer: boolean;
  damage: number;
  color: string;
  isLaser?: boolean;
}

export type EnemyType = 'BEE' | 'BUTTERFLY' | 'BOSS_GALAGA' | 'INTERCEPTOR' | 'ASTEROID' | 'STAGE_BOSS';

export interface EnemyPathPoint {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  points: number;
  color: string;
  
  // Formation / Movement State
  formationX: number;
  formationY: number;
  state: 'ENTERING' | 'IN_FORMATION' | 'DIVING' | 'RETURNING';
  path?: EnemyPathPoint[];
  pathIndex?: number;
  diveAngle?: number;
  shootCooldown: number;
  animFrame: number;
  
  // Boss features
  bossPhase?: number;
  tractorBeamActive?: boolean;
  tractorBeamAngle?: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  glow?: boolean;
}

export interface Drone {
  offsetX: number;
  offsetY: number;
  angle: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
  lives: number;
  
  // Weapon stats
  weaponLevel: number; // 1 to 5
  weaponType: 'STANDARD' | 'SPREAD' | 'LASER' | 'PLASMA';
  laserActiveTimer: number;
  
  // Shield / Invulnerability
  shieldActive: boolean;
  shieldHealth: number;
  shieldMaxHealth: number;
  invulnerableTimer: number;
  
  // Drones
  drones: Drone[];
  
  // Bombs
  bombs: number;
  
  fighterId: FighterId;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  color: string;
}

export interface HighScore {
  id: string;
  name: string;
  score: number;
  stage: number;
  date: string;
  fighterId: FighterId;
}

export interface GameStats {
  score: number;
  highScore: number;
  wave: number;
  kills: number;
  shotsFired: number;
  accuracy: number;
  bombsUsed: number;
  bossesDefeated: number;
}

export interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

export interface GameSettings {
  controlMode: ControlMode;
  autoFire: boolean;
  vibration: boolean;
  sensitivity: number;
  audio: AudioSettings;
}
