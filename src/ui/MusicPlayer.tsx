import React from 'react';
import { useMusic, TRACKS } from '../hooks/useMusic';

export const MusicPlayer: React.FC = () => {
    const { currentTrack, isMuted, setTrack, toggleMute } = useMusic();

    return (
        <div className="flex items-center gap-2">
            {/* Track label */}
            <span className="text-[8px] uppercase tracking-[0.12em] text-[#8b95a5] hidden sm:inline">
                MUSIC
            </span>

            {/* Track selector buttons */}
            <div className="flex gap-0.5">
                {TRACKS.map((track) => (
                    <button
                        key={track.id}
                        onClick={() => setTrack(track.id)}
                        className={`
              w-5 h-5 text-[10px] font-mono border transition-colors
              ${currentTrack?.id === track.id
                                ? 'bg-[#06b6d4] border-[#06b6d4] text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                                : 'bg-[#111827] border-[#1f2937] text-[#9ca3af] hover:border-[#374151] hover:text-white'
                            }
            `}
                        title={track.name}
                    >
                        {track.id}
                    </button>
                ))}
            </div>

            {/* Mute button */}
            <button
                onClick={toggleMute}
                className={`
          px-1.5 py-0.5 text-xs border transition-colors
          ${isMuted
                        ? 'bg-[#ef4444] border-[#ef4444] text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                        : 'bg-[#111827] border-[#1f2937] text-[#9ca3af] hover:border-[#374151] hover:text-white'
                    }
        `}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? '🔇' : '🔊'}
            </button>
        </div>
    );
};
