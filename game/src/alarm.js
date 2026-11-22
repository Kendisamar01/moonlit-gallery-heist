import { clamp } from './geometry.js';

export const ALARM_STATES = ['CALM', 'UNEASY', 'SUSPICIOUS', 'ALERT', 'LOCKDOWN'];

export function createAlarm() {
  return {
    value: 0,
    peak: 0,
    state: 'CALM',
    witnesses: 0,
    exposure: 0,
    pulse: 0,
  };
}

function stateFor(value) {
  if (value >= 85) return 'LOCKDOWN';
  if (value >= 62) return 'ALERT';
  if (value >= 32) return 'SUSPICIOUS';
  if (value >= 8) return 'UNEASY';
  return 'CALM';
}

export function updateAlarm(alarm, dt, exposure, witnesses) {
  alarm.exposure = exposure;
  alarm.witnesses = witnesses;
  const rate = exposure > 0 ? 36 * exposure : -18;
  alarm.value = clamp(alarm.value + rate * dt, 0, 100);
  alarm.peak = Math.max(alarm.peak, alarm.value);
  alarm.state = stateFor(alarm.value);
  alarm.pulse += dt * (exposure > 0 ? 7 : 2.2);
  return alarm.value >= 100;
}

export function alarmFraction(alarm) {
  return clamp(alarm.value / 100, 0, 1);
}
