/**
 * One-time migration: sets `section` on any articles where it is null.
 *
 * Usage (while Strapi is running):
 *   STRAPI_TOKEN=<full-access-api-token> node cms/scripts/migrate-add-section.js
 *
 * It prints each article it updates. Re-running is safe — skips articles
 * that already have a section set.
 *
 * Section values: discourse | tech | science | archives
 * Edit the SLUG_TO_SECTION map below to assign specific slugs, or let the
 * script fall back to "discourse" for anything it doesn't recognise.
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const TOKEN      = process.env.STRAPI_TOKEN;

if (!TOKEN) {
  console.error('Set STRAPI_TOKEN to a full-access API token.');
  process.exit(1);
}

// Optional: explicitly map known slugs to their section.
// Anything not listed here gets the DEFAULT_SECTION.
const SLUG_TO_SECTION = {
  'martindale-identifies-chemosynthetic-microbial-mats-jurassic-deep-sea-morocco': 'science',
};
const DEFAULT_SECTION = 'discourse';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function run() {
  // Fetch all articles
  const res = await fetch(
    `${STRAPI_URL}/api/articles?pagination[pageSize]=200&fields[0]=slug&fields[1]=section`,
    { headers }
  );
  if (!res.ok) throw new Error(`GET /api/articles → ${res.status} ${res.statusText}`);

  const { data } = await res.json();
  console.log(`Found ${data.length} article(s).`);

  let updated = 0;
  for (const a of data) {
    if (a.section) {
      console.log(`  skip  ${a.slug} (already "${a.section}")`);
      continue;
    }

    const section = SLUG_TO_SECTION[a.slug] || DEFAULT_SECTION;
    const patch = await fetch(`${STRAPI_URL}/api/articles/${a.documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data: { section } }),
    });

    if (!patch.ok) {
      console.error(`  ERROR ${a.slug} → ${patch.status}`);
    } else {
      console.log(`  set   ${a.slug} → "${section}"`);
      updated++;
    }
  }

  console.log(`\nDone. Updated ${updated}/${data.length} article(s).`);
}

run().catch(err => { console.error(err.message); process.exit(1); });
