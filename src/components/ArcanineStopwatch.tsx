/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSwoosh } from '../utils/audio';

interface ArcanineStopwatchProps {
  isRunning: boolean;
  lapTriggerCount: number; // Increment this to trigger lap visual effects
}

export default function ArcanineStopwatch({ isRunning, lapTriggerCount }: ArcanineStopwatchProps) {
  const [flames, setFlames] = useState<{ id: number; top: number; size: number; delay: number }[]>([]);
  const [showGhost, setShowGhost] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const flameIdCounter = useRef(0);

  // Generate scrolling flame trail particles continuously while running
  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => {
        setFlames(prev => {
          const newFlame = {
            id: flameIdCounter.current++,
            top: Math.random() * 50 + 25, // center-ish vertical y
            size: Math.random() * 12 + 6,
            delay: Math.random() * 0.2,
          };
          // Keep list lean
          return [...prev.slice(-15), newFlame];
        });
      }, 100);
    } else {
      setFlames([]);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle lap triggers to draw a ghost trailing copy and dust clouds
  useEffect(() => {
    if (lapTriggerCount > 0) {
      playSwoosh();
      setShowGhost(true);
      setShowDust(true);

      const ghostTimer = setTimeout(() => setShowGhost(false), 900);
      const dustTimer = setTimeout(() => setShowDust(false), 600);

      return () => {
        clearTimeout(ghostTimer);
        clearTimeout(dustTimer);
      };
    }
  }, [lapTriggerCount]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-end items-center lcd-grid bg-[#8bac0f] text-[#0f380f] border-r border-[#1c301c]/30 select-none">
      {/* Velocity / Speed Lines */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '120%' }}
              animate={{ x: '-120%' }}
              transition={{
                duration: 0.8 + Math.random() * 0.6,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 0.5,
              }}
              style={{
                top: `${i * 8 + 10}%`,
                height: '1.5px',
                width: `${Math.random() * 50 + 20}px`,
              }}
              className="absolute bg-[#406840]"
            />
          ))}
        </div>
      )}

      {/* Mode header */}
      <div className="absolute top-3 left-4 font-press-start text-[8px] opacity-75 flex items-center space-x-1.5">
        <span className={isRunning ? 'text-orange-500 animate-spin' : 'text-emerald-700'}>
          ⚙️
        </span>
        <span>{isRunning ? 'ARRANQUE TÁTICO' : 'CRONÔMETRO PRONTO'}</span>
      </div>

      {/* Flames streaming backwards (procedural) */}
      <AnimatePresence>
        {flames.map(flame => (
          <motion.div
            key={flame.id}
            initial={{ x: '60px', y: `${flame.top}%`, scale: 0.6, opacity: 0.9 }}
            animate={{ x: '-160px', scale: [1, 1.4, 0.2], opacity: [0.9, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: flame.delay }}
            className="absolute pointer-events-none"
            style={{ zIndex: 5 }}
          >
            {/* Retro 8-bit Fire Diamond representation */}
            <svg width={flame.size} height={flame.size} viewBox="0 0 16 16">
              <polygon 
                points="8,1 15,8 8,15 1,8" 
                fill={Math.random() > 0.4 ? '#F97316' : '#EF4444'} 
                stroke="#1c1917" 
                strokeWidth="0.75" 
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Arcanine Sprite Frame */}
      <div className="relative z-10 w-44 h-44 flex items-center justify-center">
        
        {/* Laplace Dust Cloud Spark */}
        {showDust && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute z-20 left-6 bottom-10 pointer-events-none"
          >
            <svg width="60" height="40" viewBox="0 0 60 40">
              {/* Cute 8-bit clouds overlay */}
              <circle cx="20" cy="20" r="12" fill="#E2E8F0" stroke="#1c1917" strokeWidth="2" />
              <circle cx="35" cy="18" r="10" fill="#E2E8F0" stroke="#1c1917" strokeWidth="2" />
              <circle cx="45" cy="25" r="8" fill="#CBD5E1" stroke="#1c1917" strokeWidth="2" />
            </svg>
          </motion.div>
        )}

        {/* Arcanine Ghost Image (Trailing) */}
        {showGhost && (
          <div className="absolute left-10 opacity-30 z-0 pointer-events-none filter scale-95 origin-center select-none">
            <svg width="120" height="110" viewBox="0 0 120 110" className="opacity-50">
              <rect x="0" y="0" width="120" height="110" fill="none" />
              {/* Ghost shape */}
              <ellipse cx="60" cy="65" rx="36" ry="24" fill="#38BDF8" />
              <ellipse cx="78" cy="42" rx="18" ry="16" fill="#38BDF8" />
              <path d="M 60 20 L 75 10 L 80 25 Z" fill="#E0F2FE" />
              <path d="M 40 40 Q 20 50 10 75 Q 35 60 30 90 L 50 78 Z" fill="#E0F2FE" />
            </svg>
            <div className="font-press-start text-[6px] text-[#0284C7] bg-[#E0F2FE]/50 px-1 text-center rounded">
              VOLTA REGISTRADA
            </div>
          </div>
        )}

        {/* Regular Arcanine Model */}
        <motion.div
          animate={isRunning ? {
            y: [0, -6, 0, -6, 0],
            rotate: [1, -2, 2, -1, 1],
          } : {
            y: [0, -1, 0]
          }}
          transition={isRunning ? {
            duration: 0.35,
            repeat: Infinity,
            ease: 'linear'
          } : {
            duration: 2.0,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative"
        >
          <svg width="115" height="100" viewBox="0 0 115 100" className="w-28 h-28 drop-shadow-[0_2px_4px_rgba(40,64,40,0.15)]">
            {/* Back Fluffy Tail */}
            <motion.path 
              animate={isRunning ? { rotate: [-10, 15, -10] } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
              d="M 30 60 Q 5 50 8 30 Q 18 10 32 35 Q 26 50 30 60" 
              fill="#FAF9F6" stroke="#406840" strokeWidth="2" strokeLinecap="round" 
            />

            {/* Back Leg Left */}
            <motion.path 
              animate={isRunning ? { rotate: [-20, 30, -20] } : {}}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
              d="M 28 68 Q 16 75 22 88 Q 30 88 32 76" 
              fill="#EA580C" stroke="#406840" strokeWidth="2" 
            />

            {/* Back Leg Right */}
            <motion.path 
              animate={isRunning ? { rotate: [20, -30, 20] } : {}}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'linear', delay: 0.15 }}
              d="M 36 68 Q 42 75 40 88 Q 48 88 44 76" 
              fill="#EA580C" stroke="#406840" strokeWidth="2" 
            />

            {/* Main Orange/Red Tiger-Striped Plump Body */}
            <ellipse cx="56" cy="62" rx="30" ry="20" fill="#EA580C" stroke="#406840" strokeWidth="2" />
            
            {/* Tiger Stripes */}
            <path d="M 44 54 Q 46 62 42 68" stroke="#1C1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 52 50 Q 56 60 52 70" stroke="#1C1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 64 54 Q 66 62 62 68" stroke="#1C1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Front Leg Left */}
            <motion.path 
              animate={isRunning ? { rotate: [30, -20, 30] } : {}}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
              d="M 68 68 Q 63 76 74 88 Q 80 84 76 72" 
              fill="#EA580C" stroke="#406840" strokeWidth="2" 
            />

            {/* Front Leg Right */}
            <motion.path 
              animate={isRunning ? { rotate: [-30, 20, -30] } : {}}
              transition={{ duration: 0.3, repeat: Infinity, ease: 'linear', delay: 0.15 }}
              d="M 76 68 Q 82 76 84 88 Q 90 84 82 72" 
              fill="#EA580C" stroke="#406840" strokeWidth="2" 
            />

            {/* Big Fluffy Cream Chest Mane */}
            <path 
              d="M 70 50 Q 82 54 82 66 Q 72 74 62 66 Q 52 50 70 50 Z" 
              fill="#FAF9F6" stroke="#406840" strokeWidth="2" 
            />

            {/* Head */}
            <ellipse cx="80" cy="40" rx="14" ry="12" fill="#EA580C" stroke="#406840" strokeWidth="2" />

            {/* Cream Mane around Head */}
            <path 
              d="M 68 36 Q 60 20 74 24 Q 84 10 88 26 Q 96 32 86 44 Z" 
              fill="#FAF9F6" stroke="#406840" strokeWidth="2" 
            />

            {/* Pointy Ears */}
            <polygon points="70,30 65,16 75,22" fill="#EA580C" stroke="#406840" strokeWidth="2" />
            <polygon points="86,30 92,16 83,23" fill="#EA580C" stroke="#406840" strokeWidth="2" />

            {/* Black Snout / Nose */}
            <polygon points="90,40 94,42 90,44" fill="#1C1917" />
            
            {/* Proud Canine Eye */}
            <circle cx="80" cy="36" r="2" fill="#1C1917" />
            <circle cx="79" cy="35" r="0.75" fill="#FFFFFF" />

            {/* Tiger stripe on cheek */}
            <path d="M 84 38 L 82 42" stroke="#1C1917" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </motion.div>
        
        {isRunning ? (
          <div className="absolute bottom-1 right-2 font-press-start text-[6px] text-orange-600 bg-orange-100 border border-orange-400 px-1.5 py-0.5 rounded animate-pulse">
            VELOCIDADE MÁXIMA
          </div>
        ) : (
          <div className="absolute bottom-1 right-2 font-press-start text-[6px] text-emerald-700/80">
            VELOC: 0 KM/H
          </div>
        )}
      </div>
      
      <div className="font-press-start text-[7px] text-emerald-800 tracking-wider mb-2 opacity-75 font-semibold">
        ARCANINE CORRENDO
      </div>
    </div>
  );
}
