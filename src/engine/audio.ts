export type SoundId = "click" | "positive" | "negative" | "crisis" | "gameover";

let audioContext: AudioContext | null = null;
let muted = false;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn("Web Audio API not supported");
      return null;
    }
  }
  // Resume if suspended (iOS requirement)
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

export function setMuted(v: boolean) {
  muted = v;
}

export function isMuted(): boolean {
  return muted;
}

// Simple oscillator beep
function beep(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.15
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// Two-tone beep (rising or falling)
function twoTone(
  ctx: AudioContext,
  freq1: number,
  freq2: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.12
) {
  const half = duration / 2;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq1, ctx.currentTime);
  osc.frequency.setValueAtTime(freq2, ctx.currentTime + half);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// Warble alarm effect
function warble(ctx: AudioContext, baseFreq: number, duration: number, volume = 0.1) {
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const masterGain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

  lfo.type = "sine";
  lfo.frequency.setValueAtTime(8, ctx.currentTime);
  lfoGain.gain.setValueAtTime(50, ctx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(masterGain);
  masterGain.connect(ctx.destination);

  lfo.start(ctx.currentTime);
  osc.start(ctx.currentTime);
  lfo.stop(ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

// Descending sad effect
function sadTrombone(ctx: AudioContext, volume = 0.1) {
  const notes = [392, 370, 349, 330]; // G4 → E4 descending
  const noteDuration = 0.15;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * noteDuration);

    gain.gain.setValueAtTime(volume, ctx.currentTime + i * noteDuration);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i + 1) * noteDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * noteDuration);
    osc.stop(ctx.currentTime + (i + 1) * noteDuration);
  });
}

export function playSound(id: SoundId) {
  if (muted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  switch (id) {
    case "click":
      beep(ctx, 800, 0.05, "square", 0.08);
      break;
    case "positive":
      twoTone(ctx, 523, 659, 0.15, "square", 0.1); // C5 → E5 rising
      break;
    case "negative":
      twoTone(ctx, 440, 294, 0.2, "sawtooth", 0.1); // A4 → D4 falling
      break;
    case "crisis":
      warble(ctx, 600, 0.4, 0.12);
      break;
    case "gameover":
      sadTrombone(ctx, 0.12);
      break;
  }
}

// Initialize audio context on first user interaction (iOS requirement)
export function initAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
}

// ====== MARS AMBIENT MUSIC ======
// Epic orchestral: layered strings, brass swells, majestic crescendos
// Feels like the beginning of something monumental

let marsAmbientPlaying = false;
let marsAmbientNodes: {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  masterGain: GainNode;
  intervals: ReturnType<typeof setInterval>[];
  timeouts: ReturnType<typeof setTimeout>[];
} | null = null;

// Note frequencies
const NOTES = {
  // Sub-bass
  F0: 21.83,
  // Deep bass
  F1: 43.65, G1: 49.00, A1: 55.00,
  // Bass
  C2: 65.41, F2: 87.31, G2: 98.00, A2: 110.00,
  // Cello range
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  // Viola/violin
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  // High strings
  C5: 523.25, E5: 659.26, G5: 783.99, A5: 880.00,
};

// Rich chord voicings (more notes for orchestral fullness)
const CHORDS = {
  Fmaj7: {
    bass: [NOTES.F1, NOTES.F2],
    cellos: [NOTES.C3, NOTES.F3],
    violas: [NOTES.A3, NOTES.C4],
    violins: [NOTES.E4, NOTES.A4],
    high: NOTES.E5,
  },
  G6: {
    bass: [NOTES.G1, NOTES.G2],
    cellos: [NOTES.D3, NOTES.G3],
    violas: [NOTES.B3, NOTES.D4],
    violins: [NOTES.E4, NOTES.G4],
    high: NOTES.E5,
  },
  Am: {
    bass: [NOTES.A1, NOTES.A2],
    cellos: [NOTES.E3, NOTES.A3],
    violas: [NOTES.C4, NOTES.E4],
    violins: [NOTES.A4, NOTES.C5],
    high: NOTES.A5,
  },
};

