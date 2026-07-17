import { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const words = ['vais?', 'tu', 'Aonde'];
const correctOrder = ['Aonde', 'tu', 'vais?'];

export function OrderExercise({ onCorrect, onAttempt }: { onCorrect: () => void; onAttempt?: (correct: boolean) => void }) {
  const { t } = useLanguage();
  const [used, setUsed] = useState<boolean[]>(words.map(() => false));
  const [build, setBuild] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'ok' | 'wrong' | null>(null);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);

  const pick = (i: number) => {
    if (used[i] || done) return;
    const next = [...used];
    next[i] = true;
    setUsed(next);
    setBuild((b) => [...b, words[i]]);
  };

  const reset = () => {
    setUsed(words.map(() => false));
    setBuild([]);
    setFeedback(null);
  };

  const check = () => {
    const ok = build.join(' ') === correctOrder.join(' ');
    if (ok) {
      setFeedback('ok');
      setDone(true);
      onCorrect();
      onAttempt?.(true);
    } else {
      onAttempt?.(false);
      setFeedback('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }
  };

  return (
    <div className="exercise" id="order">
      <div className="exercise-header">
        <strong>{t('Monte a frase — pergunta informal com tu', 'Собери фразу — неформальный вопрос с tu')}</strong>
        <span className="badge">{t('Sintaxe', 'Синтаксис')}</span>
      </div>
      <div className="scene" style={{ gridTemplateColumns: '100px 1fr' }}>
        <div className="pictogram"><img className="mascot mascot-md" src="/assets/avatar-writing.png" alt="" /></div>
        <div>
          <p>{t('Toque nas palavras na ordem certa:', 'Нажимай на слова в правильном порядке:')}</p>
          <div className="chip-row">
            {words.map((w, i) => (
              <button key={i} className={'chip' + (used[i] ? ' used' : '')} onClick={() => pick(i)}>{w}</button>
            ))}
          </div>
          <div className={'build-strip' + (shake ? ' shake' : '')}>
            {build.map((w, i) => <span className="chip" key={i}>{w}</span>)}
          </div>
          <div className="sr-actions">
            <button className="sr-btn" onClick={reset}>{t('Recomeçar', 'Начать заново')}</button>
            <button className="sr-btn know" onClick={check}>{t('Verificar', 'Проверить')}</button>
          </div>
          {feedback && (
            <div className="feedback" style={{ color: feedback === 'ok' ? '#08783f' : '#c73545' }}>
              {feedback === 'ok'
                ? t('Ótimo! Ordem correta — "Aonde tu vais?".', 'Отлично! Правильный порядок — «Aonde tu vais?».')
                : t('Ainda não é essa ordem — tente de novo.', 'Порядок ещё не тот — попробуй снова.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
