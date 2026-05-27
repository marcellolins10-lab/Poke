/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Plus, Trash2, Volume2, VolumeX, Keyboard, Radio, Battery, Trophy } from 'lucide-react';

import { AppMode, AlarmItem, LapTime, TimerConfig } from './types';
import { 
  playBeep, 
  toggleSound, 
  isSoundEnabled, 
  playPokeFluteMelody, 
  stopAlarmFluteLoop 
} from './utils/audio';

// Visual sprites
import PikachuClock from './components/PikachuClock';
import SnorlaxAlarm from './components/SnorlaxAlarm';
import ArcanineStopwatch from './components/ArcanineStopwatch';
import TogepiTimer from './components/TogepiTimer';

export default function App() {
  // --- Standard Core States ---
  const [activeMode, setActiveMode] = useState<AppMode>('CLOCK');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timeOffsetMs, setTimeOffsetMs] = useState<number>(0);
  const timeOffsetMsRef = useRef<number>(0);

  useEffect(() => {
    timeOffsetMsRef.current = timeOffsetMs;
  }, [timeOffsetMs]);

  const displayedTime = useMemo(() => {
    return new Date(currentTime.getTime() + timeOffsetMs);
  }, [currentTime, timeOffsetMs]);

  const [simulatedNight, setSimulatedNight] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState<boolean>(false);

  // --- Clock Mode States ---
  const [triggerSpark, setTriggerSpark] = useState<boolean>(false);
  const lastHourRef = useRef<number>(new Date().getHours());

  // --- Alarm Mode States ---
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: '1', time: '08:00', enabled: false, label: 'Aventura Matinal' },
    { id: '2', time: '12:00', enabled: false, label: 'Almoço do Pika' },
    { id: '3', time: '22:00', enabled: false, label: 'Hora de Dormir' }
  ]);
  const [isAlarmTriggered, setIsAlarmTriggered] = useState<boolean>(false);
  const [triggeredAlarmLabel, setTriggeredAlarmLabel] = useState<string>('');
  const [newAlarmTime, setNewAlarmTime] = useState<string>('07:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState<string>('Despertar Poké');
  const lastAlarmCheckMin = useRef<number>(-1);

  // --- Stopwatch Mode States ---
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);
  const stopwatchStartRef = useRef<number>(0);
  const stopwatchElapsedRef = useRef<number>(0);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const [lapTriggerCount, setLapTriggerCount] = useState<number>(0);

  // --- Timer Mode States ---
  const [timerRemaining, setTimerRemaining] = useState<number>(10000); // Default to 10 seconds (for quick hatch demo!)
  const [timerInitial, setTimerInitial] = useState<number>(10000);
  const [timerRunningState, setTimerRunningState] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({ hours: 0, minutes: 0, seconds: 10 });
  const timerStartRef = useRef<number>(0);
  const timerElapsedRef = useRef<number>(0);

  // --- physical Button Clicking Depress Visuals ---
  const [isAActive, setIsAActive] = useState<boolean>(false);
  const [isBActive, setIsBActive] = useState<boolean>(false);

  // --- Interactive Achieved Badges State (Gamified!) ---
  const [achievements, setAchievements] = useState<{ [badge: string]: boolean }>({
    boulder: false, // Opened app
    cascade: false, // Hatched Togepi Egg!
    thunder: false, // Sparked Pikachu Thunderbolt
    rainbow: false, // Created a custom alarm clock
    soul: false,    // Registered a stopwatch lap
    marsh: false,   // Toggled night mode 
    volcano: false, // Survived Snorlax alarm wakening
    earth: false    // Explored all 4 digital modules
  });

  // Track explored tabs
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['CLOCK']));

  // Toggle night mode simulation helper
  const isNightTime = useMemo(() => {
    if (simulatedNight) return true;
    const hour = displayedTime.getHours();
    return hour >= 20 || hour < 6;
  }, [displayedTime, simulatedNight]);

  // --- High Precision Loop Engine (10ms) ---
  useEffect(() => {
    const mainTimer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const disp = new Date(now.getTime() + timeOffsetMsRef.current);

      // 1. Hour spark notification check
      const currentHour = disp.getHours();
      if (currentHour !== lastHourRef.current) {
        if (disp.getMinutes() === 0 && disp.getSeconds() === 0) {
          setTriggerSpark(true);
          setAchievements(prev => ({ ...prev, thunder: true }));
        }
        lastHourRef.current = currentHour;
      }

      // 2. Alarm Triggering mechanism (minute alignment check)
      const currentMin = disp.getMinutes();
      if (currentMin !== lastAlarmCheckMin.current) {
        const hToken = disp.getHours().toString().padStart(2, '0');
        const mToken = disp.getMinutes().toString().padStart(2, '0');
        const timeString = `${hToken}:${mToken}`; // "HH:MM"
        const matched = alarms.find(a => a.enabled && a.time === timeString);
        if (matched) {
          setIsAlarmTriggered(true);
          setTriggeredAlarmLabel(matched.label);
        }
        lastAlarmCheckMin.current = currentMin;
      }

      // 3. High accuracy Stopwatch calculator
      if (stopwatchRunning) {
        const delta = Date.now() - stopwatchStartRef.current;
        setStopwatchTime(stopwatchElapsedRef.current + delta);
      }

      // 4. High accuracy Countdown Timer calculator
      if (timerRunningState) {
        const delta = Date.now() - timerStartRef.current;
        const remaining = timerInitial - (timerElapsedRef.current + delta);
        if (remaining <= 0) {
          setTimerRemaining(0);
          setTimerRunningState(false);
          setTimerCompleted(true);
          // Unlock Cascade Badge achievement!
          setAchievements(prev => ({ ...prev, cascade: true }));
        } else {
          setTimerRemaining(remaining);
        }
      }
    }, 15);

    // Initial badge unlock for boot
    setAchievements(prev => ({ ...prev, boulder: true }));

    return () => clearInterval(mainTimer);
  }, [alarms, stopwatchRunning, timerRunningState, timerInitial]);

  // Track visited tabs for the core badge unlock
  useEffect(() => {
    if (visitedTabs.size === 4) {
      setAchievements(prev => ({ ...prev, earth: true }));
    }
  }, [visitedTabs]);

  // Handle mode transitions
  const selectMode = (newMode: AppMode) => {
    playBeep(600, 0.08);
    setActiveMode(newMode);
    setVisitedTabs(prev => {
      const updated = new Set(prev);
      updated.add(newMode);
      return updated;
    });
  };

  // Switch sound toggle helper
  const handleToggleSound = () => {
    const state = toggleSound();
    setSoundOn(state);
    playBeep(700, 0.08);
  };

  // --- Clock Mode Actions ---
  const handleManualSparkTrigger = () => {
    setTriggerSpark(true);
    setAchievements(prev => ({ ...prev, thunder: true }));
  };

  // --- Alarm Mode Actions ---
  const handleAddAlarm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playBeep(800, 0.1);
    
    // Simple validation
    if (!newAlarmTime) return;

    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      time: newAlarmTime,
      enabled: true,
      label: newAlarmLabel.trim() || 'Despertar Poké'
    };

    setAlarms(prev => [...prev].sort((a, b) => a.time.localeCompare(b.time)));
    // Add new custom alarm
    setAlarms(prev => {
      const index = prev.findIndex(a => a.time === newAlarm.time);
      if (index !== -1) {
        // replace
        const copy = [...prev];
        copy[index] = newAlarm;
        return copy;
      }
      return [...prev, newAlarm].sort((a, b) => a.time.localeCompare(b.time));
    });

    setNewAlarmLabel('Almoço do Pika');
    setAchievements(prev => ({ ...prev, rainbow: true }));
  };

  const deleteAlarm = (id: string) => {
    playBeep(350, 0.1);
    setAlarms(prev => prev.filter(al => al.id !== id));
  };

  const toggleAlarmStatus = (id: string) => {
    playBeep(550, 0.08);
    setAlarms(prev => prev.map(al => al.id === id ? { ...al, enabled: !al.enabled } : al));
  };

  const handleSilenceSnorlax = () => {
    setIsAlarmTriggered(false);
    stopAlarmFluteLoop();
    setAchievements(prev => ({ ...prev, volcano: true }));
  };

  // --- Stopwatch Mode Actions ---
  const handleStartStopStopwatch = () => {
    if (stopwatchRunning) {
      // Pause
      stopwatchElapsedRef.current = stopwatchTime;
      setStopwatchRunning(false);
      playBeep(500, 0.1);
    } else {
      // Start
      stopwatchStartRef.current = Date.now();
      setStopwatchRunning(true);
      playBeep(700, 0.1);
    }
  };

  const handleLapResetStopwatch = () => {
    if (stopwatchRunning) {
      // Create a Lap
      const currentElapsed = stopwatchTime;
      const previousTotal = laps.length > 0 ? laps[laps.length - 1].elapsedMs : 0;
      const lapDiff = currentElapsed - previousTotal;

      const newLap: LapTime = {
        index: laps.length + 1,
        elapsedMs: currentElapsed,
        lapTimeMs: lapDiff
      };

      setLaps(prev => [...prev, newLap]);
      setLapTriggerCount(prev => prev + 1);
      setAchievements(prev => ({ ...prev, soul: true }));
    } else {
      // Reset
      playBeep(300, 0.15);
      setStopwatchTime(0);
      setLaps([]);
      stopwatchElapsedRef.current = 0;
    }
  };

  // --- Timer Mode Actions ---
  const handleStartStopTimer = () => {
    if (timerCompleted) {
      // If completed, reset it first
      handleResetTimer();
      return;
    }

    if (timerRunningState) {
      // Pause
      timerElapsedRef.current = timerInitial - timerRemaining;
      setTimerRunningState(false);
      playBeep(500, 0.1);
    } else {
      // Make sure we have a positive duration
      if (timerRemaining <= 0) {
        // Reset to initial config first
        const initMs = (timerConfig.hours * 3600 + timerConfig.minutes * 60 + timerConfig.seconds) * 1000;
        if (initMs === 0) return;
        setTimerInitial(initMs);
        setTimerRemaining(initMs);
        timerElapsedRef.current = 0;
      }

      timerStartRef.current = Date.now();
      setTimerRunningState(true);
      playBeep(700, 0.1);
    }
  };

  const handleResetTimer = () => {
    playBeep(350, 0.12);
    setTimerRunningState(false);
    setTimerCompleted(false);
    
    const initMs = (timerConfig.hours * 3600 + timerConfig.minutes * 60 + timerConfig.seconds) * 1000;
    setTimerInitial(initMs);
    setTimerRemaining(initMs);
    timerElapsedRef.current = 0;
  };

  const updateTimerConfig = (field: keyof TimerConfig, amount: number) => {
    playBeep(650, 0.05);
    setTimerConfig(prev => {
      const updated = { ...prev };
      const val = updated[field] + amount;
      if (field === 'hours' && val >= 0 && val <= 23) updated.hours = val;
      if (field === 'minutes' && val >= 0 && val <= 59) updated.minutes = val;
      if (field === 'seconds' && val >= 0 && val <= 59) updated.seconds = val;
      
      // Sync remaining immediately if stopped
      if (!timerRunningState && !timerCompleted) {
        const initMs = (updated.hours * 3600 + updated.minutes * 60 + updated.seconds) * 1000;
        setTimerInitial(initMs);
        setTimerRemaining(initMs);
        timerElapsedRef.current = 0;
      }
      return updated;
    });
  };

  // Quick Timer Config presets
  const applyTimerPreset = (secs: number) => {
    playBeep(750, 0.08);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const config = { hours: 0, minutes: m, seconds: s };
    setTimerConfig(config);
    setTimerRunningState(false);
    setTimerCompleted(false);
    
    const initMs = secs * 1000;
    setTimerInitial(initMs);
    setTimerRemaining(initMs);
    timerElapsedRef.current = 0;
  };

  // Adjust countdown timer remaining/initial time on-the-fly (running or stopped)
  const adjustTimerTime = (amountSeconds: number) => {
    playBeep(650, 0.05);
    const amountMs = amountSeconds * 1000;
    
    if (timerRunningState) {
      // Adjust ticking running timer
      setTimerInitial(prev => Math.max(1000, prev + amountMs));
      setTimerRemaining(prev => {
        const newVal = Math.max(0, prev + amountMs);
        if (newVal === 0) {
          // If we reduced it to zero, trigger end instantly
          setTimerCompleted(true);
          setTimerRunningState(false);
          setAchievements(p => ({ ...p, cascade: true }));
        }
        return newVal;
      });
    } else {
      // Adjust configured static timer config
      setTimerConfig(prev => {
        let totalSecs = prev.hours * 3600 + prev.minutes * 60 + prev.seconds + amountSeconds;
        totalSecs = Math.max(0, totalSecs);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        
        const newConfig = { hours, minutes, seconds };
        
        const initMs = totalSecs * 1000;
        setTimerInitial(initMs);
        setTimerRemaining(initMs);
        timerElapsedRef.current = 0;
        
        return newConfig;
      });
    }
  };

  // --- Physical Console Press Handlers (Synthesizing triggers) ---
  const handleAPress = () => {
    setIsAActive(true);
    setTimeout(() => setIsAActive(false), 120);

    // Direct actions based on modules
    switch (activeMode) {
      case 'CLOCK':
        handleManualSparkTrigger();
        break;
      case 'ALARM':
        if (isAlarmTriggered) {
          handleSilenceSnorlax();
        } else {
          // Trigger a cute play beep
          playBeep(880, 0.08, 'square');
        }
        break;
      case 'STOPWATCH':
        handleStartStopStopwatch();
        break;
      case 'TIMER':
        handleStartStopTimer();
        break;
    }
  };

  const handleBPress = () => {
    setIsBActive(true);
    setTimeout(() => setIsBActive(false), 120);

    switch (activeMode) {
      case 'CLOCK':
        // Toggle Day/Night Simulation
        setSimulatedNight(prev => {
          const toggled = !prev;
          playBeep(toggled ? 300 : 900, 0.1);
          setAchievements(p => ({ ...p, marsh: true }));
          return toggled;
        });
        break;
      case 'ALARM':
        // Silence or play simple test melody
        if (isAlarmTriggered) {
          handleSilenceSnorlax();
        } else {
          playPokeFluteMelody();
        }
        break;
      case 'STOPWATCH':
        handleLapResetStopwatch();
        break;
      case 'TIMER':
        handleResetTimer();
        break;
    }
  };

  // --- Keyboard Shortcuts Listener ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing hotkeys when typing in alarm label input fields!
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAPress();
      }
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleBPress();
      }
      if (e.key === '1') selectMode('CLOCK');
      if (e.key === '2') selectMode('ALARM');
      if (e.key === '3') selectMode('STOPWATCH');
      if (e.key === '4') selectMode('TIMER');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, isAlarmTriggered, alarms, stopwatchRunning, stopwatchTime, timerRunningState, timerConfig, timerRemaining, timerCompleted]);


  // Formatting numbers beautifully with 0 pads
  const formatTimeToken = (num: number) => num.toString().padStart(2, '0');

  const formattedStopwatch = useMemo(() => {
    const totalMs = stopwatchTime;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const centiseconds = Math.floor((totalMs % 1000) / 10);
    return `${formatTimeToken(minutes)}:${formatTimeToken(seconds)}:${formatTimeToken(centiseconds)}`;
  }, [stopwatchTime]);

  const formattedTimer = useMemo(() => {
    const totalMs = timerRemaining;
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    return `${formatTimeToken(hours)}:${formatTimeToken(minutes)}:${formatTimeToken(seconds)}`;
  }, [timerRemaining]);

  // Compute upcoming set alarm for the Clock screen smaller display
  const upcomingAlarmTimeString = useMemo(() => {
    const enabled = alarms.filter(a => a.enabled);
    if (enabled.length === 0) return null;
    // Find closest alarm
    return enabled[0].time; // simple sorted head
  }, [alarms]);

  return (
    <div className="min-h-screen w-full bg-[#222] text-white flex flex-col items-center justify-between p-4 md:p-8 font-sans antialiased selection:bg-rose-900 selection:text-white select-none">
      
      {/* HEADER BAR (Vibrant Palette Theme) */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-[4px] border-[#8B0000] pb-4 mb-6 gap-4">
        {/* Trainer Stats blocks from Design HTML */}
        <div className="flex space-x-4">
          <div className="bg-[#8B0000] px-4 py-2 rounded-xl border-2 border-white/20 shadow-md">
            <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest block font-press-start">Treinador</span>
            <span className="text-white font-press-start text-[11px] font-extrabold">ASH KETCHUM</span>
          </div>
          <div className="bg-[#8B0000] px-4 py-2 rounded-xl border-2 border-white/20 shadow-md text-center">
            <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest block font-press-start">Nível</span>
            <span className="text-white font-press-start text-[11px] font-extrabold">99</span>
          </div>
        </div>

        {/* Signal Monitor & Sound Controls from Design HTML */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full border border-white/20 shadow-sm">
            <div className="flex items-end space-x-1 h-3.5">
              <div className="w-1 h-1 bg-white"></div>
              <div className="w-1 h-1.5 bg-white"></div>
              <div className="w-1 h-2.5 bg-white"></div>
              <div className="w-1 h-3.5 bg-white"></div>
            </div>
            <div className="text-white font-press-start text-[7px] uppercase tracking-wider">SINAL: MÁX</div>
            <div className="w-8 h-4 border border-white rounded-sm relative p-0.5 flex items-center">
              <div className="h-full w-4/5 bg-green-400 rounded-2xs"></div>
              <div className="absolute -right-1 top-0.5 w-[2px] h-1.5 bg-white rounded-r-3xs"></div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Keyboard shortcut list toggle */}
            <button
              onClick={() => { playBeep(600, 0.05); setKeyboardHelpOpen(!keyboardHelpOpen); }}
              className={`p-2 rounded-xl border text-xs flex items-center space-x-1.5 transition ${
                keyboardHelpOpen ? 'bg-amber-400 text-[#222] border-amber-500' : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-white'
              }`}
              title="Atalhos do Teclado"
            >
              <Keyboard className="w-4 h-4" />
              <span className="font-mono text-[9px] uppercase font-bold hidden md:inline">TECLADO</span>
            </button>

            {/* Master Sound Button Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-center transition ${
                soundOn ? 'bg-amber-400 border-amber-500 text-zinc-900' : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title={soundOn ? 'Mutar Som' : 'Ativar Som'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* KEYBOARD SHORTCUT FLOATING HELPER */}
      <AnimatePresence>
        {keyboardHelpOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-5xl bg-stone-900 text-stone-100 p-4 rounded-xl shadow-lg border-2 border-stone-800 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono"
          >
            <div>
              <p className="text-amber-400 font-bold mb-1 font-press-start text-[8px] uppercase">Botões Físicos</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <kbd className="px-2 py-1 bg-stone-800 rounded border border-stone-600 text-[10px]">A</kbd>
                <span>Botão de Ação A</span>
              </div>
              <div className="flex items-center space-x-2 mt-1.5">
                <kbd className="px-2 py-1 bg-stone-800 rounded border border-stone-600 text-[10px]">B</kbd>
                <span>Botão de Voltar B</span>
              </div>
            </div>

            <div>
              <p className="text-amber-400 font-bold mb-1 font-press-start text-[8px] uppercase">Abas Rápidas</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <kbd className="px-2.5 py-1 bg-stone-800 rounded border border-stone-600 text-[10px]">1</kbd>
                <span>Modo RELÓGIO</span>
              </div>
              <div className="flex items-center space-x-2 mt-1.5">
                <kbd className="px-2.5 py-1 bg-stone-800 rounded border border-stone-600 text-[10px]">2</kbd>
                <span>Modo ALARME</span>
              </div>
            </div>

            <div>
              <p className="text-stone-400 font-bold mb-1 font-press-start text-[8px] uppercase">Abas (Cont.)</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <kbd className="px-2.5 py-1 bg-stone-800 rounded border border-stone-600 text-[10px]">3</kbd>
                <span>Modo CRONÔMETRO</span>
              </div>
              <div className="flex items-center space-x-2 mt-1.5">
                <kbd className="px-2.5 py-1 bg-stone-800 rounded border border-stone-600 text-[10px]">4</kbd>
                <span>Modo CRONO OVO</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="p-2 border border-stone-700 bg-stone-800 rounded-lg text-[10px] leading-relaxed text-stone-300">
                Aperte as teclas diretamente no seu teclado físico para interagir com o Poké-Gear!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DUAL COLUMN WORKSPACE: POKÉGEAR ON LEFT, STATS/ACHIEVEMENTS ON RIGHT */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-stretch lg:justify-between gap-6 md:gap-10 my-auto">
        
        {/* LEFT COLUMN: THE PHYSICAL POKÉ-GEAR DEVICE HANDHELD */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          
          {/* PHYSICAL CONSOLE CASE CASE CONTAINER (Vibrant Palette Theme) */}
          <div className="relative w-full max-w-[480px] bg-[#CC0000] rounded-[40px] border-[6px] border-stone-900 border-b-[18px] border-b-[#8B0000] shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
            
            {/* Upper-margin highlights and side grooves matching Poké-Gear design vents */}
            <div className="absolute top-1/4 left-2 w-1.5 h-20 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute top-1/4 right-2 w-1.5 h-20 bg-white/10 rounded-full pointer-events-none" />
            
            {/* Side grip ridges from Design HTML */}
            <div className="absolute top-1/2 left-3.5 w-1 h-32 bg-black/15 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 right-3.5 w-1 h-32 bg-black/15 rounded-full pointer-events-none" />

            {/* Top red section gloss highlight finish */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-white/15 pointer-events-none" />

            {/* UPPER PANEL: POKÉ BALL RED SECTION & ACTIVE SYSTEM MONITOR */}
            <div className="p-5 pb-2 flex flex-col items-center bg-[#CC0000]">
              
              {/* LCD CONSOLE SCREEN FRAME (Thick Charcoal Frame from Design HTML) */}
              <div className="w-full bg-[#333] rounded-2xl p-2.5 md:p-3.5 border-[10px] md:border-[16px] border-[#333] flex flex-col relative shadow-inner shadow-black/80">
                {/* Left screen speaker holes & power led indicators */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col space-y-2 opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-950 shadow" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-950 shadow" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-950 shadow" />
                </div>

                {/* Glass reflex overlay */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 skew-y-6 pointer-events-none rounded-t-lg z-20" />
                
                {/* 1. SCREEN SYSTEM TOP STATUS BAR */}
                <div className="w-full border-b border-[#0f380f]/20 pb-1.5 mb-1.5 flex justify-between items-center font-press-start font-bold text-[7px] text-[#0f380f] tracking-wider z-10 px-1 opacity-80">
                  
                  {/* Battery level life represented as Trainer Lv */}
                  <div className="flex items-center space-x-1">
                    <Battery className="w-3 h-3 text-[#0f380f]" />
                    <span>TREINADOR NV99</span>
                  </div>

                  {/* Great ball signal strength */}
                  <div className="flex items-center space-x-1">
                    <Radio className="w-2.5 h-2.5 text-[#0f380f]" />
                    <span className="hidden sm:inline">SINAL:MÁX</span>
                  </div>

                  {/* Mode badge labels */}
                  <div className="bg-[#0f380f]/15 px-1 rounded-sm uppercase tracking-wider font-extrabold text-[6px]">
                    {activeMode === 'CLOCK' ? 'RELÓGIO' : activeMode === 'ALARM' ? 'ALARME' : activeMode === 'STOPWATCH' ? 'CRONO' : 'OVO'}
                  </div>
                </div>

                {/* 2. THE DUAL-CELL DEVICE SCREEN SPLIT (Left 60% Character, Right 40% Data Metrics) */}
                <div className="w-full flex aspect-[1.6/1] bg-[#8bac0f] rounded-md border-2 border-[#1c301c] overflow-hidden crt-screen relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]">
                  
                  {/* Retro Gameboy LCD grid overlay dot matrix pattern from Design HTML */}
                  <div className="absolute inset-0 opacity-12 pointer-events-none z-15" style={{ backgroundImage: 'radial-gradient(#000 1.2px, transparent 0)', backgroundSize: '4px 4px' }} />

                  {/* Left 60% view: Charcter animation screen */}
                  <div id="character-frame" className="w-[60%] h-full relative border-r border-[#1c301c]/30 z-10">
                    <AnimatePresence mode="wait">
                      {activeMode === 'CLOCK' && (
                        <PikachuClock 
                          currentTime={displayedTime} 
                          triggerSpark={triggerSpark} 
                          onSparkDone={() => setTriggerSpark(false)} 
                        />
                      )}
                      {activeMode === 'ALARM' && (
                        <SnorlaxAlarm 
                          alarms={alarms} 
                          isAlarmTriggered={isAlarmTriggered}
                          onSilenceAlarm={handleSilenceSnorlax} 
                        />
                      )}
                      {activeMode === 'STOPWATCH' && (
                        <ArcanineStopwatch 
                          isRunning={stopwatchRunning} 
                          lapTriggerCount={lapTriggerCount} 
                        />
                      )}
                      {activeMode === 'TIMER' && (
                        <TogepiTimer 
                          remainingMs={timerRemaining} 
                          initialDurationMs={timerInitial} 
                          isActive={timerRunningState} 
                          isComplete={timerCompleted} 
                          onReset={handleResetTimer} 
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right 40% view: Numeric Data display panel */}
                  <div id="metric-frame" className="w-[40%] h-full bg-[#8bac0f] lcd-grid flex flex-col justify-between p-2 font-press-start text-[#0f380f] relative">
                    
                    {/* Tiny visual LCD watermark */}
                    <div className="absolute top-1 right-2 text-[5px] opacity-35 font-extrabold">
                      SYSv2.1
                    </div>

                    {/* Dynamic context content display */}
                    <div className="flex-1 flex flex-col justify-center space-y-1 mt-1">
                      
                      {/* Sub-screen A: Mode clock figures */}
                      {activeMode === 'CLOCK' && (
                        <div className="text-center flex flex-col justify-center h-full">
                          <span className="text-[6px] opacity-65 tracking-wider">HORA</span>
                          <span className="text-[12px] md:text-[14px] font-bold leading-tight select-all">
                            {formatTimeToken(displayedTime.getHours())}:{formatTimeToken(displayedTime.getMinutes())}
                          </span>
                          <span className="text-[7.5px] text-[#0f380f] font-bold opacity-80 mt-1 select-all">
                            :{formatTimeToken(displayedTime.getSeconds())}
                          </span>
                          <span className="text-[5.5px] opacity-60 font-mono mt-1.5 uppercase select-all">
                            {displayedTime.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                          </span>

                          {/* Night notification indicator inside LCD panel */}
                          {upcomingAlarmTimeString && (
                            <div className="mt-2.5 flex items-center justify-center text-[5px] text-[#0f380f] bg-[#0f380f]/10 py-0.5 rounded px-1 space-x-1 scale-90">
                              <span>🔔</span>
                              <span>{upcomingAlarmTimeString}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-screen B: Alarm details figure */}
                      {activeMode === 'ALARM' && (
                        <div className="text-center flex flex-col justify-center h-full">
                          <span className="text-[5px] opacity-60">REGISTRAR</span>
                          
                          {isAlarmTriggered ? (
                            <div className="animate-bounce flex flex-col items-center">
                              <span className="text-[#0f380f] text-[10px] font-bold">ALARME!!</span>
                              <span className="text-[5.5px] font-mono whitespace-nowrap bg-[#0f380f]/15 px-1 rounded truncate max-w-full text-[#0f380f] mt-1 uppercase font-bold">
                                {triggeredAlarmLabel}
                              </span>
                            </div>
                          ) : (
                            <>
                              <span className="text-[11px] font-semibold mt-1">
                                {newAlarmTime}
                              </span>
                              <span className="text-[5px] text-[#0f380f] truncate max-w-[80px] bg-[#0f380f]/10 px-1 mt-1 rounded py-0.5 mx-auto">
                                {newAlarmLabel}
                              </span>
                              
                              <span className="text-[5px] opacity-40 mt-1 bg-black/5 p-1 rounded-sm block">
                                A: ADICIONAR
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Sub-screen C: Stopwatch figure */}
                      {activeMode === 'STOPWATCH' && (
                        <div className="text-center flex flex-col justify-center h-full">
                          <span className="text-[5px] opacity-60">CRONÔMETRO</span>
                          
                          {/* Main MM:SS format */}
                          <span className="text-[10px] font-bold mt-1 tracking-tight select-all">
                            {formattedStopwatch.slice(0, 5)}
                          </span>
                          {/* Centiseconds */}
                          <span className="text-[7.5px] text-[#0f380f] mt-0.5 select-all">
                            .{formattedStopwatch.slice(6)}
                          </span>

                          <div className="text-[5px] mt-2.5 space-y-0.5 bg-black/5 rounded-sm p-1">
                            <div className="flex justify-between">
                              <span>VOLTAS:</span>
                              <span>{laps.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ÚLTIMA:</span>
                              <span className="truncate max-w-[42px]">
                                {laps.length > 0 ? `+${(laps[laps.length - 1].lapTimeMs / 1000).toFixed(1)}s` : '---'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-screen D: Countdowns timer figures */}
                      {activeMode === 'TIMER' && (
                        <div className="text-center flex flex-col justify-center h-full">
                          <span className="text-[5px] opacity-60">CHOCAR OVO</span>
                          
                          {timerCompleted ? (
                            <div className="flex flex-col items-center font-bold">
                              <span className="text-[12px] animate-pulse">00:00:00</span>
                              <span className="text-[5px] bg-[#0f380f]/20 text-[#0f380f] px-1 rounded mt-1.5 animate-bounce font-bold">CHOCADO!</span>
                            </div>
                          ) : (
                            <>
                              <span className="text-[10px] font-bold tracking-tight select-all">
                                {formattedTimer}
                              </span>

                              {/* Progress inside small panel */}
                              <div className="w-full bg-[#0f380f]/15 h-1 mt-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#0f380f] h-full transition-all duration-300"
                                  style={{ width: `${(timerRemaining / timerInitial) * 100}%` }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Bottom layout label indicator */}
                    <div className="opacity-55 text-[5px] text-center border-t border-[#0f380f]/25 pt-1 flex justify-between px-[#0.5] uppercase">
                      <span>BATERIA: 99%</span>
                      <span>ESTÁVEL</span>
                    </div>

                  </div>

                </div>

              </div>
              
              {/* LCD bezel layout visual credits */}
              <div className="w-full flex justify-between items-center px-2 mt-1 text-white/50 text-[6px] font-mono">
                <span className="tracking-wide">GRÁFICOS RETRÔ DOT-MATRIX</span>
                <span className="tracking-widest">Aistudio S.A.</span>
              </div>

            </div>


            {/* LOWER PORTION: MID-DIVIDE BLACK LINE & GLACIER WHITE BASE SHELL */}
            <div className="bg-[#e4e4e7] p-5 pt-3 flex flex-col relative border-t-4 border-stone-900">
              
              {/* Retro divider Pokéball button graphic in center */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-white border-4 border-stone-900 shadow flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                </div>
              </div>

              {/* RETRO NAVIGATION TABS (SELECT SYSTEM MODE) */}
              <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-4 mt-1.5">
                {[
                  { mode: 'CLOCK', icon: '⏰', text: 'RELÓGIO' },
                  { mode: 'ALARM', icon: '🛎️', text: 'ALARME' },
                  { mode: 'STOPWATCH', icon: '🏃', text: 'CRONO' },
                  { mode: 'TIMER', icon: '🥚', text: 'OVO' }
                ].map(item => (
                  <button
                    key={item.mode}
                    onClick={() => selectMode(item.mode as AppMode)}
                    className={`flex flex-col items-center justify-center p-1.5 py-2.5 rounded-lg border-2 transition ${
                      activeMode === item.mode
                        ? 'bg-amber-400 hover:bg-amber-500 border-stone-800 text-stone-900 shadow font-extrabold'
                        : 'bg-stone-100 hover:bg-stone-200 border-stone-400 text-stone-700'
                    }`}
                  >
                    <span className="text-[12px]">{item.icon}</span>
                    <span className="font-press-start text-[5.5px] mt-1.5 uppercase select-none tracking-tight">
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>

              {/* TACTILE HARDWARE CONTROL PANEL & CONSOLE BUTTONS */}
              <div className="flex justify-between items-center mt-3 mb-1 px-1.5">
                
                {/* 1. Classic D-PAD (Directional button decor) */}
                <div className="relative w-20 h-20 flex items-center justify-center select-none opacity-90">
                  {/* Vertical line bar */}
                  <div className="absolute w-6 h-20 bg-stone-500 border-2 border-stone-900 rounded-sm shadow-sm" />
                  {/* Horizontal line bar */}
                  <div className="absolute w-20 h-6 bg-stone-500 border-2 border-stone-900 rounded-sm shadow-sm" />
                  {/* Center cover */}
                  <div className="absolute w-6 h-6 bg-stone-600 rounded-sm z-10" />
                  {/* Direction arrows */}
                  <div className="absolute top-0 text-[10px] text-stone-800 font-extrabold select-none">▲</div>
                  <div className="absolute bottom-0 text-[10px] text-stone-800 font-extrabold select-none">▼</div>
                  <div className="absolute left-1 text-[10px] text-stone-800 font-extrabold select-none">◀</div>
                  <div className="absolute right-1 text-[10px] text-stone-800 font-extrabold select-none">▶</div>
                </div>

                {/* 2. Start/Select decorative buttons */}
                <div className="flex space-x-3 mt-4 opacity-80">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-3 bg-stone-500 border-2 border-stone-900 rounded-full rotate-[-12deg] shadow-inner cursor-pointer active:bg-stone-600" onClick={() => { playBeep(250, 0.05); }} />
                    <span className="text-[5px] text-stone-500 font-press-start mt-2 uppercase">Select</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-3 bg-stone-500 border-2 border-stone-900 rounded-full rotate-[-12deg] shadow-inner cursor-pointer active:bg-stone-600" onClick={() => { playBeep(300, 0.05); }} />
                    <span className="text-[5px] text-stone-500 font-press-start mt-2 uppercase">Start</span>
                  </div>
                </div>

                {/* 3. Red Primary "A" & "B" Action Hardware Buttons */}
                <div className="flex items-center space-x-4">
                  {/* Button B (Reset/Back) */}
                  <div className="flex flex-col items-center">
                    <button
                      id="hardware-btn-b"
                      onClick={handleBPress}
                      className={`w-12 h-12 rounded-full border-4 border-stone-900 bg-stone-700 text-stone-100 font-press-start text-[14px] font-bold shadow-md transform transition-all flex items-center justify-center select-none active:scale-95 ${
                        isBActive ? 'bg-stone-800 border-stone-950 scale-90 translate-y-0.5 shadow' : 'translate-y-0'
                      }`}
                      title="B Action Button"
                    >
                      B
                    </button>
                    <span className="text-[5.5px] text-stone-500 font-press-start mt-2 uppercase tracking-wide">VOLTAR</span>
                  </div>

                  {/* Button A (Confirm/Start) */}
                  <div className="flex flex-col items-center">
                    <button
                      id="hardware-btn-a"
                      onClick={handleAPress}
                      className={`w-12 h-12 rounded-full border-4 border-stone-900 bg-rose-600 text-white font-press-start text-[14px] font-bold shadow-md transform transition-all flex items-center justify-center select-none active:scale-95 ${
                        isAActive ? 'bg-rose-700 border-stone-950 scale-90 translate-y-0.5 shadow' : 'translate-y-0'
                      }`}
                      title="Botão de Ação A"
                    >
                      A
                    </button>
                    <span className="text-[5.5px] text-rose-600 font-press-start mt-2 uppercase font-extrabold tracking-wide">INICIAR</span>
                  </div>
                </div>

              </div>

              {/* Tiny helpful key reminder */}
              <div className="text-center font-mono text-[7px] text-stone-400 mt-2 hover:text-stone-600 cursor-pointer" onClick={() => setKeyboardHelpOpen(true)}>
                ⌨️ ATALHOS NO TECLADO: PRESSIONE AS TECLAS <strong className="text-rose-600">[A]</strong> E <strong className="text-stone-700">[B]</strong> DIRETAMENTE
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: DETAIL WORK DESK CONFIGURATORS & GYM BADGE CASE */}
        <div className="flex-1 w-full flex flex-col justify-between space-y-6">
          
          {/* DETAIL MODIFIER PANELS (Vibrant Palette Dark theme) */}
          <div className="bg-stone-900 rounded-2xl p-5 border-2 border-stone-800 shadow-xl flex-1 flex flex-col justify-between text-stone-100">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <h2 className="font-press-start text-[10px] font-bold tracking-tight text-amber-400 uppercase flex items-center space-x-2">
                  <span>⚙️</span>
                  <span>Painel: {activeMode === 'CLOCK' ? 'RELÓGIO' : activeMode === 'ALARM' ? 'ALARME' : activeMode === 'STOPWATCH' ? 'CRONÔMETRO' : 'TEMPORIZADOR'}</span>
                </h2>
                <div className="text-[8px] font-mono whitespace-nowrap bg-[#CC0000]/15 text-[#ff4d4d] px-2 py-0.5 rounded font-bold border border-[#CC0000]/25">
                  MODIFICADOR ATIVO
                </div>
              </div>

              {/* A. CLOCK CONTROLS PANEL */}
              {activeMode === 'CLOCK' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Bem-vindo ao <strong>módulo de relógio do treinador</strong> com o <strong>Pikachu</strong>! A cada hora cheia, Pikachu salta em comemoração, soltando belas faíscas de choque do trovão.
                  </p>

                  {/* Real-time Clock Offset adjustment */}
                  <div className="p-3 bg-stone-950/40 rounded-lg border border-stone-850 space-y-3">
                    <span className="text-[9px] font-mono tracking-wider text-stone-305 uppercase block font-extrabold text-amber-400">Ajustar Relógio do Poké-Gear:</span>
                    <div className="flex justify-around items-center space-x-2">
                      <div className="text-center">
                        <span className="block text-[8px] font-mono text-stone-400 uppercase mb-1">Horas</span>
                        <div className="flex items-center space-x-1 bg-stone-900 border border-stone-700 rounded px-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => { playBeep(500, 0.05); setTimeOffsetMs(prev => prev - 3600000); }}
                            className="w-6 h-6 hover:bg-stone-800 text-white font-bold rounded flex items-center justify-center transition text-sm"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold text-amber-400 min-w-[20.5px] text-center select-all">
                            {formatTimeToken(displayedTime.getHours())}
                          </span>
                          <button
                            type="button"
                            onClick={() => { playBeep(550, 0.05); setTimeOffsetMs(prev => prev + 3600000); }}
                            className="w-6 h-6 hover:bg-stone-800 text-white font-bold rounded flex items-center justify-center transition text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="block text-[8px] font-mono text-stone-400 uppercase mb-1">Minutos</span>
                        <div className="flex items-center space-x-1 bg-stone-900 border border-stone-700 rounded px-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => { playBeep(500, 0.05); setTimeOffsetMs(prev => prev - 60000); }}
                            className="w-6 h-6 hover:bg-stone-800 text-white font-bold rounded flex items-center justify-center transition text-sm"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold text-amber-400 min-w-[20.5px] text-center select-all">
                            {formatTimeToken(displayedTime.getMinutes())}
                          </span>
                          <button
                            type="button"
                            onClick={() => { playBeep(550, 0.05); setTimeOffsetMs(prev => prev + 60000); }}
                            className="w-6 h-6 hover:bg-stone-800 text-white font-bold rounded flex items-center justify-center transition text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={() => { playBeep(400, 0.1); setTimeOffsetMs(0); }}
                        className="text-[8px] font-press-start bg-stone-800 hover:bg-stone-750 text-stone-200 px-3 py-1.5 rounded border-2 border-stone-950 shadow transition active:scale-95"
                      >
                        SINCRONIZAR HORA REAL
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-stone-800 space-y-3 bg-stone-950/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-stone-200">Simular Modo Noturno [B]:</span>
                      <button
                        onClick={handleBPress}
                        className={`text-[10px] font-mono px-2 py-1 rounded border-2 transition font-bold ${
                          simulatedNight ? 'bg-amber-400 text-stone-900 border-amber-500' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {simulatedNight ? 'SIMULADOR LIGADO' : 'SIMULADOR DESLIGADO'}
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      Ativar o modo noturno força o estilo visual da noite. Pikachu coloca sua touca de dormir aconchegante, se encolhe e cai no sono profundo.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-stone-800 space-y-3 bg-stone-950/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-stone-200">Ferramentas de Teste:</span>
                      <button
                        onClick={handleAPress}
                        className="text-[9px] font-press-start bg-amber-400 hover:bg-amber-500 text-stone-900 px-3 py-1.5 rounded-lg border-2 border-stone-950 shadow transition-all active:scale-95"
                      >
                        CHOQUE DE TESTE [A]
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      Dispara instantaneamente a animação clássica de salto e descarga elétrica do Pikachu, piscando frelas amarelas com som em 8-bits.
                    </p>
                  </div>
                </div>
              )}

              {/* B. ALARM CONTROLS PANEL */}
              {activeMode === 'ALARM' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Snorlax dorme profundamente enquanto o despertador estiver silencioso. Quando chega a hora programada, ele se irrita com o barulho, acorda bravo e começa a chacoalhar!
                  </p>

                  {/* Alarm creation form */}
                  <form onSubmit={handleAddAlarm} className="bg-stone-950/40 p-4 rounded-lg border border-stone-800 space-y-3">
                    <h3 className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-stone-400">Registrar Novo Despertador:</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-semibold text-stone-400 mb-1 uppercase tracking-wide">HORA (24H):</label>
                        <input
                          type="time"
                          value={newAlarmTime}
                          onChange={(e) => setNewAlarmTime(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 text-white rounded px-2 py-1 text-xs font-mono focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-stone-400 mb-1 uppercase tracking-wide">DESCRIÇÃO:</label>
                        <input
                          type="text"
                          value={newAlarmLabel}
                          onChange={(e) => setNewAlarmLabel(e.target.value)}
                          placeholder="Lanche do Pika"
                          maxLength={16}
                          className="w-full bg-stone-900 border border-stone-700 text-white rounded px-2 py-1 text-xs focus:border-amber-400 focus:outline-none placeholder-stone-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#CC0000] hover:bg-[#dc2626] text-white font-press-start text-[7px] py-2 rounded-lg border-2 border-stone-950 flex items-center justify-center space-x-1.5 transition active:scale-97"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>REGISTRAR ALARME</span>
                    </button>
                  </form>

                  {/* Alarm Ledger list */}
                  <div className="space-y-2">
                    <h4 className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-stone-400">Alarmes Ativos:</h4>
                    {alarms.length === 0 ? (
                      <p className="text-[10px] text-stone-500 italic mt-1">Nenhum alarme registrado de momento.</p>
                    ) : (
                      <div className="max-h-[125px] overflow-y-auto space-y-1.5 pr-1">
                        {alarms.map(item => (
                          <div 
                            key={item.id} 
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                              item.enabled ? 'bg-amber-500/10 border-amber-500/30' : 'bg-stone-950/30 border-stone-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <input
                                type="checkbox"
                                checked={item.enabled}
                                onChange={() => toggleAlarmStatus(item.id)}
                                className="w-3.5 h-3.5 accent-[#CC0000] cursor-pointer"
                              />
                              <div>
                                <span className="font-bold font-mono text-stone-200">{item.time}</span>
                                <span className="text-[9px] text-[#ff4d4d] ml-2 font-mono">{item.label}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteAlarm(item.id)}
                              className="p-1 hover:bg-stone-800 rounded text-stone-500 hover:text-[#ff4d4d] transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* C. STOPWATCH CONTROLS PANEL */}
              {activeMode === 'STOPWATCH' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Assista ao magnífico <strong>Arcanine</strong> correr em alta velocidade! Os milissegundos aceleram a animação das chamas saindo de trás dele.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleStartStopStopwatch}
                      className={`font-press-start text-[7px] py-1.5 border-2 border-stone-950 rounded-lg flex items-center justify-center space-x-1.5 shadow active:scale-95 transition ${
                        stopwatchRunning ? 'bg-amber-400 text-stone-950 font-extrabold' : 'bg-emerald-600 text-white font-extrabold hover:bg-emerald-700'
                      }`}
                    >
                      {stopwatchRunning ? <Pause className="w-3" /> : <Play className="w-3" />}
                      <span>{stopwatchRunning ? 'PAUSAR A' : 'INICIAR A'}</span>
                    </button>
                    <button
                      onClick={handleLapResetStopwatch}
                      className="font-press-start text-[7px] py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border-2 border-stone-950 rounded-lg flex items-center justify-center space-x-1.5 shadow active:scale-95 transition"
                    >
                      {stopwatchRunning ? <Plus className="w-3" /> : <RotateCcw className="w-3" />}
                      <span>{stopwatchRunning ? 'VOLTA B' : 'RESETAR B'}</span>
                    </button>
                  </div>

                  {/* Lap logs list */}
                  <div className="space-y-2">
                    <h3 className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-stone-400">Voltas Registradas:</h3>
                    {laps.length === 0 ? (
                      <div className="border border-dashed border-stone-850 rounded-lg p-4 text-center text-[10px] text-stone-500 italic">
                        Nenhuma volta registrada. Pressione B durante a corrida!
                      </div>
                    ) : (
                      <div className="max-h-[125px] overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                        {laps.map(lap => (
                          <div key={lap.index} className="flex justify-between items-center p-1.5 bg-stone-950/40 rounded border border-stone-800">
                            <span className="font-bold text-stone-400 font-press-start text-[6px]">VOLTA #{lap.index}</span>
                            <span className="text-amber-400 font-medium">+{ (lap.lapTimeMs / 1000).toFixed(2) }s</span>
                            <span className="text-stone-500 text-[10px]">{ (lap.elapsedMs / 1000).toFixed(2) }s</span>
                          </div>
                        )).reverse()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* D. TIMER CONTROLS PANEL */}
              {activeMode === 'TIMER' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Defina o tempo de incubação para sacudir o <strong>Ovo de Togepi</strong>! Conforme o tempo se aproxima de zero, o ovo treme mais. Chocar trará seu novo amigo Togepi!
                  </p>

                  <div className="bg-stone-950/40 p-3 rounded-lg border border-stone-800 space-y-2">
                    <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase block">Configurar Incubadora:</span>
                    
                    <div className="flex justify-around items-center space-x-2">
                      <div className="text-center">
                        <span className="block text-[8px] font-mono text-stone-400">HORAS</span>
                        <div className="flex items-center space-x-1 bg-stone-900 border border-stone-700 rounded px-1 mt-1">
                          <button onClick={() => updateTimerConfig('hours', -1)} disabled={timerRunningState} className="w-5 h-5 font-bold hover:bg-stone-805 text-white disabled:opacity-40">-</button>
                          <span className="font-mono font-bold text-sm w-5 text-white">{formatTimeToken(timerConfig.hours)}</span>
                          <button onClick={() => updateTimerConfig('hours', 1)} disabled={timerRunningState} className="w-5 h-5 font-bold hover:bg-stone-805 text-white disabled:opacity-40">+</button>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="block text-[8px] font-mono text-stone-400">MINUTOS</span>
                        <div className="flex items-center space-x-1 bg-stone-900 border border-stone-700 rounded px-1 mt-1">
                          <button onClick={() => updateTimerConfig('minutes', -1)} disabled={timerRunningState} className="w-5 h-5 font-bold hover:bg-stone-805 text-white disabled:opacity-40">-</button>
                          <span className="font-mono font-bold text-sm w-5 text-white">{formatTimeToken(timerConfig.minutes)}</span>
                          <button onClick={() => updateTimerConfig('minutes', 1)} disabled={timerRunningState} className="w-5 h-5 font-bold hover:bg-stone-805 text-white disabled:opacity-40">+</button>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="block text-[8px] font-mono text-stone-400">SEGUNDOS</span>
                        <div className="flex items-center space-x-1 bg-stone-900 border border-stone-700 rounded px-1 mt-1">
                          <button onClick={() => updateTimerConfig('seconds', -1)} disabled={timerRunningState} className="w-5 h-5 font-bold hover:bg-stone-805 text-white disabled:opacity-40">-</button>
                          <span className="font-mono font-bold text-sm w-5 text-white">{formatTimeToken(timerConfig.seconds)}</span>
                          <button onClick={() => updateTimerConfig('seconds', 1)} disabled={timerRunningState} className="w-5 h-5 font-bold hover:bg-stone-805 text-white disabled:opacity-40">+</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live adjustment while running or stopped */}
                  <div className="bg-stone-950/40 p-3 rounded-lg border border-stone-850 space-y-2">
                    <span className="text-[9px] font-mono tracking-wider text-stone-305 uppercase block font-extrabold text-amber-400">Ajuste Rápido de Tempo:</span>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => adjustTimerTime(-60)}
                        className="bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-[9px] py-1 border border-stone-700 rounded transition font-bold active:scale-95 cursor-pointer"
                        title="Subtrair 1 Minuto"
                      >
                        -1 Min
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustTimerTime(-10)}
                        className="bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-[9px] py-1 border border-stone-700 rounded transition font-bold active:scale-95 cursor-pointer"
                        title="Subtrair 10 Segundos"
                      >
                        -10 Seg
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustTimerTime(10)}
                        className="bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-[9px] py-1 border border-stone-700 rounded transition font-bold active:scale-95 cursor-pointer"
                        title="Adicionar 10 Segundos"
                      >
                        +10 Seg
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustTimerTime(60)}
                        className="bg-stone-900 hover:bg-stone-800 text-stone-300 font-mono text-[9px] py-1 border border-stone-700 rounded transition font-bold active:scale-95 cursor-pointer"
                        title="Adicionar 1 Minuto"
                      >
                        +1 Min
                      </button>
                    </div>
                  </div>

                  {/* Preset Buttons for Quick Egg Hatch Testing! */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase block font-extrabold">Atalhos de Chocagem Rápida:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { time: 5, label: '5 Seg' },
                        { time: 10, label: '10 Seg' },
                        { time: 60, label: '1 Min' },
                        { time: 300, label: '5 Min' }
                      ].map(preset => (
                        <button
                          key={preset.time}
                          type="button"
                          onClick={() => applyTimerPreset(preset.time)}
                          disabled={timerRunningState}
                          className="bg-stone-850 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-amber-400 font-mono text-[9px] py-1 rounded transition text-center font-bold"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      onClick={handleStartStopTimer}
                      className="font-press-start text-[7px] py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-stone-950 rounded-lg flex items-center justify-center space-x-1.5 shadow"
                    >
                      {timerRunningState ? <Pause className="w-3" /> : <Play className="w-3" />}
                      <span>{timerRunningState ? 'PAUSAR A' : 'INICIAR A'}</span>
                    </button>
                    <button
                      onClick={handleResetTimer}
                      className="font-press-start text-[7px] py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border-2 border-stone-950 rounded-lg flex items-center justify-center space-x-1.5 shadow"
                    >
                      <RotateCcw className="w-3" />
                      <span>RESETAR B</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Visual Footnotes for interactive guidance */}
            <div className="bg-stone-950/40 border-t border-stone-800 p-2 text-center text-[9px] text-stone-400 font-mono flex justify-center items-center space-x-1.5 mt-4">
              <span>💡 DICA:</span>
              <span>OS BOTÕES FÍSICOS DO GEAR RESPONDEM AO VIVO DE ACORDO COM O MODO SELECIONADO.</span>
            </div>
          </div>

          {/* GYM BADGE CASE CASE (Gamified easter-egg system!) */}
          <div className="bg-stone-900 rounded-2xl p-4 border-2 border-stone-800 shadow-xl flex flex-col justify-between text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
              <h3 className="font-press-start text-[8px] font-bold text-stone-200 uppercase flex items-center space-x-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span>Porta-Insígnias do Treinador</span>
              </h3>
              <div className="text-[8px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {Object.values(achievements).filter(Boolean).length} / 8 INSÍGNIAS
              </div>
            </div>

            {/* Badges alignment grids */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 py-1.5">
              {[
                { key: 'boulder', name: 'Rocha', icon: '🪨', task: 'Iniciar o Poké-Gear' },
                { key: 'cascade', name: 'Cascata', icon: '💧', task: 'Chocar o Ovo de Togepi' },
                { key: 'thunder', name: 'Trovão', icon: '⚡', task: 'Ativar Faíscas do Pikachu' },
                { key: 'rainbow', name: 'Arco-Íris', icon: '🌈', task: 'Registrar um Novo Alarme' },
                { key: 'soul', name: 'Alma', icon: '💜', task: 'Gravar Volta do Arcanine' },
                { key: 'marsh', name: 'Pântano', icon: '👁️', task: 'Simular o Modo Noturno' },
                { key: 'volcano', name: 'Vulcão', icon: '🔥', task: 'Acalmar Snorlax irritado' },
                { key: 'earth', name: 'Terra', icon: '🗺️', task: 'Explorar todos os 4 Modos' }
              ].map(badge => (
                <div 
                  key={badge.key} 
                  className="flex flex-col items-center group relative cursor-help"
                >
                  {/* Badge token item block */}
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    achievements[badge.key]
                      ? 'bg-gradient-to-br from-amber-200 to-amber-500 scale-105 border-yellow-600 text-stone-900 shadow-[0_2px_4px_rgba(217,119,6,0.3)]'
                      : 'bg-stone-800 border-stone-700 text-stone-500 opacity-30 select-none grayscale'
                  }`}>
                    <span className="text-sm">{badge.icon}</span>
                  </div>
                  
                  {/* Small text design label */}
                  <span className="font-press-start text-[5px] mt-1 text-center font-bold truncate max-w-[40px] uppercase">
                    {badge.name}
                  </span>

                  {/* Tooltip detail popping on hover */}
                  <div className="absolute bottom-11 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom bg-stone-950 text-white font-mono text-[8px] p-2 rounded-lg shadow-2xl w-36 text-center select-none z-50 pointer-events-none line-clamp-2 leading-relaxed border border-stone-800">
                    <p className="font-bold text-amber-400 uppercase text-[7px] tracking-wide mb-0.5">Insígnia {badge.name}</p>
                    <p className="opacity-90">{badge.task}</p>
                    {achievements[badge.key] ? (
                      <span className="text-lime-400 font-bold block mt-1">★ DESBLOQUEADA</span>
                    ) : (
                      <span className="text-stone-500 font-bold block mt-1">BLOQUEADA</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-stone-500 italic text-center font-mono mt-2 pt-1 border-t border-[#333]">
              Complete os desafios do relógio para liberar retro Ligas de Treinadores!
            </p>
          </div>

        </div>

      </main>

      {/* FOOTER BAR */}
      <footer className="w-full max-w-5xl border-t border-stone-855 pt-3 mt-4 text-center text-stone-500 font-mono text-[9px]">
        <p>Copyright © 2026. Projetado com extrema atenção aos detalhes visuais de Pokémon.</p>
        <p className="mt-1 font-bold text-stone-605 uppercase tracking-widest text-[8px]">PokeGear S.A., Terminal da Liga Kanto</p>
      </footer>

    </div>
  );
}
