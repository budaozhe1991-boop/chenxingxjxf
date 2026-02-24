import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameState, 
  Player, 
  Bullet, 
  Enemy, 
  PowerUp, 
  Particle, 
  EnemyType, 
  PowerUpType, 
  Achievement,
  GameStats,
  Bomb,
  Difficulty,
  ShipType
} from '../types';
import { 
  PLAYER_SIZE, 
  PLAYER_SPEED, 
  PLAYER_MAX_HP, 
  BULLET_WIDTH, 
  BULLET_HEIGHT, 
  BULLET_SPEED, 
  PLAYER_CONFIG,
  ENEMY_CONFIG, 
  POWERUP_SIZE, 
  POWERUP_SPEED, 
  POWERUP_DURATION,
  ACHIEVEMENTS_LIST,
  BOMB_CONFIG,
  POWERUP_CONFIG
} from '../constants';

import { audioManager } from '../services/audioService';

interface GameCanvasProps {
  gameState: GameState;
  difficulty: Difficulty;
  shipType: ShipType;
  onGameOver: (stats: GameStats, achievements: Achievement[]) => void;
  onScoreUpdate: (score: number, level: number, hp: number, bombs: number) => void;
  onAchievementUnlock: (achievement: Achievement) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  difficulty,
  shipType,
  onGameOver, 
  onScoreUpdate,
  onAchievementUnlock
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Game State Refs
  const playerRef = useRef<Player>({
    x: 0, y: 0, width: PLAYER_SIZE, height: PLAYER_SIZE,
    speedX: 0, speedY: 0, hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP,
    score: 0, level: 1, invincible: false, invincibleTimer: 0,
    powerUpQueue: [], shieldActive: false, bombs: BOMB_CONFIG.initialBombs
  });
  
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number}[]>([]);
  const bombsRef = useRef<Bomb[]>([]);
  const statsRef = useRef<GameStats>({
    score: 0, level: 1, enemiesKilled: 0, powerUpsCollected: 0, distanceTraveled: 0, startTime: Date.now()
  });
  const achievementsRef = useRef<Achievement[]>(
    ACHIEVEMENTS_LIST.map(a => ({ ...a, unlocked: false }))
  );
  
  const keysRef = useRef<Set<string>>(new Set());
  const lastSpawnTime = useRef<number>(0);
  const lastShotTime = useRef<number>(0);
  const bossActive = useRef<boolean>(false);
  const enemiesSpawnedInLevel = useRef<number>(0);
  const mousePos = useRef<{x: number, y: number}>({x: 0, y: 0});
  const isMouseDown = useRef<boolean>(false);

  // Load Images
  useEffect(() => {
    const imagesToLoad: Record<string, string> = {
      [EnemyType.BASIC]: ENEMY_CONFIG[EnemyType.BASIC].imagePath,
      [EnemyType.FAST]: ENEMY_CONFIG[EnemyType.FAST].imagePath,
      [EnemyType.HEAVY]: ENEMY_CONFIG[EnemyType.HEAVY].imagePath,
      [EnemyType.BOSS]: ENEMY_CONFIG[EnemyType.BOSS].imagePath,
    };

    // Add all ship images
    Object.entries(PLAYER_CONFIG.images).forEach(([type, path]) => {
      imagesToLoad[`player_${type}`] = path;
    });

    let loadedCount = 0;
    const totalToLoad = Object.keys(imagesToLoad).length;

    Object.entries(imagesToLoad).forEach(([key, path]) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        imagesRef.current[key] = img;
        loadedCount++;
        if (loadedCount === totalToLoad) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) setImagesLoaded(true);
      };
    });
  }, []);

  // Initialize stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.2
      });
    }
    starsRef.current = stars;
  }, []);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let initialHp = PLAYER_MAX_HP;
    if (shipType === ShipType.DEFENSE) initialHp = 5;

    playerRef.current = {
      x: canvas.width / 2 - PLAYER_SIZE / 2,
      y: canvas.height - PLAYER_SIZE - 50,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      speedX: 0,
      speedY: 0,
      hp: initialHp,
      maxHp: initialHp,
      score: 0,
      level: 1,
      invincible: false,
      invincibleTimer: 0,
      powerUpQueue: [],
      shieldActive: false,
      bombs: BOMB_CONFIG.initialBombs
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    bombsRef.current = [];
    bossActive.current = false;
    enemiesSpawnedInLevel.current = 0;
    statsRef.current = {
      score: 0, level: 1, enemiesKilled: 0, powerUpsCollected: 0, distanceTraveled: 0, startTime: Date.now()
    };
    achievementsRef.current = ACHIEVEMENTS_LIST.map(a => ({ ...a, unlocked: false }));
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
    }
  }, [gameState, resetGame]);

  const checkAchievements = () => {
    const stats = statsRef.current;
    const achievements = achievementsRef.current;
    const unlock = (id: string) => {
      const ach = achievements.find(a => a.id === id);
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        onAchievementUnlock(ach);
      }
    };
    if (stats.enemiesKilled >= 1) unlock('first_blood');
    if (stats.level >= 5) unlock('survivor');
    if (stats.score >= 10000) unlock('ace_pilot');
    if (stats.powerUpsCollected >= 10) unlock('collector');
    if (stats.enemiesKilled >= 100) unlock('unstoppable');
  };

  const createExplosion = (x: number, y: number, color: string, count = 15) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        width: 0, height: 0,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8,
        life: 1,
        maxLife: Math.random() * 0.5 + 0.5,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const spawnEnemy = (canvas: HTMLCanvasElement) => {
    if (bossActive.current) return;

    const now = Date.now();
    
    // Difficulty multipliers
    const diffMult = difficulty === Difficulty.SIMPLE ? 0.7 : difficulty === Difficulty.HARD ? 1.3 : 1;
    const spawnMult = difficulty === Difficulty.SIMPLE ? 1.3 : difficulty === Difficulty.HARD ? 0.7 : 1;

    const spawnInterval = Math.max((1500 - (statsRef.current.level * 150)) * spawnMult, 400 * spawnMult);
    const bossThreshold = 15 + statsRef.current.level * 5;
    
    // Check for Boss Spawn
    if (enemiesSpawnedInLevel.current >= bossThreshold && !bossActive.current) {
      bossActive.current = true;
      audioManager.playSound('boss');
      const config = ENEMY_CONFIG[EnemyType.BOSS];
      const bossHp = (config.hp + (statsRef.current.level * 20)) * diffMult;
      enemiesRef.current.push({
        type: EnemyType.BOSS,
        x: canvas.width / 2 - config.width / 2,
        y: -config.height,
        width: config.width,
        height: config.height,
        speedX: (1.5 + (statsRef.current.level * 0.2)) * diffMult,
        speedY: config.speedY,
        hp: bossHp,
        maxHp: bossHp,
        points: config.points,
        color: config.color,
        lastShot: now
      });
      return;
    }

    if (now - lastSpawnTime.current > spawnInterval) {
      const rand = Math.random();
      let type = EnemyType.BASIC;
      if (rand < 0.1 + (statsRef.current.level * 0.02)) type = EnemyType.HEAVY;
      else if (rand < 0.3 + (statsRef.current.level * 0.03)) type = EnemyType.FAST;
      
      const config = ENEMY_CONFIG[type];
      const x = Math.random() * (canvas.width - config.width);
      
      enemiesRef.current.push({
        type,
        x,
        y: -config.height,
        width: config.width,
        height: config.height,
        speedX: type === EnemyType.FAST ? (Math.random() - 0.5) * (4 + statsRef.current.level * 0.5) * diffMult : 0,
        speedY: (config.speedY + (statsRef.current.level * 0.4)) * diffMult,
        hp: (config.hp + Math.floor(statsRef.current.level / 2)) * diffMult,
        maxHp: (config.hp + Math.floor(statsRef.current.level / 2)) * diffMult,
        points: config.points,
        color: config.color
      });
      lastSpawnTime.current = now;
      enemiesSpawnedInLevel.current++;
    }
  };

  const spawnPowerUp = (x: number, y: number, force = false) => {
    if (force || Math.random() < 0.2) {
      const types = Object.values(PowerUpType);
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpsRef.current.push({
        type,
        x,
        y,
        width: POWERUP_SIZE,
        height: POWERUP_SIZE,
        speedX: (Math.random() - 0.5) * 2,
        speedY: POWERUP_SPEED,
        color: '#fff' // Color handled in draw
      });
    }
  };

  const update = (canvas: HTMLCanvasElement, delta: number) => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;

    // Mouse/Touch Drag Movement
    const followSpeed = shipType === ShipType.SPEED ? 0.25 : 0.15;
    player.x += (mousePos.current.x - (player.x + player.width / 2)) * followSpeed;
    player.y += (mousePos.current.y - (player.y + player.height / 2)) * followSpeed;

    // Clamp player to canvas
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    // Player Shooting
    const now = Date.now();
    const damageMult = shipType === ShipType.POWER ? 1.5 : 1.0;
    const laserLevel = player.powerUpQueue.filter(p => p.type === PowerUpType.LASER).length;
    const spreadLevel = player.powerUpQueue.filter(p => p.type === PowerUpType.SPREAD).length;
    const tripleLevel = player.powerUpQueue.filter(p => p.type === PowerUpType.TRIPLE_SHOT).length;
    
    const isLaser = laserLevel > 0;
    const isSpread = spreadLevel > 0;
    const isTriple = tripleLevel > 0;
    
    const shotInterval = isLaser ? Math.max(120 - (laserLevel * 10), 50) : 250;
    if (now - lastShotTime.current > shotInterval) {
      const bulletX = player.x + player.width / 2 - BULLET_WIDTH / 2;
      const bulletY = player.y;
      
      const shots: {x: number, y: number, speedX: number, speedY: number, damage: number, width?: number, height?: number}[] = [];
      
      // Base shot
      shots.push({ x: bulletX, y: bulletY, speedX: 0, speedY: -BULLET_SPEED, damage: 1 * damageMult });
      
      if (isTriple) {
        for (let i = 1; i <= tripleLevel; i++) {
          shots.push({ x: bulletX - 20 * i, y: bulletY, speedX: 0, speedY: -BULLET_SPEED, damage: 1 * damageMult });
          shots.push({ x: bulletX + 20 * i, y: bulletY, speedX: 0, speedY: -BULLET_SPEED, damage: 1 * damageMult });
        }
      }
      
      if (isSpread) {
        const spreadCount = 2 + spreadLevel;
        for (let i = 1; i <= spreadCount; i++) {
          const angle = (i / (spreadCount + 1)) * Math.PI - Math.PI;
          shots.push({ 
            x: bulletX, y: bulletY, 
            speedX: Math.cos(angle) * BULLET_SPEED, 
            speedY: Math.sin(angle) * BULLET_SPEED,
            damage: 1 * damageMult 
          });
        }
      }

      audioManager.playSound(isLaser ? 'laser' : 'shoot');
      
      shots.forEach(s => {
        if (isLaser) {
          bulletsRef.current.push({ 
            x: s.x - (2 + laserLevel), y: s.y - 20, 
            width: 8 + laserLevel * 2, height: 40, 
            speedX: s.speedX, speedY: s.speedY * 1.5, 
            damage: 0.6 + laserLevel * 0.2, color: '#ec4899', isLaser: true 
          });
        } else {
          bulletsRef.current.push({ 
            x: s.x, y: s.y, width: s.width || BULLET_WIDTH, height: s.height || BULLET_HEIGHT, 
            speedX: s.speedX, speedY: s.speedY, 
            damage: s.damage, color: isTriple ? '#f59e0b' : (isSpread ? '#06b6d4' : '#3b82f6') 
          });
        }
      });
      
      lastShotTime.current = now;
    }

    // Update Timers
    if (player.invincible) {
      player.invincibleTimer -= delta;
      if (player.invincibleTimer <= 0) player.invincible = false;
    }
    
    // Update PowerUps Queue (remove expired)
    player.powerUpQueue = player.powerUpQueue.filter(p => p.expiry > now);
    player.shieldActive = player.powerUpQueue.some(p => p.type === PowerUpType.SHIELD);

    // Update Bombs
    bombsRef.current = bombsRef.current.filter(b => {
      if (b.exploding) {
        b.radius += (b.maxRadius - b.radius) * 0.1;
        b.timer -= delta;
        
        // AOE Damage
        enemiesRef.current.forEach(e => {
          const dx = (e.x + e.width / 2) - b.x;
          const dy = (e.y + e.height / 2) - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < b.radius) {
            e.hp -= 0.2; // Continuous damage while in radius
          }
        });
        
        return b.timer > 0;
      } else {
        b.y += b.speedY;
        if (b.y < canvas.height / 2) {
          b.exploding = true;
          audioManager.playSound('bomb');
        }
        return true;
      }
    });

    // Update Bullets
    bulletsRef.current = bulletsRef.current.filter(b => {
      b.x += b.speedX;
      b.y += b.speedY;
      return b.y > -50 && b.x > -50 && b.x < canvas.width + 50;
    });

    // Update Enemies
    enemiesRef.current = enemiesRef.current.filter(e => {
      e.y += e.speedY;
      e.x += e.speedX;

      // Boss Movement
      if (e.type === EnemyType.BOSS) {
        if (e.y < 100) e.y += 1;
        else e.speedY = 0;
        
        if (e.x <= 0 || e.x + e.width >= canvas.width) e.speedX *= -1;
        
        // Boss Shooting
        if (now - (e.lastShot || 0) > 1000 - (statsRef.current.level * 50)) {
          for (let i = -2; i <= 2; i++) {
            bulletsRef.current.push({ x: e.x + e.width / 2, y: e.y + e.height, width: 10, height: 10, speedX: i * 2, speedY: 4, damage: 1, color: '#f43f5e' });
          }
          e.lastShot = now;
        }
      }
      
      // Collision with bullets
      bulletsRef.current.forEach((b, bIdx) => {
        if (
          b.speedY < 0 && // Only player bullets
          b.x < e.x + e.width &&
          b.x + b.width > e.x &&
          b.y < e.y + e.height &&
          b.y + b.height > e.y
        ) {
          e.hp -= b.damage;
          audioManager.playSound('hit');
          if (!b.isLaser) bulletsRef.current.splice(bIdx, 1);
          createExplosion(b.x, b.y, e.color, 3);
        }
      });

      // Collision with player
      if (
        !player.invincible &&
        player.x < e.x + e.width &&
        player.x + player.width > e.x &&
        player.y < e.y + e.height &&
        player.y + player.height > e.y
      ) {
        if (player.shieldActive) {
          const shieldIndex = player.powerUpQueue.findIndex(p => p.type === PowerUpType.SHIELD);
          if (shieldIndex !== -1) {
            player.powerUpQueue.splice(shieldIndex, 1);
            player.shieldActive = player.powerUpQueue.some(p => p.type === PowerUpType.SHIELD);
          } else {
            player.shieldActive = false;
          }
          createExplosion(player.x + player.width/2, player.y + player.height/2, '#8b5cf6', 20);
        } else {
          player.hp -= 1;
          player.invincible = true;
          player.invincibleTimer = 2000;
          createExplosion(player.x + player.width/2, player.y + player.height/2, '#ef4444', 20);
          if (player.hp <= 0) onGameOver(statsRef.current, achievementsRef.current);
        }
        if (e.type !== EnemyType.BOSS) return false;
      }

      if (e.hp <= 0) {
        statsRef.current.score += e.points;
        statsRef.current.enemiesKilled += 1;
        audioManager.playSound('explosion');
        createExplosion(e.x + e.width/2, e.y + e.height/2, e.color, e.type === EnemyType.BOSS ? 100 : 20);
        
        if (e.type === EnemyType.BOSS) {
          bossActive.current = false;
          statsRef.current.level += 1;
          enemiesSpawnedInLevel.current = 0;
          // Drop 4 power ups
          for (let i = 0; i < 4; i++) {
            spawnPowerUp(e.x + (i * 30), e.y + (Math.random() * 50), true);
          }
          // Clear bullets
          bulletsRef.current = [];
        } else {
          spawnPowerUp(e.x + e.width/2, e.y + e.height/2);
        }
        
        onScoreUpdate(statsRef.current.score, statsRef.current.level, player.hp, player.bombs);
        checkAchievements();
        return false;
      }

      if (e.y > canvas.height) {
        if (e.type !== EnemyType.BOSS) {
           statsRef.current.score = Math.max(0, statsRef.current.score - 50);
           onScoreUpdate(statsRef.current.score, statsRef.current.level, player.hp, player.bombs);
        }
        return false;
      }
      return true;
    });

    // Update PowerUps
    powerUpsRef.current = powerUpsRef.current.filter(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      if (
        player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y < p.y + p.height &&
        player.y + player.height > p.y
      ) {
        audioManager.playSound('powerup');
        
        if (p.type === PowerUpType.BOMB) {
          player.bombs += 1;
        } else {
          // Add to queue, limit to 5
          player.powerUpQueue.push({
            type: p.type,
            expiry: Date.now() + POWERUP_DURATION
          });
          
          if (player.powerUpQueue.length > 5) {
            player.powerUpQueue.shift(); // Remove oldest
          }
        }
        
        player.shieldActive = player.powerUpQueue.some(p => p.type === PowerUpType.SHIELD);
        statsRef.current.powerUpsCollected += 1;
        createExplosion(p.x + p.width/2, p.y + p.height/2, '#fff', 15);
        checkAchievements();
        onScoreUpdate(statsRef.current.score, statsRef.current.level, player.hp, player.bombs);
        return false;
      }
      return p.y < canvas.height;
    });

    // Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= delta / 1000;
      return p.life > 0;
    });

    // Update Stars
    starsRef.current.forEach(s => {
      s.y += s.speed;
      if (s.y > canvas.height) s.y = -10;
    });

    spawnEnemy(canvas);
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Stars
    ctx.fillStyle = 'white';
    starsRef.current.forEach(s => {
      ctx.globalAlpha = s.speed;
      ctx.beginPath();
      ctx.arc(s.x % canvas.width, s.y % canvas.height, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Bombs
    bombsRef.current.forEach(b => {
      if (b.exploding) {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        grad.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw PowerUps
    powerUpsRef.current.forEach(p => {
      const config = (POWERUP_CONFIG as any)[p.type];
      ctx.shadowBlur = 15;
      ctx.shadowColor = config.color;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.width, p.height, 8);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(config.label, p.x + p.width/2, p.y + p.height/2 + 6);
      ctx.shadowBlur = 0;
    });

    // Draw Bullets
    bulletsRef.current.forEach(b => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      if (b.isLaser) {
        ctx.fillRect(b.x, b.y, b.width, b.height);
      } else {
        ctx.beginPath();
        ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    // Draw Enemies
    enemiesRef.current.forEach(e => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = e.color;
      const img = imagesRef.current[e.type];
      if (img) {
        ctx.drawImage(img, e.x, e.y, e.width, e.height);
      } else {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2, e.y + e.height);
        ctx.lineTo(e.x, e.y);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.closePath();
        ctx.fill();
      }
      // HP Bar
      if (e.maxHp > 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(e.x, e.y - 15, e.width, 6);
        ctx.fillStyle = e.type === EnemyType.BOSS ? '#f43f5e' : '#ef4444';
        ctx.fillRect(e.x, e.y - 15, (e.hp / e.maxHp) * e.width, 6);
      }
      ctx.shadowBlur = 0;
    });

    // Draw Player
    const player = playerRef.current;
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
      let shipColor = '#3b82f6';
      if (shipType === ShipType.SPEED) shipColor = '#10b981';
      if (shipType === ShipType.POWER) shipColor = '#f59e0b';
      if (shipType === ShipType.DEFENSE) shipColor = '#8b5cf6';

      ctx.shadowBlur = 20;
      ctx.shadowColor = shipColor;
      const playerImg = imagesRef.current[`player_${shipType}`];
      if (playerImg) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
      } else {
        ctx.fillStyle = shipColor;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height * 0.8);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();
      }
      if (player.shieldActive) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
  };

  const loop = (time: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      update(canvas, 16.67);
      draw(ctx, canvas);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = canvas.parentElement?.clientHeight || 900;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    mousePos.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    isMouseDown.current = true;
    const player = playerRef.current;
    if (player.bombs > 0) {
      player.bombs -= 1;
      bombsRef.current.push({
        x: player.x + player.width / 2,
        y: player.y,
        width: 20, height: 20,
        speedX: 0, speedY: -5,
        radius: 0, maxRadius: BOMB_CONFIG.maxRadius,
        exploding: false, timer: BOMB_CONFIG.duration
      });
      onScoreUpdate(statsRef.current.score, statsRef.current.level, player.hp, player.bombs);
    }
  };

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full block bg-slate-950 cursor-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchStart={handleMouseDown}
    />
  );
};

export default GameCanvas;
