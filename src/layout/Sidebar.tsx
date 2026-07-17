import { Link, useLocation } from 'react-router-dom';
import type { ComponentType } from 'react';
import {
  Home, ListChecks, PenLine, Heart, BookOpen, Type, MapPin, ClipboardList,
  Grid2x2, Compass, Music, BarChart3, RotateCcw, Settings,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavItem {
  to: string;
  icon: ComponentType<{ size?: number }>;
  key: string;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    groupKey: 'inicio',
    items: [
      { to: '/', icon: Home, key: 'visaoGeral' },
      { to: '/trilha', icon: ListChecks, key: 'minhaTrilha' },
      { to: '/trilha?section=verbo-contexto', icon: PenLine, key: 'aulaAtual' },
    ],
  },
  {
    groupKey: 'explorar',
    items: [
      { to: '/cenarios?collection=emotions', icon: Heart, key: 'atelieEmocoes' },
      { to: '/cenarios', icon: Compass, key: 'cenarios' },
      { to: '/vocab', icon: Grid2x2, key: 'pictogramas' },
      { to: '/vocab?section=brasil-real', icon: MapPin, key: 'brasilReal' },
    ],
  },
  {
    groupKey: 'estudar',
    items: [
      { to: '/conjugador', icon: BookOpen, key: 'conjugador' },
      { to: '/trilha?section=aula-completa', icon: Type, key: 'tuVoce' },
      { to: '/trilha?tab=listen', icon: Music, key: 'audioPronuncia' },
    ],
  },
  {
    groupKey: 'praticar',
    items: [
      { to: '/trilha?section=banco-exercicios', icon: ClipboardList, key: 'bancoExercicios' },
      { to: '/progresso?section=revisao', icon: RotateCcw, key: 'revisao' },
    ],
  },
  {
    groupKey: 'acompanhar',
    items: [
      { to: '/progresso', icon: BarChart3, key: 'desempenho' },
    ],
  },
  {
    groupKey: 'config',
    items: [
      { to: '/config', icon: Settings, key: 'preferencias' },
    ],
  },
];

const querySpecificItems = groups
  .flatMap((group) => group.items)
  .filter((item) => item.to.includes('?'));

function isSidebarItemActive(to: string, pathname: string, search: string) {
  const target = new URL(to, 'https://matrioskinha.local');
  if (target.pathname !== pathname) return false;

  const currentParams = new URLSearchParams(search);
  const targetEntries = [...target.searchParams.entries()];
  if (targetEntries.length > 0) {
    return targetEntries.every(([key, value]) => currentParams.get(key) === value);
  }

  // A rota-base permanece ativa, exceto quando um atalho mais específico
  // da mesma tela está selecionado (Ateliê, áudio, Brasil real etc.).
  return !querySpecificItems.some((item) => {
    const specificTarget = new URL(item.to, 'https://matrioskinha.local');
    return specificTarget.pathname === pathname
      && [...specificTarget.searchParams.entries()]
        .every(([key, value]) => currentParams.get(key) === value);
  });
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tk } = useLanguage();
  const { pathname, search } = useLocation();
  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div className="brand">
        <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="2" y="2" width="60" height="60" rx="18" fill="#08783f" />
          <path d="M32 9c-7 0-11.5 6.7-11.5 12.4 0 3.6 1.9 6.5 5.3 8.4-7.4 3-11.6 10-11.6 17.9 0 5.2 8 8.3 17.8 8.3s17.8-3.1 17.8-8.3c0-7.9-4.2-14.9-11.6-17.9 3.4-1.9 5.3-4.8 5.3-8.4C43.5 15.7 39 9 32 9z" fill="#fff" />
        </svg>
        <div>
          <div className="brand-word">matri<span className="g">osk</span>in<span className="y">h</span>a</div>
          <small>{tk('sidebar.brandTagline')}</small>
        </div>
      </div>
      {groups.map((group) => (
        <div key={group.groupKey}>
          <div className="nav-title">{tk(`sidebar.groups.${group.groupKey}`)}</div>
          <nav className="nav">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              const active = isSidebarItemActive(item.to, pathname, search);
              return (
                <Link
                  key={item.key + i}
                  to={item.to}
                  className={active ? 'active' : ''}
                  aria-current={active ? 'page' : undefined}
                  onClick={onClose}
                >
                  <span className="dot"><Icon size={14} /></span> <span>{tk(`sidebar.items.${item.key}`)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
      <div className="sidebar-note">
        <span className="diamond" />
        <span>
          <strong>{tk('sidebar.noteTitle')}</strong>
          <br />
          {tk('sidebar.noteBody')}
        </span>
      </div>
    </aside>
  );
}
