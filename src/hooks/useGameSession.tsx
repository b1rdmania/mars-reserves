import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

// Types
export interface Profile {
    privy_user_id: string;
    wallet: string;
    commander_name: string;
    missions_count: number;
    best_score: number;
    last_ending_id: string | null;
    archetype: string | null;
    archetype_blurb: string | null;
    created_at: string;
    updated_at: string;
}

export interface Run {
    id: string;
    wallet: string;
    commander_name: string | null;
    score: number;
    ending_id: string;
    action_count: number;
    run_hash: string;
    on_chain_tx: string | null;
    created_at: string;
}

interface GameSessionContextValue {
    // Session state
    isGuest: boolean;
    sessionMode: 'guest' | 'commander';

    // Profile
    profile: Profile | null;
    profileLoading: boolean;

    // Commander ID derived from wallet
    commanderId: string | null;

    // Recent runs for this user
    recentRuns: Run[];

    // Actions
    refreshProfile: () => Promise<void>;
    setCommanderName: (name: string) => Promise<boolean>;
    needsCommanderName: boolean;

    // Game session control
    startGuestSession: () => void;
    guestCallSign: string;
}

const GameSessionContext = createContext<GameSessionContextValue | null>(null);

// Generate commander ID from wallet address (e.g., "CMD. A-472")
function deriveCommanderId(wallet: string): string {
    if (!wallet) return 'CMD. X-000';
    const hash = wallet.slice(-4).toUpperCase();
    const letter = String.fromCharCode(65 + (parseInt(hash[0], 16) % 26));
    const number = parseInt(hash.slice(1), 16) % 1000;
    return `CMD. ${letter}-${number.toString().padStart(3, '0')}`;
}

// Sci-fi commander names for guest sessions
const GUEST_NAMES = [
    "Cmdr. Archer", "Cmdr. Picard", "Cmdr. Sisko", "Cmdr. Janeway", "Cmdr. Kirk",
    "Cmdr. Riker", "Cmdr. Spock", "Cmdr. Worf", "Cmdr. Watney", "Cmdr. Shepard",
    "Cmdr. Ripley", "Cmdr. Bowman", "Cmdr. Cooper", "Cmdr. Stone", "Cmdr. Holden",
    "Cmdr. Nagata", "Cmdr. Burton", "Cmdr. Draper", "Cmdr. Chen", "Cmdr. Vasquez",
    "Cmdr. Okonkwo", "Cmdr. Petrov", "Cmdr. Nakamura", "Cmdr. Solo", "Cmdr. Organa",
];

function getRandomGuestName(): string {
    return GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
}

interface Props {
    children: ReactNode;
}

export function GameSessionProvider({ children }: Props) {
    const { ready, authenticated, user } = usePrivy();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [recentRuns, setRecentRuns] = useState<Run[]>([]);
    const [guestCallSign, setGuestCallSign] = useState(() => getRandomGuestName());

    const isGuest = !authenticated;
    const sessionMode = authenticated ? 'commander' : 'guest';

    const commanderId = user?.wallet?.address
        ? deriveCommanderId(user.wallet.address)
        : null;

    const needsCommanderName = authenticated && profile !== null &&
        (!profile.commander_name || profile.commander_name === 'Unknown Commander');

    // Fetch profile from Supabase
    const refreshProfile = useCallback(async () => {
        if (!user?.id) {
            setProfile(null);
            setRecentRuns([]);
            return;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase config missing');
            return;
        }

        setProfileLoading(true);

        try {
            // Fetch profile
            const profileRes = await fetch(
                `${supabaseUrl}/rest/v1/profiles?privy_user_id=eq.${encodeURIComponent(user.id)}`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                    },
                }
            );

            if (profileRes.ok) {
                const profiles = await profileRes.json();
                if (profiles.length > 0) {
                    setProfile(profiles[0]);
                } else {
                    // No profile yet - will be created on first mission record
                    setProfile(null);
                }
            }

            // Fetch recent runs
            const runsRes = await fetch(
                `${supabaseUrl}/rest/v1/runs?privy_user_id=eq.${encodeURIComponent(user.id)}&order=created_at.desc&limit=10`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                    },
                }
            );

            if (runsRes.ok) {
                const runs = await runsRes.json();
                setRecentRuns(runs);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setProfileLoading(false);
        }
    }, [user?.id]);

    // Set commander name
    const setCommanderName = useCallback(async (name: string): Promise<boolean> => {
        if (!user?.id || !user?.wallet?.address) return false;

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) return false;

        try {
            // Upsert profile with commander name
            const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'resolution=merge-duplicates',
                },
                body: JSON.stringify({
                    privy_user_id: user.id,
                    wallet: user.wallet.address,
                    commander_name: name,
                }),
            });

            if (res.ok) {
                await refreshProfile();
                return true;
            }
        } catch (err) {
            console.error('Failed to set commander name:', err);
        }

        return false;
    }, [user?.id, user?.wallet?.address, refreshProfile]);

    // Start guest session
    const startGuestSession = useCallback(() => {
        setGuestCallSign(getRandomGuestName());
    }, []);

    // Auto-fetch profile when authenticated
    useEffect(() => {
        if (ready && authenticated) {
            refreshProfile();
        } else {
            setProfile(null);
            setRecentRuns([]);
        }
    }, [ready, authenticated, refreshProfile]);

    const value: GameSessionContextValue = {
        isGuest,
        sessionMode,
        profile,
        profileLoading,
        commanderId,
        recentRuns,
        refreshProfile,
        setCommanderName,
        needsCommanderName,
        startGuestSession,
        guestCallSign,
    };

    return (
        <GameSessionContext.Provider value={value}>
            {children}
        </GameSessionContext.Provider>
    );
}

export function useGameSession(): GameSessionContextValue {
    const context = useContext(GameSessionContext);
    if (!context) {
        throw new Error('useGameSession must be used within a GameSessionProvider');
    }
    return context;
}

// Re-export for convenience
export { deriveCommanderId, getRandomGuestName };
