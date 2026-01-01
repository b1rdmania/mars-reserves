import React from 'react';
import { useMusic, TRACKS } from '../hooks/useMusic';

export const MusicPlayer: React.FC = () => {
    const { currentTrack, isMuted, setTrack, toggleMute } = useMusic();

    return (
        <div className="flex items-center gap-2">
            {/* Track label */}
            <span className="text-[8px] uppercase tracking-[0.08em] text-[#4a5565] hidden sm:inline">
                Music
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
                                ? 'bg-[#0891b2] border-[#0891b2] text-white'
                                : 'bg-[#0d0f13] border-[#1a1f28] text-[#5a6475] hover:border-[#2d3544] hover:text-[#8b95a5]'
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
                        ? 'bg-[#dc2626] border-[#dc2626] text-white'
                        : 'bg-[#0d0f13] border-[#1a1f28] text-[#5a6475] hover:border-[#2d3544] hover:text-[#8b95a5]'
                    }
        `}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? '🔇' : '🔊'}
            </button>
        </div>
    );
};
