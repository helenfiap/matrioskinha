import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgress, STAGE_LABELS } from '../context/ProgressContext';
import { scenes } from '../data/scenarios';

function keyOf(sceneId: string, hotspotId: string) {
  return sceneId + ':' + hotspotId;
}

export function Progresso() {
  const { t, lang } = useLanguage();
  const { pendingReview, advanceReview, sceneCounts, streakDays } = useProgress();
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [justSkipped, setJustSkipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (searchParams.get('section') === 'revisao' && reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (searchParams.get('section')) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reviewItems = pendingReview.map(({ sceneId, hotspotId, stage }) => {
    const scene = scenes.find((s) => s.id === sceneId);
    const hotspot = scene?.hotspots.find((h) => h.id === hotspotId);
    return scene && hotspot ? { scene, hotspot, stage } : null;
  }).filter((x): x is { scene: (typeof scenes)[number]; hotspot: (typeof scenes)[number]['hotspots'][number]; stage: (typeof pendingReview)[number]['stage'] } => x !== null);

  const totalExplored = Object.values(sceneCounts).reduce((sum, c) => sum + c.reviewed, 0);
  const totalMastered = Object.values(sceneCounts).reduce((sum, c) => sum + c.mastered, 0);
  const totalItems = Object.values(sceneCounts).reduce((sum, c) => sum + c.total, 0);

  const reveal = (key: string) => setRevealed((prev) => new Set(prev).add(key));
  const collapse = (key: string) => setRevealed((prev) => {
    const next = new Set(prev);
    next.delete(key);
    return next;
  });

  const handleRemembered = (sceneId: string, hotspotId: string, key: string) => {
    advanceReview(sceneId, hotspotId);
    collapse(key);
  };

  const handleNotRemembered = (key: string) => {
    collapse(key);
    setJustSkipped((prev) => new Set(prev).add(key));
    setTimeout(() => setJustSkipped((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    }), 2500);
  };

  return (
    <>
      <section className="section" style={{ marginTop: 0 }}>
        <div className="progress-hero">
          <div className="section-head">
            <div>
              <h2>{t('Progresso', 'Прогресс')}</h2>
              <p>{t('Compreensão, produção, retenção e automatização — não só acertos.', 'Понимание, речь, запоминание и автоматизация — не только правильные ответы.')}</p>
            </div>
          </div>
        </div>
        <div className="mini-stats">
          <div className="stat-card"><div className="label">{t('Itens explorados', 'Изучено предметов')}</div><div className="value">{totalExplored} / {totalItems}</div></div>
          <div className="stat-card"><div className="label">{t('Itens dominados', 'Освоено предметов')}</div><div className="value">{totalMastered} / {totalItems}</div></div>
          <div className="stat-card"><div className="label">{t('Revisão pendente hoje', 'Ожидает повторения сегодня')}</div><div className="value">{pendingReview.length}</div></div>
          <div className="stat-card"><div className="label">{t('Sequência de estudo', 'Серия занятий')}</div><div className="value">{streakDays} {t('dias', 'дней')}</div></div>
        </div>
      </section>

      <section className="section" ref={reviewRef}>
        <div className="section-head">
          <div>
            <h2>{t('Fila de revisão', 'Очередь повторения')}</h2>
            <p>{t(
              'Itens com revisão espaçada agendada para hoje — novo → hoje → 1 → 3 → 7 → 14 → 30 dias. Para avançar de estágio, tente lembrar antes de ver a resposta.',
              'Слова с повторением, запланированным на сегодня — новое → сегодня → 1 → 3 → 7 → 14 → 30 дней. Чтобы перейти на следующий этап, попробуй вспомнить перед тем, как увидеть ответ.'
            )}</p>
          </div>
        </div>
        {reviewItems.length === 0 && (
          <div className="panel mascot-row center" style={{ color: 'var(--muted)' }}>
            <img className="mascot mascot-lg" src="/assets/avatar-sleeping.png" alt="" />
            <div>
              {t(
                'Nada pendente por aqui. Explore itens nos Cenários para começar a fila de revisão.',
                'Здесь пока пусто. Открывай предметы в Сценах, чтобы наполнить очередь повторения.'
              )}
            </div>
          </div>
        )}
        {reviewItems.length > 0 && (
          <div className="panel">
            {reviewItems.map(({ scene, hotspot, stage }) => {
              const stageLabel = STAGE_LABELS[stage];
              const key = keyOf(scene.id, hotspot.id);
              const isRevealed = revealed.has(key);
              const wasSkipped = justSkipped.has(key);
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '10px 0', borderBottom: '1px solid var(--line)', flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <strong>{hotspot.pt}</strong>
                    {isRevealed && <span style={{ color: 'var(--blue)', marginLeft: 8 }}>{hotspot.ru}</span>}
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>
                      {lang === 'ru' ? scene.labelRu : scene.labelPt}
                      {' · '}
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>{t(stageLabel.pt, stageLabel.ru)}</span>
                      {wasSkipped && (
                        <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                          {t('· continua na fila, tenta de novo mais tarde', '· остаётся в очереди, попробуй позже')}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isRevealed ? (
                    <button className="sr-btn" style={{ flex: '0 0 auto' }} onClick={() => reveal(key)}>
                      <Eye size={14} /> {t('Tentei lembrar — mostrar', 'Попробовал(а) вспомнить — показать')}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flex: '0 0 auto' }}>
                      <button className="sr-btn" onClick={() => handleNotRemembered(key)}>
                        <XCircle size={14} /> {t('Não lembrei', 'Не вспомнил(а)')}
                      </button>
                      <button className="sr-btn know" onClick={() => handleRemembered(scene.id, hotspot.id, key)}>
                        <CheckCircle2 size={14} /> {t('Lembrei', 'Вспомнил(а)')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>{t('Erros recorrentes', 'Повторяющиеся ошибки')} <span className="soon-chip">{t('exemplo', 'пример')}</span></h2>
            <p>{t(
              'Ainda não registramos tentativas erradas de verdade — esta tabela é um exemplo ilustrativo do que a análise de erros vai mostrar quando o histórico de tentativas existir.',
              'Мы пока не записываем реальные неправильные попытки — эта таблица лишь иллюстрирует то, что покажет анализ ошибок, когда появится история попыток.'
            )}</p>
          </div>
        </div>
        <div className="illustrative-note"><Info size={13} /> {t('Dados de exemplo, não derivados do seu uso real.', 'Примерные данные, не основанные на твоём реальном использовании.')}</div>
        <table className="grammar-table">
          <thead>
            <tr>
              <th>{t('Estrutura', 'Структура')}</th>
              <th>{t('Tipo de erro', 'Тип ошибки')}</th>
              <th>{t('Prioridade', 'Приоритет')}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Tu falas / tu fala</td><td>{t('Concordância verbal', 'Согласование глагола')}</td><td><strong>{t('Alta', 'Высокий')}</strong></td></tr>
            <tr><td>Contigo / com você</td><td>{t('Regência pronominal', 'Управление местоимением')}</td><td><strong>{t('Média', 'Средний')}</strong></td></tr>
            <tr><td>Nasalização de "ão"</td><td>{t('Percepção auditiva', 'Восприятие на слух')}</td><td><strong>{t('Média', 'Средний')}</strong></td></tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
