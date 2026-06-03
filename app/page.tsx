import { listSites } from "@/lib/services/site-service";
import styles from "./page.module.css";

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
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.badge}>Landing Page Platform</p>
          <h1>Build and Publish Beautiful Client Landing Pages in Minutes</h1>
          <p className={styles.heroText}>
            A clean template system for your agency: pick a layout, personalize content, and publish
            instantly with subdomain and custom-domain support.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="/preview/starter/dietician/template-1">
              View Master Template
            </a>
            <a className={styles.secondaryButton} href="/edit/preview/starter/dietician/template-1">
              Create Client Copy
            </a>
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>How It Works</h2>
          <p>A simple 3-step workflow made for fast delivery.</p>
        </div>
        <div className={styles.stepGrid}>
          <article className={styles.stepCard}>
            <span>01</span>
            <h3>Preview</h3>
            <p>Open the master design and inspect the layout and branding style.</p>
          </article>
          <article className={styles.stepCard}>
            <span>02</span>
            <h3>Customize</h3>
            <p>Generate a client copy and update text, media, and sections in the editor.</p>
          </article>
          <article className={styles.stepCard}>
            <span>03</span>
            <h3>Publish</h3>
            <p>Launch the final version and connect a subdomain or custom domain.</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Quick Access</h2>
          <p>Direct links for your daily workflow.</p>
        </div>
        <div className={styles.linkPanel}>
          <p>
            <strong>Master Preview:</strong>{" "}
            <a href="/preview/starter/dietician/template-1">/preview/starter/dietician/template-1</a>
          </p>
          <p>
            <strong>Create Client Copy:</strong>{" "}
            <a href="/edit/preview/starter/dietician/template-1">
              /edit/preview/starter/dietician/template-1
            </a>
          </p>
          <p>
            <strong>Edit Client Site:</strong> <code>/edit/site/{"{slug}"}</code>
          </p>
          <p>
            <strong>Live Client Site:</strong> <code>/site/{"{slug}"}</code>
          </p>
          <p>
            <strong>Admin Password:</strong> set <code>ADMIN_PASSWORD</code> in <code>.env</code>.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Client Sites</h2>
          <p>Live data loaded from your database.</p>
        </div>
        {loadError ? (
          <p className={styles.errorText}>Could not load sites: {loadError}</p>
        ) : sites && sites.length > 0 ? (
          <div className={styles.siteGrid}>
            {sites.map((site) => (
              <article key={site.id} className={styles.siteCard}>
                <h3>{site.clientName}</h3>
                <p>
                  <strong>Slug:</strong> <code>{site.slug}</code>
                </p>
                <p>
                  <strong>Website:</strong> <a href={`/site/${site.slug}`}>{`/site/${site.slug}`}</a>
                </p>
                <p>
                  <strong>Editor:</strong>{" "}
                  <a href={`/edit/site/${site.slug}`}>{`/edit/site/${site.slug}`}</a>
                </p>
                <p className={styles.statusText}>Status: {site.status}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.mutedText}>
            No client sites found yet. Create one from the master template editor.
          </p>
        )}
      </section>

      <footer className={styles.footer}>
        <p>Landing Page Template Platform</p>
      </footer>
    </main>
  );
}
