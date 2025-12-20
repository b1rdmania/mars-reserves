import React, { useState } from 'react';
import { useGameSession } from '../hooks/useGameSession';
import { CommanderRecordModal } from './CommanderRecordModal';
import { formatScore } from '../engine/scoring';

interface Props {
    className?: string;
}

export const CommanderPanel: React.FC<Props> = ({ className = '' }) => {
    const { profile, commanderId, recentRuns, profileLoading } = useGameSession();
    const [showRecordModal, setShowRecordModal] = useState(false);

    if (profileLoading) {
        return (
            <div className={`bg-[#0a0c10] border border-[#1a1f28] p-2 ${className}`}>
                <div className="text-[9px] text-[#4a5565] uppercase tracking-wide animate-pulse">
                    Loading...
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const commanderName = profile.commander_name || 'Unknown Commander';
    const missionsCount = profile.missions_count || 0;
    const bestScore = profile.best_score || 0;
    const archetype = profile.archetype;

    return (
        <>
            <div className={`bg-[#0a0c10] border border-[#1a1f28] p-3 text-right ${className}`}>
                {/* Commander Name */}
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#c8cdd5]">
                    {commanderName}
                </div>

                {/* Commander ID */}
                <div className="text-[8px] font-mono text-[#4a5565] mb-2">
                    {commanderId}
                </div>

                {/* Stats */}
                <div className="text-[9px] text-[#5a6475] space-y-0.5">
                    <div>
                        <span className="text-[#16a34a]">{missionsCount}</span> MISSIONS
                        {bestScore > 0 && (
                            <span className="ml-1">• BEST {formatScore(bestScore)}</span>
                        )}
                    </div>

                    {archetype && (
                        <div className="text-[#0891b2] uppercase tracking-wide">
                            {archetype.replace(/_/g, ' ')}
                        </div>
                    )}
                </div>

                {/* View Record Button */}
                {missionsCount > 0 && (
                    <button
                        onClick={() => setShowRecordModal(true)}
                        className="mt-2 text-[8px] text-[#4a5565] hover:text-[#0891b2] uppercase tracking-[0.1em] transition-colors"
                    >
                        [ VIEW RECORD ]
                    </button>
                )}
            </div>

            <CommanderRecordModal
                open={showRecordModal}
                onClose={() => setShowRecordModal(false)}
                profile={profile}
                commanderId={commanderId}
                runs={recentRuns}
            />
        </>
    );
};
