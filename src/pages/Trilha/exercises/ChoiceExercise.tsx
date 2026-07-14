import { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const options = [
  { text: 'Como está a senhora?', correct: false },
  { text: 'Oi! Tudo bem?', correct: true },
  { text: 'Qual é o vosso estado?', correct: false },
];

export function ChoiceExercise({ onCorrect }: { onCorrect: () => void }) {
  const { t } = useLanguage();
  const [answered, setAnswered] = useState<string | null>(null);
  const isCorrect = answered ? options.find((o) => o.text === answered)?.correct : null;

  return (
    <div className="exercise" id="choice">
      <div className="exercise-header">
        <div>
          <strong>{t('Qual frase soa natural nesta situação?', 'Какая фраза звучит естественно в этой ситуации?')}</strong>
        </div>
        <span className="badge">{t('Brasil real', 'Настоящий бразильский португальский')}</span>
      </div>
      <div className="scene">
        <div aria-label="pictograma de cafeteria" className="pictogram">
          <svg role="img" viewBox="0 0 120 120">
            <rect fill="#f5c842" height={42} rx={9} width={62} x={18} y={42} />
            <path d="M80 50h12c12 0 14 24 0 27H80" fill="none" stroke="#08783f" strokeLinecap="round" strokeWidth={8} />
            <path d="M37 31c-8-11 7-12 0-22M57 31c-8-11 7-12 0-22" fill="none" stroke="#2155a5" strokeLinecap="round" strokeWidth={5} />
            <rect fill="#c73545" height={8} rx={4} width={66} x={26} y={84} />
          </svg>
        </div>
        <div>
          <div className="context-label">{t('Situação prática · cafeteria em Florianópolis', 'Практическая ситуация · кафе во Флорианополисе')}</div>
          <p>{t('Você encontra uma amiga e quer perguntar informalmente como ela está.', 'Ты встречаешь подругу и хочешь неформально спросить, как у неё дела.')}</p>
          <div className="bubble"><strong>"Oi! Tudo bem?"</strong><div className="translation">«Привет! Всё хорошо?» / «Как дела?»</div></div>
        </div>
      </div>
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
            ? t('Correto — forma neutra e natural para esta situação.', 'Верно — нейтральная и естественная форма для этой ситуации.')
            : t('Tente novamente: observe o grau de formalidade.', 'Попробуй ещё раз: обрати внимание на степень формальности.')}
        </div>
      )}
    </div>
  );
}
