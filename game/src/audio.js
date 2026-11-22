const SILENT_AUDIO = {
  ensure() {},
  step() {},
  grab() {},
  spotted() {},
  caught() {},
  win() {},
  decoy() {},
  veil() {},
  deny() {},
};

export function createAudio() {
  if (typeof window === 'undefined') return SILENT_AUDIO;
  let context = null;

  const ensure = () => {
    if (!context) {
      const AudioConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioConstructor) return null;
      context = new AudioConstructor();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  };

  const tone = (frequency, duration, type, volume, slide) => {
    const audio = ensure();
    if (!audio) return;
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  };

  return {
    ensure,
    step() { tone(148, 0.055, 'triangle', 0.022, -46); },
    grab() { tone(720, 0.13, 'sine', 0.07, 420); tone(1080, 0.19, 'triangle', 0.035, 260); },
    spotted() { tone(420, 0.15, 'square', 0.035, 180); },
    caught() { tone(190, 0.55, 'sawtooth', 0.07, -110); tone(95, 0.7, 'sine', 0.05, -30); },
    win() { tone(540, 0.18, 'sine', 0.06, 160); tone(810, 0.28, 'triangle', 0.05, 220); },
    decoy() { tone(920, 0.09, 'square', 0.028, -540); },
    veil() { tone(260, 0.35, 'sine', 0.05, -120); },
    deny() { tone(180, 0.1, 'square', 0.025, -50); },
  };
}
