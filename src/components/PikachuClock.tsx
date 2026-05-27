/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playThunderbolt } from '../utils/audio';

interface PikachuClockProps {
  currentTime: Date;
  triggerSpark: boolean;
  onSparkDone: () => void;
}

export default function PikachuClock({ currentTime, triggerSpark, onSparkDone }: PikachuClockProps) {
  const hour = currentTime.getHours();
  const isNight = hour >= 20 || hour < 6;

  // Track spark particle sparks
  const [lightningParticles, setLightningParticles] = useState<{ id: number; x: number; y: number; rotate: number }[]>([]);

  useEffect(() => {
    if (triggerSpark) {
      playThunderbolt();
      
      // Generate some exciting random zigzag lightning bolts around Pikachu
      const particles = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 10,
        rotate: Math.random() * 360,
      }));
      setLightningParticles(particles);

      const timer = setTimeout(() => {
        setLightningParticles([]);
        onSparkDone();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [triggerSpark, onSparkDone]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-end items-center lcd-grid bg-[#8bac0f] text-[#0f380f] border-r border-[#1c301c]/30 select-none">
      {/* Dynamic Retro Sky Background */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${isNight ? 'bg-indigo-950/20' : 'bg-sky-200/10'}`} />

      {/* Floating Retro Sun or Moon Celestial Body */}
      <div className="absolute top-4 left-6 pointer-events-none select-none z-10">
        {isNight ? (
          <motion.div
            animate={{ 
              y: [0, -3, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center text-[#406840]"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-35">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            animate={{ 
              y: [0, -3, 0],
              scale: [1, 1.05, 1],
              rotate: [0, 360]
            }}
            transition={{
              y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 40, repeat: Infinity, ease: 'linear' }
            }}
            className="flex items-center justify-center text-[#406840]"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-35">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="23" />
              <line x1="1" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
              <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Retro Pixel Clouds (Floating) */}
      <div className="absolute top-4 left-0 w-full overflow-hidden pointer-events-none">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex space-x-16 opacity-40 text-[#406840]"
        >
          {/* Pixel Cloud 1 */}
          <div className="flex flex-col space-y-0.5">
            <div className="flex justify-center"><div className="w-6 h-2 bg-current" /></div>
            <div className="w-12 h-2 bg-current" />
          </div>
          {/* Pixel Cloud 2 */}
          <div className="flex flex-col space-y-0.5 mt-2">
            <div className="w-16 h-2 bg-current" />
            <div className="w-8 h-2 bg-current mx-auto" />
          </div>
        </motion.div>
      </div>

      {/* Sun/Moon Indicator */}
      <div className="absolute top-3 right-4 pointer-events-none font-press-start text-[8px] opacity-70 flex items-center space-x-1.5">
        {isNight ? (
          <span className="flex items-center space-x-1">
            <span>🌙</span>
            <span>NOITE</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1">
            <span>☀️</span>
            <span>DIA</span>
          </span>
        )}
      </div>

      {/* Grassy Background (Horizontal scrolling on walk mode) */}
      <div className="absolute bottom-4 left-0 w-[200%] h-6 pointer-events-none opacity-40 flex overflow-hidden">
        <motion.div 
          animate={!isNight ? { x: ['0%', '-50%'] } : {}}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="flex w-full"
        >
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="flex flex-col justify-end h-full w-2">
              <div className="w-0.5 h-3 bg-[#406840] mb-0" />
              <div className="w-1 h-1 bg-[#406840] mb-1" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Ground Line */}
      <div className="absolute bottom-4 left-0 w-full h-[1px] bg-[#406840]/40" />

      {/* Standard walking Pikachu or sleeping Pikachu */}
      <div className="relative z-10 w-44 h-44 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isNight ? (
            /* SLEEPING PIKACHU */
            <motion.div
              key="sleeping"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center justify-center relative mt-6"
            >
              {/* Float Zzz bubbles */}
              <motion.div 
                animate={{ y: [-10, -35], x: [0, 8, -4], opacity: [0, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-2 right-4 font-press-start text-[9px] text-[#406840] font-bold"
              >
                Zzz
              </motion.div>
              <motion.div 
                animate={{ y: [-5, -25], x: [5, 12, 8], opacity: [0, 1, 0] }}
                transition={{ duration: 2.2, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 right-1 font-press-start text-[7px] text-[#406840]/80"
              >
                zZ
              </motion.div>

              {/* Pikachu sleeping SVG */}
              <svg width="100" height="90" viewBox="0 0 100 90" className="w-24 h-24">
                {/* Tail lying down */}
                <path d="M 12 70 L 6 52 L 20 54 L 14 38 L 30 44 L 28 58 L 38 60 Z" fill="#FCE22A" stroke="#406840" strokeWidth="2" strokeLinejoin="miter" />
                <path d="M 12 70 L 6 52 L 14 53 Z" fill="#A87023" />
                
                {/* Plump Body curled up */}
                <ellipse cx="50" cy="65" rx="32" ry="20" fill="#FCE22A" stroke="#406840" strokeWidth="2" />
                {/* Back Stripes */}
                <path d="M 28 58 Q 32 55 38 61" stroke="#A87023" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M 32 63 Q 36 60 42 66" stroke="#A87023" strokeWidth="3.5" fill="none" strokeLinecap="round" />

                {/* Head resting closed eyes */}
                <motion.ellipse 
                  animate={{ y: [0, 1.5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  cx="70" cy="52" rx="20" ry="18" fill="#FCE22A" stroke="#406840" strokeWidth="2" 
                />
                
                {/* Ears folded down sleepily */}
                {/* Left Ear */}
                <path d="M 68 35 Q 52 25 50 32 Q 54 44 64 40 Z" fill="#FCE22A" stroke="#406840" strokeWidth="2" />
                <path d="M 52 25 Q 50 32 54 34 Z" fill="#1A1A1A" />
                {/* Right Ear */}
                <path d="M 78 35 Q 92 18 95 24 Q 88 40 76 40 Z" fill="#FCE22A" stroke="#406840" strokeWidth="2" />
                <path d="M 92 18 Q 95 24 88 28 Z" fill="#1A1A1A" />

                {/* Cheeks */}
                <circle cx="82" cy="58" r="4.5" fill="#FF1C1C" />

                {/* Sleeping Closed Eyes (curves) */}
                <path d="M 64 50 Q 67 52 70 50" stroke="#406840" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 74 50 Q 77 52 80 50" stroke="#406840" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Cute Nose */}
                <polygon points="72,53 74,53 73,54.5" fill="#406840" />
                {/* Sleepy smile curve */}
                <path d="M 70 57 Q 73 59 76 57" stroke="#406840" strokeWidth="1" fill="none" />

                {/* Cute Nightcap */}
                <path d="M 58 40 Q 65 14 55 10 Q 52 14 58 35 Z" fill="#319795" stroke="#406840" strokeWidth="1.5" />
                <circle cx="53" cy="9" r="3" fill="#F2F4F3" />
                <path d="M 60 38 Q 70 34 80 39 Q 78 44 68 44 Z" fill="#F2F4F3" />
              </svg>
              <div className="font-press-start text-[8px] text-[#406840] tracking-wider mt-1 opacity-70">
                PIKA... Zzz
              </div>
            </motion.div>
          ) : (
            /* WALKING / JUMPING PIKACHU */
            <motion.div
              key="walking"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: triggerSpark ? [-4, -60, -4, -15, 0] : [0, -8, 0],
                rotate: triggerSpark ? [0, 15, -15, 10, 0] : 0
              }}
              transition={triggerSpark ? {
                duration: 1.0,
                times: [0, 0.25, 0.5, 0.75, 1.0]
              } : {
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="flex flex-col items-center justify-center relative mt-3"
            >
              {/* Thunderbolt pop effect */}
              {triggerSpark && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 bg-yellow-300/30 z-20 rounded-lg pointer-events-none border-2 border-yellow-400 flex items-center justify-center font-press-start text-xs text-yellow-900"
                >
                  SPARK!!
                </motion.div>
              )}

              {/* Pikachu active SVG */}
              <svg width="120" height="120" viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-[0_2px_2px_rgba(64,104,64,0.15)]">
                {/* Lightning Tail */}
                <motion.path 
                  animate={{ rotate: triggerSpark ? [0, -25, 25, 0] : [0, -6, 6, 0] }}
                  transition={{ duration: 0.6, repeat: triggerSpark ? 0 : Infinity }}
                  d="M 28 84 L 12 60 L 32 63 L 22 35 L 45 42 L 38 68 L 50 72 Z" 
                  fill="#FCE22A" 
                  stroke="#406840" 
                  strokeWidth="2" 
                  strokeLinejoin="miter" 
                />
                <path d="M 28 84 L 12 60 L 22 61 Z" fill="#A87023" />

                {/* Body bouncy walk shape */}
                <ellipse cx="60" cy="80" rx="22" ry="24" fill="#FCE22A" stroke="#406840" strokeWidth="2" />
                {/* Back Stripes */}
                <path d="M 40 76 H 45" stroke="#A87023" strokeWidth="3" strokeLinecap="round" />
                <path d="M 39 82 H 44" stroke="#A87023" strokeWidth="3" strokeLinecap="round" />

                {/* Left Arm and Right Arm */}
                <motion.path 
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  d="M 44 78 Q 32 78 38 86" 
                  stroke="#406840" strokeWidth="2" fill="none" strokeLinecap="round" 
                />
                <motion.path 
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  d="M 76 78 Q 88 78 82 86" 
                  stroke="#406840" strokeWidth="2" fill="none" strokeLinecap="round" 
                />

                {/* Head */}
                <motion.ellipse 
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  cx="60" cy="52" rx="19" ry="18" fill="#FCE22A" stroke="#406840" strokeWidth="2" 
                />

                {/* Longpointed Ears */}
                {/* Left Ear */}
                <motion.path 
                  animate={{ rotate: triggerSpark ? [-15, 15, -15] : [-5, 5, -5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  d="M 50 37 Q 26 10 32 8 Q 44 20 48 35 Z" 
                  fill="#FCE22A" stroke="#406840" strokeWidth="2" 
                />
                <path d="M 26 10 Q 32 8 Q 36 12 Z" fill="#1A1A1A" />

                {/* Right Ear */}
                <motion.path 
                  animate={{ rotate: triggerSpark ? [15, -15, 15] : [5, -5, 5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  d="M 70 37 Q 94 10 88 8 Q 76 20 72 35 Z" 
                  fill="#FCE22A" stroke="#406840" strokeWidth="2" 
                />
                <path d="M 94 10 Q 88 8 Q 84 12 Z" fill="#1A1A1A" />

                {/* Cheeks */}
                <circle cx="48" cy="58" r="4.5" fill="#FF1C1C" />
                <circle cx="72" cy="58" r="4.5" fill="#FF1C1C" />

                {/* Chubby Eyes */}
                <circle cx="53" cy="49" r="2.5" fill="#1A1A1A" />
                <circle cx="52" cy="48" r="0.8" fill="#FFFFFF" />
                <circle cx="67" cy="49" r="2.5" fill="#1A1A1A" />
                <circle cx="66" cy="48" r="0.8" fill="#FFFFFF" />

                {/* Nose */}
                <polygon points="59,52.5 61,52.5 60,54" fill="#1A1A1A" />

                {/* Cute Open W Mouth */}
                {triggerSpark ? (
                  /* Big shock mouth */
                  <circle cx="60" cy="59" r="4" fill="#602020" stroke="#406840" strokeWidth="1.5" />
                ) : (
                  /* Standard Pikachu smile */
                  <path d="M 56 56 Q 58 58 60 56 Q 62 58 64 56" stroke="#406840" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                )}

                {/* Walk feet */}
                <motion.path 
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  d="M 48 104 Q 44 110 50 110" stroke="#406840" strokeWidth="2" fill="none" strokeLinecap="round" 
                />
                <motion.path 
                  animate={{ y: [4, 0, 4] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  d="M 72 104 Q 76 110 70 110" stroke="#406840" strokeWidth="2" fill="none" strokeLinecap="round" 
                />
              </svg>
              <div className="font-press-start text-[8px] text-[#406840] tracking-wider mt-1 opacity-70">
                PIKA! PIKA!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spark particles layered on top during full-screen spark state */}
      {lightningParticles.map((pt) => (
        <motion.div
          key={pt.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [1, 1.5, 0], opacity: [1, 0.8, 0] }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            left: `${pt.x}%`,
            top: `${pt.y}%`,
            transform: `rotate(${pt.rotate}deg)`,
          }}
          className="pointer-events-none"
        >
          {/* SVG representation of retro yellow sparks */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10" fill="#FCE22A" stroke="#104010" strokeWidth="1" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
