import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Search, BarChart3, Globe2, Target, Check, Link2, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { STAGE_LABELS, STAGE_KEYS, REVIEW_INTERVAL_DAYS, type StageKey, type ItemProgress } from '../../domain/progress';
import { getLexicalKnowledgeNode, getRelatedOccurrences, getVerbKnowledgeNode } from '../../lib/semanticGraph';
import { audioAssets } from '../../lib/audioAssets';
import { AudioButton } from '../../components/AudioButton';
import type { Hotspot, Scene } from '../../types';
import { PracticeButton } from '../../components/practice/PracticeButton';

const catLabels: Record<string, { pt: string; ru: string }> = {
  objeto: { pt: 'Objetos', ru: 'Предметы' },
  alimento: { pt: 'Alimentos', ru: 'Еда' },
  movel: { pt: 'Móveis', ru: 'Мебель' },
  decoracao: { pt: 'Decoração', ru: 'Декор' },
  eletro: { pt: 'Eletro', ru: 'Техника' },
  infraestrutura: { pt: 'Estrutura', ru: 'Инфраструктура' },
  utensilio: { pt: 'Utensílios', ru: 'Утварь' },
  veiculo: { pt: 'Veículos', ru: 'Транспорт' },
};

type Tab = 'detalhe' | 'progresso' | 'cultura';

interface Props {
  scene: Scene;
  selected: Hotspot | null;
  stage: StageKey;
  stageInfo: ItemProgress | null;
  reviewedCount: number;
  masteredCount: number;
  reviewedIds: Set<string>;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onPracticeClick: () => void;
  onJumpTo: (sceneId: string, hotspotId: string) => void;
}

