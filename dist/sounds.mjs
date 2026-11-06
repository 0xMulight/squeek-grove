// Original, short garden cues. All sounds are synthesized locally.
// Each voice: delay, starting Hz, ending Hz, duration, gain, waveform.
const CUES = {
  plant: [[0,260,120,.13,.25,'sine'],[.06,520,690,.13,.09,'sine']],
  water: [[0,930,420,.13,.15,'sine'],[.09,1180,620,.15,.13,'sine'],[.19,860,380,.17,.11,'sine']],
  irrigate: [[0,392,523,.25,.12,'sine'],[.09,784,392,.16,.14,'sine'],[.2,1047,660,.2,.12,'sine'],[.32,1319,1047,.24,.07,'sine']],
  harvest: [[0,523,523,.23,.14,'triangle'],[.08,659,659,.25,.12,'triangle'],[.16,784,784,.32,.11,'sine']],
  sell: [[0,988,988,.16,.1,'sine'],[.09,1319,1319,.25,.08,'sine']],
  accept: [[0,440,520,.1,.12,'triangle'],[.09,659,659,.19,.1,'sine']],
  deliver: [[0,523,523,.22,.14,'triangle'],[.11,659,659,.24,.13,'triangle'],[.22,784,784,.28,.12,'triangle'],[.36,1047,1047,.42,.11,'sine']],
  unlock: [[0,196,262,.2,.14,'triangle'],[.12,523,523,.24,.11,'sine'],[.23,784,784,.3,.09,'sine']],
  claim: [[0,659,659,.2,.12,'triangle'],[.1,784,784,.23,.11,'sine'],[.21,1047,1047,.34,.09,'sine']],
  level: [[0,523,523,.23,.13,'triangle'],[.12,659,659,.24,.12,'triangle'],[.24,784,784,.28,.11,'triangle'],[.38,1047,1047,.46,.1,'sine'],[.38,1319,1319,.46,.055,'sine']]
};
const STORAGE = 'squeek-grove-sounds-v1';

export function createGardenSounds(onChange = () => {}) {
  let enabled = true, volume = 55;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    if (typeof saved?.enabled === 'boolean') enabled = saved.enabled;
    if (Number.isFinite(saved?.volume)) volume = Math.max(0,Math.min(100,saved.volume));
  } catch { /* Sound controls also work without storage. */ }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let context, master, output, generation = 0, request = 0, lastPlay = -Infinity;
  const voices = new Set();
  const persist = () => { try { localStorage.setItem(STORAGE,JSON.stringify({enabled,volume})); } catch {} };

  function setup() {
    if (context) return;
    // Separate from the music context so pausing the melody leaves effects usable.
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = volume / 100 * .6;
    output = context.createBiquadFilter();
    output.type = 'lowpass';
    output.frequency.value = 2800;
    output.connect(master);
    master.connect(context.destination);
  }

  function stop() {
    generation++;
    for (const voice of voices) {
      try { voice.oscillator.stop(); } catch {}
      voice.oscillator.disconnect();
      voice.envelope.disconnect();
    }
    voices.clear();
    if (context) void context.suspend().catch(() => {});
  }

  function voiceAt([delay,from,to,duration,gain,type],start) {
    const time = start + delay;
    const oscillator = context.createOscillator(), envelope = context.createGain();
    const voice = {oscillator,envelope};
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from,time);
    oscillator.frequency.exponentialRampToValueAtTime(to,time+duration);
    envelope.gain.setValueAtTime(0,time);
    envelope.gain.linearRampToValueAtTime(gain,time+.008);
    envelope.gain.exponentialRampToValueAtTime(.0001,time+duration);
    oscillator.connect(envelope);
    envelope.connect(output);
    voices.add(voice);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
      voices.delete(voice);
    };
    oscillator.start(time);
    oscillator.stop(time+duration+.02);
  }

  function play(name) {
    const cue = CUES[name];
    if (!enabled || !volume || !AudioContext || document.hidden || !cue) return false;
    const requestedAt = performance.now(), currentGeneration = generation, id = ++request;
    if (requestedAt-lastPlay < 85) return false;
    const emit = () => {
      // Never queue old game sounds behind a blocked resume or a rapid series of taps.
      if (!enabled || !volume || document.hidden || currentGeneration !== generation ||
          id !== request || performance.now()-requestedAt > 400 || context.state !== 'running') return false;
      if (voices.size+cue.length > 18) return false;
      master.gain.setTargetAtTime(volume/100*.6,context.currentTime,.015);
      cue.forEach(voice => voiceAt(voice,context.currentTime+.012));
      lastPlay = performance.now();
      return true;
    };
    try {
      setup();
      if (context.state === 'running') return emit();
      void context.resume().then(emit).catch(() => {});
      return true;
    } catch { return false; }
  }

  document.addEventListener('visibilitychange',() => { if (document.hidden) stop(); });
  window.addEventListener('pagehide',stop);

  return {
    get enabled() { return enabled; },
    get volume() { return volume; },
    get supported() { return Boolean(AudioContext); },
    play,
    toggle() {
      enabled = !enabled;
      if (!enabled) stop();
      persist();
      onChange();
    },
    setVolume(value) {
      if (!Number.isFinite(Number(value))) return;
      volume = Math.round(Math.max(0,Math.min(100,Number(value))));
      if (!volume) stop();
      else if (master) master.gain.setTargetAtTime(volume/100*.6,context.currentTime,.015);
      persist();
      onChange();
    }
  };
}
