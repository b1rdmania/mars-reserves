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
            <div className="border border-[#1a1f28] bg-[#0d0f13] px-3 py-2">
                <div className="text-center text-[#4a5565] text-[10px] uppercase tracking-wide">Loading Registry...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="border border-[#1a1f28] bg-[#0d0f13] px-3 py-2">
                <div className="text-center text-[#4a5565] text-[10px] uppercase tracking-wide">Registry Offline</div>
            </div>
        );
    }


    return (
        <div className="border border-[#1a1f28] bg-[#0d0f13] overflow-hidden">
            {/* Clickable Header - always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#12151c] text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="font-medium text-[#8b95a5] text-xs uppercase tracking-[0.1em]">Mission Registry</span>
                    <span className="text-[9px] text-[#4a5565]">
                        {data.recent.filter(e => e.on_chain_tx).length} verified
                    </span>
                </div>
                <span className={`text-[#4a5565] text-[10px] ${expanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {/* Expandable Content */}
            {expanded && (
                <div className="px-3 pb-3 pt-1 border-t border-[#1a1f28]">
                    {/* Mission entries */}
                    {data.recent.length > 0 ? (
                        <div className="space-y-1 mt-2">
                            {data.recent.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`flex items-center justify-between px-2 py-1.5 border ${entry.on_chain_tx ? 'border-[#1a1f28] bg-[#0a0c10]' : 'border-[#1a1f28]/50 opacity-80'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-[#8b95a5] truncate">
                                                {entry.commander_name || 'Unknown'}
                                            </span>
                                            {entry.on_chain_tx ? (
                                                <span className="text-[7px] bg-[#16a34a]/20 text-[#16a34a] px-1 rounded-sm border border-[#16a34a]/30 uppercase font-bold">Verified</span>
                                            ) : (
                                                <span className="text-[7px] bg-[#4a5565]/20 text-[#4a5565] px-1 rounded-sm border border-[#4a5565]/30 uppercase font-bold">Saved</span>
                                            )}
                                        </div>
                                        <div className="text-[9px] text-[#4a5565]">
                                            {ENDING_NAMES[entry.ending_id] || 'Complete'} · {formatTimeAgo(entry.created_at)}
                                        </div>
                                    </div>
                                    <div className="text-right ml-2">
                                        <div className="text-[11px] font-mono text-[#5a6475]">
                                            {formatScore(entry.score)}
                                        </div>
                                        {entry.on_chain_tx && (
                                            <a
                                                href={`https://explorer.movementnetwork.xyz/txn/${entry.on_chain_tx}?network=bardock+testnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[8px] text-[#0891b2] hover:text-[#06b6d4]"
                                            >
                                                PROOF ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-3 text-[#4a5565] text-[10px]">
                            No missions in registry.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
