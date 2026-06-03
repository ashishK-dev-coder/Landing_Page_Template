# Architecture — Template-Based Marketing Website Platform

## What you are building

You are **not** building WordPress or a page builder from scratch.

You are building a **template factory** for your marketing agency:

- Same section structure per niche (Dietician, Fitness, …)
- Team changes **text**, **images**, **theme** (5–7 colors × 10 combinations)
- **Instant publish** — no per-client deploy
- Live on **subdomain** (`reeta.sites.youragency.com`) or **custom domain** (`reetahealth.com`)

End users see ads → pricing → category → template preview → your **team** edits and publishes.

---

## Data flow (never edit master)

```
Master Template (DB + Next.js component)
        │
        │  createSiteFromTemplate()
        ▼
   Site (DRAFT) + SiteContentVersion v1 (copy of defaultContentJson)
        │
        │  visual editor saves → new version (v2, v3, …)
        ▼
   publishSite() → status PUBLISHED + publishedVersionId
        │
        ▼
   Middleware: host → resolveSiteByHost() → render componentKey + contentJson
```

**Rule:** `templates` and `template_schemas.default_content_json` on master are never updated by the editor. All edits go to `site_content_versions`.

---

## Entity relationship

```
Plan
 └── Category
      └── Template (master)
           └── TemplateSchema (schema_json + default_content_json)
           └── TemplateThemeAllowlist → Theme → ThemeCombination (×10)

Site (client copy)
 ├── plan, category, template (references)
 ├── theme + theme_combination
 ├── site_content_versions (undo)
 ├── site_custom_domains
 └── published_version_id → live content
```

---

## Hosting without redeploy

### One Next.js app

| Route | Purpose |
|-------|---------|
| Marketing site | Plans, categories, template gallery |
| `/preview/...` | Internal preview (draft OK) |
| `middleware.ts` | Read `Host` header |

### Subdomains

1. DNS: `*.sites.youragency.com` → Vercel (wildcard)
2. Vercel project: add wildcard domain
3. Middleware extracts slug: `reeta` from `reeta.sites.youragency.com`
4. `resolveSiteByHost()` loads published content
5. Render `template.componentKey` with `contentJson` + theme tokens

### Custom domains

1. Client adds DNS:

   ```txt
   CNAME  www  →  cname.vercel-dns.com
   ```

   Or CNAME to your canonical host if you proxy through one hostname.

2. Add row in `site_custom_domains` with `domain = reetahealth.com`
3. Verify (TXT record or HTTP challenge) → `verification_status = VERIFIED`
4. Register domain on Vercel (API or dashboard) for SSL
5. Same middleware: match `Host` → site → render

No new build per client.

---

## Scaling plans / categories / templates

Build **generic** tables from day one:

| Table | CRUD | Notes |
|-------|------|-------|
| `plans` | Yes | Lead Gen / Premium inactive until ready |
| `categories` | Yes | `plan_id` scopes category |
| `templates` | Yes | `component_key` maps to React file |
| `template_schemas` | Yes | Version field when editor fields change |
| `themes` + `theme_combinations` | Yes | 10 combos per color |
| `sites` | Yes | One row per client website |
| `site_content_versions` | Append-only | Undo = restore → new version |

Adding Premium later = new plan row + categories + templates. **No schema migration** for core model.

---

## Starter-only work strategy

**Database:** all three plans seeded; only Starter `ACTIVE`.

**Development focus:**

1. CRUD APIs for Plan → Category → Template (admin)
2. `createSiteFromTemplate` + editor save + publish
3. One category (Dietician) + 5 templates
4. Middleware + one dynamic renderer
5. Subdomain on staging wildcard

Lead Generation / Premium reuse the same tables when you enable them.

---

## Content storage rules

| Store in DB | Do not store |
|-------------|--------------|
| `content_json` field values | Full HTML pages |
| Image URLs (S3/CDN) | Binary in Postgres |
| `schema_json` for editor | Layout JSX (lives in repo) |

Template **layout** = Next.js components in codebase.  
Template **copy** = JSON in `site_content_versions`.

---

## Edge cases checklist

| Case | Approach |
|------|----------|
| Edit master by mistake | Editor API only writes `site_content_versions` |
| Undo | `restoreSiteContentVersion` copies old version forward |
| Publish wrong version | Publish picks explicit `contentVersionId` |
| Slug collision | Unique on `sites.slug` |
| Unpublish | `status = DRAFT` or `ARCHIVED` |
| Template schema v2 | Bump `template_schema.version`; new sites get new defaults; old sites unchanged |
| Custom domain not verified | Middleware ignores until `VERIFIED` |
| GST / payment | Out of scope for this schema; link `plan_id` at checkout later |

---

## Next steps (frontend — later)

1. Admin dashboard: plan → category → template picker
2. Visual editor driven by `schema_json`
3. `app/sites/[...]` or edge middleware renderer
4. Image upload → `site_media_assets` + CDN URL in `content_json`
5. Auth for `team_members` only on edit routes

---

## Commands

```bash
cd Landing_Page_Template
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run db:studio
```
