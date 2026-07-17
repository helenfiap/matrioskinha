import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { KnowledgeEntityRef, PracticeSession } from '../pedagogy/contracts';
import { practicePlanner, type PracticePlanOptions } from '../pedagogy/planner';
import { PracticeDrawer } from '../components/practice/PracticeDrawer';

interface PracticeSessionContextValue {
  session: PracticeSession | null;
  openPractice: (origin: KnowledgeEntityRef, options?: PracticePlanOptions, trigger?: HTMLElement | null) => void;
  closePractice: () => void;
}

const PracticeSessionContext = createContext<PracticeSessionContextValue | null>(null);

export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openPractice = useCallback((origin: KnowledgeEntityRef, options: PracticePlanOptions = {}, trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null;
    setSession(practicePlanner.plan(origin, options));
  }, []);

  const closePractice = useCallback(() => {
    setSession(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <PracticeSessionContext.Provider value={{ session, openPractice, closePractice }}>
      {children}
      {session && <PracticeDrawer session={session} onClose={closePractice} />}
    </PracticeSessionContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components -- provider and hook form one public context API.
export function usePracticeSession() {
  const context = useContext(PracticeSessionContext);
  if (!context) throw new Error('usePracticeSession deve ser usado dentro de PracticeSessionProvider');
  return context;
}
