# Visual editor integration

The editor from `visual-editor/` is injected into the Kshitija dietician template.

## Edit URLs

| Context | URL |
|---------|-----|
| Master template (Starter / Dietician / template-1) | `/edit/preview/starter/dietician/template-1` |
| Client site | `/edit/site/{slug}` |

## Login (password only)

Set in `.env`:

```env
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=your-long-random-secret-min-32-chars
```

1. Open preview or edit URL.
2. Click **Edit Template** (floating, bottom-right) or the lock (bottom-left on edit pages).
3. Enter **password only**.
4. Edit mode: toolbar + section pencils.

## Flow (master → client)

| Step | URL |
|------|-----|
| 1. View master | `/preview/starter/dietician/template-1` |
| 2. Edit master | Click **Edit Template** → `/edit/preview/starter/dietician/template-1` |
| 3. Edit client | **Edit client site** (prompt for slug) → `/edit/site/{slug}` |

With known client slug, use query:  
`/edit/preview/starter/dietician/template-1?siteSlug=reeta-pcos` — then **Client site** is a direct link.

## How saves work

| Context | Storage |
|---------|---------|
| `/edit/site/...` | Patches `site_content_versions` (latest row) in PostgreSQL |
| `/edit/preview/...` | Patches `template_schemas.default_content_json` (master only) |

Images upload to `public/uploads/{siteId|templateId}/`.

## Instrumented sections

- Brand (logo)
- Hero (headlines, badges, stats)
- Video & form (titles)
- Benefits (card titles/descriptions)
- About (bio image + paragraphs)
- Reviews (testimonial images)
- Footer

## Files copied from `visual-editor`

- `src/components/visual-editor/` — UI components
- `src/components/dev-cms/` — login lock + form
- `src/lib/auth/session.ts`
- `src/lib/visual-data/setByPath.ts`
- `app/api/admin/*` — adapted for site/template cookies
