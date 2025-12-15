import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ArchiveEntry {
    id: string;
    wallet: string;
    commander_name: string;
    score: number;
    ending_id: string;
    action_count: number;
    run_hash: string;
    on_chain_tx: string | null;
    created_at: string;
}

interface ArchiveStats {
    total_missions: number;
    total_commanders: number;
    avg_score: number;
}

interface ArchiveResponse {
    success: boolean;
    stats: ArchiveStats;
    recent: ArchiveEntry[];
    briefing?: string;
}

// Generate contextual briefing based on recent missions
function generateBriefing(stats: ArchiveStats, recent: ArchiveEntry[]): string {
    if (stats.total_missions === 0) {
        return "No missions recorded yet. You could be the first to leave your mark on the Archive.";
    }

    const recentFailures = recent.filter(r =>
        r.ending_id.includes('fail') ||
        r.ending_id.includes('mutiny') ||
        r.ending_id.includes('recalled')
    ).length;

    const recentSuccesses = recent.filter(r =>
        r.ending_id.includes('survive') ||
        r.ending_id.includes('legend') ||
        r.ending_id.includes('triumph')
    ).length;

    const failureRate = recent.length > 0 ? recentFailures / recent.length : 0;

    if (failureRate > 0.6) {
        return "Oversight is tense after recent mission failures. Earth is watching closely.";
    } else if (failureRate > 0.3) {
        return "Mixed results from recent commanders. The Archive reflects uncertain times.";
    } else if (recentSuccesses > 3) {
        return "Recent successes have lifted colony morale. The Archive shows promising trends.";
    } else if (stats.total_missions < 10) {
        return "The Archive is still young. Each mission shapes humanity's future on Mars.";
    }

    return `${stats.total_missions} missions recorded. ${stats.total_commanders} commanders have served.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Archive not configured' });
    }

    try {
        // Fetch archive stats
        const statsResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_archive_stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
            },
            body: '{}',
        });

        let stats: ArchiveStats = { total_missions: 0, total_commanders: 0, avg_score: 0 };
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (Array.isArray(statsData) && statsData.length > 0) {
                stats = statsData[0];
            }
        }

        // Fetch recent missions from archive view
        const archiveResponse = await fetch(
            `${supabaseUrl}/rest/v1/archive?select=*&limit=20`,
            {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                },
            }
        );

        let recent: ArchiveEntry[] = [];
        if (archiveResponse.ok) {
            recent = await archiveResponse.json();
        }

        // Generate contextual briefing
        const briefing = generateBriefing(stats, recent);

        const response: ArchiveResponse = {
            success: true,
            stats,
            recent,
            briefing,
        };

        return res.status(200).json(response);

    } catch (err) {
        console.error('Archive fetch error:', err);
        return res.status(500).json({
            error: 'Failed to fetch archive',
            message: err instanceof Error ? err.message : 'Unknown error',
        });
    }
}
