import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useChallenge, type ChallengeKey } from './useChallenge';
import { ChoiceExercise } from './exercises/ChoiceExercise';
import { FlashExercise } from './exercises/FlashExercise';
import { OrderExercise } from './exercises/OrderExercise';
import { ListenExercise } from './exercises/ListenExercise';
import { RegistroExercise } from './exercises/RegistroExercise';
import { LessonPanel } from './LessonPanel';

const phases = [
  { pt: 'Primeiro contato', ru: 'Первый контакт', descPt: 'Apresentação, cumprimentos e frases de sobrevivência.', descRu: 'Знакомство, приветствия и базовые фразы.', count: 12 },
  { pt: 'Ouvir o Brasil', ru: 'Услышать Бразилию', descPt: 'Ritmo, nasalização, reduções e sotaques.', descRu: 'Ритм, носовые звуки, сокращения и акценты.', count: 18 },
  { pt: 'Tu × você', ru: 'Tu × você', descPt: 'Uso real, concordância e variação regional.', descRu: 'Реальное употребление, согласование и региональные различия.', count: 14 },
  { pt: 'Verbos essenciais', ru: 'Основные глаголы', descPt: 'Conjugação em contexto e micro-histórias.', descRu: 'Спряжение в контексте и микроистории.', count: 24 },
  { pt: 'Mundo visual', ru: 'Визуальный мир', descPt: 'Casa, comida, cidade, animais e objetos.', descRu: 'Дом, еда, город, животные и предметы.', count: 36 },
  { pt: 'História da língua', ru: 'История языка', descPt: 'Origem, mudança, Brasil e Portugal.', descRu: 'Происхождение, изменения, Бразилия и Португалия.', count: 10 },
  { pt: 'Português social', ru: 'Социальный португальский', descPt: 'Intenção, afeto, ironia e expressões.', descRu: 'Намерение, эмоции, ирония и выражения.', count: 20 },
  { pt: 'Conversação profunda', ru: 'Глубокая беседа', descPt: 'Opinião, ciência, história e cultura.', descRu: 'Мнения, наука, история и культура.', count: 16 },
];

const tabs: Array<{ key: ChallengeKey; pt: string; ru: string }> = [
  { key: 'choice', pt: 'Escolha contextual', ru: 'Выбор по контексту' },
  { key: 'flash', pt: 'Flashcard visual', ru: 'Визуальная карточка' },
  { key: 'order', pt: 'Ordenar frase', ru: 'Собрать фразу' },
  { key: 'listen', pt: 'Compreensão oral', ru: 'Аудирование' },
  { key: 'registro', pt: 'Classificar registro', ru: 'Определить регистр' },
];

const isChallengeKey = (v: string): v is ChallengeKey =>
  ['choice', 'flash', 'order', 'listen', 'registro'].includes(v);

