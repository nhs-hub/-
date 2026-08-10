import React, { useEffect, useRef, useState } from 'react';
import { Bullet, ControlMode, Enemy, FighterId, GameSettings, GameStats, Particle, Player, PowerUp, Star } from '../types/game';
import { soundEngine } from '../utils/audio';
import { FIGHTERS } from '../utils/storage';

interface GameCanvasProps {
  fighterId: FighterId;
  settings: GameSettings;
  onGameOver: (stats: GameStats) => void;
  onPause: () => void;
  isPaused: boolean;
  onUpdateStats: (score: number, wave: number, lives: number, health: number, maxHealth: number, bombs: number, bossHealth?: { current: number; max: number }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  fighterId,
  settings,
  onGameOver,
  onPause,
  isPaused,
  onUpdateStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Selected Fighter configuration
  const spec = FIGHTERS.find(f => f.id === fighterId) || FIGHTERS[0];

  // Game Ref state for smooth 60fps canvas loop
  const gameStateRef = useRef<{
    player: Player;
    bullets: Bullet[];
    enemies: Enemy[];
    particles: Particle[];
    powerUps: PowerUp[];
    stars: Star[];
    wave: number;
    score: number;
    kills: number;
    shotsFired: number;
    shotsHit: number;
    bombsUsed: number;
    bossesDefeated: number;
    screenShakeTimer: number;
    bannerText: string;
    bannerTimer: number;
    bannerSubText?: string;
    isSpawningWave: boolean;
    bossActive: boolean;
    bossRef?: Enemy;
    touchPos: { x: number; y: number } | null;
    keys: { [key: string]: boolean };
    lastShootTime: number;
    joystickOffset: { x: number; y: number };
  }>({
    player: {
      x: 0,
      y: 0,
      width: 44,
      height: 48,
      speed: spec.speed,
      health: spec.maxHealth,
      maxHealth: spec.maxHealth,
      lives: 3,
      weaponLevel: fighterId === 'PHOENIX' ? 2 : 1,
      weaponType: fighterId === 'PHOENIX' ? 'SPREAD' : fighterId === 'VOID' ? 'LASER' : 'STANDARD',
      laserActiveTimer: 0,
      shieldActive: fighterId === 'AEGIS',
      shieldHealth: fighterId === 'AEGIS' ? 50 : 0,
      shieldMaxHealth: 50,
      invulnerableTimer: 0,
      drones: [],
      bombs: 2,
      fighterId: fighterId,
    },
    bullets: [],
    enemies: [],
    particles: [],
    powerUps: [],
    stars: [],
    wave: 1,
    score: 0,
    kills: 0,
    shotsFired: 0,
    shotsHit: 0,
    bombsUsed: 0,
    bossesDefeated: 0,
    screenShakeTimer: 0,
    bannerText: 'STAGE 1',
    bannerTimer: 180,
    bannerSubText: 'GET READY!',
    isSpawningWave: false,
    bossActive: false,
    touchPos: null,
    keys: {},
    lastShootTime: 0,
    joystickOffset: { x: 0, y: 0 },
  });

  // Handle Resize and Canvas scale setup
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Position player near bottom center on initial load
      if (gameStateRef.current.player.x === 0) {
        gameStateRef.current.player.x = width / 2;
        gameStateRef.current.player.y = height - 90;
      }

      // Initialize stars if needed
      if (gameStateRef.current.stars.length === 0) {
        const starList: Star[] = [];
        for (let i = 0; i < 70; i++) {
          starList.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.8 + 0.2,
            color: Math.random() > 0.8 ? '#38bdf8' : Math.random() > 0.6 ? '#f472b6' : '#ffffff',
          });
        }
        gameStateRef.current.stars = starList;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        onPause();
      }
      if ((e.code === 'KeyB' || e.code === 'ShiftLeft' || e.code === 'KeyK') && gameStateRef.current.player.bombs > 0) {
        triggerBomb();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPause]);

  // Trigger Smart Bomb explosion
  const triggerBomb = () => {
    const state = gameStateRef.current;
    if (state.player.bombs <= 0) return;

    state.player.bombs--;
    state.bombsUsed++;
    soundEngine.playBomb();
    state.screenShakeTimer = 30;

    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate([100, 50, 200]);
    }

    // Damage all enemies on screen and wipe out enemy bullets
    state.bullets = state.bullets.filter(b => b.isPlayer);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Create explosion particles covering screen
    for (let i = 0; i < 80; i++) {
      state.particles.push({
        id: Math.random().toString(),
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 6 + 2,
        color: i % 2 === 0 ? '#38bdf8' : '#f43f5e',
        alpha: 1,
        decay: 0.02,
        glow: true,
      });
    }

    state.enemies.forEach(enemy => {
      enemy.health -= 150;
      if (enemy.health <= 0) {
        state.kills++;
        state.score += enemy.points;
      }
    });

    state.enemies = state.enemies.filter(e => e.health > 0);
  };

  // Helper to spawn wave formations
  const spawnWave = (waveNum: number, canvasWidth: number) => {
    const state = gameStateRef.current;
    state.isSpawningWave = true;
    state.enemies = [];

    const isBossWave = waveNum % 5 === 0;

    if (isBossWave) {
      soundEngine.playBossAlarm();
      state.bannerText = `WARNING! BOSS WAVE ${waveNum}`;
      state.bannerSubText = 'DESTORY THE ALIEN FLAGSHIP!';
      state.bannerTimer = 180;
      state.bossActive = true;

      const boss: Enemy = {
        id: 'boss_' + Date.now(),
        type: 'STAGE_BOSS',
        x: canvasWidth / 2,
        y: -120,
        vx: 0,
        vy: 2,
        width: 130,
        height: 100,
        health: 400 + waveNum * 150,
        maxHealth: 400 + waveNum * 150,
        points: 2500 + waveNum * 500,
        color: '#f43f5e',
        formationX: canvasWidth / 2,
        formationY: 130,
        state: 'ENTERING',
        shootCooldown: 60,
        animFrame: 0,
        bossPhase: 1,
      };

      state.enemies.push(boss);
      state.bossRef = boss;
      state.isSpawningWave = false;
      return;
    }

    // Normal Galaga Wave Formation setup
    state.bossActive = false;
    state.bossRef = undefined;
    state.bannerText = `WAVE ${waveNum}`;
    state.bannerSubText = 'INCOMING ENEMY FORMATION';
    state.bannerTimer = 150;

    const rows = Math.min(3 + Math.floor(waveNum / 2), 5);
    const cols = Math.min(6 + Math.floor(waveNum / 3), 10);
    const startY = 80;
    const spacingX = Math.min(48, (canvasWidth - 80) / cols);
    const spacingY = 40;
    const startX = (canvasWidth - cols * spacingX) / 2 + spacingX / 2;

    let delay = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const formX = startX + c * spacingX;
        const formY = startY + r * spacingY;

        let type: Enemy['type'] = 'BEE';
        let health = 1;
        let pts = 100;
        let color = '#facc15'; // yellow bee

        if (r === 0) {
          type = 'BOSS_GALAGA';
          health = 3;
          pts = 400;
          color = '#06b6d4'; // teal boss bug
        } else if (r === 1 || r === 2) {
          type = 'BUTTERFLY';
          health = 2;
          pts = 160;
          color = '#f43f5e'; // red butterfly
        }

        // Swooping entrance curved path
        const spawnFromLeft = (c + r) % 2 === 0;
        const startPosX = spawnFromLeft ? -50 : canvasWidth + 50;
        const startPosY = -40 - delay * 15;

        state.enemies.push({
          id: `enemy_${r}_${c}_${Date.now()}`,
          type,
          x: startPosX,
          y: startPosY,
          vx: 0,
          vy: 0,
          width: type === 'BOSS_GALAGA' ? 38 : 32,
          height: type === 'BOSS_GALAGA' ? 38 : 32,
          health,
          maxHealth: health,
          points: pts,
          color,
          formationX: formX,
          formationY: formY,
          state: 'ENTERING',
          shootCooldown: Math.random() * 200 + 100,
          animFrame: Math.floor(Math.random() * 60),
        });

        delay++;
      }
    }

    state.isSpawningWave = false;
  };

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      const state = gameStateRef.current;

      // Skip updates if paused
      if (!isPaused) {
        // --- 1. UPDATE PLAYER MOVEMENT ---
        const player = state.player;
        let moveX = 0;
        let moveY = 0;

        // Keyboard controls
        if (state.keys['ArrowLeft'] || state.keys['KeyA']) moveX -= 1;
        if (state.keys['ArrowRight'] || state.keys['KeyD']) moveX += 1;
        if (state.keys['ArrowUp'] || state.keys['KeyW']) moveY -= 1;
        if (state.keys['ArrowDown'] || state.keys['KeyS']) moveY += 1;

        // Joystick controls
        if (settings.controlMode === 'VIRTUAL_JOYSTICK' && (state.joystickOffset.x !== 0 || state.joystickOffset.y !== 0)) {
          moveX = state.joystickOffset.x;
          moveY = state.joystickOffset.y;
        }

        // Direct Touch Drag
        if (settings.controlMode === 'DIRECT_TOUCH' && state.touchPos) {
          // Smoothly track finger position
          const targetX = state.touchPos.x;
          const targetY = state.touchPos.y - 30; // Slightly above finger so ship is visible
          player.x += (targetX - player.x) * 0.25;
          player.y += (targetY - player.y) * 0.25;
        } else {
          // Standard directional movement
          const currentSpeed = player.speed * settings.sensitivity;
          player.x += moveX * currentSpeed;
          player.y += moveY * currentSpeed;
        }

        // Bound player to canvas screen
        player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, player.x));
        player.y = Math.max(player.height / 2 + 40, Math.min(height - player.height / 2 - 20, player.y));

        // Timers decay
        if (player.invulnerableTimer > 0) player.invulnerableTimer--;
        if (player.laserActiveTimer > 0) player.laserActiveTimer--;

        // --- 2. SHOOTING LOGIC ---
        const now = Date.now();
        const fireInterval = player.weaponType === 'LASER' ? 100 : player.weaponType === 'PLASMA' ? 120 : 160;

        const isShootingRequested = settings.autoFire || state.keys['Space'] || state.keys['KeyJ'] || state.touchPos !== null;

        if (isShootingRequested && now - state.lastShootTime > fireInterval) {
          state.lastShootTime = now;
          state.shotsFired++;

          // Bullet patterns based on weaponType & weaponLevel
          if (player.weaponType === 'SPREAD' || player.weaponLevel >= 3) {
            soundEngine.playHeavyShoot();
            // 3-Way or 5-Way spread
            const angles = player.weaponLevel >= 4 ? [-0.3, -0.15, 0, 0.15, 0.3] : [-0.25, 0, 0.25];
            angles.forEach(angle => {
              const speed = 12;
              state.bullets.push({
                id: Math.random().toString(),
                x: player.x,
                y: player.y - 20,
                vx: Math.sin(angle) * speed,
                vy: -Math.cos(angle) * speed,
                radius: 4,
                isPlayer: true,
                damage: 25 * spec.attackPower,
                color: '#f43f5e',
              });
            });
          } else if (player.weaponType === 'LASER' || player.laserActiveTimer > 0) {
            soundEngine.playLaser(1200, 400, 0.08);
            // Heavy piercing energy beam
            state.bullets.push({
              id: Math.random().toString(),
              x: player.x,
              y: player.y - 24,
              vx: 0,
              vy: -18,
              radius: 5,
              isPlayer: true,
              damage: 40 * spec.attackPower,
              color: '#c084fc',
              isLaser: true,
            });
          } else {
            soundEngine.playLaser();
            // Dual laser default
            const offset = player.weaponLevel >= 2 ? 14 : 8;
            state.bullets.push({
              id: Math.random().toString(),
              x: player.x - offset,
              y: player.y - 18,
              vx: 0,
              vy: -14,
              radius: 3.5,
              isPlayer: true,
              damage: 20 * spec.attackPower,
              color: spec.color,
            });
            state.bullets.push({
              id: Math.random().toString(),
              x: player.x + offset,
              y: player.y - 18,
              vx: 0,
              vy: -14,
              radius: 3.5,
              isPlayer: true,
              damage: 20 * spec.attackPower,
              color: spec.color,
            });
          }

          // Auxiliary drone shooting
          player.drones.forEach(drone => {
            const droneX = player.x + drone.offsetX;
            const droneY = player.y + drone.offsetY;
            state.bullets.push({
              id: Math.random().toString(),
              x: droneX,
              y: droneY - 10,
              vx: 0,
              vy: -13,
              radius: 3,
              isPlayer: true,
              damage: 15 * spec.attackPower,
              color: '#38bdf8',
            });
          });
        }

        // --- 3. UPDATE BULLETS ---
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const bullet = state.bullets[i];
          bullet.x += bullet.vx;
          bullet.y += bullet.vy;

          // Remove bullets off screen
          if (bullet.y < -20 || bullet.y > height + 20 || bullet.x < -20 || bullet.x > width + 20) {
            state.bullets.splice(i, 1);
          }
        }

        // --- 4. UPDATE POWERUPS ---
        for (let i = state.powerUps.length - 1; i >= 0; i--) {
          const p = state.powerUps[i];
          p.y += p.vy;

          // Collision with player
          const dist = Math.hypot(p.x - player.x, p.y - player.y);
          if (dist < p.radius + player.width / 2) {
            soundEngine.playPowerUp();

            // Apply powerup effects
            if (p.type === 'SPREAD') {
              player.weaponType = 'SPREAD';
              player.weaponLevel = Math.min(5, player.weaponLevel + 1);
            } else if (p.type === 'LASER') {
              player.weaponType = 'LASER';
              player.laserActiveTimer = 360;
            } else if (p.type === 'SHIELD') {
              player.shieldActive = true;
              player.shieldHealth = player.shieldMaxHealth;
            } else if (p.type === 'BOMB') {
              player.bombs = Math.min(5, player.bombs + 1);
            } else if (p.type === 'DRONE') {
              if (player.drones.length < 2) {
                const isFirst = player.drones.length === 0;
                player.drones.push({
                  offsetX: isFirst ? -32 : 32,
                  offsetY: 8,
                  angle: 0,
                });
              }
            } else if (p.type === 'REPAIR') {
              player.health = Math.min(player.maxHealth, player.health + 40);
            } else if (p.type === 'SPEED') {
              player.speed = Math.min(10, player.speed + 1.5);
            }

            state.score += 200;
            state.powerUps.splice(i, 1);
            continue;
          }

          if (p.y > height + 30) {
            state.powerUps.splice(i, 1);
          }
        }

        // --- 5. UPDATE ENEMIES & FORMATION DYNAMICS ---
        let remainingEnemies = 0;

        state.enemies.forEach(enemy => {
          remainingEnemies++;
          enemy.animFrame++;

          if (enemy.type === 'STAGE_BOSS') {
            // Boss Movement & Phases
            if (enemy.state === 'ENTERING') {
              enemy.y += 1.5;
              if (enemy.y >= enemy.formationY) {
                enemy.state = 'IN_FORMATION';
              }
            } else {
              // Boss sways left and right
              enemy.x += Math.sin(enemy.animFrame * 0.03) * 3;

              // Boss Attack Patterns
              enemy.shootCooldown--;
              if (enemy.shootCooldown <= 0) {
                enemy.shootCooldown = Math.max(30, 90 - state.wave * 5);

                // Shoot radial bullets
                soundEngine.playLaser(400, 150, 0.2);
                const bulletCount = enemy.health < enemy.maxHealth * 0.4 ? 8 : 5;
                for (let b = 0; b < bulletCount; b++) {
                  const angle = (Math.PI / (bulletCount - 1)) * b + Math.PI / 6;
                  state.bullets.push({
                    id: Math.random().toString(),
                    x: enemy.x,
                    y: enemy.y + 40,
                    vx: Math.cos(angle) * 4.5,
                    vy: Math.sin(angle) * 4.5,
                    radius: 4,
                    isPlayer: false,
                    damage: 15,
                    color: '#f43f5e',
                  });
                }
              }
            }
          } else {
            // Normal Galaga Enemies
            if (enemy.state === 'ENTERING') {
              // Move towards formation spot
              const dx = enemy.formationX - enemy.x;
              const dy = enemy.formationY - enemy.y;
              const dist = Math.hypot(dx, dy);

              if (dist < 4) {
                enemy.x = enemy.formationX;
                enemy.y = enemy.formationY;
                enemy.state = 'IN_FORMATION';
              } else {
                enemy.x += (dx / dist) * 5;
                enemy.y += (dy / dist) * 5;
              }
            } else if (enemy.state === 'IN_FORMATION') {
              // Hover in formation with subtle wave
              enemy.x = enemy.formationX + Math.sin((enemy.animFrame + enemy.formationX) * 0.04) * 6;
              enemy.y = enemy.formationY + Math.cos(enemy.animFrame * 0.03) * 3;

              // Chance to dive bomb!
              enemy.shootCooldown--;
              if (enemy.shootCooldown <= 0) {
                enemy.shootCooldown = Math.random() * 300 + 150;
                if (Math.random() < 0.3 + state.wave * 0.05) {
                  enemy.state = 'DIVING';
                  enemy.diveAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                }
              }
            } else if (enemy.state === 'DIVING') {
              // Dive down towards player
              const angle = enemy.diveAngle || Math.PI / 2;
              const diveSpeed = 4 + state.wave * 0.3;
              enemy.x += Math.cos(angle) * diveSpeed + Math.sin(enemy.animFrame * 0.1) * 2;
              enemy.y += Math.sin(angle) * diveSpeed;

              // Fire bullet while diving
              if (enemy.animFrame % 45 === 0) {
                state.bullets.push({
                  id: Math.random().toString(),
                  x: enemy.x,
                  y: enemy.y + 16,
                  vx: (player.x - enemy.x) * 0.02,
                  vy: 5,
                  radius: 3.5,
                  isPlayer: false,
                  damage: 10,
                  color: '#facc15',
                });
              }

              // Loop back around when passing bottom
              if (enemy.y > height + 40) {
                enemy.y = -30;
                enemy.state = 'ENTERING';
              }
            }
          }

          // Enemy collision with Player
          const distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
          if (distToPlayer < (enemy.width + player.width) / 2.5) {
            damagePlayer(35);
            enemy.health -= 50;
            if (enemy.health <= 0) {
              createExplosion(enemy.x, enemy.y, enemy.type === 'STAGE_BOSS' ? 'LARGE' : 'MEDIUM', enemy.color);
            }
          }
        });

        // Filter out destroyed enemies
        state.enemies = state.enemies.filter(e => e.health > 0);

        // Check if wave cleared
        if (remainingEnemies === 0 && !state.isSpawningWave) {
          state.wave++;
          soundEngine.playStageClear();
          spawnWave(state.wave, width);
        }

        // --- 6. BULLET COLLISIONS ---
        for (let bIdx = state.bullets.length - 1; bIdx >= 0; bIdx--) {
          const bullet = state.bullets[bIdx];

          if (bullet.isPlayer) {
            // Player Bullet hits Enemy
            for (let eIdx = state.enemies.length - 1; eIdx >= 0; eIdx--) {
              const enemy = state.enemies[eIdx];

              if (
                bullet.x >= enemy.x - enemy.width / 2 &&
                bullet.x <= enemy.x + enemy.width / 2 &&
                bullet.y >= enemy.y - enemy.height / 2 &&
                bullet.y <= enemy.y + enemy.height / 2
              ) {
                state.shotsHit++;
                enemy.health -= bullet.damage;
                soundEngine.playHit();

                // Hit spark particles
                for (let p = 0; p < 3; p++) {
                  state.particles.push({
                    id: Math.random().toString(),
                    x: bullet.x,
                    y: bullet.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    radius: Math.random() * 2 + 1,
                    color: bullet.color,
                    alpha: 1,
                    decay: 0.08,
                  });
                }

                // If non-piercing bullet, destroy bullet
                if (!bullet.isLaser) {
                  state.bullets.splice(bIdx, 1);
                }

                // If Enemy Destroyed
                if (enemy.health <= 0) {
                  state.kills++;
                  state.score += enemy.points;

                  createExplosion(enemy.x, enemy.y, enemy.type === 'STAGE_BOSS' ? 'LARGE' : 'MEDIUM', enemy.color);

                  if (enemy.type === 'STAGE_BOSS') {
                    state.bossesDefeated++;
                    state.bossActive = false;
                    state.bossRef = undefined;
                    // Guaranteed powerup drop on boss defeat
                    dropPowerUp(enemy.x, enemy.y, true);
                  } else {
                    // 15% powerup drop chance
                    if (Math.random() < 0.15) {
                      dropPowerUp(enemy.x, enemy.y);
                    }
                  }
                }
                break;
              }
            }
          } else {
            // Enemy Bullet hits Player
            const distToPlayer = Math.hypot(bullet.x - player.x, bullet.y - player.y);
            if (distToPlayer < bullet.radius + player.width / 3) {
              state.bullets.splice(bIdx, 1);
              damagePlayer(bullet.damage);
            }
          }
        }

        // --- 7. UPDATE PARTICLES & STARS ---
        for (let pIdx = state.particles.length - 1; pIdx >= 0; pIdx--) {
          const p = state.particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            state.particles.splice(pIdx, 1);
          }
        }

        state.stars.forEach(star => {
          star.y += star.speed * (state.bannerTimer > 0 ? 2 : 1);
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        });

        // Banner timer
        if (state.bannerTimer > 0) state.bannerTimer--;

        // Notify parent HUD component
        onUpdateStats(
          state.score,
          state.wave,
          player.lives,
          player.health,
          player.maxHealth,
          player.bombs,
          state.bossRef ? { current: Math.max(0, state.bossRef.health), max: state.bossRef.maxHealth } : undefined
        );
      }

      // --- 8. RENDER CANVAS GRAPHICS ---
      ctx.save();

      // Screen Shake translation
      if (state.screenShakeTimer > 0) {
        state.screenShakeTimer--;
        const shakeX = (Math.random() - 0.5) * 8;
        const shakeY = (Math.random() - 0.5) * 8;
        ctx.translate(shakeX * dpr, shakeY * dpr);
      }

      ctx.scale(dpr, dpr);

      // Deep space background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(1, '#0b0f19');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Parallax Stars
      state.stars.forEach(star => {
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Render Particles
      state.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        if (p.glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render PowerUps
      state.powerUps.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Glowing circle outline
        ctx.shadowBlur = 12;
        ctx.shadowColor =
          p.type === 'SPREAD' ? '#f43f5e' : p.type === 'LASER' ? '#c084fc' : p.type === 'SHIELD' ? '#38bdf8' : p.type === 'BOMB' ? '#facc15' : '#4ade80';

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = ctx.shadowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Icon text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label =
          p.type === 'SPREAD' ? '3X' : p.type === 'LASER' ? 'BEAM' : p.type === 'SHIELD' ? 'DEF' : p.type === 'BOMB' ? 'BOMB' : p.type === 'DRONE' ? 'DRONE' : 'HP';
        ctx.fillText(label, 0, 0);

        ctx.restore();
      });

      // Render Enemies
      state.enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        ctx.shadowBlur = 10;
        ctx.shadowColor = enemy.color;

        if (enemy.type === 'STAGE_BOSS') {
          // Draw Large Alien Boss Flagship
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.moveTo(0, 50);
          ctx.lineTo(-65, -10);
          ctx.lineTo(-40, -50);
          ctx.lineTo(0, -30);
          ctx.lineTo(40, -50);
          ctx.lineTo(65, -10);
          ctx.closePath();
          ctx.fill();

          // Boss glowing core
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === 'BOSS_GALAGA') {
          // Classic Galaga Boss Bug Shape
          ctx.fillStyle = enemy.health < enemy.maxHealth ? '#f43f5e' : enemy.color;
          ctx.beginPath();
          ctx.moveTo(0, 18);
          ctx.lineTo(-18, 0);
          ctx.lineTo(-12, -18);
          ctx.lineTo(0, -10);
          ctx.lineTo(12, -18);
          ctx.lineTo(18, 0);
          ctx.closePath();
          ctx.fill();

          // Mandibles
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-8, -18);
          ctx.lineTo(-14, -26);
          ctx.moveTo(8, -18);
          ctx.lineTo(14, -26);
          ctx.stroke();
        } else if (enemy.type === 'BUTTERFLY') {
          // Galaga Butterfly Shape
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.moveTo(0, 15);
          ctx.lineTo(-16, -5);
          ctx.lineTo(-8, -15);
          ctx.lineTo(0, -5);
          ctx.lineTo(8, -15);
          ctx.lineTo(16, -5);
          ctx.closePath();
          ctx.fill();
        } else {
          // Galaga Bee Shape
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.moveTo(0, 14);
          ctx.lineTo(-14, -12);
          ctx.lineTo(0, -4);
          ctx.lineTo(14, -12);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // Render Bullets
      state.bullets.forEach(bullet => {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = bullet.color;
        ctx.fillStyle = bullet.color;

        ctx.beginPath();
        if (bullet.isLaser) {
          ctx.ellipse(bullet.x, bullet.y, bullet.radius, bullet.radius * 3, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      });

      // Render Player Ship & Drones
      const player = state.player;

      // Draw Drones
      player.drones.forEach(drone => {
        const droneX = player.x + drone.offsetX;
        const droneY = player.y + drone.offsetY;

        ctx.save();
        ctx.translate(droneX, droneY);
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = '#38bdf8';

        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, 8);
        ctx.lineTo(0, 4);
        ctx.lineTo(8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Draw Player Fighter (Flicker if invulnerable)
      if (player.invulnerableTimer === 0 || Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x, player.y);

        ctx.shadowBlur = 12;
        ctx.shadowColor = spec.color;

        // Thruster flame animation
        const flameHeight = 12 + Math.random() * 8;
        const flameGrad = ctx.createLinearGradient(0, 16, 0, 16 + flameHeight);
        flameGrad.addColorStop(0, '#facc15');
        flameGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-6, 18);
        ctx.lineTo(0, 18 + flameHeight);
        ctx.lineTo(6, 18);
        ctx.fill();

        // Main Ship Hull
        ctx.fillStyle = spec.color;
        ctx.beginPath();
        ctx.moveTo(0, -24); // Nose
        ctx.lineTo(-22, 16); // Left Wing Tip
        ctx.lineTo(-10, 12);
        ctx.lineTo(0, 18); // Tail
        ctx.lineTo(10, 12);
        ctx.lineTo(22, 16); // Right Wing Tip
        ctx.closePath();
        ctx.fill();

        // Accent Cockpit
        ctx.fillStyle = spec.accentColor;
        ctx.beginPath();
        ctx.ellipse(0, -4, 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shield Sphere
        if (player.shieldActive) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Render Stage Banners
      if (state.bannerTimer > 0) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#38bdf8';
        ctx.font = '900 28px sans-serif';
        ctx.fillText(state.bannerText, width / 2, height / 2 - 20);

        if (state.bannerSubText) {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '600 14px sans-serif';
          ctx.shadowBlur = 8;
          ctx.fillText(state.bannerSubText, width / 2, height / 2 + 15);
        }

        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    // Initialize Wave 1
    const container = containerRef.current;
    if (container) {
      spawnWave(1, container.clientWidth);
    }

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, fighterId, settings]);

  // Helper function to damage player
  const damagePlayer = (amount: number) => {
    const state = gameStateRef.current;
    const player = state.player;

    if (player.invulnerableTimer > 0) return;

    soundEngine.playHit();
    state.screenShakeTimer = 15;

    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate(120);
    }

    // Shield takes damage first
    if (player.shieldActive && player.shieldHealth > 0) {
      player.shieldHealth -= amount;
      if (player.shieldHealth <= 0) {
        player.shieldActive = false;
        player.shieldHealth = 0;
      }
      return;
    }

    player.health -= amount;
    player.invulnerableTimer = 60; // 1 second invulnerability

    if (player.health <= 0) {
      soundEngine.playExplosion('LARGE');
      player.lives--;

      if (player.lives <= 0) {
        // Game Over!
        const totalShots = Math.max(1, state.shotsFired);
        const accuracy = Math.round((state.shotsHit / totalShots) * 100);

        onGameOver({
          score: state.score,
          highScore: state.score,
          wave: state.wave,
          kills: state.kills,
          shotsFired: state.shotsFired,
          accuracy,
          bombsUsed: state.bombsUsed,
          bossesDefeated: state.bossesDefeated,
        });
      } else {
        // Respawn player
        player.health = player.maxHealth;
        player.weaponLevel = Math.max(1, player.weaponLevel - 1);
        player.invulnerableTimer = 120; // 2 seconds safety
      }
    }
  };

  // Helper function for particle explosion
  const createExplosion = (x: number, y: number, size: 'SMALL' | 'MEDIUM' | 'LARGE', color: string) => {
    soundEngine.playExplosion(size);
    const count = size === 'SMALL' ? 12 : size === 'MEDIUM' ? 24 : 45;
    const state = gameStateRef.current;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (size === 'LARGE' ? 7 : 4) + 1;

      state.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1.5,
        color: i % 2 === 0 ? color : '#facc15',
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        glow: true,
      });
    }
  };

  // Helper function to drop powerups
  const dropPowerUp = (x: number, y: number, isBoss = false) => {
    const types: PowerUp['type'][] = ['SPREAD', 'LASER', 'SHIELD', 'BOMB', 'DRONE', 'REPAIR', 'SPEED'];
    const selectedType = isBoss
      ? 'BOMB'
      : types[Math.floor(Math.random() * types.length)];

    gameStateRef.current.powerUps.push({
      id: Math.random().toString(),
      x,
      y,
      vy: 2,
      type: selectedType,
      radius: 14,
    });
  };

  // --- TOUCH HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    gameStateRef.current.touchPos = { x, y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    gameStateRef.current.touchPos = { x, y };
  };

  const handleTouchEnd = () => {
    gameStateRef.current.touchPos = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none bg-slate-950"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
