# Swipe Strike relay worker

A tiny Cloudflare Worker that gives the game short-lived TURN relay passes, so phones on 4G/5G can always connect online.
The real Cloudflare TURN secret stays in the worker. The game only ever sees passes that expire after 12 hours.

## Setup (about 10 minutes)
1. Sign up free at https://dash.cloudflare.com/sign-up
2. **Realtime → TURN Server → Create**. Name it `swipe-strike`. Copy the **Turn Token ID** and the **API Token** (the token is only shown once).
3. **Workers & Pages → Create → Create Worker**. Name it `swipe-strike-relay`, then **Deploy**.
4. **Edit code**, replace everything with `worker.js`, then **Deploy**.
5. Worker **Settings → Variables and Secrets → Add**, type **Secret**:
   - `TURN_KEY_ID` = the Turn Token ID
   - `TURN_KEY_API_TOKEN` = the API Token
6. Open `https://swipe-strike-relay.<your-subdomain>.workers.dev/health`. It should say `"secretsSet":true`.
7. Put that worker URL (without `/health`) in `TURN_API` in the game.

Free tier: the first 1,000 GB of relay traffic each month. After that, $0.05/GB. A relayed match uses very little data.
If you move the game to a new website, add its address to `ALLOWED_ORIGINS` in `worker.js`.
