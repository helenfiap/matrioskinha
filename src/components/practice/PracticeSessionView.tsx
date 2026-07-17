import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLearning } from '../../context/LearningContext';
import type { PracticeSession } from '../../pedagogy/contracts';
import { interactionToAttempt } from '../../pedagogy/evidence';
import { evaluateAnswer } from '../../pedagogy/evaluation';
import { AudioButton } from '../AudioButton';

export function PracticeSessionView({ session, onClose }: { session: PracticeSession; onClose: () => void }) {
  const { lang, t } = useLanguage();
  const { recordAttempt } = useLearning();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const startedAt = useRef(Date.now());
  const interaction = session.interactions[stepIndex];

  useEffect(() => {
    setStepIndex(0); setSelectedId(null); setCorrect(null); setScore(0); setComplete(false); startedAt.current = Date.now();
  }, [session.id]);

  if (complete) return (
    <div className="practice-complete">
      <CheckCircle2 size={42} />
      <h3>{t('Sessão concluída', 'Практика завершена')}</h3>
      <p>{t(`Você acertou ${score} de ${session.interactions.length} conexões.`, `Правильных ответов: ${score} из ${session.interactions.length}.`)}</p>
      <button type="button" className="sr-btn know" onClick={onClose}>{t('Voltar ao conteúdo', 'Вернуться к материалу')}</button>
    </div>
  );

  if (!interaction || interaction.answerSpec.kind !== 'single-choice') return null;
  const answerInPortuguese = interaction.tags.includes('answer:pt');
  const monolingualContext = interaction.tags.includes('monolingual-context');
  const audio = interaction.assets?.find((asset) => asset.type === 'audio' && asset.role?.startsWith('primary-pronunciation'))
    ?? interaction.assets?.find((asset) => asset.type === 'audio');
  const image = interaction.assets?.find((asset) => asset.type === 'image');
  const answer = (optionId: string) => {
    if (selectedId) return;
    const wasCorrect = evaluateAnswer(interaction.answerSpec, { kind: 'single-choice', optionId });
    setSelectedId(optionId); setCorrect(wasCorrect); if (wasCorrect) setScore((value) => value + 1);
    recordAttempt(interactionToAttempt(session, interaction, wasCorrect, Date.now() - startedAt.current));
  };

  const next = () => {
    if (stepIndex + 1 >= session.interactions.length) { setComplete(true); return; }
    setStepIndex((value) => value + 1); setSelectedId(null); setCorrect(null); startedAt.current = Date.now();
  };

  return (
    <div className="practice-session-view">
      <div
        className="practice-stepper" role="progressbar"
        aria-label={t('Progresso da sessão', 'Ход практики')}
        aria-valuemin={1} aria-valuemax={session.interactions.length} aria-valuenow={stepIndex + 1}
      >
        {session.interactions.map((item, index) => <span key={item.id} className={index < stepIndex ? 'done' : index === stepIndex ? 'active' : ''} />)}
      </div>
      <div className="practice-skill-label">{stepIndex + 1}/{session.interactions.length} · {interaction.skill}</div>
      {image && <img className="practice-visual" src={image.src} alt="" />}
      <div className="practice-prompt">
        <h3>{lang === 'ru' ? interaction.prompt.ru : interaction.prompt.pt}</h3>
        {audio && <div className="practice-audio">
          <span>{t('Ouvir a palavra em português', 'Прослушать слово на португальском')}</span>
          <AudioButton src={audio.src} label={t('palavra em português', 'слово на португальском')} />
        </div>}
      </div>
      <div className="practice-options">
        {interaction.answerSpec.options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrect = interaction.answerSpec.kind === 'single-choice' && option.id === interaction.answerSpec.correctOptionId;
          const className = selectedId ? isCorrect ? 'correct' : isSelected ? 'incorrect' : '' : '';
          const primary = answerInPortuguese ? option.label.pt : lang === 'ru' ? option.label.ru : option.label.pt;
          const secondary = answerInPortuguese ? option.label.ru : lang === 'ru' ? option.label.pt : option.label.ru;
          return <button type="button" key={option.id} className={className} disabled={selectedId !== null} onClick={() => answer(option.id)}>
            <strong>{primary}</strong>{selectedId && !monolingualContext && <small>{secondary}</small>}
          </button>;
        })}
      </div>
      {selectedId && <div className={`practice-feedback ${correct ? 'correct' : 'incorrect'}`} role="status">
        {correct ? <CheckCircle2 size={18} /> : <RotateCcw size={18} />}
        <div><strong>{correct ? t('Correto', 'Верно') : t('Vamos revisar', 'Повторим')}</strong><p>{lang === 'ru' ? (correct ? interaction.feedback.correct.ru : interaction.feedback.incorrect.ru) : (correct ? interaction.feedback.correct.pt : interaction.feedback.incorrect.pt)}</p></div>
      </div>}
      {selectedId && <button type="button" className="practice-next sr-btn know" onClick={next}>
        {stepIndex + 1 === session.interactions.length ? t('Concluir', 'Завершить') : t('Próximo', 'Далее')} <ArrowRight size={16} />
      </button>}
    </div>
  );
}
