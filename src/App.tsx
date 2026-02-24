import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState, Achievement, GameStats, Difficulty, ShipType } from './types';
import { Info, Shield, Zap, Target, MousePointer2 } from 'lucide-react';

import { audioManager } from './services/audioService';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.ADVANCED);
  const [selectedShip, setSelectedShip] = useState<ShipType>(ShipType.BALANCED);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [hp, setHp] = useState(3);
  const [bombs, setBombs] = useState(3);
  const [lastStats, setLastStats] = useState<GameStats>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);

  const handleStart = useCallback((ship: ShipType) => {
    setDifficulty(Difficulty.ADVANCED);
    setSelectedShip(ship);
    setGameState(GameState.PLAYING);
    setScore(0);
    setLevel(1);
    setHp(3);
    setBombs(3);
    audioManager.playMusic();
  }, []);

  const handlePause = useCallback(() => {
    setGameState(GameState.PAUSED);
    audioManager.pauseMusic();
  }, []);

  const handleResume = useCallback(() => {
    setGameState(GameState.PLAYING);
    audioManager.playMusic();
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setLevel(1);
    setHp(3);
    setBombs(3);
    audioManager.playMusic();
  }, []);

  const handleHome = useCallback(() => {
    setGameState(GameState.START);
    audioManager.pauseMusic();
  }, []);

  const handleGameOver = useCallback((stats: GameStats, finalAchievements: Achievement[]) => {
    setGameState(GameState.GAMEOVER);
    setLastStats(stats);
    setAchievements(finalAchievements);
    audioManager.pauseMusic();
    audioManager.playSound('gameover');
  }, []);

  const handleScoreUpdate = useCallback((newScore: number, newLevel: number, newHp: number, newBombs: number) => {
    setScore(newScore);
    setLevel(newLevel);
    setHp(newHp);
    setBombs(newBombs);
  }, []);

  const handleAchievementUnlock = useCallback((achievement: Achievement) => {
    setActiveAchievement(achievement);
    setTimeout(() => setActiveAchievement(null), 4000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === GameState.PLAYING) handlePause();
        else if (gameState === GameState.PAUSED) handleResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handlePause, handleResume]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex">
      
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex flex-col w-80 h-full bg-slate-900/50 backdrop-blur-md border-r border-white/5 p-8 overflow-y-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-white italic tracking-tighter mb-1">CHEN XING</h1>
          <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase">Interstellar Pioneer</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
              <MousePointer2 className="w-3 h-3" />
              操作指南
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/60 text-xs">移动</span>
                <span className="text-white text-xs font-mono bg-white/10 px-2 py-1 rounded">鼠标/触摸 拖动</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/60 text-xs">重型炸弹</span>
                <span className="text-white text-xs font-mono bg-white/10 px-2 py-1 rounded">鼠标左键</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/60 text-xs">暂停</span>
                <span className="text-white text-xs font-mono bg-white/10 px-2 py-1 rounded">P / ESC</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              道具说明
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">T</div>
                <div>
                  <p className="text-white text-xs font-bold">三向子弹</p>
                  <p className="text-white/40 text-[10px]">增强火力覆盖</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#ec4899]/20 flex items-center justify-center text-pink-500 font-bold">L</div>
                <div>
                  <p className="text-white text-xs font-bold">激光炮</p>
                  <p className="text-white/40 text-[10px]">穿透性持续伤害</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/20 flex items-center justify-center text-cyan-500 font-bold">M</div>
                <div>
                  <p className="text-white text-xs font-bold">散弹炮</p>
                  <p className="text-white/40 text-[10px]">五向散射火力</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-500 font-bold">S</div>
                <div>
                  <p className="text-white text-xs font-bold">能量护盾</p>
                  <p className="text-white/40 text-[10px]">抵挡一次伤害</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">B</div>
                <div>
                  <p className="text-white text-xs font-bold">重型炸弹</p>
                  <p className="text-white/40 text-[10px]">增加一枚重型炸弹</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              敌机情报
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-white/60 text-xs">基础型</span>
                </div>
                <span className="text-white/40 text-[10px]">均衡</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-white/60 text-xs">快速型</span>
                </div>
                <span className="text-white/40 text-[10px]">极速</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-white/60 text-xs">重型</span>
                </div>
                <span className="text-white/40 text-[10px]">高血量</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/20">
            <Info className="w-4 h-4" />
            <span className="text-[10px] font-medium">版本 1.0.4 - 银河系部署</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="flex-1 relative h-full">
        <GameCanvas 
          gameState={gameState}
          difficulty={difficulty}
          shipType={selectedShip}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          onAchievementUnlock={handleAchievementUnlock}
        />
        
        <UIOverlay 
          gameState={gameState}
          score={score}
          level={level}
          hp={hp}
          bombs={bombs}
          onStart={handleStart}
          onResume={handleResume}
          onPause={handlePause}
          onRestart={handleRestart}
          onHome={handleHome}
          lastStats={lastStats}
          achievements={achievements}
          activeAchievement={activeAchievement}
        />
      </main>
    </div>
  );
}
