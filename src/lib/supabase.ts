import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured - leaderboard disabled');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Types
export interface LeaderboardEntry {
    wallet: string;
    score: number;
    ending_id: string;
    action_count: number;
    run_hash: string;
    on_chain_tx: string | null;
    created_at: string;
    rank?: number;
}

export interface PersonalBest {
    score: number;
    ending_id: string;
    created_at: string;
    rank: number;
}

// API Functions

/**
 * Get top scores for the leaderboard
 */
export async function getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('runs')
        .select('wallet, score, ending_id, action_count, run_hash, on_chain_tx, created_at')
        .order('score', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    // Add rank
    return (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));
}

/**
 * Get personal best for a wallet address
 */
export async function getPersonalBest(wallet: string): Promise<PersonalBest | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('runs')
        .select('score, ending_id, created_at')
        .eq('wallet', wallet)
        .order('score', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Not found is ok
            console.error('Error fetching personal best:', error);
        }
        return null;
    }

    // Get rank by counting how many scores are higher
    const { count } = await supabase
        .from('runs')
        .select('*', { count: 'exact', head: true })
        .gt('score', data.score);

    return {
        ...data,
        rank: (count ?? 0) + 1,
    };
}

/**
 * Submit a verified run to the leaderboard
 * Note: This should be called from server-side after verification
 */
export async function submitRun(run: {
    wallet: string;
    score: number;
    seed: number;
    ending_id: string;
    action_count: number;
    run_hash: string;
    on_chain_tx?: string;
}): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
        .from('runs')
        .insert([run]);

    if (error) {
        console.error('Error inserting run:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Check if a run hash already exists (prevent duplicates)
 */
export async function runExists(runHash: string): Promise<boolean> {
    if (!supabase) return false;

    const { data, error } = await supabase
        .from('runs')
        .select('id')
        .eq('run_hash', runHash)
        .limit(1);

    if (error) {
        console.error('Error checking run:', error);
        return false;
    }

    return (data?.length ?? 0) > 0;
}
