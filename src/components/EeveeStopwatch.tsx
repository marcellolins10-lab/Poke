/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSwoosh } from '../utils/audio';

interface EeveeStopwatchProps {
  isRunning: boolean;
  lapTriggerCount: number; // Increment this to trigger lap visual effects
  currentTime: number;      // Current stopwatch time in ms
  dashTriggerCount: number; // Increment this to trigger Eevee dash
}

interface Evolution {
  id: string;
  name: string;
  element: string;
  bodyColor: string;
  bodyDarkColor: string;
  collarColor: string;
  accentColor: string;
  tagline: string;
  badgeBg: string;
  badgeText: string;
}

const EVOLUTIONS: Evolution[] = [
  {
    id: 'eevee',
    name: 'EEVEE',
    element: 'NORMAL',
    bodyColor: '#c2895b',
    bodyDarkColor: '#966339',
    collarColor: '#fbf4da',
    accentColor: '#966339',
    tagline: 'EEVEE CORRENDO SOLTA',
    badgeBg: 'bg-stone-100/15 border-stone-500/30',
    badgeText: 'text-stone-100'
  },
  {
    id: 'vaporeon',
    name: 'VAPOREON',
    element: 'ÁGUA',
    bodyColor: '#4ca3db',
    bodyDarkColor: '#257bb5',
    collarColor: '#ffffff',
    accentColor: '#0a4275',
    tagline: 'VAPOREON NAVEGANDO SUPER VELOZ',
    badgeBg: 'bg-cyan-950/40 border-cyan-500/40',
    badgeText: 'text-cyan-200'
  },
  {
    id: 'jolteon',
    name: 'JOLTEON',
    element: 'ELÉTRICO',
    bodyColor: '#facc15',
    bodyDarkColor: '#ca8a04',
    collarColor: '#ffffff',
    accentColor: '#ffffff',
    tagline: 'JOLTEON DESCARREGANDO TROVÃO',
    badgeBg: 'bg-yellow-950/40 border-yellow-500/40',
    badgeText: 'text-yellow-250'
  },
  {
    id: 'flareon',
    name: 'FLAREON',
    element: 'FOGO',
    bodyColor: '#ea580c',
    bodyDarkColor: '#c2410c',
    collarColor: '#fef08a',
    accentColor: '#facc15',
    tagline: 'FLAREON CORRENDO ARDENTE',
    badgeBg: 'bg-orange-950/40 border-orange-500/40',
    badgeText: 'text-orange-200'
  },
  {
    id: 'espeon',
    name: 'ESPEON',
    element: 'PSÍQUICO',
    bodyColor: '#d8b4fe',
    bodyDarkColor: '#a855f7',
    collarColor: '#ef4444',
    accentColor: '#c084fc',
    tagline: 'ESPEON PREVENDO O FUTURO',
    badgeBg: 'bg-purple-950/40 border-purple-500/40',
    badgeText: 'text-purple-200'
  },
  {
    id: 'umbreon',
    name: 'UMBREON',
    element: 'SOMBRIO',
    bodyColor: '#374151',
    bodyDarkColor: '#1f2937',
    collarColor: '#facc15',
    accentColor: '#f59e0b',
    tagline: 'UMBREON CAÇANDO NA PENUMBRA',
    badgeBg: 'bg-zinc-900/60 border-zinc-600/40',
    badgeText: 'text-amber-400 font-extrabold'
  },
  {
    id: 'leafeon',
    name: 'LEAFEON',
    element: 'PLANTA',
    bodyColor: '#f5f5f4', // Pale cream
    bodyDarkColor: '#d6d3d1',
    collarColor: '#22c55e',
    accentColor: '#84cc16',
    tagline: 'LEAFEON BRISA DA FLORESTA',
    badgeBg: 'bg-emerald-950/40 border-emerald-500/40',
    badgeText: 'text-emerald-250'
  },
  {
    id: 'glaceon',
    name: 'GLACEON',
    element: 'GELO',
    bodyColor: '#a5f3fc',
    bodyDarkColor: '#0891b2',
    collarColor: '#0e7490',
    accentColor: '#06b6d4',
    tagline: 'GLACEON DESLIZANDO NO GELO',
    badgeBg: 'bg-blue-950/40 border-blue-500/40',
    badgeText: 'text-blue-200'
  },
  {
    id: 'sylveon',
    name: 'SYLVEON',
    element: 'FADA',
    bodyColor: '#fff1f2',
    bodyDarkColor: '#fda4af',
    collarColor: '#f43f5e',
    accentColor: '#3b82f6',
    tagline: 'SYLVEON DANÇA DE FITAS',
    badgeBg: 'bg-pink-950/40 border-pink-500/40',
    badgeText: 'text-pink-200'
  }
];