export function Trilha() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ChallengeKey>(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && isChallengeKey(tabParam) ? tabParam : 'choice';
  });
  const [activePhase, setActivePhase] = useState(2);
  const { items, markComplete, done, total, frac } = useChallenge();
  const lessonRef = useRef<HTMLDivElement>(null);
  const exercisesRef = useRef<HTMLDivElement>(null);
  const verboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = searchParams.get('section');
    const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      'aula-completa': lessonRef,
      'banco-exercicios': exercisesRef,
      'verbo-contexto': verboRef,
    };
    if (section && sectionRefs[section]?.current) {
      sectionRefs[section].current!.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (searchParams.get('tab') || searchParams.get('section')) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="section">
        <div className="section-head">
          <div>
            <h2>{t('Trilha pedagógica', 'Учебная траектория')}</h2>
            <p>{t('Oito fases com objetivos, prática e contexto brasileiro.', 'Восемь этапов с целями, практикой и бразильским контекстом.')}</p>
          </div>
        </div>
        <div className="phase-grid">
          {phases.map((p, i) => (
            <article
              className={'phase' + (i === activePhase ? ' active' : '')}
              key={p.pt}
              onClick={() => setActivePhase(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActivePhase(i); }}
            >
              <div className="phase-no">{String(i + 1).padStart(2, '0')}</div>
              <h3>{t(p.pt, p.ru)}</h3>
              <p>{t(p.descPt, p.descRu)}</p>
              <small>{p.count} {t('atividades', 'заданий')}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section workspace" ref={exercisesRef}>
        <div className="panel">
          <h3>{t('Banco de exercícios', 'Банк упражнений')}</h3>
          <div className="panel-sub">
            {t(
              'Exercícios fictícios gerados para retomar exatamente de onde Demetrio parou — Fase 3, tu × você.',
              'Демонстрационные упражнения, созданные, чтобы продолжить ровно с того места, где остановился Деметрио — Этап 3, tu × você.'
            )}
          </div>

          <div className="challenge-progress">
            <div className="bar"><div className="challenge-bar-fill" style={{ width: frac * 100 + '%' }} /></div>
            <div className="meta">
              <span>{t('Progresso desta sessão', 'Прогресс сессии')}</span>
              <span>{done} / {total}</span>
            </div>
          </div>

          <div className="exercise-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={(activeTab === tab.key ? 'active' : '') + (items[tab.key] ? ' done' : '')}
                onClick={() => setActiveTab(tab.key)}
              >
                {t(tab.pt, tab.ru)}
              </button>
            ))}
          </div>

          {activeTab === 'choice' && <ChoiceExercise onCorrect={() => markComplete('choice')} />}
          {activeTab === 'flash' && <FlashExercise onCorrect={() => markComplete('flash')} />}
          {activeTab === 'order' && <OrderExercise onCorrect={() => markComplete('order')} />}
          {activeTab === 'listen' && <ListenExercise onCorrect={() => markComplete('listen')} />}
          {activeTab === 'registro' && <RegistroExercise onCorrect={() => markComplete('registro')} />}
        </div>

        <aside className="context-card">
          <div className="context-label">{t('Contexto de uso', 'Контекст употребления')}</div>
          <h3>{t('Como isso aparece no Brasil?', 'Как это звучит в Бразилии?')}</h3>
          <p>
            {t(
              'O aluno não aprende apenas a frase. Ele aprende ',
              'Ученик изучает не только перевод. Он изучает '
            )}
            <strong>{t('onde', 'где')}</strong>{t(', ', ', ')}
            <strong>{t('com quem', 'с кем')}</strong>{t(' e ', ' и ')}
            <strong>{t('em qual registro', 'в каком регистре')}</strong>
            {t(' usá-la.', ' её использовать.')}
          </p>
          <ul>
            <li><strong>{t('Formal:', 'Формально:')}</strong> "Como o senhor está?"</li>
            <li><strong>{t('Neutro:', 'Нейтрально:')}</strong> "Tudo bem?"</li>
            <li><strong>{t('Informal:', 'Неформально:')}</strong> "E aí, tudo certo?"</li>
            <li><strong>{t('Regional:', 'Регионально:')}</strong> {t('variações de tu, você e reduções.', 'варианты tu, você и разговорные сокращения.')}</li>
          </ul>
        </aside>
      </section>

      <section className="section workspace" ref={verboRef}>
        <div className="panel">
          <h3>{t('Verbo em contexto', 'Глагол в контексте')}</h3>
          <div className="panel-sub">{t('Conjugação reduzida ao que é funcional no estágio atual.', 'Только те формы спряжения, которые действительно нужны на текущем этапе.')}</div>
          <table className="grammar-table">
            <thead><tr><th>{t('Pessoa', 'Лицо')}</th><th>Falar</th><th>{t('Exemplo real', 'Реальный пример')}</th></tr></thead>
            <tbody>
              <tr><td>eu</td><td><strong>falo</strong></td><td>Eu falo russo.</td></tr>
              <tr><td>tu</td><td><strong>falas / fala</strong></td><td>Tu falas português? · Tu fala português?</td></tr>
              <tr><td>você</td><td><strong>fala</strong></td><td>Você fala português?</td></tr>
              <tr><td>nós</td><td><strong>falamos</strong></td><td>Nós falamos todo dia.</td></tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>{t('Micro-história', 'Микроистория')}</h3>
          <div className="panel-sub">{t('Transformar tabela em memória procedural.', 'Превратить таблицу в автоматический навык.')}</div>
          <div className="bubble">
            <strong>Demetrio mora no Brasil.</strong> Ele fala russo e inglês. Agora ele estuda português. Helen fala com ele todos os dias. Às vezes, ela pergunta: "Tu entendeu?".
          </div>
          <div className="translation" style={{ marginTop: 12 }}>Деметрио живёт в Бразилии. Он говорит по-русски и по-английски. Теперь он изучает португальский.</div>
        </div>
      </section>

      <section className="section" ref={lessonRef}>
        <div className="section-head">
          <div>
            <h2>{t('Aula completa · Tu × você', 'Полный урок · Tu × você')}</h2>
            <p>{t('Material 100% bilíngue: conjugação, pronomes, exemplos e variação regional.', 'Полностью двуязычный материал: спряжение, местоимения, примеры и региональные варианты.')}</p>
          </div>
        </div>
        <LessonPanel />
      </section>
    </>
  );
}
