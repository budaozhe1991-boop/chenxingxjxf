import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Pause, RotateCcw, Home, Info, Shield, Zap, Target, Package, Volume2, VolumeX } from 'lucide-react';
import { GameState, Achievement, GameStats, Difficulty, ShipType } from '../types';
import { audioManager } from '../services/audioService';
import { PLAYER_CONFIG } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  level: number;
  hp: number;
  bombs: number;
  onStart: (ship: ShipType) => void;
  onResume: () => void;
  onPause: () => void;
  onRestart: () => void;
  onHome: () => void;
  lastStats?: GameStats;
  achievements: Achievement[];
  activeAchievement?: Achievement | null;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  score,
  level,
  hp,
  bombs,
  onStart,
  onResume,
  onPause,
  onRestart,
  onHome,
  lastStats,
  achievements,
  activeAchievement
}) => {
  const [volume, setVolume] = useState(audioManager.getVolume());
  const [selectedShip, setSelectedShip] = useState<ShipType>(ShipType.BALANCED);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioManager.setVolume(val);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target': return <Target className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'Package': return <Package className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* HUD */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl">
            <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Score</div>
            <div className="text-white text-2xl font-bold tabular-nums">{score.toLocaleString()}</div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl text-center min-w-[80px]">
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Level</div>
              <div className="text-white text-2xl font-bold">{level}</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={onPause}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl transition-all active:scale-95"
              >
                <Pause className="text-white w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-[-60px] left-6 flex flex-col gap-4">
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ scale: 1 }}
                  animate={{ scale: i < hp ? 1 : 0.8, opacity: i < hp ? 1 : 0.2 }}
                  className="w-8 h-8 rounded-lg bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center"
                >
                  <Shield className="text-white w-5 h-5" />
                </motion.div>
              ))}
            </div>
            
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ scale: 1 }}
                  animate={{ scale: i < bombs ? 1 : 0.8, opacity: i < bombs ? 1 : 0.2 }}
                  className="w-8 h-8 rounded-lg bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] flex items-center justify-center"
                >
                  <Zap className="text-white w-5 h-5" />
                </motion.div>
              ))}
              <span className="text-white/40 text-[10px] uppercase tracking-widest self-center ml-2">Bombs</span>
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      <AnimatePresence>
        {gameState === GameState.START && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] shadow-2xl max-w-md w-full text-center pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.h1 
                initial={{ letterSpacing: '0.1em' }}
                animate={{ letterSpacing: '0.2em' }}
                className="text-2xl font-black text-white uppercase italic"
              >
                陈星
              </motion.h1>
              <h2 className="text-lg text-blue-400 font-medium tracking-widest uppercase">星际先锋</h2>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-left bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="bg-blue-500/20 p-1.5 rounded-lg">
                  <Zap className="text-blue-400 w-4 h-4" />
                </div>
                <div>
                  <p className="text-white text-[10px] font-semibold">移动与炸弹</p>
                  <p className="text-white/40 text-[9px]">鼠标拖动战机，左键点击释放炸弹</p>
                </div>
              </div>

              {/* Ship Selection */}
              <div className="text-left">
                <p className="text-white/30 text-[8px] uppercase tracking-widest font-bold mb-2">选择你的战机</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { 
                      type: ShipType.BALANCED, 
                      label: '均衡型', 
                      desc: '属性均衡',
                      color: 'bg-blue-500',
                      icon: <Shield className="w-3 h-3" />,
                      image: PLAYER_CONFIG.images[ShipType.BALANCED]
                    },
                    { 
                      type: ShipType.SPEED, 
                      label: '极速型', 
                      desc: '速度极快',
                      color: 'bg-emerald-500',
                      icon: <Zap className="w-3 h-3" />,
                      image: PLAYER_CONFIG.images[ShipType.SPEED]
                    },
                    { 
                      type: ShipType.POWER, 
                      label: '火力型', 
                      desc: '攻击力高',
                      color: 'bg-amber-500',
                      icon: <Target className="w-3 h-3" />,
                      image: PLAYER_CONFIG.images[ShipType.POWER]
                    },
                    { 
                      type: ShipType.DEFENSE, 
                      label: '防御型', 
                      desc: '生命值多',
                      color: 'bg-violet-500',
                      icon: <Shield className="w-3 h-3" />,
                      image: PLAYER_CONFIG.images[ShipType.DEFENSE]
                    },
                  ].map((ship) => (
                    <button
                      key={ship.type}
                      onClick={() => setSelectedShip(ship.type)}
                      className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col gap-2 relative overflow-hidden group ${
                        selectedShip === ship.type 
                          ? 'bg-white/10 border-white/40 scale-[1.02] shadow-xl' 
                          : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {selectedShip === ship.type && (
                        <motion.div 
                          layoutId="activeShip"
                          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                        />
                      )}
                      
                      <div className="relative flex items-center justify-center h-12 w-full mb-0.5">
                        <div className={`absolute inset-0 ${ship.color} opacity-10 blur-xl rounded-full scale-75`} />
                        <img 
                          src={ship.image} 
                          alt={ship.label}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          className={`w-10 h-10 object-contain relative z-10 transition-transform duration-500 ${
                            selectedShip === ship.type ? 'scale-110' : 'scale-90 grayscale'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-md ${ship.color} shadow-lg flex items-center justify-center shrink-0`}>
                          {ship.icon}
                        </div>
                        <div>
                          <span className="text-white text-[10px] font-bold block leading-none">{ship.label}</span>
                          <span className="text-white/40 text-[7px] leading-tight block mt-0.5">{ship.desc}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button 
                  onClick={() => onStart(selectedShip)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  开始战斗
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Screen */}
      <AnimatePresence>
        {gameState === GameState.PAUSED && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl max-w-sm w-full text-center pointer-events-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-6">游戏暂停</h2>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 mb-8">
              {volume === 0 ? <VolumeX className="text-white/40 w-5 h-5" /> : <Volume2 className="text-blue-400 w-5 h-5" />}
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange}
                className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={onResume}
                className="py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-semibold transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                继续战斗
              </button>
              <button 
                onClick={onRestart}
                className="py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-semibold transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                重新开始
              </button>
              <button 
                onClick={onHome}
                className="py-4 bg-red-500/20 hover:bg-red-500/30 rounded-2xl text-red-400 font-semibold transition-all flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5" />
                退出游戏
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === GameState.GAMEOVER && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl max-w-lg w-full text-center pointer-events-auto"
          >
            <div className="bg-red-500/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <Zap className="text-red-500 w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-white mb-2 uppercase">任务失败</h2>
            <p className="text-white/40 mb-8">战机已被摧毁，但你的英勇将被铭记</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">最终得分</p>
                <p className="text-2xl font-bold text-white tabular-nums">{score.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">最高关卡</p>
                <p className="text-2xl font-bold text-white">{level}</p>
              </div>
            </div>

            <div className="mb-10 text-left">
              <h3 className="text-white/60 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy className="w-3 h-3" />
                获得成就
              </h3>
              <div className="flex flex-wrap gap-2">
                {achievements.filter(a => a.unlocked).length > 0 ? (
                  achievements.filter(a => a.unlocked).map(a => (
                    <div key={a.id} className="bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                      <div className="text-blue-400">{renderIcon(a.icon)}</div>
                      <span className="text-blue-100 text-xs font-medium">{a.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/20 text-sm italic">暂无成就</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onRestart}
                className="py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                再次挑战
              </button>
              <button 
                onClick={onHome}
                className="py-5 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5" />
                返回主页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Unlock Popup */}
      <AnimatePresence>
        {activeAchievement && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-10 right-10 bg-blue-600/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs"
          >
            <div className="bg-white/20 p-3 rounded-xl">
              {renderIcon(activeAchievement.icon)}
            </div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">成就解锁</p>
              <p className="text-white font-bold">{activeAchievement.title}</p>
              <p className="text-white/70 text-xs">{activeAchievement.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UIOverlay;
