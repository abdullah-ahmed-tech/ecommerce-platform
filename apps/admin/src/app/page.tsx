import Link from 'next/link';
import { AdminShell } from '../components/layout/admin-shell';

export default function AdminPage() {
  return (
    <AdminShell title="Catalog Admin" subtitle="Manage categories and products from a central dashboard.">
      <section className="grid grid-2">
        <article className="card">
          <h2>Categories</h2>
          <p style={{ color: 'var(--muted)' }}>Create and manage nested category taxonomy.</p>
          <Link href="/categories" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Open categories →
          </Link>
        </article>
        <article className="card">
          <h2>Products</h2>
          <p style={{ color: 'var(--muted)' }}>Manage catalog items, stock, pricing, and images.</p>
          <Link href="/products" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Open products →
          </Link>
        </article>
      </section>
    </AdminShell>
  );
}