type ChordName = keyof typeof CHORDS;
const CHORD_SEQUENCE: ChordName[] = ["Fmaj7", "Fmaj7", "G6", "Am", "Am", "Am", "Fmaj7", "Fmaj7"];

// Create a string-like tone (layered, slightly detuned for warmth)
function createStringVoice(
  ctx: AudioContext,
  freq: number,
  destination: AudioNode,
  detuneCents: number = 0
): { oscs: OscillatorNode[]; gain: GainNode } {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.connect(destination);

  const oscs: OscillatorNode[] = [];

  // Main tone (sine for purity)
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(freq, ctx.currentTime);
  osc1.detune.setValueAtTime(detuneCents, ctx.currentTime);
  osc1.connect(gain);
  osc1.start(ctx.currentTime);
  oscs.push(osc1);

  // Slightly detuned layer for thickness (+8 cents)
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq, ctx.currentTime);
  osc2.detune.setValueAtTime(detuneCents + 8, ctx.currentTime);
  const osc2Gain = ctx.createGain();
  osc2Gain.gain.setValueAtTime(0.6, ctx.currentTime);
  osc2.connect(osc2Gain);
  osc2Gain.connect(gain);
  osc2.start(ctx.currentTime);
  oscs.push(osc2);

  // Slightly detuned layer (-8 cents) for chorus effect
  const osc3 = ctx.createOscillator();
  osc3.type = "sine";
  osc3.frequency.setValueAtTime(freq, ctx.currentTime);
  osc3.detune.setValueAtTime(detuneCents - 8, ctx.currentTime);
  const osc3Gain = ctx.createGain();
  osc3Gain.gain.setValueAtTime(0.6, ctx.currentTime);
  osc3.connect(osc3Gain);
  osc3Gain.connect(gain);
  osc3.start(ctx.currentTime);
  oscs.push(osc3);

  return { oscs, gain };
}

// Create brass-like tone (sawtooth, darker)
function createBrassVoice(
  ctx: AudioContext,
  freq: number,
  destination: AudioNode
): { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode } {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);

  // Low-pass filter for warmth (brass isn't too bright)
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.Q.setValueAtTime(0.7, ctx.currentTime);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  osc.start(ctx.currentTime);

  return { osc, gain, filter };
}

