/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppMode = 'CLOCK' | 'ALARM' | 'STOPWATCH' | 'TIMER';

export interface AlarmItem {
  id: string;
  time: string; // HH:MM (24-hour format)
  enabled: boolean;
  label: string;
}

export interface LapTime {
  index: number;
  elapsedMs: number;
  lapTimeMs: number;
}

export interface TimerConfig {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TogepiEggState {
  status: 'incubation' | 'rocking_low' | 'rocking_high' | 'hatched';
  initialDurationMs: number;
  remainingMs: number;
}
