import Link from 'next/link';
import type { ReactNode } from 'react';

interface AdminShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminShell({ title, subtitle, actions, children }: AdminShellProps) {
  return (
    <main className="container">
      <nav style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/products">Products</Link>
      </nav>
      <header className="page-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>{title}</h1>
          {subtitle ? <p style={{ margin: 0, color: 'var(--muted)' }}>{subtitle}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </main>
  );
}