export function startMarsAmbient() {
  if (muted || marsAmbientPlaying) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  marsAmbientPlaying = true;

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  // Master gain with slow fade-in
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 5);
  masterGain.connect(ctx.destination);

  // ====== CONTINUOUS DRONE LAYER (never goes silent) ======
  // Sub-bass foundation
  const subDrone = createStringVoice(ctx, NOTES.F0, masterGain);
  subDrone.gain.gain.setValueAtTime(0.025, ctx.currentTime);
  oscillators.push(...subDrone.oscs);
  gains.push(subDrone.gain);

  // Low drone (F1) - always audible
  const lowDrone = createStringVoice(ctx, NOTES.F1, masterGain);
  lowDrone.gain.gain.setValueAtTime(0.04, ctx.currentTime);
  oscillators.push(...lowDrone.oscs);
  gains.push(lowDrone.gain);

  // Mid drone (C3 fifth) - always audible  
  const midDrone = createStringVoice(ctx, NOTES.C3, masterGain);
  midDrone.gain.gain.setValueAtTime(0.025, ctx.currentTime);
  oscillators.push(...midDrone.oscs);
  gains.push(midDrone.gain);

  // ====== PULSING BASS (the Zimmer heartbeat) ======
  const pulseOsc = ctx.createOscillator();
  pulseOsc.type = "triangle";
  pulseOsc.frequency.setValueAtTime(NOTES.F1, ctx.currentTime);
  const pulseGain = ctx.createGain();
  pulseGain.gain.setValueAtTime(0, ctx.currentTime);
  pulseOsc.connect(pulseGain);
  pulseGain.connect(masterGain);
  pulseOsc.start(ctx.currentTime);
  oscillators.push(pulseOsc);
  gains.push(pulseGain);

  // Sub-pulse (octave below)
  const subPulseOsc = ctx.createOscillator();
  subPulseOsc.type = "sine";
  subPulseOsc.frequency.setValueAtTime(NOTES.F1 / 2, ctx.currentTime);
  const subPulseGain = ctx.createGain();
  subPulseGain.gain.setValueAtTime(0, ctx.currentTime);
  subPulseOsc.connect(subPulseGain);
  subPulseGain.connect(masterGain);
  subPulseOsc.start(ctx.currentTime);
  oscillators.push(subPulseOsc);
  gains.push(subPulseGain);

  // ====== OMINOUS "DUN-DUN" OSTINATO (the tension driver) ======
  // Two-note pattern: E-F semitone (like Jaws but slower, more ominous)
  const dunOsc1 = ctx.createOscillator();
  dunOsc1.type = "triangle";
  dunOsc1.frequency.setValueAtTime(NOTES.E3, ctx.currentTime);
  const dunGain1 = ctx.createGain();
  dunGain1.gain.setValueAtTime(0, ctx.currentTime);
  dunOsc1.connect(dunGain1);
  dunGain1.connect(masterGain);
  dunOsc1.start(ctx.currentTime);
  oscillators.push(dunOsc1);
  gains.push(dunGain1);

  const dunOsc2 = ctx.createOscillator();
  dunOsc2.type = "triangle";
  dunOsc2.frequency.setValueAtTime(NOTES.F3, ctx.currentTime);
  const dunGain2 = ctx.createGain();
  dunGain2.gain.setValueAtTime(0, ctx.currentTime);
  dunOsc2.connect(dunGain2);
  dunGain2.connect(masterGain);
  dunOsc2.start(ctx.currentTime);
  oscillators.push(dunOsc2);
  gains.push(dunGain2);

  // Dun-dun pattern: alternating notes every 600ms
  const DUN_INTERVAL = 600;
  let dunBeat = 0;
  const doDunDun = () => {
    if (!marsAmbientPlaying) return;
    const now = ctx.currentTime;
    const isFirst = dunBeat % 2 === 0;
    dunBeat++;

    // First note (E) - slightly louder
    if (isFirst) {
      dunGain1.gain.cancelScheduledValues(now);
      dunGain1.gain.setValueAtTime(0, now);
      dunGain1.gain.linearRampToValueAtTime(0.045, now + 0.05);
      dunGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    } else {
      // Second note (F) - slightly quieter
      dunGain2.gain.cancelScheduledValues(now);
      dunGain2.gain.setValueAtTime(0, now);
      dunGain2.gain.linearRampToValueAtTime(0.035, now + 0.05);
      dunGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    }
  };

  // Slow bass pulse pattern (less frequent now)
  const PULSE_INTERVAL = 2400; // Slower, every 2.4s
  const doPulse = () => {
    if (!marsAmbientPlaying) return;
    const now = ctx.currentTime;

    // Main pulse
    pulseGain.gain.cancelScheduledValues(now);
    pulseGain.gain.setValueAtTime(0, now);
    pulseGain.gain.linearRampToValueAtTime(0.08, now + 0.12);
    pulseGain.gain.setValueAtTime(0.08, now + 0.5);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // Sub pulse
    subPulseGain.gain.cancelScheduledValues(now);
    subPulseGain.gain.setValueAtTime(0, now);
    subPulseGain.gain.linearRampToValueAtTime(0.05, now + 0.12);
    subPulseGain.gain.setValueAtTime(0.05, now + 0.5);
    subPulseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
  };

  // Start patterns after fade-in
  const pulseStartTimeout = setTimeout(() => {
    if (!marsAmbientPlaying) return;

    // Start dun-dun ostinato
    doDunDun();
    const dunInterval = setInterval(doDunDun, DUN_INTERVAL);
    intervals.push(dunInterval);

    // Start bass pulse (offset slightly)
    setTimeout(() => {
      if (!marsAmbientPlaying) return;
      doPulse();
      const pulseInterval = setInterval(doPulse, PULSE_INTERVAL);
      intervals.push(pulseInterval);
    }, 300);
  }, 2000);
  timeouts.push(pulseStartTimeout);


  // ====== STRING PAD LAYER (swells but never silent) ======
  // Cellos
  const celloVoices: { oscs: OscillatorNode[]; gain: GainNode }[] = [];
  for (let i = 0; i < 2; i++) {
    const voice = createStringVoice(ctx, NOTES.C3, masterGain, i * 4);
    voice.gain.gain.setValueAtTime(0.015, ctx.currentTime); // Start quiet but audible
    celloVoices.push(voice);
    oscillators.push(...voice.oscs);
    gains.push(voice.gain);
  }

  // Violas
  const violaVoices: { oscs: OscillatorNode[]; gain: GainNode }[] = [];
  for (let i = 0; i < 2; i++) {
    const voice = createStringVoice(ctx, NOTES.A3, masterGain, i * 3);
    voice.gain.gain.setValueAtTime(0.01, ctx.currentTime);
    violaVoices.push(voice);
    oscillators.push(...voice.oscs);
    gains.push(voice.gain);
  }

  // Violins
  const violinVoices: { oscs: OscillatorNode[]; gain: GainNode }[] = [];
  for (let i = 0; i < 2; i++) {
    const voice = createStringVoice(ctx, NOTES.E4, masterGain, i * 2);
    voice.gain.gain.setValueAtTime(0.008, ctx.currentTime);
    violinVoices.push(voice);
    oscillators.push(...voice.oscs);
    gains.push(voice.gain);
  }

  // High strings (for climax)
  const highVoice = createStringVoice(ctx, NOTES.E5, masterGain);
  oscillators.push(...highVoice.oscs);
  gains.push(highVoice.gain);

  // Brass
  const brass = createBrassVoice(ctx, NOTES.F3, masterGain);
  oscillators.push(brass.osc);
  gains.push(brass.gain);

  // ====== CHORD PROGRESSION (smooth crossfades, always audible) ======
  let chordIndex = 0;
  const CHORD_DURATION = 6000;

  const playChord = (chordName: ChordName, intensity: number) => {
    if (!marsAmbientPlaying) return;

    const chord = CHORDS[chordName];
    const now = ctx.currentTime;
    const isClimax = chordName === "Am";
    const crossfade = 2.0; // Smooth 2-second crossfade

    // Update drone frequencies (instant, they're continuous)
    lowDrone.oscs.forEach(o => o.frequency.setValueAtTime(chord.bass[0], now));
    subDrone.oscs.forEach(o => o.frequency.setValueAtTime(chord.bass[0] / 2, now));
    pulseOsc.frequency.setValueAtTime(chord.bass[0], now);
    subPulseOsc.frequency.setValueAtTime(chord.bass[0] / 2, now);

    // Mid drone follows
    if (chord.cellos[0]) {
      midDrone.oscs.forEach(o => o.frequency.linearRampToValueAtTime(chord.cellos[0], now + crossfade));
    }

    // Cellos: swell from base to peak and back to base (never silent)
    const celloBase = 0.015;
    const celloPeak = 0.035 * intensity;
    chord.cellos.forEach((freq, i) => {
      if (celloVoices[i]) {
        celloVoices[i].oscs.forEach(o => o.frequency.linearRampToValueAtTime(freq, now + crossfade));
        const g = celloVoices[i].gain;
        g.gain.cancelScheduledValues(now);
        g.gain.linearRampToValueAtTime(celloPeak, now + 2.5);
        g.gain.linearRampToValueAtTime(celloBase, now + 5.5);
      }
    });

    // Violas
    const violaBase = 0.01;
    const violaPeak = 0.028 * intensity;
    chord.violas.forEach((freq, i) => {
      if (violaVoices[i]) {
        violaVoices[i].oscs.forEach(o => o.frequency.linearRampToValueAtTime(freq, now + crossfade));
        const g = violaVoices[i].gain;
        g.gain.cancelScheduledValues(now);
        g.gain.linearRampToValueAtTime(violaPeak, now + 3);
        g.gain.linearRampToValueAtTime(violaBase, now + 5.5);
      }
    });

    // Violins
    const violinBase = 0.008;
    const violinPeak = 0.022 * intensity;
    chord.violins.forEach((freq, i) => {
      if (violinVoices[i]) {
        violinVoices[i].oscs.forEach(o => o.frequency.linearRampToValueAtTime(freq, now + crossfade));
        const g = violinVoices[i].gain;
        g.gain.cancelScheduledValues(now);
        g.gain.linearRampToValueAtTime(violinPeak, now + 3.5);
        g.gain.linearRampToValueAtTime(violinBase, now + 5.5);
      }
    });

    // High strings + brass on climax
    if (isClimax) {
      highVoice.oscs.forEach(o => o.frequency.setValueAtTime(chord.high, now));
      highVoice.gain.gain.cancelScheduledValues(now);
      highVoice.gain.gain.linearRampToValueAtTime(0.018, now + 3);
      highVoice.gain.gain.linearRampToValueAtTime(0, now + 5.5);

      brass.osc.frequency.setValueAtTime(chord.cellos[0], now);
      brass.filter.frequency.linearRampToValueAtTime(1000, now + 2.5);
      brass.filter.frequency.linearRampToValueAtTime(500, now + 5);
      brass.gain.gain.cancelScheduledValues(now);
      brass.gain.gain.linearRampToValueAtTime(0.012, now + 3);
      brass.gain.gain.linearRampToValueAtTime(0, now + 5.5);
    }
  };

  // Start progression
  const startTimeout = setTimeout(() => {
    if (!marsAmbientPlaying) return;

    playChord(CHORD_SEQUENCE[0], 0.7);

    const chordInterval = setInterval(() => {
      if (!marsAmbientPlaying) return;
      chordIndex = (chordIndex + 1) % CHORD_SEQUENCE.length;

      // Intensity builds to Am, then resolves
      let intensity: number;
      if (chordIndex <= 2) intensity = 0.8 + (chordIndex * 0.1);
      else if (chordIndex <= 5) intensity = 1.2;
      else intensity = 0.8;

      playChord(CHORD_SEQUENCE[chordIndex], intensity);
    }, CHORD_DURATION);
    intervals.push(chordInterval);
  }, 3500);
  timeouts.push(startTimeout);

  marsAmbientNodes = { oscillators, gains, masterGain, intervals, timeouts };
}

export function stopMarsAmbient() {
  if (!marsAmbientPlaying || !marsAmbientNodes) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  marsAmbientPlaying = false;

  const { oscillators, masterGain, intervals, timeouts } = marsAmbientNodes;

  // Clear all scheduled patterns
  intervals.forEach(clearInterval);
  timeouts.forEach(clearTimeout);

  // Quick fade out (0.3s) so game music can start cleanly
  masterGain.gain.cancelScheduledValues(ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

  setTimeout(() => {
    oscillators.forEach(osc => {
      try { osc.stop(); } catch { /* ok */ }
    });
    marsAmbientNodes = null;
  }, 400);
}

export function isMarsAmbientPlaying(): boolean {
  return marsAmbientPlaying;
}




