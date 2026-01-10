import React, { useEffect, useCallback, useState } from "react";
import { initAudio, startMarsAmbient, stopMarsAmbient, isMarsAmbientPlaying } from "../engine/audio";

interface SplashScreenProps {
    onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
    const [musicStarted, setMusicStarted] = useState(false);

    // Start music on first interaction (anywhere on splash)
    const handleFirstInteraction = useCallback(() => {
        if (!musicStarted && !isMarsAmbientPlaying()) {
            initAudio();
            startMarsAmbient();
            setMusicStarted(true);
        }
    }, [musicStarted]);

    // Handle START click - stop music and proceed
    const handleStart = useCallback(() => {
        stopMarsAmbient();
        onStart();
    }, [onStart]);

    // Handle Enter key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Any key starts music
            handleFirstInteraction();

            if (e.key === "Enter") {
                handleStart();
            }
        },
        [handleFirstInteraction, handleStart]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            // Also stop ambient music on unmount as backup
            stopMarsAmbient();
        };
    }, [handleKeyDown]);

    return (
        <div className="splash-screen" onClick={handleFirstInteraction}>
            <div className="splash-card">
                {/* Subtle grain overlay */}
                <div className="splash-grain" />

                {/* Mars planet */}
                <div className="splash-mars">
                    <div className="mars-glow" />
                    <div className="mars-body">
                        <div className="mars-terminator" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="splash-title">MARS EXTRACTION</h1>

                {/* Tagline */}
                <p className="splash-tagline">A public mission. A private legacy.</p>

                {/* Start button */}
                <button className="splash-start" onClick={handleStart}>
                    START
                </button>

                {/* Footer */}
                <div className="splash-footer flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase tracking-widest text-[#5a6475]">Recorded on</span>
                        <img src="/Movement_idDEfxpCuG_1.svg" alt="Movement" className="h-4 w-auto" />
                    </div>
                    <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase tracking-widest text-[#5a6475]">Powered by</span>
                        <img src="/Privy_Wordmark_White.svg" alt="Privy" className="h-4 w-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
};

