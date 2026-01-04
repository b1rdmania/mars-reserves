import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export interface Track {
    id: number;
    name: string;
    file: string;
    startTime?: number;  // Optional: seconds to skip at start
}

export const TRACKS: Track[] = [
    { id: 1, name: 'Rocket Man', file: '/music/track1.mp3', startTime: 0 },
    { id: 2, name: 'Starman', file: '/music/track2.mp3', startTime: 0 },
    { id: 3, name: 'Walking on the Moon', file: '/music/track3.mp3', startTime: 0 },
    { id: 4, name: 'Space Oddity', file: '/music/track4.mp3', startTime: 22 },
];

interface MusicContextValue {
    currentTrack: Track | null;
    isPlaying: boolean;
    isMuted: boolean;
    setTrack: (id: number) => void;
    togglePlay: () => void;
    toggleMute: () => void;
    startMusic: () => void;
    stopMusic: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle track changes
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        const audio = audioRef.current;
        audio.src = currentTrack.file;

        // Set start time if specified
        if (currentTrack.startTime && currentTrack.startTime > 0) {
            audio.currentTime = currentTrack.startTime;
        }

        if (hasStarted && !isMuted) {
            audio.play().catch(err => {
                // Expected to fail if MP3 not uploaded yet
                console.log('Music not loaded:', err.message);
            });
            setIsPlaying(true);
        }
    }, [currentTrack, hasStarted, isMuted]);

    // Handle mute changes
    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.muted = isMuted;
    }, [isMuted]);

    const setTrack = useCallback((id: number) => {
        const track = TRACKS.find(t => t.id === id);
        if (track) {
            setCurrentTrack(track);
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const startMusic = useCallback(() => {
        if (hasStarted) return;

        // Random track on first start
        const randomTrack = TRACKS[Math.floor(Math.random() * TRACKS.length)];
        setCurrentTrack(randomTrack);
        setHasStarted(true);
    }, [hasStarted]);

    const stopMusic = useCallback(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setHasStarted(false);
        setCurrentTrack(null);
    }, []);

    return (
        <MusicContext.Provider
            value={{
                currentTrack,
                isPlaying,
                isMuted,
                setTrack,
                togglePlay,
                toggleMute,
                startMusic,
                stopMusic,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = (): MusicContextValue => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
};