export default function EeveeStopwatch({ isRunning, lapTriggerCount, currentTime, dashTriggerCount }: EeveeStopwatchProps) {
  const [showGhost, setShowGhost] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const [clouds, setClouds] = useState<{ id: number; left: number; top: number; scale: number; speed: number }[]>([]);
  const cloudIdCounter = useRef(0);

  // Calculate current evolution stage (every 20 seconds of stopwatch time)
  const totalSeconds = Math.floor(currentTime / 1000);
  const evolutionIndex = Math.floor(totalSeconds / 20) % EVOLUTIONS.length;
  const currentEvo = EVOLUTIONS[evolutionIndex];

  // Visual evolve flash trigger
  const prevEvoIndex = useRef(0);
  const [evolveFlash, setEvolveFlash] = useState(false);

  useEffect(() => {
    if (evolutionIndex !== prevEvoIndex.current) {
      prevEvoIndex.current = evolutionIndex;
      setEvolveFlash(true);
      const timer = setTimeout(() => setEvolveFlash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [evolutionIndex]);

  // Dash animation trigger when B button is clicked
  useEffect(() => {
    if (dashTriggerCount > 0) {
      setIsDashing(true);
      setShowDust(true);
      const dashTimer = setTimeout(() => setIsDashing(false), 700);
      const dustTimer = setTimeout(() => setShowDust(false), 500);
      return () => {
        clearTimeout(dashTimer);
        clearTimeout(dustTimer);
      };
    }
  }, [dashTriggerCount]);

  // General Lap effect triggers
  useEffect(() => {
    if (lapTriggerCount > 0) {
      playSwoosh();
      setShowGhost(true);
      setShowDust(true);
      const ghostTimer = setTimeout(() => setShowGhost(false), 850);
      const dustTimer = setTimeout(() => setShowDust(false), 550);
      return () => {
        clearTimeout(ghostTimer);
        clearTimeout(dustTimer);
      };
    }
  }, [lapTriggerCount]);

  // Create floating wind/dust particles when running or dashing
  useEffect(() => {
    let interval: number;
    if (isRunning || isDashing) {
      interval = window.setInterval(() => {
        setClouds(prev => {
          const newCloud = {
            id: cloudIdCounter.current++,
            left: 100,
            top: 20 + Math.random() * 60,
            scale: 0.5 + Math.random() * 0.8,
            speed: isDashing ? 1.5 + Math.random() : 0.6 + Math.random() * 0.4
          };
          return [...prev.slice(-10), newCloud];
        });
      }, isDashing ? 60 : 180);
    } else {
      setClouds([]);
    }
    return () => clearInterval(interval);
  }, [isRunning, isDashing]);

  // Animation parameters depending on whether Eevee is normal, running or dashing
  const isMoving = isRunning || isDashing;
  const cycleDuration = isDashing ? 0.08 : isRunning ? 0.25 : 1.8;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-end items-center lcd-grid bg-[#8bac0f] text-[#0f380f] border-r border-[#1c301c]/30 select-none">
      
      {/* Background Evolution Theme Glow */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none" 
        style={{
          background: `radial-gradient(circle, ${currentEvo.bodyColor}11 0%, transparent 75%)`,
          opacity: isMoving ? 1 : 0.4
        }}
      />

      {/* Screen flash on evolution */}
      <AnimatePresence>
        {evolveFlash && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-white z-40 flex flex-col items-center justify-center text-stone-900 font-press-start text-[10px] uppercase font-extrabold"
          >
            <span className="mb-2 text-yellow-600">⚡ EVOLUÇÃO! ⚡</span>
            <span className="text-stone-900 tracking-widest">{currentEvo.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wind line particles scrolling backward */}
      {isMoving && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {Array.from({ length: isDashing ? 18 : 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '120%' }}
              animate={{ x: '-120%' }}
              transition={{
                duration: isDashing ? 0.35 + Math.random() * 0.15 : 0.7 + Math.random() * 0.4,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 0.4,
              }}
              style={{
                top: `${(i % 10) * 9 + 8}%`,
                height: isDashing ? '2.5px' : '1px',
                width: `${Math.random() * 60 + 25}px`,
              }}
              className="absolute bg-[#406840]"
            />
          ))}
        </div>
      )}

      {/* Retro Floating Wind Dust Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {clouds.map(cloud => (
          <motion.div
            key={cloud.id}
            initial={{ x: '100%' }}
            animate={{ x: '-150%' }}
            transition={{ duration: cloud.speed, ease: 'linear' }}
            style={{
              top: `${cloud.top}%`,
              transform: `scale(${cloud.scale})`,
              opacity: 0.35
            }}
            className="absolute flex space-x-1"
          >
            <div className="w-4 h-3 bg-[#406840] rounded-full" />
            <div className="w-3 h-2 bg-[#406840] rounded-full mt-1" />
          </motion.div>
        ))}
      </div>

      {/* Mode header labels */}
      <div className="absolute top-2.5 left-4 font-press-start text-[8px] opacity-85 flex items-center space-x-2">
        <span 
          className={`px-1.5 py-0.5 rounded text-[7px] font-extrabold border bg-stone-950/20 ${currentEvo.badgeBg} ${currentEvo.badgeText}`}
        >
          {currentEvo.element}
        </span>
        <span className="font-bold tracking-tight">
          {isDashing ? '⚡ DRIFT DASH! +5S' : isRunning ? 'CORRENDO' : 'PRONTO'}
        </span>
      </div>

      {/* Evolution ticker showing progress bar to next evolution (20 seconds) */}
      <div className="absolute top-3.5 right-4 w-28 bg-[#406840]/20 h-1.5 rounded-full overflow-hidden border border-[#1c301c]/15">
        <div 
          className="h-full bg-[#406840] transition-all duration-300"
          style={{ width: `${((currentTime % 20000) / 20000) * 100}%` }}
        />
      </div>

      {/* MAIN CAROUSEL RENDER */}
      <div className="relative z-10 w-44 h-44 flex items-center justify-center">
        
        {/* Laplace Lap Dust Puff */}
        {showDust && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute z-20 left-4 bottom-10 pointer-events-none"
          >
            <svg width="50" height="30" viewBox="0 0 50 30" className="opacity-60">
              <circle cx="15" cy="15" r="10" fill="#406840" />
              <circle cx="28" cy="12" r="8" fill="#406840" />
              <circle cx="38" cy="18" r="6" fill="#406840" />
            </svg>
          </motion.div>
        )}

        {/* Eevee Phantom Spirit (Left trail during lap confirmations) */}
        {showGhost && (
          <div className="absolute left-8 opacity-30 z-0 pointer-events-none filter scale-95 origin-center select-none">
            <svg width="100" height="90" viewBox="0 0 100 90" className="opacity-40 text-[#406840] stroke-current fill-none" strokeWidth="2">
              <ellipse cx="50" cy="55" rx="26" ry="16" />
              <ellipse cx="65" cy="35" rx="14" ry="12" />
            </svg>
            <div className="font-press-start text-[6px] text-zinc-700 bg-stone-900/10 px-1 text-center rounded mt-1 font-bold">
              LAP RECORDED!
            </div>
          </div>
        )}

        {/* Dynamic Multi-stage Eevee Character Model */}
        <motion.div
          animate={isMoving ? {
            y: [0, -5, 0, -5, 0],
            rotate: isDashing ? [12, 16, 12] : [2, -2, 2],
            x: isDashing ? [0, 16, 24, 8, 0] : [0, -2, 2, 0]
          } : {
            y: [0, -2, 0],
            rotate: 0,
            x: 0
          }}
          transition={isMoving ? {
            duration: cycleDuration,
            repeat: isDashing ? 0 : Infinity,
            ease: 'linear'
          } : {
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative flex items-center justify-center cursor-pointer"
        >
          {/* Main Pokemon Vector SVG container */}
          <svg width="120" height="110" viewBox="0 0 120 110" className="w-28 h-28 drop-shadow-[0_2px_4px_rgba(40,64,40,0.18)]">
            
            {/* TAIL ASSEMBLY (Stage-dependent) */}
            {/* Eevee Bushy Tail */}
            {currentEvo.id === 'eevee' && (
              <motion.path 
                animate={isMoving ? { rotate: [-10, 15, -10] } : { rotate: [-2, 3, -2] }}
                transition={{ duration: cycleDuration, repeat: Infinity }}
                d="M 32 60 Q 4 52 8 32 Q 18 15 32 38 Q 28 50 32 60" 
                fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" strokeLinecap="round" 
              />
            )}
            
            {/* Vaporeon Fin tail */}
            {currentEvo.id === 'vaporeon' && (
              <motion.path 
                animate={isMoving ? { rotate: [-20, 18, -20] } : {}}
                transition={{ duration: cycleDuration, repeat: Infinity }}
                d="M 35 60 Q 10 58 5 45 Q -2 30 10 32 C 15 38 22 45 35 55" 
                fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" strokeLinecap="round" 
              />
            )}

            {/* Jolteon jagged lightning tail collar */}
            {currentEvo.id === 'jolteon' && (
              <motion.path 
                animate={isMoving ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: cycleDuration, repeat: Infinity }}
                d="M 28 52 L 14 42 L 20 54 L 10 52 L 24 64 Z" 
                fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" 
              />
            )}

            {/* Flareon fluffy mega vapor cloud tail */}
            {currentEvo.id === 'flareon' && (
              <motion.path 
                animate={isMoving ? { y: [-2, 4, -2] } : {}}
                transition={{ duration: 0.4, repeat: Infinity }}
                d="M 30 55 C 15 48 10 25 24 20 C 35 15 42 32 32 50" 
                fill={currentEvo.collarColor} stroke="#406840" strokeWidth="2" 
              />
            )}

            {/* Espeon dual branch sleek tail */}
            {currentEvo.id === 'espeon' && (
              <motion.path 
                animate={isMoving ? { rotate: [-12, 12, -12] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                d="M 32 58 Q 12 50 2 30 C 5 22 10 20 8 28 Q 16 48 32 56 M 8 28 Q 2 12 6 6" 
                fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="1.75" fillRule="evenodd"
              />
            )}

            {/* Umbreon sleek tail with gold band */}
            {currentEvo.id === 'umbreon' && (
              <g>
                <motion.path 
                  animate={isMoving ? { rotate: [-10, 10, -10] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  d="M 30 58 Q -2 50 12 32 Q 22 42 30 55" 
                  fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" 
                />
                {/* Yellow Ring */}
                <ellipse cx="14" cy="44" rx="3" ry="5" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1" transform="rotate(-15, 14, 44)" />
              </g>
            )}

            {/* Leafeon curved grass leaf tail */}
            {currentEvo.id === 'leafeon' && (
              <motion.path 
                animate={isMoving ? { rotate: [-5, 15, -5] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
                d="M 30 55 Q 15 48 14 30 Q 18 10 28 22 C 26 28 24 38 28 50" 
                fill={currentEvo.collarColor} stroke="#406840" strokeWidth="2" 
              />
            )}

            {/* Glaceon diamond-themed paddle tail */}
            {currentEvo.id === 'glaceon' && (
              <motion.path 
                animate={isMoving ? { rotate: [-15, 15, -15] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                d="M 32 58 Q 10 54 8 36 L 4 30 L 14 32 L 18 42 Z" 
                fill={currentEvo.accentColor} stroke="#406840" strokeWidth="2" 
              />
            )}

            {/* Sylveon beautiful flowing banner ribbon tail */}
            {currentEvo.id === 'sylveon' && (
              <g>
                <motion.path 
                  animate={isMoving ? { rotate: [-15, 20, -15] } : {}}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  d="M 32 58 Q 12 50 6 38 C 12 30 20 28 15 36 Z" 
                  fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="1.75" 
                />
                {/* Ribbon banner curves */}
                <path d="M 12 36 Q -5 45 -8 24 Q -2 18 2 24" fill="#ffffff" stroke="#406840" strokeWidth="1" />
                <path d="M 2 24 C -4 20 -8 22 -6 28" fill={currentEvo.accentColor} />
              </g>
            )}

            {/* LEGS (Back pair animating) */}
            {/* Back Leg Left */}
            <motion.path 
              animate={isMoving ? { rotate: [-35, 35, -35] } : {}}
              transition={{ duration: cycleDuration, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '28px 70px' }}
              d="M 26 66 Q 14 74 20 86 Q 28 86 32 74" 
              fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" 
            />

            {/* Back Leg Right */}
            <motion.path 
              animate={isMoving ? { rotate: [35, -35, 35] } : {}}
              transition={{ duration: cycleDuration, repeat: Infinity, ease: 'linear', delay: cycleDuration / 2 }}
              style={{ transformOrigin: '35px 70px' }}
              d="M 35 66 Q 40 74 38 86 Q 46 86 42 74" 
              fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" 
            />

            {/* MAIN CORE BODY SHAPE */}
            <ellipse cx="54" cy="58" rx="28" ry="17" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
            
            {/* LEGS (Front pair animating) */}
            {/* Front Leg Left */}
            <motion.path 
              animate={isMoving ? { rotate: [35, -35, 35] } : {}}
              transition={{ duration: cycleDuration, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '66px 68px' }}
              d="M 64 66 Q 59 74 68 86 Q 74 82 72 70" 
              fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" 
            />

            {/* Front Leg Right */}
            <motion.path 
              animate={isMoving ? { rotate: [-35, 35, -35] } : {}}
              transition={{ duration: cycleDuration, repeat: Infinity, ease: 'linear', delay: cycleDuration / 2 }}
              style={{ transformOrigin: '74px 68px' }}
              d="M 72 66 Q 78 74 80 86 Q 86 82 78 70" 
              fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" 
            />

            {/* COLLAR MANE & NECK (Evolution-dependent) */}
            {/* Eevee fluff */}
            {currentEvo.id === 'eevee' && (
              <path 
                d="M 65 48 C 50 48 50 66 65 66 C 78 66 76 48 65 48 Z" 
                fill={currentEvo.collarColor} stroke="#406840" strokeWidth="2" 
              />
            )}

            {/* Vaporeon White Neck Ruff */}
            {currentEvo.id === 'vaporeon' && (
              <path 
                d="M 66 48 C 54 44 54 68 66 68 C 76 68 76 44 66 48 Z" 
                fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.75" 
              />
            )}

            {/* Jolteon Spiky White Collar */}
            {currentEvo.id === 'jolteon' && (
              <path 
                d="M 66 46 L 56 52 L 60 56 L 52 60 L 66 68 L 74 58 L 70 52 Z" 
                fill={currentEvo.collarColor} stroke="#406840" strokeWidth="2" 
              />
            )}

            {/* Flareon puff golden mane cloud */}
            {currentEvo.id === 'flareon' && (
              <path 
                d="M 66 46 C 48 44 48 70 66 70 C 80 70 82 46 66 46 Z" 
                fill={currentEvo.collarColor} stroke="#406840" strokeWidth="2" 
              />
            )}

            {/* Espeon sleek neck (no ruff) */}
            {currentEvo.id === 'espeon' && (
              <path d="M 62 50 C 58 52 58 60 62 61" fill="none" stroke="#406840" strokeWidth="2" />
            )}

            {/* Umbreon sleek neck */}
            {currentEvo.id === 'umbreon' && (
              <path d="M 62 50 C 58 52 58 60 62 61" fill="none" stroke="#406840" strokeWidth="2" />
            )}

            {/* Leafeon Green Sprout leaves at neck */}
            {currentEvo.id === 'leafeon' && (
              <g>
                <path d="M 64 54 Q 54 44 62 44 Z" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.5" />
                <path d="M 64 58 Q 50 56 56 62 Z" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.5" />
              </g>
            )}

            {/* Glaceon dark blue cape */}
            {currentEvo.id === 'glaceon' && (
              <path d="M 62 48 C 55 52 56 64 64 65 Z" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="2" />
            )}

            {/* Sylveon beautiful neck bow */}
            {currentEvo.id === 'sylveon' && (
              <g>
                <circle cx="64" cy="54" r="4" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1" />
                <path d="M 64 54 Q 54 48 58 60 Z" fill="#ffffff" stroke="#406840" strokeWidth="1" />
                {/* Waving ribbon feelers */}
                <path d="M 58 60 Q 42 66 38 58" fill="none" stroke="#406840" strokeWidth="1.5" />
              </g>
            )}

            {/* HEAD & FACIAL FEATURES */}
            {/* Round Head */}
            <ellipse cx="78" cy="38" rx="14" ry="12" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />

            {/* EYES (Glow or custom color depending on specie) */}
            {currentEvo.id === 'umbreon' ? (
              // Red glowing Umbreon Eye
              <g>
                <ellipse cx="80" cy="36" rx="2" ry="3.5" fill="#ef4444" stroke="#406840" strokeWidth="1" />
                <circle cx="79.5" cy="35" r="0.75" fill="#facc15" />
              </g>
            ) : (
              // Classic wide Eevee kawaii black eye
              <g>
                <ellipse cx="80" cy="36" rx="2.2" ry="3.3" fill="#1c1917" />
                <circle cx="78.8" cy="34" r="0.9" fill="#ffffff" />
                <circle cx="81.2" cy="37.5" r="0.4" fill="#ffffff" />
              </g>
            )}

            {/* Nose & Mouth */}
            <polygon points="88,40 90,41 88,42" fill="#1c1917" />

            {/* EARS ASSEMBLY (Evolution-specific shapes) */}
            {/* Eevee ears */}
            {currentEvo.id === 'eevee' && (
              <g>
                <polygon points="68,30 52,10 68,22" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="66,28 56,14 66,22" fill={currentEvo.bodyDarkColor} />
                <polygon points="82,28 92,8 84,21" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="82,26 89,12 84,20" fill={currentEvo.bodyDarkColor} />
              </g>
            )}

            {/* Vaporeon head fins */}
            {currentEvo.id === 'vaporeon' && (
              <g>
                {/* Yellow center crest fin */}
                <path d="M 78 26 L 82 10 L 86 26 Z" fill="#facc15" stroke="#406840" strokeWidth="1.5" />
                {/* Side white/blue webbed ears */}
                <path d="M 66 36 Q 52 28 58 44 Z" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.5" />
                <path d="M 90 36 Q 104 28 98 44 Z" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.5" />
              </g>
            )}

            {/* Jolteon jagged point ears */}
            {currentEvo.id === 'jolteon' && (
              <g>
                <polygon points="68,28 54,6 72,22" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="68,26 58,10 70,22" fill="#1c1917" />
                <polygon points="83,28 95,6 84,22" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="83,26 91,10 84,22" fill="#1c1917" />
              </g>
            )}

            {/* Flareon ears */}
            {currentEvo.id === 'flareon' && (
              <g>
                <polygon points="68,30 54,12 68,24" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="82,30 96,12 84,24" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                {/* Cute puff of hair on forehead */}
                <circle cx="75" cy="28" r="6" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.5" />
              </g>
            )}

            {/* Espeon elegant ears */}
            {currentEvo.id === 'espeon' && (
              <g>
                <polygon points="68,28 46,14 66,22" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="66,26 52,18 64,22" fill="#a855f7" />
                <polygon points="84,28 106,14 86,22" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="84,26 98,18 86,22" fill="#a855f7" />
                {/* Red Forehead Gem */}
                <circle cx="82" cy="32" r="2.5" fill="#ef4444" stroke="#406840" strokeWidth="0.75" />
              </g>
            )}

            {/* Umbreon dark ringed ears */}
            {currentEvo.id === 'umbreon' && (
              <g>
                <polygon points="68,30 58,10 72,24" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="82,30 92,10 84,24" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                {/* Gold forehead ring and ear markings */}
                <circle cx="76" cy="30" r="2" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="0.75" />
                <ellipse cx="63" cy="20" rx="1.5" ry="3.5" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="0.75" transform="rotate(-15, 63, 20)" />
                <ellipse cx="87" cy="20" rx="1.5" ry="3.5" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="0.75" transform="rotate(15, 87, 20)" />
              </g>
            )}

            {/* Leafeon forest leaf ears */}
            {currentEvo.id === 'leafeon' && (
              <g>
                <path d="M 68 28 C 50 16 52 8 66 18 Z" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="1.75" />
                <path d="M 58 12 Q 54 4 60 8 Z" fill={currentEvo.collarColor} />
                <path d="M 82 28 C 100 16 98 8 84 18 Z" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="1.75" />
                <path d="M 92 12 Q 96 4 90 8 Z" fill={currentEvo.collarColor} />
                {/* Green leaf sprout hair curl on forehead */}
                <path d="M 76 28 Q 72 16 78 18 Z" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.25" />
              </g>
            )}

            {/* Glaceon dual frozen tassels */}
            {currentEvo.id === 'glaceon' && (
              <g>
                {/* Dark teal skull cap pattern */}
                <path d="M 70 30 Q 78 24 86 30" stroke="#406840" strokeWidth="2.5" fill="none" />
                {/* Hanging tassels */}
                <path d="M 68 34 Q 60 56 64 56 L 68 34" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.5" />
                <path d="M 88 34 Q 96 56 92 56 L 88 34" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="1.5" />
                {/* Pointy cyan ears */}
                <polygon points="68,26 56,12 70,20" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="1.75" />
                <polygon points="84,26 96,12 82,20" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="1.75" />
              </g>
            )}

            {/* Sylveon lovely pink ears with bows */}
            {currentEvo.id === 'sylveon' && (
              <g>
                <polygon points="68,28 54,10 70,22" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="66,26 58,16 68,22" fill={currentEvo.bodyDarkColor} />
                <polygon points="82,28 96,10 84,22" fill={currentEvo.bodyColor} stroke="#406840" strokeWidth="2" />
                <polygon points="82,26 90,16 84,22" fill={currentEvo.bodyDarkColor} />
                {/* Ribbon Bow on left ear */}
                <circle cx="68" cy="24" r="3.5" fill={currentEvo.collarColor} stroke="#406840" strokeWidth="0.75" />
                <path d="M 68 24 Q 60 14 62 26" fill="#ffffff" stroke="#406840" strokeWidth="0.75" />
              </g>
            )}

          </svg>
        </motion.div>
        
        {/* Speed readout badge */}
        {isDashing ? (
          <div className="absolute bottom-1 right-2 font-press-start text-[6px] text-yellow-300 bg-red-950 border border-yellow-500 px-2 py-0.5 rounded animate-bounce shadow">
            DASH ATIVO!
          </div>
        ) : isRunning ? (
          <div className="absolute bottom-1 right-2 font-press-start text-[6px] text-amber-900 bg-amber-200/90 border border-amber-400 px-1.5 py-0.5 rounded animate-pulse">
            RAPIDEZ MAX
          </div>
        ) : (
          <div className="absolute bottom-1 right-2 font-press-start text-[6px] text-emerald-900 opacity-60">
            ESPERANDO
          </div>
        )}
      </div>
      
      {/* Footer Title */}
      <div className="font-press-start text-[7px] text-emerald-800 tracking-wider mb-2 opacity-85 font-bold uppercase transition-all duration-300">
        {currentEvo.tagline}
      </div>
    </div>
  );
}
