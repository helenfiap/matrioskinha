import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { attemptSchema, type Attempt } from '../content/schemas';
import { calculateLearningMetrics, calculateMastery, findRecurringErrors } from '../domain/learningEngine';
import { attemptRepository } from '../repositories/attemptRepository';

type NewAttempt = Omit<Attempt, 'id' | 'userId' | 'answeredAt'> & { answeredAt?: string };

interface LearningContextValue {
  attempts: Attempt[];
  metrics: ReturnType<typeof calculateLearningMetrics>;
  mastery: ReturnType<typeof calculateMastery>;
  recurringErrors: ReturnType<typeof findRecurringErrors>;
  recordAttempt: (input: NewAttempt) => Attempt;
  resetAttempts: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => attemptRepository.read());

  useEffect(() => { attemptRepository.write(attempts); }, [attempts]);

  const recordAttempt = useCallback((input: NewAttempt) => {
    const attempt = attemptSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      userId: 'local-user',
      answeredAt: input.answeredAt ?? new Date().toISOString(),
    });
    setAttempts((current) => [...current, attempt].slice(-1000));
    return attempt;
  }, []);

  const resetAttempts = useCallback(() => { attemptRepository.clear(); setAttempts([]); }, []);
  const metrics = useMemo(() => calculateLearningMetrics(attempts), [attempts]);
  const mastery = useMemo(() => calculateMastery(attempts), [attempts]);
  const recurringErrors = useMemo(() => findRecurringErrors(attempts), [attempts]);

  return <LearningContext.Provider value={{ attempts, metrics, mastery, recurringErrors, recordAttempt, resetAttempts }}>{children}</LearningContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components -- provider and hook form one public context API.
export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) throw new Error('useLearning deve ser usado dentro de LearningProvider');
  return context;
}
