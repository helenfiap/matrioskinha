import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { vocabItems } from '../data/vocab';
import { scenes } from '../data/scenarios';
import { curatedInfinitives } from '../data/verbs';

interface SearchResult {
  key: string;
  labelPt: string;
  labelRu: string;
  tagPt: string;
  tagRu: string;
  onSelect: () => void;
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { lang, toggle, tk } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results: SearchResult[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: SearchResult[] = [];

    vocabItems.forEach((v) => {
      if (v.pt.toLowerCase().includes(q) || v.ru.toLowerCase().includes(q)) {
        out.push({
          key: 'vocab-' + v.pt,
          labelPt: v.pt, labelRu: v.ru,
          tagPt: 'Pictograma', tagRu: 'Пиктограмма',
          onSelect: () => navigate('/vocab'),
        });
      }
    });

    scenes.forEach((s) => {
      s.hotspots.forEach((h) => {
        if (h.pt.toLowerCase().includes(q) || h.ru.toLowerCase().includes(q)) {
          out.push({
            key: 'hotspot-' + s.id + h.id,
            labelPt: h.pt, labelRu: h.ru,
            tagPt: lang === 'ru' ? s.labelRu : s.labelPt, tagRu: s.labelRu,
            onSelect: () => navigate(`/cenarios?scene=${s.id}&hotspot=${h.id}`),
          });
        }
      });
    });

    curatedInfinitives.forEach((v) => {
      if (v.pt.toLowerCase().includes(q) || v.ru.toLowerCase().includes(q)
        || v.relatedExpressions.some((expression) => expression.pt.toLowerCase().includes(q) || expression.ru.toLowerCase().includes(q))) {
        out.push({
          key: 'verb-' + v.id,
          labelPt: v.pt, labelRu: v.ru,
          tagPt: 'Verbo', tagRu: 'Глагол',
          onSelect: () => navigate(`/conjugador?q=${encodeURIComponent(v.pt)}`),
        });
      }
    });

    return out.slice(0, 8);
  }, [query, lang, navigate]);

  const showDropdown = focused && query.trim().length >= 2;

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label={tk('topbar.menuAria')}>
        <Menu size={20} />
      </button>
      <label className="search" style={{ position: 'relative' }}>
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={tk('topbar.searchPlaceholder')}
        />
        {showDropdown && (
          <div className="search-dropdown">
            {results.length === 0 && (
              <div className="search-empty">{tk('topbar.searchEmpty')}</div>
            )}
            {results.map((r) => (
              <button
                key={r.key}
                className="search-result"
                onMouseDown={(e) => { e.preventDefault(); r.onSelect(); setQuery(''); setFocused(false); }}
              >
                <span className="search-result-tag">{lang === 'ru' ? r.tagRu : r.tagPt}</span>
                <span className="search-result-label">{lang === 'ru' ? r.labelRu : r.labelPt}</span>
              </button>
            ))}
          </div>
        )}
      </label>
      <div className="actions">
        <span className="lang-status">{tk('topbar.langLabel')}</span>
        <button className="pill-btn" onClick={toggle}>{lang === 'pt' ? 'Русский' : 'Português'}</button>
        <button className="pill-btn primary">{tk('topbar.continueBtn')}</button>
        <img
          className="avatar"
          src="/assets/standard-avatar.png"
          alt={tk('topbar.avatarAlt')}
        />
      </div>
    </header>
  );
}
