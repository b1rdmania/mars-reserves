import React from 'react';
import type { Profile, Run } from '../hooks/useGameSession';
import { formatScore } from '../engine/scoring';

interface Props {
    open: boolean;
    onClose: () => void;
    profile: Profile | null;
    commanderId: string | null;
    runs: Run[];
}

// Ending display names
const ENDING_NAMES: Record<string, string> = {
    'crew_mutiny': 'MUTINY',
    'earth_recall': 'RECALLED',
    'trust_collapse': 'TRUST LOST',
    'reserves_depleted': 'RESERVES EMPTY',
    'legendary_commander': 'LEGENDARY',
    'successful_mission': 'SUCCESS',
    'modest_legacy': 'MODEST LEGACY',
    'survived': 'SURVIVED',
};

function getEndingDisplay(endingId: string): string {
    return ENDING_NAMES[endingId] || endingId.replace(/_/g, ' ').toUpperCase();
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export const CommanderRecordModal: React.FC<Props> = ({
    open,
    onClose,
    profile,
    commanderId,
    runs,
}) => {
    if (!open || !profile) return null;

    const commanderName = profile.commander_name || 'Unknown Commander';
    const missionsCount = profile.missions_count || 0;
    const bestScore = profile.best_score || 0;
    const archetype = profile.archetype;
    const archetypeBlurb = profile.archetype_blurb;
    const lastEnding = profile.last_ending_id;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#64748b] mb-2">
                        Commander Record
                    </div>
                    <h2 className="text-lg font-semibold uppercase tracking-wide text-[#c8cdd5]">
                        {commanderName}
                    </h2>
                    <div className="text-[10px] font-mono text-[#64748b]">
                        {commanderId}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="border border-[#1a1f28] bg-[#0a0c10] p-3 mb-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <div className="text-[8px] uppercase tracking-[0.1em] text-[#64748b] mb-1">
                                Missions
                            </div>
                            <div className="text-lg font-semibold text-[#16a34a]">
                                {missionsCount}
                            </div>
                        </div>
                        <div>
                            <div className="text-[8px] uppercase tracking-[0.1em] text-[#64748b] mb-1">
                                Best Legacy
                            </div>
                            <div className="text-lg font-semibold text-[#0891b2] font-mono">
                                {formatScore(bestScore)}
                            </div>
                        </div>
                        <div>
                            <div className="text-[8px] uppercase tracking-[0.1em] text-[#64748b] mb-1">
                                Last Result
                            </div>
                            <div className="text-sm font-semibold text-[#94a3b8]">
                                {lastEnding ? getEndingDisplay(lastEnding) : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Archetype */}
                {archetype && (
                    <div className="border-l-2 border-l-[#0891b2] bg-[#0a0c10] p-3 mb-4">
                        <div className="text-[9px] uppercase tracking-[0.12em] text-[#64748b] mb-1">
                            Archetype
                        </div>
                        <div className="text-sm font-semibold text-[#0891b2] uppercase tracking-wide mb-1">
                            {archetype.replace(/_/g, ' ')}
                        </div>
                        {archetypeBlurb && (
                            <p className="text-[10px] text-[#707d91] leading-relaxed">
                                {archetypeBlurb}
                            </p>
                        )}
                    </div>
                )}

                {/* Recent Runs */}
                {runs.length > 0 && (
                    <div className="mb-4">
                        <div className="text-[9px] uppercase tracking-[0.12em] text-[#64748b] mb-2">
                            Recent Missions
                        </div>
                        <div className="space-y-1">
                            {runs.map((run) => (
                                <div
                                    key={run.id}
                                    className="flex items-center justify-between bg-[#0a0c10] border border-[#1a1f28] p-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-semibold text-[#94a3b8] uppercase">
                                            {getEndingDisplay(run.ending_id)}
                                        </span>
                                        <span className="text-[10px] text-[#16a34a] font-mono">
                                            {formatScore(run.score)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-[#64748b]">
                                            {formatDate(run.created_at)}
                                        </span>
                                        {run.on_chain_tx && (
                                            <a
                                                href={`https://explorer.movementnetwork.xyz/txn/${run.on_chain_tx}?network=bardock+testnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[8px] text-[#0891b2] hover:text-[#38bdf8] uppercase"
                                            >
                                                PROOF ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-2.5 px-4 bg-[#0d0f13] hover:bg-[#12151c] text-[#94a3b8] font-medium border border-[#1a1f28] text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
