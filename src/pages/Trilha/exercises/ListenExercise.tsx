import { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const options = [
  { text: 'tu vais — norma culta', correct: false },
  { text: 'tu vai — concordância coloquial, muito comum no Brasil', correct: true },
  { text: 'você vai — tratamento indireto', correct: false },
];

export function ListenExercise({ onCorrect }: { onCorrect: () => void }) {
  const { t } = useLanguage();
  const [answered, setAnswered] = useState<string | null>(null);
  const isCorrect = answered ? options.find((o) => o.text === answered)?.correct : null;

  return (
    <div className="exercise" id="listen">
      <div className="exercise-header">
        <strong>{t('Compreensão oral — variação de concordância', 'Аудирование — вариант согласования')}</strong>
        <span className="badge">{t('Pronúncia', 'Произношение')}</span>
      </div>
      <div className="scene" style={{ gridTemplateColumns: '100px 1fr' }}>
        <div className="pictogram"><img className="mascot mascot-md" src="/assets/avatar-listening.png" alt="" /></div>
        <div>
          <p>{t('Áudio simulado:', 'Смоделированное аудио:')}</p>
          <div className="bubble"><strong>"Tu vai comigo amanhã?"</strong></div>
          <p style={{ marginTop: 10 }}>{t('Qual estrutura você reconheceu?', 'Какую структуру ты узнал?')}</p>
          <div className="options">
            {options.map((o) => {
              const cls = ['option', answered === o.text ? (o.correct ? 'correct' : 'wrong') : ''].filter(Boolean).join(' ');
              return (
                <button key={o.text} className={cls} onClick={() => { setAnswered(o.text); if (o.correct) onCorrect(); }}>
                  {o.text}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="feedback" style={{ color: isCorrect ? '#08783f' : '#c73545' }}>
              {isCorrect
                ? t('Correto — "tu vai" é a concordância coloquial mais comum no Brasil, mesmo fora da norma culta.', 'Верно — «tu vai» — самое частое разговорное согласование в Бразилии, хоть и вне литературной нормы.')
                : t('Quase lá: preste atenção na conjugação depois de "tu".', 'Почти! Обрати внимание на форму глагола после «tu».')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
