import { EnemyType, PowerUpType, ShipType } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 900;

export const PLAYER_SIZE = 40;
export const PLAYER_SPEED = 6;
export const PLAYER_MAX_HP = 3;

export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 15;
export const BULLET_SPEED = 10;

export const PLAYER_CONFIG = {
  width: PLAYER_SIZE,
  height: PLAYER_SIZE,
  images: {
    [ShipType.BALANCED]: '/assets/player_balanced.png',
    [ShipType.SPEED]: '/assets/player_speed.png',
    [ShipType.POWER]: '/assets/player_power.png',
    [ShipType.DEFENSE]: '/assets/player_defense.png',
  }
};

export const ENEMY_CONFIG = {
  [EnemyType.BASIC]: {
    width: 40,
    height: 40,
    speedY: 2,
    hp: 1,
    points: 100,
    color: '#3b82f6', // blue-500
    spawnWeight: 0.7,
    imagePath: '/assets/enemy_basic.png'
  },
  [EnemyType.FAST]: {
    width: 30,
    height: 30,
    speedY: 4,
    hp: 1,
    points: 200,
    color: '#10b981', // emerald-500
    spawnWeight: 0.2,
    imagePath: '/assets/enemy_fast.png'
  },
  [EnemyType.HEAVY]: {
    width: 60,
    height: 60,
    speedY: 1.2,
    hp: 3,
    points: 500,
    color: '#ef4444', // red-500
    spawnWeight: 0.1,
    imagePath: '/assets/enemy_heavy.png'
  },
  [EnemyType.BOSS]: {
    width: 150,
    height: 120,
    speedY: 0.5,
    hp: 20, // Base HP, scales with level
    points: 5000,
    color: '#f43f5e', // rose-500
    spawnWeight: 0,
    imagePath: '/assets/boss.png'
  }
};

export const POWERUP_SIZE = 30;
export const POWERUP_SPEED = 1.5;
export const POWERUP_DURATION = 16000; // 16 seconds (doubled from 8)

export const POWERUP_CONFIG = {
  [PowerUpType.TRIPLE_SHOT]: {
    color: '#f59e0b', // amber-500
    label: 'T'
  },
  [PowerUpType.SHIELD]: {
    color: '#8b5cf6', // violet-500
    label: 'S'
  },
  [PowerUpType.LASER]: {
    color: '#ec4899', // pink-500
    label: 'L'
  },
  [PowerUpType.SPREAD]: {
    color: '#06b6d4', // cyan-500
    label: 'M' // Multi/Spread
  },
  [PowerUpType.BOMB]: {
    color: '#f97316', // orange-500
    label: 'B'
  }
};

export const BOMB_CONFIG = {
  maxRadius: 200,
  duration: 1000,
  damage: 10,
  initialBombs: 3
};

export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_blood',
    title: '第一滴血',
    description: '击毁第一架敌机',
    icon: 'Target'
  },
  {
    id: 'survivor',
    title: '生存者',
    description: '达到第5关',
    icon: 'Shield'
  },
  {
    id: 'ace_pilot',
    title: '王牌飞行员',
    description: '单局得分超过 10,000',
    icon: 'Trophy'
  },
  {
    id: 'collector',
    title: '收藏家',
    description: '拾取 10 个道具',
    icon: 'Package'
  },
  {
    id: 'unstoppable',
    title: '势不可挡',
    description: '击毁 100 架敌机',
    icon: 'Zap'
  }
];
