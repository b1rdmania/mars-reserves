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
    const [expanded, setExpanded] = useState(false);

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
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                <div className="text-center text-slate-500 text-xs">Loading Archive...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                <div className="text-center text-slate-500 text-xs">Archive offline</div>
            </div>
        );
    }

    // Filter to only show on-chain recorded missions
    const onChainRecords = data.recent.filter(e => e.on_chain_tx);

    // Find notable record (highest score among on-chain)
    const notableRecord = onChainRecords.length > 0
        ? onChainRecords.reduce((best, entry) => entry.score > best.score ? entry : best, onChainRecords[0])
        : null;

    // Other records (excluding notable)
    const otherRecords = onChainRecords.filter(e => e.id !== notableRecord?.id).slice(0, 4);

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Clickable Header - always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300 text-sm">Colony Archive</span>
                    <span className="text-[10px] text-slate-600">
                        {onChainRecords.length} on-chain
                    </span>
                </div>
                <span className={`text-slate-500 text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {/* Expandable Content */}
            {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-700/30">
                    {/* Notable Record */}
                    {notableRecord && (
                        <div className="bg-slate-900/50 rounded-lg px-3 py-2 mb-2 border-l-2 border-slate-500/50">
                            <div className="text-[9px] uppercase tracking-wide text-slate-500 mb-1">Notable Record</div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-slate-200">
                                        {notableRecord.commander_name || 'Unknown Commander'}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        {ENDING_NAMES[notableRecord.ending_id] || 'Mission Complete'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-300 font-mono">
                                        {formatScore(notableRecord.score)}
                                    </div>
                                    <a
                                        href={`https://explorer.movementnetwork.xyz/tx/${notableRecord.on_chain_tx}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] text-sky-400 hover:text-sky-300"
                                    >
                                        View on Explorer ↗
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Records */}
                    {otherRecords.length > 0 && (
                        <div className="space-y-1.5">
                            {otherRecords.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between px-2 py-1.5 bg-slate-900/30 rounded"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-slate-300 truncate">
                                            {entry.commander_name || 'Unknown'}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {ENDING_NAMES[entry.ending_id] || 'Complete'} · {formatTimeAgo(entry.created_at)}
                                        </div>
                                    </div>
                                    <div className="text-right ml-2">
                                        <div className="text-xs font-mono text-slate-400">
                                            {formatScore(entry.score)}
                                        </div>
                                        <a
                                            href={`https://explorer.movementnetwork.xyz/tx/${entry.on_chain_tx}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] text-sky-400 hover:text-sky-300"
                                        >
                                            ↗
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {onChainRecords.length === 0 && (
                        <div className="text-center py-3 text-slate-600 text-xs italic">
                            No missions archived on-chain yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
