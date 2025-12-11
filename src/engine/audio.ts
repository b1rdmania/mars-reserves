export type SoundId = "click" | "positive" | "negative" | "crisis" | "gameover";

const SOUND_MAP: Record<SoundId, string> = {
  click: "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3",
  positive: "https://assets.mixkit.co/sfx/preview/mixkit-retro-game-notification-212.mp3",
  negative: "https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3",
  crisis: "https://assets.mixkit.co/sfx/preview/mixkit-retro-emergency-alarm-1000.mp3",
  gameover: "https://assets.mixkit.co/sfx/preview/mixkit-video-game-retro-click-237.wav",
};

let mute = false;

export function setMuted(v: boolean) {
  mute = v;
}

export function playSound(id: SoundId) {
  if (mute) return;
  const src = SOUND_MAP[id];
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 0.35;
  void audio.play();
}

