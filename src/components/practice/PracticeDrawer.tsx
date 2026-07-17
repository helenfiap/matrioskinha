import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { PracticeSession } from '../../pedagogy/contracts';
import { PracticeSessionView } from './PracticeSessionView';

export function PracticeDrawer({ session, onClose }: { session: PracticeSession; onClose: () => void }) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = [...(drawerRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex]:not([tabindex="-1"])') ?? [])];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="practice-drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside ref={drawerRef} className="practice-drawer" role="dialog" aria-modal="true" aria-labelledby="practice-drawer-title">
        <header className="practice-drawer-header">
          <div><small>{t('Ciclo pedagógico', 'Педагогический цикл')}</small><h2 id="practice-drawer-title">{t('Prática contextual', 'Контекстная практика')}</h2></div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label={t('Fechar prática', 'Закрыть практику')}><X size={20} /></button>
        </header>
        <PracticeSessionView session={session} onClose={onClose} />
      </aside>
    </div>
  );
}
