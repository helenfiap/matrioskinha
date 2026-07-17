import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Hotspot, Scene } from '../../types';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Props {
  scene: Scene;
  reviewedIds: string[];
  masteredIds: string[];
  getStage: (hotspotId: string) => string;
  onCorrect: (hotspotId: string) => void;
  onAttempt: (hotspotId: string, kind: Step['kind'], correct: boolean) => void;
  onClose: () => void;
}

type Step = { hotspot: Hotspot; kind: 'choice' | 'order' };

export function PracticeModal({ scene, reviewedIds, masteredIds, getStage, onCorrect, onAttempt, onClose }: Props) {
  const { t, lang } = useLanguage();
  const [correctIds, setCorrectIds] = useState<string[]>([]);

  const queue = useMemo<Step[]>(() => {
    const pool = reviewedIds
      .map((id) => scene.hotspots.find((h) => h.id === id))
      .filter((h): h is Hotspot => Boolean(h));
    pool.sort((a, b) => (masteredIds.includes(a.id) ? 1 : 0) - (masteredIds.includes(b.id) ? 1 : 0));
    const chosen = shuffle(pool).slice(0, 6);
    return chosen.map((h, i) => ({ hotspot: h, kind: i % 2 === 0 ? 'choice' : 'order' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const finished = index >= queue.length;
  // "dominadas agora": itens que ficaram no estágio 'dominado' durante ESTA sessão de
  // prática e que ainda não estavam dominados antes dela começar (não a contagem total,
  // que usaria a lista de mastered capturada na abertura do modal).
  const masteredNow = correctIds.filter((id) => getStage(id) === 'dominado' && !masteredIds.includes(id)).length;

  if (finished) {
    return (
      <div className="practice-overlay">
        <div className="practice-modal">
          <div className="practice-head">
            <span className="badge"><Check size={14} /></span>
            <button className="icon-btn" onClick={onClose} aria-label="Fechar">✕</button>
          </div>
          <div className="practice-result">
            <img className="mascot mascot-lg" src="/assets/avatar-teaching.png" alt="" style={{ margin: '0 auto 10px' }} />
            <div className="big">{correct}/{queue.length}</div>
            <p>{t('Respostas certas.', 'Правильных ответов.')} {masteredNow} {t('palavras agora dominadas.', 'слов теперь освоено.')}</p>
            <button className="sr-btn know" style={{ width: '100%' }} onClick={onClose}>
              {t('Fechar', 'Закрыть')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const step = queue[index];

  const advance = (wasCorrect: boolean) => {
    onAttempt(step.hotspot.id, step.kind, wasCorrect);
    if (wasCorrect) {
      setCorrect((c) => c + 1);
      setCorrectIds((ids) => [...ids, step.hotspot.id]);
      onCorrect(step.hotspot.id);
    }
    setTimeout(() => setIndex((i) => i + 1), 900);
  };

  return (
    <div className="practice-overlay">
      <div className="practice-modal">
        <div className="practice-head">
          <span className="badge">{index + 1}/{queue.length}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        {step.kind === 'choice' ? (
          <ChoiceStep scene={scene} hotspot={step.hotspot} lang={lang} onAnswer={advance} />
        ) : (
          <OrderStep hotspot={step.hotspot} lang={lang} onAnswer={advance} />
        )}
      </div>
    </div>
  );
}

function ChoiceStep({
  scene, hotspot, lang, onAnswer,
}: { scene: Scene; hotspot: Hotspot; lang: string; onAnswer: (ok: boolean) => void }) {
  const options = useMemo(() => {
    const others = scene.hotspots.filter((o) => o.id !== hotspot.id).map((o) => o.ru);
    const distractors = shuffle(others).slice(0, 2);
    return shuffle([hotspot.ru, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspot.id]);
  const [answered, setAnswered] = useState<string | null>(null);

  return (
    <div>
      <p style={{ fontWeight: 700 }}>
        {lang === 'ru' ? `Как сказать «${hotspot.pt}» по-русски?` : `Como se diz "${hotspot.pt}" em russo?`}
      </p>
      <div className="options">
        {options.map((opt) => {
          const isCorrect = opt === hotspot.ru;
          const cls = ['option', answered ? (isCorrect ? 'correct' : answered === opt ? 'wrong' : '') : '']
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={opt}
              className={cls}
              disabled={Boolean(answered)}
              onClick={() => {
                setAnswered(opt);
                onAnswer(isCorrect);
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OrderStep({
  hotspot, lang, onAnswer,
}: { hotspot: Hotspot; lang: string; onAnswer: (ok: boolean) => void }) {
  const sentence = (lang === 'ru' ? hotspot.exampleRu : hotspot.examplePt).replace(/[.!?]/g, '').trim();
  const words = useMemo(() => shuffle(sentence.split(' ')), [sentence]);
  const [used, setUsed] = useState<boolean[]>(() => words.map(() => false));
  const [build, setBuild] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'ok' | 'wrong' | null>(null);
  const [locked, setLocked] = useState(false);

  const pick = (i: number) => {
    if (used[i] || locked) return;
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
    const ok = build.join(' ') === sentence;
    if (ok) {
      setFeedback('ok');
      setLocked(true);
      onAnswer(true);
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div>
      <p>{lang === 'ru' ? 'Собери фразу правильно:' : 'Monte a frase corretamente:'}</p>
      <div className="chip-row">
        {words.map((w, i) => (
          <button key={i} className={'chip' + (used[i] ? ' used' : '')} style={used[i] ? { opacity: 0.35 } : undefined} onClick={() => pick(i)}>
            {w}
          </button>
        ))}
      </div>
      <div className="build-strip">
        {build.map((w, i) => (
          <span className="chip" key={i}>{w}</span>
        ))}
      </div>
      <div className="sr-actions">
        <button className="sr-btn" onClick={reset}>{lang === 'ru' ? 'Сброс' : 'Reiniciar'}</button>
        <button className="sr-btn know" onClick={check}>{lang === 'ru' ? 'Проверить' : 'Verificar'}</button>
      </div>
      {feedback && (
        <div className="feedback" style={{ color: feedback === 'ok' ? 'var(--green)' : 'var(--red)' }}>
          {feedback === 'ok'
            ? (lang === 'ru' ? 'Верно!' : 'Certo!')
            : (lang === 'ru' ? 'Ещё нет... попробуй снова.' : 'Ainda não, tenta de novo.')}
        </div>
      )}
    </div>
  );
}
