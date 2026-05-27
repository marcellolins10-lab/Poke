/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playLevelUp, playBeep } from '../utils/audio';

interface TogepiTimerProps {
  remainingMs: number;
  initialDurationMs: number;
  isActive: boolean;
  isComplete: boolean;
  onReset: () => void;
  onEggClick?: () => void;
}

export default function TogepiTimer({
  remainingMs,
  initialDurationMs,
  isActive,
  isComplete,
  onReset,
  onEggClick,
}: TogepiTimerProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; rotation: number; size: number }[]>([]);

  // Trigger level up sound when timer completes
  useEffect(() => {
    if (isComplete) {
      playLevelUp();
      
      // Seed confetti
      const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
      const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: -10 - Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 365,
        size: Math.random() * 6 + 4,
      }));
      setConfetti(particles);
    } else {
      setConfetti([]);
    }
  }, [isComplete]);

  // Handle confetti falling animation
  useEffect(() => {
    let interval: number;
    if (isComplete && confetti.length > 0) {
      interval = window.setInterval(() => {
        setConfetti(prev => 
          prev.map(p => ({
            ...p,
            y: p.y > 110 ? -10 : p.y + 3,
            rotation: (p.rotation + 5) % 360,
          }))
        );
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isComplete, confetti.length]);

  // Calculate rocking parameters based on remaining time ratio
  const ratio = initialDurationMs > 0 ? remainingMs / initialDurationMs : 1;
  const isRocking = isActive && remainingMs > 0;

  let rockDuration = 1.6; // slow
  let rockDegrees = [-4, 4, -4]; // narrow

  if (isRocking) {
    if (ratio < 0.2) {
      // Violent rocking
      rockDuration = 0.25;
      rockDegrees = [-15, 15, -15];
    } else if (ratio < 0.5) {
      // Solid rocking
      rockDuration = 0.5;
      rockDegrees = [-10, 10, -10];
    } else if (ratio < 0.8) {
      // Gentle rocking
      rockDuration = 0.9;
      rockDegrees = [-6, 6, -6];
    }
  }

  const handleResetClick = () => {
    playBeep(400, 0.1);
    onReset();
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-end items-center lcd-grid bg-[#8bac0f] text-[#0f380f] border-r border-[#1c301c]/30 select-none">
      {/* Confetti canvas */}
      {isComplete && (
        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
          {confetti.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond style confetti
              }}
            />
          ))}
        </div>
      )}

      {/* Mode header */}
      <div className="absolute top-3 left-4 font-press-start text-[8px] opacity-75 flex items-center space-x-1.5">
        <span className={isActive && !isComplete ? 'text-blue-500 animate-pulse' : 'text-emerald-700'}>
          🥚
        </span>
        <span>{isComplete ? 'CHOCOU COM SUCESSO!' : isActive ? 'INCUBANDO OVO' : 'PRONTO PARA INCUBAR'}</span>
      </div>

      {/* Main Egg / Togepi Display */}
      <div className="relative z-10 w-44 h-44 flex flex-col items-center justify-center">
        
        {/* Surprise Balloon (!) for completion */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0, y: 15 }}
            animate={{ scale: [1.2, 1], y: [0, -5, 0] }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute top-4 bg-red-500 text-white font-press-start font-bold text-[10px] px-2 py-0.5 rounded-full border-2 border-stone-800 shadow"
            style={{ zIndex: 30 }}
          >
            ❗ NOVO AMIGO!
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {isComplete ? (
            /* HATCHED TOGEPI */
            <motion.div
              key="hatched"
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="flex flex-col items-center justify-center mt-3"
            >
              <svg width="110" height="110" viewBox="0 0 110 110" className="w-24 h-24 drop-shadow-[0_2px_4px_rgba(40,64,40,0.1)]">
                {/* Outstretched happy small hands */}
                <motion.path 
                  animate={{ rotate: [-20, 20, -20], y: [0, -4, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  d="M 24 54 Q 12 40 20 48" stroke="#406840" strokeWidth="2.5" fill="none" strokeLinecap="round" 
                />
                <motion.path 
                  animate={{ rotate: [20, -20, 20], y: [0, -4, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  d="M 86 54 Q 98 40 90 48" stroke="#406840" strokeWidth="2.5" fill="none" strokeLinecap="round" 
                />

                {/* Togepi Cream Head / Spikes */}
                <path 
                  d="M 32 46 C 30 30 40 20 40 24 C 44 14 50 20 54 22 C 58 12 66 18 68 24 C 74 15 80 26 78 40" 
                  fill="#FFF7ED" stroke="#406840" strokeWidth="2.5" 
                />

                {/* Happy little dot eyes */}
                <circle cx="48" cy="36" r="2" fill="#1A1A1A" />
                <circle cx="62" cy="36" r="2" fill="#1A1A1A" />

                {/* Tiny triangular blushing cheeks */}
                <polygon points="41,40 45,41 43,44" fill="#F43F5E" />
                <polygon points="69,40 65,41 67,44" fill="#F43F5E" />

                {/* W Happy Mouth */}
                <path d="M 52 42 C 53 44 57 44 58 42" stroke="#406840" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {/* Split/Hatched Bottom Shell */}
                <path 
                  d="M 28 54 Q 22 75 40 88 Q 70 88 82 72 Q 88 54 82 54 L 72 60 L 64 54 L 56 62 L 48 54 L 38 60 Z" 
                  fill="#FFFBEB" stroke="#406840" strokeWidth="2.5" strokeLinejoin="round" 
                />

                {/* Triangles & Stars pattern on Togepi's egg shell (Red & Blue) */}
                {/* Red Triangles */}
                <polygon points="34,68 40,74 32,76" fill="#EF4444" stroke="#406840" strokeWidth="1" />
                <polygon points="56,66 62,64 58,72" fill="#EF4444" stroke="#406840" strokeWidth="1" />
                <polygon points="74,68 80,72 72,76" fill="#3B82F6" stroke="#406840" strokeWidth="1" />
                {/* Blue Crowns */}
                <polygon points="44,78 48,84 40,84" fill="#3B82F6" stroke="#406840" strokeWidth="1" />
                <polygon points="64,76 68,82 60,82" fill="#EF4444" stroke="#406840" strokeWidth="1" />

                {/* Stubby baby feet */}
                <ellipse cx="42" cy="90" rx="6" ry="4" fill="#FFFBEB" stroke="#406840" strokeWidth="2" />
                <ellipse cx="68" cy="90" rx="6" ry="4" fill="#FFFBEB" stroke="#406840" strokeWidth="2" />
              </svg>
              <div className="font-press-start text-[8px] text-emerald-800 font-bold tracking-wider mt-1 text-center animate-bounce">
                TOGEPRIII!! ★
              </div>
            </motion.div>
          ) : (
            /* INCUBATING / SHAKING EGG */
            <motion.div
              key="incubating"
              animate={isRocking ? {
                rotate: rockDegrees,
              } : {}}
              transition={{
                duration: rockDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileTap={{ scale: 0.9, rotate: [-15, 15, -15, 15, 0] }}
              onClick={() => {
                if (onEggClick) onEggClick();
              }}
              className="flex flex-col items-center justify-center mt-3 cursor-pointer"
              title="Clique para sacudir o ovo!"
            >
              <svg width="100" height="110" viewBox="0 0 100 110" className="w-24 h-24 drop-shadow-[0_2px_4px_rgba(40,64,40,0.1)]">
                {/* Large Egg body */}
                <path 
                  d="M 50 15 C 22 15 22 85 50 95 C 78 85 78 15 50 15 Z" 
                  fill="#FFF7ED" stroke="#406840" strokeWidth="2.5" 
                />

                {/* Shell Triangles & Crowns patterns */}
                {/* Blue Shapes */}
                <polygon points="36,44 46,40 42,50" fill="#3B82F6" stroke="#406840" strokeWidth="1" />
                <polygon points="56,36 64,44 54,46" fill="#EF4444" stroke="#406840" strokeWidth="1" />
                <polygon points="62,60 74,56 68,68" fill="#3B82F6" stroke="#406840" strokeWidth="1" />

                {/* Red Shapes */}
                <polygon points="32,68 40,76 30,78" fill="#EF4444" stroke="#406840" strokeWidth="1" />
                <polygon points="46,58 54,64 42,66" fill="#3B82F6" stroke="#406840" strokeWidth="1" />
                <polygon points="58,74 66,80 56,82" fill="#EF4444" stroke="#406840" strokeWidth="1" />

                {/* Hatch Crack Guideline (Subtle) */}
                <path d="M 28 65 Q 40 68 50 63 Q 62 60 72 65" stroke="#406840" strokeWidth="1" strokeDasharray="3,3" fill="none" />
              </svg>

              {ratio < 0.2 && isRocking ? (
                <div className="font-press-start text-[6px] text-red-650 animate-pulse mt-2 font-bold bg-amber-200/50 px-1 rounded text-center">
                  ⚠️ RACHANDO! CLIQUE/SACUDA!
                </div>
              ) : isActive ? (
                <div className="font-press-start text-[6px] text-emerald-700/80 mt-2 font-bold text-center animate-pulse">
                  CLIQUE PARA SACUDIR COLO
                </div>
              ) : (
                <div className="font-press-start text-[6px] text-emerald-850/70 mt-2 text-center">
                  TOQUE NO OVO PARA AQUECER!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Level-up reset click */}
      {isComplete && (
        <motion.button
          onClick={handleResetClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-16 z-20 left-12 right-12 bg-emerald-600 hover:bg-emerald-700 text-amber-100 font-press-start text-[7px] py-1.5 px-2 rounded-md shadow-md border-2 border-stone-800"
        >
          REINICIAR CHOCAGEM
        </motion.button>
      )}
    </div>
  );
}
