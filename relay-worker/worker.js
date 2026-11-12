/**
 * Swipe Strike relay-pass worker (Cloudflare Workers)
 *
 * Hands the game a short-lived TURN relay pass so two phones on 4G/5G can always connect.
 * Your real Cloudflare TURN secret stays here on Cloudflare, never inside the game.
 *
 * Needs two secrets (Worker > Settings > Variables and Secrets):
 *   TURN_KEY_ID         - the "Turn Token ID" from Realtime > TURN Server
 *   TURN_KEY_API_TOKEN  - the "API Token" shown once when you create the TURN key
 */

// Where the game is allowed to ask from. Add your own domain here if you ever move the game.
const ALLOWED_ORIGINS = [
  'https://corysyx.github.io', // GitHub Pages
  'capacitor://localhost',     // iPhone app
  'https://localhost',         // Android app
  'http://localhost',          // local testing
  'null',                      // the downloaded offline .html file
];

// How long each relay pass lasts (seconds). Longer than any realistic play session.
const TTL = 12 * 60 * 60;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    // Open https://YOUR-WORKER.workers.dev/health in a browser to check the setup (gives out no relay pass).
    if (new URL(request.url).pathname === '/health') {
      return json({ ok: true, secretsSet: !!(env.TURN_KEY_ID && env.TURN_KEY_API_TOKEN) }, 200, cors);
    }
    if (!allowed) return json({ error: 'not allowed' }, 403, cors);
    if (request.method !== 'GET') return json({ error: 'use GET' }, 405, cors);
    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return json({ error: 'worker secrets not set' }, 500, cors);

    const res = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttl: TTL }),
      },
    );
    if (!res.ok) return json({ error: 'cloudflare turn error', status: res.status }, 502, cors);

    const data = await res.json();
    // Browsers block port 53, so drop those addresses to avoid slow time-outs.
    const iceServers = (data.iceServers || []).map((s) => ({
      ...s,
      urls: [].concat(s.urls).filter((u) => !/:53(\?|$)/.test(u)),
    }));
    return json({ iceServers, ttl: TTL }, 200, cors);
  },
};

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
