const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "mail",
  "ftp",
  "preview",
  "staging",
  "dev",
  "test",
]);

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function assertValidSiteSlug(slug: string) {
  if (slug.length < 2 || slug.length > 63) {
    throw new Error("Slug must be 2–63 characters");
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`Slug "${slug}" is reserved`);
  }
}
