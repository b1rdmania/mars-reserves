export type SoundId = "click" | "positive" | "negative" | "crisis" | "gameover";

// Each sound has a preferred .m4a source for iOS, plus mp3 fallback.
// Swap these URLs to your own CDN for reliable playback.
const SOUND_SOURCES: Record<SoundId, { src: string; type: string }[]> = {
  click: [
    { src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f2f17077c1.m4a?filename=click-124467.mp3", type: "audio/mp4" },
    { src: "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3", type: "audio/mpeg" },
  ],
  positive: [
    { src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_b398177ab9.m4a?filename=notification-124465.mp3", type: "audio/mp4" },
    { src: "https://assets.mixkit.co/sfx/preview/mixkit-retro-game-notification-212.mp3", type: "audio/mpeg" },
  ],
  negative: [
    { src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_7a2b7b4484.m4a?filename=fail-144084.mp3", type: "audio/mp4" },
    { src: "https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3", type: "audio/mpeg" },
  ],
  crisis: [
    { src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_49d487d92c.m4a?filename=alarm-124467.mp3", type: "audio/mp4" },
    { src: "https://assets.mixkit.co/sfx/preview/mixkit-retro-emergency-alarm-1000.mp3", type: "audio/mpeg" },
  ],
  gameover: [
    { src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_49d487d92c.m4a?filename=alarm-124467.mp3", type: "audio/mp4" },
    { src: "https://assets.mixkit.co/sfx/preview/mixkit-video-game-retro-click-237.wav", type: "audio/wav" },
  ],
};

let mute = false;

export function setMuted(v: boolean) {
  mute = v;
}

export function playSound(id: SoundId) {
  if (mute) return;
  const sources = SOUND_SOURCES[id];
  if (!sources) return;
  const audio = new Audio();
  const source = sources.find((s) => audio.canPlayType(s.type));
  const src = source?.src ?? sources[0]?.src;
  if (!src) return;
  audio.src = src;
  audio.volume = 0.35;
  void audio.play();
}


