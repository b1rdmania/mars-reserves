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
