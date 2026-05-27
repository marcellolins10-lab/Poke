/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Standard AudioContext or WebkitAudioContext fallback
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  // Try to resume if suspended (due to browser autoplay policies)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Play a classic short 8-bit button select beep (pulse wave)
export function playBeep(pitch = 800, duration = 0.08, type: OscillatorType = 'square') {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    
    // Quick volume envelope
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Audio playback error:', error);
  }
}

// Arcanine/Swoosh lunge sound: white noise with bandpass sweeps
export function playSwoosh() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * 0.15; // 0.15 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(100, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.15);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.15);
  } catch (error) {
    // Fallback simple swoosh sweep
    playBeep(200, 0.15, 'triangle');
  }
}

// Pikachu cute pleasant call melody ("Pika-Pika!" with gentle high-pitched twinkle)
export function playThunderbolt() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const playNote = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.06) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    
    // Add a gentle glide or cute sweep for a voice-like effect
    if (type === 'triangle' || type === 'sine') {
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, ctx.currentTime + start + duration);
    }

    gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  };

  try {
    // "Pi-" (high A5, triangle for warmth & vintage comfort)
    playNote(880.00, 0.0, 0.08, 'triangle', 0.08);
    // "-ka" (mid F#5, triangle)
    playNote(739.99, 0.09, 0.12, 'triangle', 0.06);
    
    // "Pi-" (high A5, triangle)
    playNote(880.00, 0.23, 0.08, 'triangle', 0.08);
    // "-ka!" (mid F#5, triangle)
    playNote(739.99, 0.32, 0.15, 'triangle', 0.06);

    // Cute electric sparkling bells (delicate, high-pitched, soft-sine, staggered)
    playNote(2093.00, 0.48, 0.15, 'sine', 0.02); // C7
    playNote(2349.32, 0.55, 0.15, 'sine', 0.025); // D7
    playNote(2637.02, 0.62, 0.25, 'sine', 0.03); // E7
  } catch (error) {
    playBeep(880, 0.2, 'sine');
  }
}

// Poké Flute Melody to awaken Snorlax (pleasant 8-bit sine scale notes, repeating or loop)
let alarmInterval: number | null = null;
export function playPokeFluteMelody() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const playNote = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine'; // Sine works beautifully for flutes
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + start + 0.05); // slightly soft attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  };

  try {
    // Melody notes (A4, B4, C#5, E5, D5, C#5, B4, A4)
    const notes = [440.00, 493.88, 554.37, 659.25, 587.33, 554.37, 493.88, 440.00];
    const itemDurations = [0.2, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.5];
    const startOffset = 0.05;
    
    let currentStart = startOffset;
    for (let i = 0; i < notes.length; i++) {
      playNote(notes[i], currentStart, itemDurations[i]);
      currentStart += itemDurations[i] + 0.03; // add small gap
    }
  } catch (error) {
    playBeep(440, 0.5, 'square');
  }
}

// Start repeating Poké Flute alarm loop
export function startAlarmFluteLoop() {
  stopAlarmFluteLoop();
  
  // Play immediately
  playPokeFluteMelody();
  
  // Repeat every 2.2 seconds
  alarmInterval = window.setInterval(() => {
    playPokeFluteMelody();
  }, 2200);
}

export function stopAlarmFluteLoop() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

// Togepi/Egg level up complete: iconic 8-bit Poké Center Healing Melody
export function playLevelUp() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const playNote = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + start + 0.02); // crisp attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  };

  try {
    // Poke Center Healing theme notes
    // Notes: C6, B5, A5, G5, F#5, G5, plus higher notes
    const fE6 = 1318.51;
    const fD6 = 1174.66;
    const fB5 = 987.77;
    const fG5 = 783.99;
    const fA5 = 880.00;
    
    // Notes sequence and timing
    const melody = [
      { freq: fE6, delay: 0.00, dur: 0.15 },
      { freq: fD6, delay: 0.15, dur: 0.15 },
      { freq: fB5, delay: 0.30, dur: 0.15 },
      { freq: fG5, delay: 0.45, dur: 0.15 },
      { freq: fA5, delay: 0.60, dur: 0.15 },
      { freq: fB5, delay: 0.75, dur: 0.15 },
      { freq: fE6, delay: 0.90, dur: 0.38 }
    ];

    melody.forEach(note => {
      // Use warm sine waves for a dreamy chiptune handheld synthesizer sound
      playNote(note.freq, note.delay, note.dur, 'sine');
    });
  } catch (error) {
    playBeep(880, 0.5, 'sine');
  }
}
