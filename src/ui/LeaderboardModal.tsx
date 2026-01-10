import React, { useEffect, useState } from 'react';
import { getLeaderboard, getPersonalBest, type LeaderboardEntry, type PersonalBest } from '../lib/supabase';
import { usePrivy } from '@privy-io/react-auth';

interface LeaderboardModalProps {
    open: boolean;
    onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ open, onClose }) => {
    const { user } = usePrivy();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [personalBest, setPersonalBest] = useState<PersonalBest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const leaderboardData = await getLeaderboard(50);
                setEntries(leaderboardData);

                if (user?.wallet?.address) {
                    const pb = await getPersonalBest(user.wallet.address);
                    setPersonalBest(pb);
                }
            } catch (err) {
                setError('Failed to load leaderboard');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [open, user?.wallet?.address]);

    if (!open) return null;

    const formatScore = (score: number) => {
        if (score >= 1_000_000_000) return `${(score / 1_000_000_000).toFixed(1)}B`;
        if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
        if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
        return score.toString();
    };

    const formatWallet = (wallet: string) => {
        return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center pb-3 border-b border-[#1a1f28]">
                    <div className="text-[9px] uppercase tracking-[0.15em] text-[#64748b] mb-1">Leaderboard</div>
                    <h2 className="text-base font-semibold uppercase tracking-wide text-[#c8cdd5]">Colony Index</h2>
                    <p className="text-[10px] text-[#707d91] mt-1">Top Commanders</p>
                </div>

                {/* Personal Best */}
                {personalBest && (
                    <div className="border-l-2 border-l-[#16a34a] bg-[#0a0c10] p-3 my-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[9px] text-[#64748b] uppercase tracking-[0.12em]">Your Best</div>
                                <div className="text-lg font-semibold text-[#16a34a] font-mono">{formatScore(personalBest.score)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] text-[#64748b] uppercase tracking-[0.12em]">Rank</div>
                                <div className="text-base font-medium text-[#94a3b8]">#{personalBest.rank}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    {loading ? (
                        <div className="text-center py-8 text-[#64748b] text-[10px] uppercase tracking-wide">Loading...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-[#f87171] text-[10px]">{error}</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-[#707d91] text-[11px]">
                            No runs recorded yet. Be the first!
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {entries.map((entry, index) => (
                                <div
                                    key={entry.run_hash}
                                    className={`flex items-center gap-2 p-2 border ${index < 3 ? 'border-[#d97706]/30 bg-[#d97706]/5' : 'border-[#1a1f28]'}`}
                                >
                                    {/* Rank */}
                                    <div className={`w-8 text-center font-semibold text-xs ${index === 0 ? 'text-[#fbbf24]' :
                                        index === 1 ? 'text-[#94a3b8]' :
                                            index === 2 ? 'text-[#d97706]' :
                                                'text-[#64748b]'
                                        }`}>
                                        #{index + 1}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-mono text-[#94a3b8] truncate">
                                            {formatWallet(entry.wallet)}
                                        </div>
                                        <div className="text-[9px] text-[#64748b]">
                                            {formatDate(entry.created_at)} • {entry.action_count} actions
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-[#16a34a] font-mono">{formatScore(entry.score)}</div>
                                        {entry.on_chain_tx && (
                                            <a
                                                href={`https://explorer.movementnetwork.xyz/txn/${entry.on_chain_tx}?network=bardock+testnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[8px] text-[#0891b2] hover:text-[#06b6d4] uppercase tracking-wide"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Verified ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="pt-3 mt-3 border-t border-[#1a1f28]">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 bg-[#0d0f13] hover:bg-[#12151c] text-[#94a3b8] font-medium border border-[#1a1f28] text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
