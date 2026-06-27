/**
 * Registers a Vercel deploy-hook webhook in Strapi so that publishing or
 * updating an article automatically triggers a site rebuild.
 *
 * Run once after first deploy:
 *   STRAPI_TOKEN=<token> VERCEL_HOOK=<url> node cms/scripts/register-webhook.js
 *
 * Get your VERCEL_HOOK from:
 *   Vercel dashboard → Project → Settings → Git → Deploy Hooks → Create hook
 */

const STRAPI_URL  = process.env.STRAPI_URL  || 'http://localhost:1337';
const TOKEN       = process.env.STRAPI_TOKEN;
const VERCEL_HOOK = process.env.VERCEL_HOOK;

if (!TOKEN || !VERCEL_HOOK) {
  console.error('Required: STRAPI_TOKEN and VERCEL_HOOK');
  process.exit(1);
}

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

async function run() {
  // Check if already registered
  const list = await fetch(`${STRAPI_URL}/api/webhooks`, { headers });
  const { data } = await list.json();
  const existing = data?.find(w => w.url === VERCEL_HOOK);
  if (existing) {
    console.log('Webhook already registered:', existing.name);
    return;
  }

  const res = await fetch(`${STRAPI_URL}/api/webhooks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Vercel Deploy Hook',
      url: VERCEL_HOOK,
      headers: {},
      events: [
        'entry.publish',
        'entry.unpublish',
        'entry.update',
        'entry.delete',
      ],
      enabled: true,
    }),
  });

  const json = await res.json();
  if (!res.ok) { console.error('Failed:', json); process.exit(1); }
  console.log('Webhook registered:', json.name, '→', json.url);
}

run().catch(err => { console.error(err.message); process.exit(1); });
