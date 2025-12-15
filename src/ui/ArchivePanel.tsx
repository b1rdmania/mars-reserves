import React, { useEffect, useState } from 'react';

interface ArchiveEntry {
    id: string;
    wallet: string;
    commander_name: string;
    score: number;
    ending_id: string;
    run_hash: string;
    on_chain_tx: string | null;
    created_at: string;
}

interface ArchiveStats {
    total_missions: number;
    total_commanders: number;
    avg_score: number;
}

interface ArchiveData {
    stats: ArchiveStats;
    recent: ArchiveEntry[];
    briefing?: string;
}

// Ending display names
const ENDING_NAMES: Record<string, string> = {
    'legendary_commander': 'Legendary Commander',
    'successful_mission': 'Successful Mission',
    'modest_legacy': 'Modest Legacy',
    'survived': 'Survived',
    'rage_mutiny': 'Crew Mutiny',
    'heat_recalled': 'Earth Recalled',
    'cred_abandoned': 'Mission Abandoned',
    'price_collapse': 'Colony Collapse',
};

function formatScore(score: number): string {
    if (score >= 1_000_000_000) return `${(score / 1_000_000_000).toFixed(1)}B`;
    if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
    if (score >= 1_000) return `${(score / 1_000).toFixed(0)}K`;
    return score.toString();
}

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export const ArchivePanel: React.FC = () => {
    const [data, setData] = useState<ArchiveData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadArchive() {
            setLoading(true);
            try {
                const response = await fetch('/api/get-archive');
                if (response.ok) {
                    const archiveData = await response.json();
                    if (archiveData.success) {
                        setData(archiveData);
                    }
                }
            } catch (err) {
                setError('Failed to load archive');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadArchive();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="text-center text-slate-400 text-sm">Loading Archive...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="text-center text-slate-500 text-sm">Archive offline</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📡</span>
                    <span className="font-semibold text-slate-200">Colony Archive</span>
                </div>
                <span className="text-xs text-slate-500">
                    {data.stats.total_missions} missions
                </span>
            </div>

            {/* Briefing */}
            {data.briefing && (
                <div className="bg-slate-900/50 rounded-lg px-3 py-2 mb-3 border-l-2 border-sky-500/50">
                    <p className="text-xs text-slate-400 italic">{data.briefing}</p>
                </div>
            )}

            {/* Recent Missions */}
            {data.recent.length > 0 ? (
                <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">Recent Missions</div>
                    {data.recent.slice(0, 5).map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-center justify-between bg-slate-900/30 rounded-lg px-3 py-2"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-300 truncate">
                                    {entry.commander_name}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {ENDING_NAMES[entry.ending_id] || entry.ending_id} • {formatTimeAgo(entry.created_at)}
                                </div>
                            </div>
                            <div className="text-right ml-3">
                                <div className="text-sm font-bold text-emerald-400">
                                    {formatScore(entry.score)}
                                </div>
                                {entry.on_chain_tx && (
                                    <a
                                        href={`https://explorer.devnet.imola.movementlabs.xyz/tx/${entry.on_chain_tx}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-sky-400 hover:text-sky-300"
                                    >
                                        on-chain ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                    No missions recorded yet. Be the first!
                </div>
            )}
        </div>
    );
};
