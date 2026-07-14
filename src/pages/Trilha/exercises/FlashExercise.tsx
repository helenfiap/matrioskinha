import { useState } from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export function FlashExercise({ onCorrect }: { onCorrect: () => void }) {
  const { t } = useLanguage();
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="exercise" id="flash">
      <div className="exercise-header">
        <strong>{t('Flashcard visual — tu × você', 'Визуальная карточка — tu × você')}</strong>
        <span className="badge">{t('Fase 3', 'Этап 3')}</span>
      </div>
      <div className="scene">
        <div className="pictogram">
          <svg viewBox="0 0 120 120">
            <circle cx={42} cy={46} fill="#f5c842" r={17} />
            <circle cx={82} cy={46} fill="#2155a5" r={17} />
            <path d="M20 92c4-17 16-25 22-25M100 92c-4-17-16-25-22-25" fill="none" stroke="#08783f" strokeLinecap="round" strokeWidth={6} />
          </svg>
        </div>
        <div className={'flip-card' + (flipped ? ' flipped' : '')} onClick={() => setFlipped((f) => !f)}>
          <div className="flip-inner">
            <div className="flip-face">
              <div className="context-label">{t('Toque para virar', 'Нажми, чтобы перевернуть')}</div>
              <h2 style={{ margin: '6px 0' }}>tu vais</h2>
              <p>{t('Forma comum em Florianópolis, entre amigos.', 'Обычная форма во Флорианополисе, между друзьями.')}</p>
            </div>
            <div className="flip-face flip-back">
              <div className="translation">ты идёшь / ты пойдёшь — неформально, юг Бразилии</div>
              <div className="bubble" style={{ marginTop: 8 }}><strong>"Tu vais pra praia amanhã?"</strong></div>
              <div className="sr-actions">
                <button className="sr-btn" onClick={(e) => { e.stopPropagation(); setFlipped(false); }}>
                  {t('Ainda não', 'Ещё нет')}
                </button>
                <button
                  className={'sr-btn know' + (saved ? ' locked' : '')}
                  onClick={(e) => { e.stopPropagation(); setSaved(true); onCorrect(); }}
                >
                  <Check size={14} /> {saved ? t('Salvo', 'Сохранено') : t('Já sei', 'Уже знаю')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