function formatNextReview(nextReviewDate: string | null, lang: 'pt' | 'ru'): string {
  if (!nextReviewDate) return '';
  const today = new Date().toISOString().slice(0, 10);
  if (nextReviewDate <= today) {
    return lang === 'ru' ? 'Повторение доступно сегодня' : 'Revisão disponível hoje';
  }
  const diffDays = Math.round(
    (new Date(nextReviewDate + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000
  );
  if (lang === 'ru') {
    return `Следующее повторение через ${diffDays} дн.`;
  }
  return diffDays === 1 ? 'Próxima revisão amanhã' : `Próxima revisão em ${diffDays} dias`;
}

function LearningTimeline({ stage, stageInfo, lang }: { stage: StageKey; stageInfo: ItemProgress | null; lang: 'pt' | 'ru' }) {
  const currentIndex = STAGE_KEYS.indexOf(stage);
  return (
    <div className="learning-timeline">
      <div className="timeline-title">{lang === 'ru' ? 'Хронология изучения' : 'Timeline de aprendizagem'}</div>
      <div className="timeline-track">
        {STAGE_KEYS.map((key, i) => {
          const done = i <= currentIndex;
          const label = STAGE_LABELS[key];
          return (
            <div className={'timeline-step' + (done ? ' done' : '')} key={key}>
              <span className="timeline-dot">{done ? <Check size={11} strokeWidth={3} /> : null}</span>
              <span className="timeline-label">{lang === 'ru' ? label.ru : label.pt}</span>
            </div>
          );
        })}
      </div>
      {stageInfo && stageInfo.nextReviewDate && stage !== 'dominado' && (
        <div className="timeline-next">{formatNextReview(stageInfo.nextReviewDate, lang)}</div>
      )}
      {stage === 'dominado' && (
        <div className="timeline-next timeline-next-mastered">
          {lang === 'ru' ? 'Освоено — следующее повторение через 30 дн.' : `Dominado — próxima revisão em ${REVIEW_INTERVAL_DAYS[6]} dias`}
        </div>
      )}
    </div>
  );
}

export function InfoPanel({
  scene, selected, stage, stageInfo, reviewedCount, masteredCount, reviewedIds, activeTab, onTabChange, onPracticeClick, onJumpTo,
}: Props) {
  const { t, lang } = useLanguage();
  const total = scene.hotspots.length;
  const exploredFrac = total ? reviewedCount / total : 0;
  const masteredFrac = total ? masteredCount / total : 0;
  const canPractice = reviewedCount >= 3;
  const stageLabel = STAGE_LABELS[stage];

  const cats = Array.from(new Set(scene.hotspots.map((h) => h.cat || 'objeto')));
  const related = selected ? getRelatedOccurrences(scene.id, selected.id) : [];
  const lexicalNode = selected ? getLexicalKnowledgeNode(selected.pt) : null;

  return (
    <div className="scenario-info">
      <div className="info-tabs">
        <button className={'info-tab-btn' + (activeTab === 'detalhe' ? ' active' : '')} onClick={() => onTabChange('detalhe')}><Search size={13} /> {t('Detalhe', 'Детали')}</button>
        <button className={'info-tab-btn' + (activeTab === 'progresso' ? ' active' : '')} onClick={() => onTabChange('progresso')}><BarChart3 size={13} /> {t('Progresso', 'Прогресс')}</button>
        <button className={'info-tab-btn' + (activeTab === 'cultura' ? ' active' : '')} onClick={() => onTabChange('cultura')}><Globe2 size={13} /> {t('Cultura', 'Культура')}</button>
      </div>

      {activeTab === 'detalhe' && (
        <div>
          {!selected && (
            <div className="empty mascot-row center">
              <img className="mascot mascot-md" src="/assets/avatar-thinking.png" alt="" />
              <div>
                {t(
                  'Clique em um dos círculos verdes na imagem para descobrir o nome do item — em português e em russo.',
                  'Нажми на один из зелёных кружков на изображении, чтобы узнать название предмета — на португальском и на русском.'
                )}
              </div>
            </div>
          )}
          {selected && (
            <div>
              <div className="cat-chip">
                {(lang === 'ru' ? 'Существительное · ' : 'Substantivo · ') + (lang === 'ru' ? scene.labelRu : scene.labelPt)}
              </div>
              <div className="term-audio-row">
                <h3>{selected.pt}</h3>
                <AudioButton src={audioAssets.word(selected.lexicalItemId)} label={selected.pt} />
              </div>
              <div className="ru-term">{selected.ru}</div>
              <div className="meta-row">
                <span className="meta-chip">{(lang === 'ru' ? 'род: ' : 'gênero: ') + selected.gender}</span>
                <span className="meta-chip">{(lang === 'ru' ? 'мн. число: ' : 'plural: ') + selected.plural}</span>
                <span className="meta-chip stage-chip">{t(stageLabel.pt, stageLabel.ru)}</span>
              </div>
              {selected.func && (
                <div className="func-note">
                  <strong>{lang === 'ru' ? 'Для чего: ' : 'Serve para: '}</strong>
                  {lang === 'ru' ? selected.func.ru : selected.func.pt}
                </div>
              )}
              <div className="example-box">
                <div>
                  <p className="pt">{selected.examplePt}</p>
                  <p className="ru">{selected.exampleRu}</p>
                </div>
                <AudioButton src={audioAssets.example(selected.exampleId)} label={selected.examplePt} />
              </div>
              <LearningTimeline stage={stage} stageInfo={stageInfo} lang={lang} />
              <PracticeButton
                className="hotspot-practice-action"
                entityRef={{ type: 'scene-occurrence', id: `${scene.id}:${selected.id}` }}
              />
              <nav className="knowledge-actions" aria-label={t('Caminhos na base de conhecimento', 'Переходы в базе знаний')}>
                {lexicalNode && (
                  <Link to={lexicalNode.vocabularyHref}>
                    <BookOpen size={13} /> {t('Abrir no vocabulário', 'Открыть в словаре')} <ArrowRight size={12} />
                  </Link>
                )}
                <Link to={`/progresso?section=revisao&scene=${encodeURIComponent(scene.id)}&item=${encodeURIComponent(selected.id)}`}>
                  <RotateCcw size={13} /> {t('Revisar este item', 'Повторить этот элемент')} <ArrowRight size={12} />
                </Link>
              </nav>
              {related.length > 0 && (
                <div className="related-objects">
                  <div className="related-title"><Link2 size={12} /> {t('Objetos relacionados', 'Связанные предметы')}</div>
                  <div className="related-chips">
                    {related.map((r) => (
                      <button
                        key={r.sceneId + r.hotspotId}
                        className={'related-chip' + (r.relation === 'mesma_palavra' ? ' same-word' : '')}
                        onClick={() => onJumpTo(r.sceneId, r.hotspotId)}
                        title={r.relation === 'mesma_palavra'
                          ? t('Mesma palavra em outra cena', 'То же слово в другой сцене')
                          : t('Relacionado por função', 'Связано по функции')}
                      >
                        {lang === 'ru' ? r.ru : r.pt}
                        <small> · {lang === 'ru' ? r.sceneLabelRu : r.sceneLabelPt}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'progresso' && (
        <div>
          <div className="scenario-progress">
            <div className="prog-row">
              <span className="label">{t('Explorado', 'Изучено')}</span>
              <div className="bar"><span style={{ width: exploredFrac * 100 + '%' }} /></div>
              <small>{Math.round(exploredFrac * 100)}%</small>
            </div>
            <div className="prog-row">
              <span className="label">{t('Dominado', 'Освоено')}</span>
              <div className="bar mastered-bar"><span style={{ width: masteredFrac * 100 + '%' }} /></div>
              <small>{Math.round(masteredFrac * 100)}%</small>
            </div>
            <button className={'sr-btn know' + (canPractice ? '' : ' locked')} style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={onPracticeClick}>
              <Target size={15} /> {t('Praticar o que você viu (mín. 3)', 'Практика того, что ты видел (мин. 3)')}
            </button>
          </div>
          <div className="discovery-breakdown">
            <div className="disc-title">{t('Descoberta por categoria', 'Открытие по категориям')}</div>
            {cats.map((catKey) => {
              const items = scene.hotspots.filter((h) => (h.cat || 'objeto') === catKey);
              const done = items.filter((h) => reviewedIds.has(h.id)).length;
              const frac = items.length ? done / items.length : 0;
              const lbl = catLabels[catKey] || { pt: catKey, ru: catKey };
              return (
                <div className="disc-row" key={catKey}>
                  <span className="label">{lang === 'ru' ? lbl.ru : lbl.pt}</span>
                  <div className="bar"><span style={{ width: frac * 100 + '%' }} /></div>
                  <small>{Math.round(frac * 100)}%</small>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'cultura' && (
        <div className="culture-layer">
          {scene.verbs.length > 0 && (
            <div className="culture-block">
              <h4>{t('Verbos úteis', 'Полезные глаголы')}</h4>
              {scene.verbs.map((v) => {
                const verbNode = getVerbKnowledgeNode(v.pt);
                return <div className="culture-item audio-item knowledge-culture-item" key={v.id}>
                  <div>
                    {verbNode ? (
                      <Link to={verbNode.conjugatorHref}>
                        {lang === 'ru' ? v.ru : v.pt} <ArrowRight size={12} />
                      </Link>
                    ) : (lang === 'ru' ? v.ru : v.pt)}
                    <div className="ru-small">{lang === 'ru' ? v.pt : v.ru}</div>
                  </div>
                  <AudioButton src={audioAssets.sceneVerb(v.pt)} label={v.pt} />
                </div>;
              })}
            </div>
          )}
          {scene.phrases.length > 0 && (
            <div className="culture-block">
              <h4>{t('Frases úteis', 'Полезные фразы')}</h4>
              {scene.phrases.map((p) => (
                <div className="culture-item audio-item" key={p.id}>
                  <div>
                    {lang === 'ru' ? p.ru : p.pt}
                    <div className="ru-small">{lang === 'ru' ? p.pt : p.ru}</div>
                  </div>
                  <AudioButton src={audioAssets.scenePhrase(p.id)} label={p.pt} />
                </div>
              ))}
            </div>
          )}
          {scene.culture.length > 0 && (
            <div className="culture-block">
              <h4>{t('Cultura', 'Культура')}</h4>
              {scene.culture.map((c, i) => (
                <div className="culture-note" key={i}>{lang === 'ru' ? c.ru : c.pt}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
