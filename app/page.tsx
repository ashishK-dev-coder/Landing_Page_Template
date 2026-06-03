import { listSites } from "@/lib/services/site-service";

export default async function HomePage() {
  let sites:
    | Array<{
        id: string;
        clientName: string;
        slug: string;
        status: string;
      }>
    | null = null;
  let loadError: string | null = null;

  try {
    const result = await listSites({ page: 1, limit: 100 });
    sites = result.items.map((site) => ({
      id: site.id,
      clientName: site.clientName,
      slug: site.slug,
      status: site.status,
    }));
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load sites";
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Landing Page Template API</h1>
      <p>Backend is running. Use <code>/api/health</code> and <code>/api/plans</code>.</p>
      <p style={{ marginTop: 12 }}>
        <strong>① Master preview:</strong>{" "}
        <a href="/preview/starter/dietician/template-1">
          /preview/starter/dietician/template-1
        </a>
        <span style={{ color: "#666" }}> — use floating &quot;Edit Template&quot; button</span>
      </p>
      <p style={{ marginTop: 8 }}>
        <strong>② Copy into client editor:</strong>{" "}
        <a href="/edit/preview/starter/dietician/template-1">
          /edit/preview/starter/dietician/template-1
        </a>
        <span style={{ color: "#666" }}> — master is locked; this opens client-site flow</span>
      </p>
      <p style={{ marginTop: 8 }}>
        <strong>③ Edit client site:</strong>{" "}
        <code>/edit/site/&#123;slug&#125;</code>
        <span style={{ color: "#666" }}> — auto-creates from master when slug is new</span>
      </p>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        Password: set <code>ADMIN_PASSWORD</code> in <code>.env</code> (default{" "}
        <code>change-this-password</code>)
      </p>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Client Sites (from database)</h2>
        {loadError ? (
          <p style={{ color: "#b91c1c", fontSize: 14 }}>
            Could not load sites: {loadError}
          </p>
        ) : sites && sites.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {sites.map((site) => (
              <div
                key={site.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 600 }}>{site.clientName}</div>
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  <strong>Slug:</strong> <code>{site.slug}</code>
                </div>
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  <strong>Website URL:</strong>{" "}
                  <a href={`/site/${site.slug}`}>{`/site/${site.slug}`}</a>
                </div>
                <div style={{ marginTop: 4, fontSize: 14 }}>
                  <strong>Edit URL:</strong>{" "}
                  <a href={`/edit/site/${site.slug}`}>{`/edit/site/${site.slug}`}</a>
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "#4b5563" }}>
                  Status: {site.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            No client sites found yet. Create one from the master template editor.
          </p>
        )}
      </section>
    </main>
  );
}
