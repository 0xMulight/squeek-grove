// "A Little Sunny Garden" — an original 16-bar, 84 BPM score for Squeek Grove.
// Synthesized locally; no external recordings, players or audio downloads.
const STORAGE = 'squeek-grove-music-v1';
const STEP = 60 / 84 / 2;
const MELODY = [
  [76,0,79,0,81,79,76,0], [74,0,76,79,76,0,72,0],
  [72,0,76,0,79,76,74,0], [71,0,74,0,76,74,71,0],
  [69,0,72,76,74,0,72,0], [72,0,76,79,81,0,79,0],
  [77,0,76,74,72,0,74,0], [71,0,74,0,72,0,0,0],
  [79,0,81,79,76,0,74,0], [76,0,79,0,84,0,81,79],
  [81,0,79,76,72,0,76,0], [74,0,76,74,71,0,0,0],
  [72,0,74,76,77,0,76,0], [76,0,79,76,72,0,69,0],
  [71,0,74,79,77,0,74,0], [76,0,74,0,72,0,0,0]
];
const CHORDS = [
  [48,60,64,67], [43,59,62,67], [45,57,60,64], [40,55,59,64],
  [41,57,60,65], [48,55,60,64], [50,57,60,65], [43,55,59,62],
  [48,60,64,67], [40,55,59,64], [45,57,60,64], [43,59,62,67],
  [41,57,60,65], [45,57,60,64], [43,55,59,62], [48,55,60,64]
];

export function createGardenMusic(onChange = () => {}) {
  let enabled = false, volume = 40;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    enabled = saved?.enabled === true;
    if (Number.isFinite(saved?.volume)) volume = Math.max(0, Math.min(100, saved.volume));
  } catch { /* Music remains usable without browser storage. */ }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let context, master, voiceBus, timer, nextTime = 0, step = 0;
  let playing = false, starting = false, revision = 0;
  const persist = () => { try { localStorage.setItem(STORAGE, JSON.stringify({enabled, volume})); } catch {} };
  const notify = () => onChange();
  const clearScheduler = () => { clearInterval(timer); timer = null; };

  function setup() {
    if (context) return;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    voiceBus = context.createBiquadFilter();
    voiceBus.type = 'lowpass';
    voiceBus.frequency.value = 3400;
    voiceBus.connect(master);
    const delay = context.createDelay(1), echo = context.createGain();
    delay.delayTime.value = STEP * 1.5;
    echo.gain.value = 0.13;
    voiceBus.connect(delay);
    delay.connect(echo);
    echo.connect(master);
    context.addEventListener('statechange', () => {
      if (context.state !== 'running') { playing = false; clearScheduler(); notify(); }
    });
  }

  function note(midi, time, duration, gain, type = 'sine') {
    const oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(gain, time + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(voiceBus);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.03);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }

  function schedule() {
    if (context.state !== 'running') return;
    // Skip a timer stall rather than stacking overdue notes.
    if (nextTime < context.currentTime - STEP) nextTime = context.currentTime + 0.04;
    while (nextTime < context.currentTime + 0.22) {
      const bar = Math.floor(step / 8) % MELODY.length, beat = step % 8;
      const chord = CHORDS[bar], melody = MELODY[bar][beat];
      if (melody) {
        note(melody, nextTime, STEP * 2.8, 0.17, 'triangle');
        note(melody + 12, nextTime, STEP * 1.1, 0.025);
      }
      if (beat % 2 === 0) note(chord[1 + (beat / 2) % 3], nextTime, STEP * 3.5, 0.075);
      if (beat === 0 || beat === 4) note(chord[0], nextTime, STEP * 5, 0.13);
      nextTime += STEP;
      step = (step + 1) % (MELODY.length * 8);
    }
  }

  async function start() {
    if (!enabled || document.hidden || playing || starting) return true;
    if (!AudioContext) return false;
    const request = ++revision;
    starting = true;
    notify();
    try {
      setup();
      await context.resume();
      if (request !== revision || !enabled || document.hidden || context.state !== 'running') return false;
      master.gain.setTargetAtTime(volume / 100 * 0.55, context.currentTime, 0.08);
      nextTime = Math.max(nextTime, context.currentTime + 0.05);
      clearScheduler();
      schedule();
      timer = setInterval(schedule, 100);
      playing = true;
      return true;
    } catch { return false; }
    finally { if (request === revision) starting = false; notify(); }
  }

  function pause() {
    revision++;
    starting = false;
    playing = false;
    clearScheduler();
    if (context) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0, context.currentTime);
      void context.suspend().catch(() => {});
    }
    notify();
  }

  // A remembered preference resumes only after an actual user interaction.
  function resumeFromGesture(event) {
    if (event.target?.closest?.('[data-action="music-toggle"]')) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    if (enabled && !playing && !starting) void start();
  }
  document.addEventListener('pointerdown', resumeFromGesture);
  document.addEventListener('keydown', resumeFromGesture);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else if (context && enabled) void start();
  });
  window.addEventListener('pagehide', pause);
  window.addEventListener('pageshow', () => { if (context && enabled) void start(); });

  return {
    get playing() { return playing; },
    get starting() { return starting; },
    get supported() { return Boolean(AudioContext); },
    get volume() { return volume; },
    async toggle() {
      if (playing || starting) { enabled = false; persist(); pause(); return true; }
      enabled = true;
      persist();
      return start();
    },
    setVolume(value) {
      if (!Number.isFinite(Number(value))) return;
      volume = Math.round(Math.max(0, Math.min(100, Number(value))));
      if (master && playing) master.gain.setTargetAtTime(volume / 100 * 0.55, context.currentTime, 0.04);
      persist();
      notify();
    }
  };
}
