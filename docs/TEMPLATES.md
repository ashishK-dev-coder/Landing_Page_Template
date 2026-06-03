# Templates

## Dietician Template 1 — Kshitija (from `Kshitija_Landing_Page`)

| Item | Value |
|------|--------|
| Plan | `starter` |
| Category | `dietician` |
| Template slug | `template-1` |
| Component key | `dietician-kshitija-v1` |
| Preview URL | `/preview/starter/dietician/template-1` |
| Client site URL | `/site/{slug}` |

### Folder structure

```
src/templates/dietician/kshitija-v1/
  index.tsx              # Main template
  types.ts               # Content shape
  default-content.ts     # Master defaults (also in DB seed)
  sections/              # Hero, Video, Benefits, Introduction, Reviews
  ui/                    # Section, FadeIn, CTA, etc.
public/templates/dietician/kshitija-v1/
  logo.avif
  introduction.jpg
```

### Registry

Add new templates in `src/templates/registry.ts` with a unique `componentKey` matching `templates.component_key` in the database.

### Flow

1. **Master preview** — loads `template_schemas.default_content_json` from DB (or file fallback).
2. **Client site** — loads `site_content_versions.content_json` for that site.
3. **Theme** — `themes` + `theme_combination.tokens_json` set CSS `--brand` variables.

### Re-seed after pull

```bash
npm run db:seed
```

Updates template-1 to Kshitija schema and content.
