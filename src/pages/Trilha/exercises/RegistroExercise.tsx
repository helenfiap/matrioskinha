import { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const items = [
  { phrase: '"Como o senhor está?"', correct: 'formal' },
  { phrase: '"Tudo bem?"', correct: 'neutro' },
  { phrase: '"E aí, beleza?"', correct: 'informal' },
];

const choices: Array<{ key: 'formal' | 'neutro' | 'informal'; pt: string; ru: string }> = [
  { key: 'formal', pt: 'Formal', ru: 'Формально' },
  { key: 'neutro', pt: 'Neutro', ru: 'Нейтрально' },
  { key: 'informal', pt: 'Informal', ru: 'Неформально' },
];

export function RegistroExercise({ onCorrect, onAttempt }: { onCorrect: () => void; onAttempt?: (correct: boolean) => void }) {
  const { t } = useLanguage();
  const [solved, setSolved] = useState<Record<number, string | null>>({});

  const allSolved = items.every((_, i) => solved[i] && solved[i] === items[i].correct);

  const pick = (i: number, key: string) => {
    setSolved((prev) => {
      const next = { ...prev, [i]: key };
      const done = items.every((_, idx) => next[idx] === items[idx].correct);
      onAttempt?.(key === items[i].correct);
      if (done) onCorrect();
      return next;
    });
  };

  return (
    <div className="exercise" id="registro">
      <div className="exercise-header">
        <strong>{t('Classifique o registro', 'Определи регистр')}</strong>
        <span className="badge">{t('Registro social', 'Социальный регистр')}</span>
      </div>
      {items.map((item, i) => (
        <div className="classify-item" key={i}>
          <p>{item.phrase}</p>
          <div className="chip-row">
            {choices.map((c) => {
              const chosen = solved[i];
              const cls = ['chip', chosen === c.key ? (c.key === item.correct ? 'correct' : 'wrong') : ''].filter(Boolean).join(' ');
              return (
                <button key={c.key} className={cls} onClick={() => pick(i, c.key)}>
                  {t(c.pt, c.ru)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {allSolved && (
        <div className="feedback" style={{ color: '#08783f' }}>
          {t('As três frases classificadas corretamente!', 'Все три фразы определены верно!')}
        </div>
      )}
    </div>
  );
}
