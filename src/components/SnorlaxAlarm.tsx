/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlarmItem } from '../types';
import { startAlarmFluteLoop, stopAlarmFluteLoop, playBeep } from '../utils/audio';

interface SnorlaxAlarmProps {
  alarms: AlarmItem[];
  isAlarmTriggered: boolean;
  onSilenceAlarm: () => void;
}

export default function SnorlaxAlarm({ alarms, isAlarmTriggered, onSilenceAlarm }: SnorlaxAlarmProps) {
  // Start Poké Flute melody loops when alarm is triggered
  useEffect(() => {
    if (isAlarmTriggered) {
      startAlarmFluteLoop();
    } else {
      stopAlarmFluteLoop();
    }

    return () => {
      stopAlarmFluteLoop();
    };
  }, [isAlarmTriggered]);

  const enabledAlarms = alarms.filter(a => a.enabled);

  const handleSilence = () => {
    playBeep(900, 0.1);
    onSilenceAlarm();
  };

  return (
    <div className={`relative w-full h-full overflow-hidden flex flex-col justify-end items-center lcd-grid border-r border-[#1c301c]/30 select-none transition-colors duration-200 ${
      isAlarmTriggered ? 'bg-red-950/30' : 'bg-[#8bac0f] text-[#0f380f]'
    }`}>
      {/* Alarm status header */}
      <div className="absolute top-3 left-4 font-press-start text-[8px] opacity-75 flex items-center space-x-1">
        <span className={enabledAlarms.length > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-700'}>
          ●
        </span>
        <span>{enabledAlarms.length > 0 ? `${enabledAlarms.length} ALARME(S) ATIVO(S)` : 'SEM ALARMES'}</span>
      </div>

      {/* Floating sleep Zzz or startled exclamation lines */}
      {isAlarmTriggered ? (
        <div className="absolute top-10 w-full flex justify-around pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.4, 1], y: [0, -15, 0], opacity: [1, 0.8, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="font-press-start text-red-600 text-[10px]"
          >
            🔊 ACORDE!
          </motion.div>
          <motion.div 
            animate={{ scale: [1.4, 1, 1.4], y: [-5, -20, -5], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            className="font-press-start text-red-500 text-[10px]"
          >
            ⏰ TRIMMM!
          </motion.div>
        </div>
      ) : (
        <div className="absolute top-12 right-6 pointer-events-none">
          <motion.div 
            animate={{ y: [-10, -40], x: [0, 8, -4], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="font-press-start text-[10px] text-[#406840] font-bold"
          >
            Zzz
          </motion.div>
          <motion.div 
            animate={{ y: [-5, -30], x: [4, 12, 6], opacity: [0, 1, 0] }}
            transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="font-press-start text-[8px] text-[#406840]/80"
          >
            Zz
          </motion.div>
        </div>
      )}

      {/* Main Snorlax display area */}
      <div className="relative z-10 w-44 h-44 flex flex-col items-center justify-center">
        <motion.div
          animate={isAlarmTriggered ? {
            x: [0, -6, 6, -6, 6, 0],
            y: [0, 4, -4, 4, -4, 0],
          } : {
            // Calm breathing expand/contract y
            scale: [1, 1.02, 1],
          }}
          transition={isAlarmTriggered ? {
            duration: 0.25,
            repeat: Infinity,
          } : {
            duration: 4.0,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative"
        >
          {/* Snorlax SVG representation */}
          <svg width="120" height="110" viewBox="0 0 120 110" className="w-28 h-28 drop-shadow-[0_2px_4px_rgba(40,64,40,0.1)]">
            {/* Feet */}
            <circle cx="34" cy="95" r="11" fill="#EBD8B0" stroke="#406840" strokeWidth="2" />
            <circle cx="34" cy="95" r="8" fill="#E1C694" />
            {/* Foot pads (3 toes each) */}
            <circle cx="28" cy="88" r="2" fill="#FFFFFF" />
            <circle cx="34" cy="85" r="2" fill="#FFFFFF" />
            <circle cx="40" cy="88" r="2" fill="#FFFFFF" />

            <circle cx="86" cy="95" r="11" fill="#EBD8B0" stroke="#406840" strokeWidth="2" />
            <circle cx="86" cy="95" r="8" fill="#E1C694" />
            <circle cx="80" cy="88" r="2" fill="#FFFFFF" />
            <circle cx="86" cy="85" r="2" fill="#FFFFFF" />
            <circle cx="92" cy="88" r="2" fill="#FFFFFF" />

            {/* Huge Plump Body */}
            <ellipse 
              cx="60" cy="62" rx="42" ry="34" 
              fill={isAlarmTriggered ? '#EF4444' : '#416675'} 
              stroke="#406840" strokeWidth="2" 
            />

            {/* Giant Cream Belly */}
            <ellipse 
              cx="60" cy="65" rx="30" ry="25" 
              fill={isAlarmTriggered ? '#FCA5A5' : '#EBD8B0'} 
              stroke="#406840" strokeWidth="1.5" 
            />

            {/* Left Hand and Right Hand resting sleepily */}
            <path d="M 18 55 Q 12 60 18 70 Q 24 62 20 54" fill={isAlarmTriggered ? '#EF4444' : '#416675'} stroke="#406840" strokeWidth="2" />
            <circle cx="15" cy="68" r="1.5" fill="#FFFFFF" />
            <path d="M 102 55 Q 108 60 102 70 Q 96 62 100 54" fill={isAlarmTriggered ? '#EF4444' : '#416675'} stroke="#406840" strokeWidth="2" />
            <circle cx="105" cy="68" r="1.5" fill="#FFFFFF" />

            {/* Head */}
            <ellipse 
              cx="60" cy="34" rx="24" ry="18" 
              fill={isAlarmTriggered ? '#EF4444' : '#416675'} 
              stroke="#406840" strokeWidth="2" 
            />

            {/* Left & Right Pointy Ears */}
            <polygon 
              points="40,24 34,10 50,20" 
              fill={isAlarmTriggered ? '#EF4444' : '#416675'} 
              stroke="#406840" strokeWidth="2" strokeLinejoin="round" 
            />
            <polygon 
              points="80,24 86,10 70,20" 
              fill={isAlarmTriggered ? '#EF4444' : '#416675'} 
              stroke="#406840" strokeWidth="2" strokeLinejoin="round" 
            />

            {/* Cream Face Mask */}
            <path 
              d="M 44 32 Q 60 46 76 32 M 76 32 Q 80 20 60 22 Q 40 20 44 32" 
              fill={isAlarmTriggered ? '#FCA5A5' : '#EBD8B0'} 
              stroke="#406840" strokeWidth="1.5" 
            />

            {isAlarmTriggered ? (
              /* STARTLED SNORE AWAKE EYES */
              <>
                {/* Surprised eyes */}
                <circle cx="50" cy="27" r="3" fill="#1A1A1A" />
                <circle cx="70" cy="27" r="3" fill="#1A1A1A" />
                {/* Sweat drop of stress */}
                <path d="M 36 22 Q 33 24 35 27 C 37 30 39 27 36 22 Z" fill="#60A5FA" />
                {/* Shocked open mouth */}
                <ellipse cx="60" cy="36" rx="4" ry="5" fill="#1A1A1A" />
                {/* Two cute tiny upward fangs */}
                <polygon points="56,36 58,35 57,32" fill="#FFFFFF" />
                <polygon points="64,36 62,35 63,32" fill="#FFFFFF" />
              </>
            ) : (
              /* SLEEPING EYES */
              <>
                <path d="M 46 27 Q 50 29 54 27" stroke="#406840" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 66 27 Q 70 29 74 27" stroke="#406840" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Sleeping mouth with two cute downward sticking fangs */}
                <path d="M 52 35 Q 60 38 68 35" stroke="#406840" strokeWidth="1.5" fill="none" />
                <polygon points="54,34 56,34 55,37" fill="#FFFFFF" />
                <polygon points="64,34 66,34 65,37" fill="#FFFFFF" />
              </>
            )}
          </svg>
        </motion.div>

        {isAlarmTriggered ? (
          <div className="font-press-start text-[7px] text-red-600 font-bold tracking-wider mt-1 text-center bg-red-100 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse">
            SNORLAX ESTÁ BRAVO!
          </div>
        ) : (
          <div className="font-press-start text-[7px] text-emerald-700/80 tracking-wider mt-1 text-center font-bold">
            SNORLAX ESTÁ DORMINDO...
          </div>
        )}
      </div>

      {/* Poké flute floating button in case we trigger alarms to let them tap to silence */}
      {isAlarmTriggered && (
        <motion.button
          onClick={handleSilence}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-16 z-20 left-12 right-12 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-press-start text-[7px] py-1.5 px-2 rounded-md shadow-md border-2 border-stone-800 flex items-center justify-center space-x-1"
        >
          <span>🎵</span>
          <span>TOCAR POKÉ-FLAUTA</span>
        </motion.button>
      )}
    </div>
  );
}
