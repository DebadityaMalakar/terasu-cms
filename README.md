# Terasu CMS

Strapi v5 headless CMS for [Terasu](https://github.com/DebadityaMalakar/terasu) — editorial media criticism site. Exposes a REST API consumed by the 11ty frontend at build time.

## Stack

| Layer | Tech |
|---|---|
| CMS | [Strapi v5](https://strapi.io/) (TypeScript) |
| Database (dev) | SQLite via `better-sqlite3` |
| Database (prod) | PostgreSQL via `pg` |
| Deployment | [Render](https://render.com/) Web Service |

## Content Types

### Article

| Field | Type | Notes |
|---|---|---|
| `slug` | UID | URL-safe identifier, auto-generated from correctedHeadline |
| `originalHeadline` | String | The headline as published |
| `correctedHeadline` | String | Terasu's more precise rewrite |
| `tldr` | Text | One-paragraph summary |
| `failureModes` | JSON | Array: `"Framing Bias"`, `"Clickbait"`, `"Censorship"` |
| `section` | Enum | `discourse`, `tech`, `science`, `archives` |
| `publication` | String | Source publication name |
| `sourceUrl` | String | Link to original article |
| `originalPublishDate` | Date | When the original article was published |
| `author` | String | Byline (defaults to "Terasu") |
| `summary` | JSON | Array of paragraph strings |
| `critique` | JSON | Array of paragraph strings (prefix `PULLQUOTE:` for pull quotes) |
| `tags` | JSON | Array of tag strings |
| `heroSrc/Alt/Cap` | String | Optional hero image |
| `sources` | Component (repeatable) | `{ title, url, note }` |

### Source Component (`shared.source`)

| Field | Type |
|---|---|
| `title` | String (required) |
| `url` | String |
| `note` | String |

## Local Development

**Prerequisites:** Node.js 22+

```bash
cd cms
npm install
npm run dev
```

Strapi admin panel: `http://localhost:1337/admin`

API (public, no auth): `http://localhost:1337/api/articles?populate=sources`

> Public read permissions are granted automatically at startup via the bootstrap function in `src/index.ts`. No manual admin configuration needed.

## Scripts

```bash
# Seed the Morocco microbial mats article
STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=<token> node scripts/seed.js

# Register Vercel deploy webhook in Strapi
STRAPI_TOKEN=<token> VERCEL_HOOK=<url> node scripts/register-webhook.js

# One-time migration: backfill section field on existing articles
STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=<token> node scripts/migrate-add-section.js
```

## Production Deployment (Render)

### 1. Create services in this order

1. **Postgres** database on Render
2. **Web Service** from this repo — link the Postgres database to get `DATABASE_URL`

**Build command:** `npm install && npm run build`
**Start command:** `npm run start`

### 2. Required environment variables

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | `1337` |
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | *(Render Postgres internal URL)* |
| `DATABASE_SSL` | `true` |
| `APP_KEYS` | Four base64 secrets joined with commas |
| `API_TOKEN_SALT` | Random base64 secret |
| `ADMIN_JWT_SECRET` | Random base64 secret |
| `TRANSFER_TOKEN_SALT` | Random base64 secret |
| `JWT_SECRET` | Random base64 secret |
| `ENCRYPTION_KEY` | Random base64 secret |
| `CORS_ORIGINS` | Your Vercel frontend URL |

Generate secrets:
```bash
node -e "const c=require('crypto');['API_TOKEN_SALT','ADMIN_JWT_SECRET','TRANSFER_TOKEN_SALT','JWT_SECRET','ENCRYPTION_KEY'].forEach(k=>console.log(k+'='+c.randomBytes(32).toString('base64')))"
```

For `APP_KEYS`, generate four separate values and join with commas. See `.env.production.example` for a full template.

### 3. After first deploy

Create an API token in Strapi admin (`Settings → API Tokens`), then register the Vercel deploy webhook so publishing an article triggers a frontend rebuild:

```bash
STRAPI_URL=https://your-cms.onrender.com \
STRAPI_TOKEN=<your-api-token> \
VERCEL_HOOK=<vercel-deploy-hook-url> \
node scripts/register-webhook.js
```

## API

Public read access — no authentication required:

```
GET /api/articles?populate=sources&sort=originalPublishDate:desc&pagination[pageSize]=100
GET /api/articles/:id?populate=sources
```

Strapi v5 returns flat documents — fields are directly on each object, not nested under `.attributes`.
