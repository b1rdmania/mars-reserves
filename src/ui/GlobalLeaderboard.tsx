import React, { useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '../lib/supabase';
import { usePrivy } from '@privy-io/react-auth';
import { Footer } from './Footer';

interface Props {
    onBack: () => void;
}

export const GlobalLeaderboard: React.FC<Props> = ({ onBack }) => {
    const { user, authenticated } = usePrivy();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const data = await getLeaderboard(100);
            setEntries(data);
            setLoading(false);
        }
        loadData();
    }, []);

    const formatScore = (score: number) => {
        if (score >= 1_000_000_000) return `${(score / 1_000_000_000).toFixed(1)}B`;
        if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
        if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
        return score.toString();
    };

    const formatWallet = (wallet: string) => {
        return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    };

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#050608]">
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-6">

                {/* Left Sidebar: Privy Identity Spotlight */}
                <div className="lg:w-80 shrink-0 space-y-4">
                    <button
                        onClick={onBack}
                        className="text-[10px] uppercase tracking-[0.2em] text-[#707d91] hover:text-[#0891b2] mb-4 flex items-center gap-2 transition-colors font-bold"
                    >
                        ← CLOSE ARCHIVE
                    </button>

                    <div className="terminal-frame p-4 space-y-4">
                        <div className="text-[9px] uppercase tracking-[0.2em] text-[#0891b2] font-bold">Privy Identity System</div>
                        <h2 className="text-xl font-semibold uppercase tracking-tight text-[#c8cdd5]">Commander Profile</h2>

                        {authenticated && user ? (
                            <div className="space-y-4 pt-2">
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
                                    <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Status: Verified</div>
                                    <div className="text-[11px] text-[#94a3b8] font-mono break-all">{user.id}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[9px] uppercase tracking-widest text-[#64748b]">Linked Authentication</div>
                                    <div className="flex flex-wrap gap-2">
                                        {user.linkedAccounts.map((acc, i) => (
                                            <div key={i} className="px-2 py-1 bg-[#0d0f13] border border-[#1a1f28] text-[9px] text-[#94a3b8] uppercase rounded-sm">
                                                {acc.type}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-[10px] text-[#707d91] leading-relaxed italic">
                                    "Individual identities are cryptographically bound to the Mission Registry. Your legacy is portable, secure, and permanent."
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center border border-dashed border-[#1a1f28] rounded-sm">
                                <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Awaiting Verification</div>
                                <div className="text-[9px] text-[#333] mt-2 italic px-4">Sign in with Privy to claim your permanent rank in the archives.</div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-[#0891b2]/5 border border-[#0891b2]/20 rounded-sm">
                        <div className="text-[10px] text-[#0891b2] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <span className="animate-pulse">●</span> Proof of Auth
                        </div>
                        <p className="text-[9px] text-[#707d91] leading-normal uppercase tracking-wide">
                            Every mission result is signed by the commander's Privy-embedded wallet and stored as a verifiable proof on the Movement blockchain.
                        </p>
                    </div>
                </div>

                {/* Right Area: Global Archives */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="terminal-frame flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-[#1a1f28] flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-[#c8cdd5]">Global Mission Archive</h3>
                                <p className="text-[10px] text-[#64748b] mt-1">Movement Network • Immutability Layer Active</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-mono text-[#16a34a] font-bold">{entries.length}</span>
                                <div className="text-[8px] text-[#64748b] uppercase tracking-tighter">Verified Runs</div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                            {loading ? (
                                <div className="text-center py-20 text-[#64748b] text-[10px] uppercase tracking-widest animate-pulse">Scanning Registry...</div>
                            ) : (
                                <div className="space-y-1">
                                    {entries.map((entry, i) => (
                                        <div
                                            key={entry.run_hash}
                                            className="group flex items-center gap-4 p-3 border border-[#1a1f28] bg-[#0d0f13]/50 hover:bg-[#12151c] transition-all cursor-crosshair"
                                        >
                                            <div className="w-8 shrink-0 text-center">
                                                <span className={`text-[10px] font-bold ${i < 3 ? 'text-amber-500' : 'text-[#64748b]'}`}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-semibold text-[#94a3b8] uppercase tracking-wide truncate">
                                                        Commander {formatWallet(entry.wallet)}
                                                    </span>
                                                    {entry.on_chain_tx && (
                                                        <span className="text-[7px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 px-1 rounded-sm uppercase tracking-tighter font-black">On-Chain</span>
                                                    )}
                                                </div>
                                                <div className="text-[9px] text-[#64748b] flex items-center gap-2">
                                                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                                                    <span className="opacity-30">|</span>
                                                    <span>{entry.action_count} Operations</span>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-lg font-mono font-bold text-[#16a34a]">
                                                    {formatScore(entry.score)}
                                                </div>
                                                {entry.on_chain_tx && (
                                                    <a
                                                        href={`https://explorer.movementnetwork.xyz/txn/${entry.on_chain_tx}?network=bardock+testnet`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[8px] text-[#0891b2] hover:text-[#06b6d4] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Proof ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer className="max-w-4xl mx-auto w-full px-4" />
        </div>
    );
};
