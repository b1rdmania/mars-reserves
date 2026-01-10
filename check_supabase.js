
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.production' });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('Missing URL or Key');
    process.exit(1);
}

async function check() {
    try {
        const res = await fetch(`${url}/rest/v1/runs?select=*`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        const data = await res.json();
        console.log('RUNS_COUNT:', data.length);
        console.log('RUNS_DATA:', JSON.stringify(data.slice(-2), null, 2));
    } catch (err) {
        console.error(err);
    }
}

check();
