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
                <div className="text-center pb-4 border-b border-slate-700">
                    <span className="text-3xl mb-2 block">🏆</span>
                    <h2 className="text-xl font-bold">Colony Index</h2>
                    <p className="text-xs text-slate-400 mt-1">Top Commanders</p>
                </div>

                {/* Personal Best */}
                {personalBest && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 my-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-emerald-400 uppercase tracking-wide">Your Best</div>
                                <div className="text-xl font-bold text-emerald-300">{formatScore(personalBest.score)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">Rank</div>
                                <div className="text-lg font-semibold text-slate-200">#{personalBest.rank}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-400">{error}</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No runs recorded yet. Be the first!
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry, index) => (
                                <div
                                    key={entry.run_hash}
                                    className={`flex items-center gap-3 p-2 rounded-lg ${index < 3 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800/50'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-8 text-center font-bold ${index === 0 ? 'text-amber-400' :
                                        index === 1 ? 'text-slate-300' :
                                            index === 2 ? 'text-amber-600' :
                                                'text-slate-500'
                                        }`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-mono text-slate-300 truncate">
                                            {formatWallet(entry.wallet)}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {formatDate(entry.created_at)} • {entry.action_count} actions
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-emerald-400">{formatScore(entry.score)}</div>
                                        {entry.on_chain_tx && (
                                            <a
                                                href={`https://explorer.movementnetwork.xyz/tx/${entry.on_chain_tx}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-sky-400 hover:text-sky-300"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                On-Chain ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="pt-4 mt-4 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
