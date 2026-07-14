import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useLanguage } from '../context/LanguageContext';

export function AppShell({ children }: { children: ReactNode }) {
  const { tk } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={'sidebar-overlay' + (menuOpen ? ' open' : '')} onClick={() => setMenuOpen(false)} />
      <main className="main">
        <Topbar onMenuClick={() => setMenuOpen((v) => !v)} />
        <div className="content">
          {children}
          <div className="footer">
            {tk('footer')}
          </div>
        </div>
      </main>
    </div>
  );
}
