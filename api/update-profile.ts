import type { VercelRequest, VercelResponse } from '@vercel/node';

interface UpdateProfileRequest {
    privyUserId: string;
    wallet: string;
    commanderName: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body as UpdateProfileRequest;

    if (!body.privyUserId || !body.wallet || !body.commanderName) {
        return res.status(400).json({ error: 'Missing required fields: privyUserId, wallet, commanderName' });
    }

    // Validate commander name
    const name = body.commanderName.trim();
    if (name.length < 2 || name.length > 30) {
        return res.status(400).json({ error: 'Commander name must be 2-30 characters' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase configuration');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // Check if profile exists
        const checkRes = await fetch(
            `${supabaseUrl}/rest/v1/profiles?privy_user_id=eq.${encodeURIComponent(body.privyUserId)}`,
            {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                },
            }
        );

        const existingProfiles = await checkRes.json();

        if (existingProfiles.length === 0) {
            // Create new profile
            const createRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                    privy_user_id: body.privyUserId,
                    wallet: body.wallet,
                    commander_name: name,
                    missions_count: 0,
                    best_score: 0,
                }),
            });

            if (!createRes.ok) {
                const errorText = await createRes.text();
                console.error('Failed to create profile:', errorText);
                return res.status(500).json({ error: 'Failed to create profile' });
            }
        } else {
            // Update existing profile
            const updateRes = await fetch(
                `${supabaseUrl}/rest/v1/profiles?privy_user_id=eq.${encodeURIComponent(body.privyUserId)}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({
                        commander_name: name,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );

            if (!updateRes.ok) {
                const errorText = await updateRes.text();
                console.error('Failed to update profile:', errorText);
                return res.status(500).json({ error: 'Failed to update profile' });
            }
        }

        return res.status(200).json({ success: true, commanderName: name });
    } catch (err) {
        console.error('Profile update error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
