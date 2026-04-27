// Programatické zvuky cez Web Audio API — žiadne externé súbory, malá veľkosť,
// vždy správne timing. Toggle je v localStorage.

const KEY = 'prijimacky-sound-v1';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {}
}

type Note = { freq: number; duration: number; delay?: number; volume?: number; type?: OscillatorType };

function playSequence(notes: Note[]) {
  if (!isSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    c.resume().catch(() => {});
  }
  const now = c.currentTime;
  for (const n of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.value = n.freq;
    const start = now + (n.delay ?? 0);
    const stop = start + n.duration;
    const vol = n.volume ?? 0.18;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(stop + 0.05);
  }
}

// === Effects ===

export function playCorrect() {
  // Šťastný stúpajúci akord (C5 → E5 → G5)
  playSequence([
    { freq: 523.25, duration: 0.08 },
    { freq: 659.25, duration: 0.08, delay: 0.06 },
    { freq: 783.99, duration: 0.18, delay: 0.12, volume: 0.22 },
  ]);
}

export function playWrong() {
  // Mäkké klesnutie — nie potrestanie
  playSequence([
    { freq: 330, duration: 0.12, type: 'triangle', volume: 0.13 },
    { freq: 247, duration: 0.18, delay: 0.1, type: 'triangle', volume: 0.13 },
  ]);
}

export function playStreak() {
  // Rýchly dvojdrng pre sériu
  playSequence([
    { freq: 880, duration: 0.07, type: 'sine', volume: 0.2 },
    { freq: 1175, duration: 0.1, delay: 0.07, type: 'sine', volume: 0.2 },
  ]);
}

export function playLevelUp() {
  // Fanfára — ascending arpeggio
  playSequence([
    { freq: 523.25, duration: 0.1 },
    { freq: 659.25, duration: 0.1, delay: 0.08 },
    { freq: 783.99, duration: 0.1, delay: 0.16 },
    { freq: 1046.5, duration: 0.3, delay: 0.24, volume: 0.25 },
  ]);
}

export function playReward() {
  // Glockenspiel sparkle — náhodné high tones
  const base = 880;
  const notes: Note[] = [];
  for (let i = 0; i < 6; i++) {
    notes.push({
      freq: base * (1 + Math.random() * 1.5),
      duration: 0.12,
      delay: i * 0.06,
      type: 'sine',
      volume: 0.15,
    });
  }
  playSequence(notes);
}

export function playPerfect() {
  // Triumphal — long ascending
  playSequence([
    { freq: 523.25, duration: 0.12 },
    { freq: 659.25, duration: 0.12, delay: 0.1 },
    { freq: 783.99, duration: 0.12, delay: 0.2 },
    { freq: 1046.5, duration: 0.12, delay: 0.3 },
    { freq: 1318.5, duration: 0.4, delay: 0.4, volume: 0.28 },
  ]);
}

export function playTick() {
  // Krátky tick pre tlačidlá / changeover
  playSequence([{ freq: 1200, duration: 0.04, type: 'sine', volume: 0.1 }]);
}

export function playTimeWarning() {
  // Posledná minúta varovanie
  playSequence([
    { freq: 660, duration: 0.1, type: 'square', volume: 0.15 },
    { freq: 660, duration: 0.1, delay: 0.15, type: 'square', volume: 0.15 },
  ]);
}
