/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

let activeNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];

function registerActiveNode(node: OscillatorNode | AudioBufferSourceNode) {
  activeNodes.push(node);
  node.onended = () => {
    activeNodes = activeNodes.filter(n => n !== node);
  };
}

export function stopAllSounds() {
  activeNodes.forEach(node => {
    try {
      node.stop();
    } catch (e) {
      // ignored
    }
  });
  activeNodes = [];
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (!soundEnabled) {
    stopAllSounds();
  }
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
    registerActiveNode(osc);
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
    registerActiveNode(noise);
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
// Designed to last exactly 2 seconds for active, satisfying retro rumble experience!
export function playThunderbolt() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const playNote = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.06) => {
    const osc = ctx.createOscillator();
    registerActiveNode(osc);
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
    playNote(880.00, 0.0, 0.15, 'triangle', 0.08);
    // "-ka" (mid F#5, triangle)
    playNote(739.99, 0.16, 0.18, 'triangle', 0.06);
    
    // "Pi-" (high A5, triangle)
    playNote(880.00, 0.36, 0.15, 'triangle', 0.08);
    // "-ka-" (mid F#5, triangle)
    playNote(739.99, 0.52, 0.20, 'triangle', 0.06);

    // "-chuuu!" (B5 gliding down to E5, lasting a full second with retro vibrato)
    const sparkDuration = 0.95; // From 0.75s to 1.70s
    const osc = ctx.createOscillator();
    registerActiveNode(osc);
    const gainNode = ctx.createGain();
    osc.type = 'triangle';
    
    const startTimeStamp = ctx.currentTime + 0.75;
    osc.frequency.setValueAtTime(987.77, startTimeStamp);
    osc.frequency.linearRampToValueAtTime(659.25, startTimeStamp + sparkDuration);
    
    gainNode.gain.setValueAtTime(0, startTimeStamp);
    gainNode.gain.linearRampToValueAtTime(0.08, startTimeStamp + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTimeStamp + sparkDuration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(startTimeStamp);
    osc.stop(startTimeStamp + sparkDuration);

    // Cute electric sparkling bells (delicate, high-pitched, soft-sine, staggered cascade up to 2.0s)
    playNote(2093.00, 0.80, 0.15, 'sine', 0.02); // C7
    playNote(2349.32, 0.95, 0.15, 'sine', 0.02); // D7
    playNote(2637.02, 1.10, 0.15, 'sine', 0.02); // E7
    playNote(3135.96, 1.25, 0.15, 'sine', 0.02); // G7
    playNote(3520.00, 1.40, 0.15, 'sine', 0.025); // A7
    playNote(4186.01, 1.55, 0.15, 'sine', 0.03); // C8
    playNote(3135.96, 1.70, 0.15, 'sine', 0.02); // G7
    playNote(2637.02, 1.82, 0.18, 'sine', 0.015); // E7
  } catch (error) {
    playBeep(880, 2.0, 'sine');
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
    registerActiveNode(osc);
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
    registerActiveNode(osc);
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
