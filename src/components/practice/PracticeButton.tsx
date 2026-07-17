import { Sparkles } from 'lucide-react';
import { featureFlags } from '../../config/features';
import { useLanguage } from '../../context/LanguageContext';
import { usePracticeSession } from '../../context/PracticeSessionContext';
import { useProgress } from '../../context/ProgressContext';
import type { KnowledgeEntityRef } from '../../pedagogy/contracts';

export function PracticeButton({
  entityRef, selectedGender, className = '', seed,
}: {
  entityRef: KnowledgeEntityRef;
  selectedGender?: 'feminine' | 'masculine';
  className?: string;
  seed?: string;
}) {
  const { t } = useLanguage();
  const { settings } = useProgress();
  const { openPractice } = usePracticeSession();
  if (!featureFlags.pedagogicalCycle) return null;
  return (
    <button
      type="button"
      className={`practice-cycle-button ${className}`.trim()}
      onClick={(event) => openPractice(entityRef, {
        seed, selectedGender, supportLanguage: settings.supportLang,
      }, event.currentTarget)}
    >
      <Sparkles size={16} /> {t('Praticar', 'Практиковаться')}
      <span>P2</span>
    </button>
  );
}
