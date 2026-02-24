export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER'
}

export enum Difficulty {
  SIMPLE = 'SIMPLE',
  ADVANCED = 'ADVANCED',
  HARD = 'HARD'
}

export enum ShipType {
  BALANCED = 'BALANCED',
  SPEED = 'SPEED',
  POWER = 'POWER',
  DEFENSE = 'DEFENSE'
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
  BOSS = 'BOSS'
}

export enum PowerUpType {
  TRIPLE_SHOT = 'TRIPLE_SHOT',
  SHIELD = 'SHIELD',
  LASER = 'LASER',
  SPREAD = 'SPREAD',
  BOMB = 'BOMB'
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
}

export interface PowerUpEffect {
  type: PowerUpType;
  expiry: number;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  score: number;
  level: number;
  invincible: boolean;
  invincibleTimer: number;
  powerUpQueue: PowerUpEffect[];
  shieldActive: boolean;
  bombs: number;
}

export interface Bomb extends Entity {
  radius: number;
  maxRadius: number;
  exploding: boolean;
  timer: number;
}

export interface Bullet extends Entity {
  damage: number;
  color: string;
  isLaser?: boolean;
}

export interface Enemy extends Entity {
  type: EnemyType;
  hp: number;
  maxHp: number;
  points: number;
  color: string;
  lastShot?: number;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  color: string;
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface GameStats {
  score: number;
  level: number;
  enemiesKilled: number;
  powerUpsCollected: number;
  distanceTraveled: number;
  startTime: number;
}
