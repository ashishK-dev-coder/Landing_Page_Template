# Landing Page Template Platform

Backend foundation for your agency’s **template-based landing page product** (Starter ₹599+, Dietician templates, team edit & publish, subdomain + custom domain).

## Product summary

| Layer | What it is |
|-------|------------|
| **Plans** | Starter, Lead Generation, Premium (expand pricing later) |
| **Categories** | Dietician, Fitness, … per plan |
| **Templates** | Master layouts (5 per category to start) — **not edited in place** |
| **Sites** | Per-client copy with unique `slug` (subdomain) |
| **Versions** | Every save = new row → undo/redo |
| **Publish** | Instant; one Next.js app reads DB by host |

## Folder layout

```
Landing_Page_Template/
├── prisma/
│   ├── schema.prisma    # Full database model
│   └── seed.ts            # Starter + Dietician + 5 templates
├── src/
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── site-service.ts   # create / save / restore / publish / resolve host
│   └── types/
│       └── content.ts
└── docs/
    └── ARCHITECTURE.md    # Deep product + hosting guide
```

## Quick start

1. `npm install`
2. Copy `.env.example` → `.env` (or use the included `.env`) and set **`DATABASE_URL`** to your PostgreSQL connection string.
3. Start database (pick one):
   - **Docker:** `docker compose up -d` (uses user/password/db from `.env`)
   - **Local Postgres:** create database `landing_page_template`, then set `DATABASE_URL` with your real username/password
4. `npm run db:push`
5. `npm run db:seed`
6. **Restart** `npm run dev` after changing `.env`
7. Open http://localhost:3000/preview/starter/dietician/template-1

### Supabase + Vercel (important)

For production deploys on Vercel with Prisma:

- Set `DATABASE_URL` to Supabase **Transaction Pooler** URL (`:6543`) with `sslmode=require`.
- Set `DIRECT_URL` to Supabase **direct** URL (`db.<project-ref>.supabase.co:5432`) with `sslmode=require`.

Example:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require&schema=website_centralised_backend"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require&schema=website_centralised_backend"
```

### `.env` minimum

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landing_page_template?schema=public"
ADMIN_PASSWORD="change-this-password"
SESSION_SECRET="any-long-random-string-at-least-32-characters"
```

If Prisma shows `P1000 Authentication failed`, your Postgres password is not `postgres` — update `DATABASE_URL` to match your machine.

## Backend (built)

- **Next.js API routes** under `app/api/`
- **Services** under `src/lib/services/`
- **Zod validation** under `src/lib/validations/`
- **API docs:** [docs/API.md](./docs/API.md)

```bash
# Health check
curl http://localhost:3000/api/health

# Public catalog
curl "http://localhost:3000/api/plans"
curl "http://localhost:3000/api/templates?planSlug=starter&categorySlug=dietician"
```

Team routes: set `TEAM_API_KEY` in `.env` and pass `X-API-Key` header.

## Templates (Kshitija)

Extracted from `Kshitija_Landing_Page` → **Starter / Dietician / template-1**

Preview: [http://localhost:3000/preview/starter/dietician/template-1](http://localhost:3000/preview/starter/dietician/template-1)

Details: [docs/TEMPLATES.md](./docs/TEMPLATES.md)

## Your two hosting questions (answered)

**1. Subdomain like Vercel**  
Wildcard DNS `*.sites.youragency.com` + Vercel wildcard domain + middleware reads slug → `sites` table → render. No redeploy.

**2. Client custom domain**  
`site_custom_domains` table + client CNAME to your platform + verify → middleware matches `Host` header → same render path.

Details: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Recommendation

- **Do not** build “Starter-only schema” — use generic `plans` / `categories` / `templates` (already in schema).
- **Do** implement only Starter + one category in UI first.
- **Do** store content as JSON; keep JSX templates in the Next.js repo.

Frontend (admin, editor, renderer) is the next phase — discuss after you review this schema.
