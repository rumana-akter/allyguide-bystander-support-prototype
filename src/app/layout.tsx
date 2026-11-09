import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AllyGuide', template: '%s | AllyGuide' },
  description:
    'Research demonstrator exploring optional, context-sensitive guidance for bystanders who witness gendered online harassment. Not a validated intervention.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              AllyGuide
            </Link>
            <nav aria-label="Main">
              <ul className="nav-list">
                <li>
                  <Link href="/">Scenarios</Link>
                </li>
                <li>
                  <Link href="/dashboard">Evaluation</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="research-banner">
            <p className="container">Research demonstrator. Not a safety service and not a validated intervention.</p>
          </div>
        </header>
        <main id="main" className="container" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="container">
            <p>All scenarios are fictional. This site has no free-text input and stores nothing you do.</p>
            <p>If someone is in immediate danger, contact local emergency services.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
