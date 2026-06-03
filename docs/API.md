# API Reference

Base URL: `http://localhost:3000/api`

All responses:

```json
{ "success": true, "data": { ... } }
```

Errors:

```json
{ "success": false, "error": { "message": "...", "code": "..." } }
```

## Auth

Team-only routes require header when `TEAM_API_KEY` is set in `.env`:

```
X-API-Key: your-secret-key
```

Public (no key): `GET /api/plans`, `GET /api/categories`, `GET /api/templates`, `GET /api/themes`, `GET /api/health`, `GET /api/sites/resolve`

---

## Catalog (public read)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/plans` | List plans (`?includeInactive=true`) |
| GET | `/plans/:id` | Plan + categories |
| GET | `/categories` | `?planSlug=starter` or `?planId=` |
| GET | `/categories/:id` | Category + templates |
| GET | `/templates` | `?planSlug=starter&categorySlug=dietician` |
| GET | `/templates/:id` | Full template + schema + themes |
| GET | `/templates/:id/themes` | Allowed themes for template |
| GET | `/themes` | All themes + 10 combinations each |

---

## Sites (team)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sites` | List client sites (paginated) |
| POST | `/sites` | Create site from template (duplicate content) |
| GET | `/sites/:id` | Site details |
| PATCH | `/sites/:id` | Update name, slug, status |
| GET | `/sites/:id/editor` | Editor payload (latest + published + schema) |
| GET | `/sites/:id/versions` | Version history |
| POST | `/sites/:id/versions` | Save new content version |
| GET | `/sites/:id/versions/:n` | Get version by number |
| POST | `/sites/:id/versions/restore` | Undo → new version from old |
| POST | `/sites/:id/publish` | `{ "contentVersionId": "..." }` |
| POST | `/sites/:id/unpublish` | Back to draft |
| POST | `/sites/:id/archive` | Archive site |
| PATCH | `/sites/:id/theme` | `{ "themeId", "themeCombinationIndex" }` |
| GET | `/sites/preview/:slug` | Draft/published preview for team |

---

## Domains (team)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sites/:id/domains` | List + DNS hints |
| POST | `/sites/:id/domains` | `{ "domain": "reetahealth.com" }` |
| POST | `/sites/:id/domains/:domainId/verify` | Mark verified (manual for now) |

---

## Live resolution

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sites/resolve?host=reeta.sites.youragency.com` | Published site for middleware |

---

## Admin CRUD (team)

Plans, categories, templates: `POST`, `PATCH`, `DELETE` on same paths as GET.

### Create site example

```bash
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key" \
  -d '{
    "clientName": "Reeta PCOS",
    "slug": "reeta-pcos",
    "planId": "<starter-plan-id>",
    "categoryId": "<dietician-category-id>",
    "templateId": "<template-1-id>",
    "themeId": "<green-theme-id>",
    "themeCombinationIndex": 3
  }'
```

### Publish example

```bash
curl -X POST http://localhost:3000/api/sites/<site-id>/publish \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key" \
  -d '{ "contentVersionId": "<version-id>" }'
```
