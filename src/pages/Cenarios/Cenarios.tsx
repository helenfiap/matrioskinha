import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sofa, ChefHat, BedDouble, Bath, WashingMachine, ShoppingCart, Pill, Bus, Star, Flag, ArrowRight, X, PartyPopper, CheckCircle2, House, Store, Heart, Map, Clock3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useProgress } from '../../context/ProgressContext';
import { scenes } from '../../data/scenarios';
import { getMission } from '../../data/missions';
import type { Hotspot } from '../../types';
import { useSceneProgress } from './useSceneProgress';
import { SceneStage } from './SceneStage';
import { InfoPanel } from './InfoPanel';
import { PracticeModal } from './PracticeModal';
import { useLearning } from '../../context/LearningContext';
import { contentRepository } from '../../repositories/contentRepository';
import { getCollectionForScene, scenarioCollections } from '../../data/scenarioCollections';
import { AtelieEmocoes } from './AtelieEmocoes';

const sceneIcons: Record<string, ComponentType<{ size?: number }>> = {
  sala: Sofa,
  cozinha: ChefHat,
  quarto: BedDouble,
  banheiro: Bath,
  lavanderia: WashingMachine,
  supermercado: ShoppingCart,
  farmacia: Pill,
  transporte: Bus,
};

const collectionIcons: Record<string, ComponentType<{ size?: number }>> = {
  house: House,
  'city-services': Store,
  mobility: Bus,
  emotions: Heart,
  brazil: Map,
};

export function Cenarios() {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCollection = scenarioCollections.find((collection) => collection.id === searchParams.get('collection'));
  const requestedMoodId = searchParams.get('mood') ?? undefined;
  const initialSceneId = scenes.some((s) => s.id === searchParams.get('scene'))
    ? (searchParams.get('scene') as string)
    : requestedCollection?.sceneIds[0] ?? scenes[0].id;
  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);
  const [activeCollectionId, setActiveCollectionId] = useState(requestedCollection?.id ?? getCollectionForScene(initialSceneId).id);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeTab, setActiveTab] = useState<'detalhe' | 'progresso' | 'cultura'>('detalhe');
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceKey, setPracticeKey] = useState(0);
  const [missionActive, setMissionActive] = useState(false);
  const [missionStep, setMissionStep] = useState(0);
  const [missionDone, setMissionDone] = useState(false);
  // true só quando o alvo da missão foi clicado DEPOIS do passo atual ter começado —
  // evita liberar "próximo passo" só porque o item já tinha sido visto antes da missão.
  const [missionInteractedThisStep, setMissionInteractedThisStep] = useState(false);

  const { reviewed, mastered, markReviewed, advanceReview, getStage, getStageInfo, counts } = useSceneProgress();
  const { missionsDone, markMissionDone, settings } = useProgress();
  const { recordAttempt } = useLearning();

  const scene = scenes.find((s) => s.id === currentSceneId)!;
  const mission = getMission(scene.id);
  const activeCollection = scenarioCollections.find((collection) => collection.id === activeCollectionId)
    ?? getCollectionForScene(currentSceneId);
  const visibleScenes = scenes.filter((candidate) => activeCollection.sceneIds.includes(candidate.id));
  const isEmotionAtelier = activeCollection.kind === 'emotion-atelier';

  useEffect(() => {
    const sceneParam = searchParams.get('scene');
    const hotspotParam = searchParams.get('hotspot');
    const collectionParam = searchParams.get('collection');
    const targetCollection = scenarioCollections.find((collection) => collection.id === collectionParam);
    if (targetCollection && targetCollection.status !== 'planned') {
      setActiveCollectionId(targetCollection.id);
      if (targetCollection.sceneIds[0]) setCurrentSceneId(targetCollection.sceneIds[0]);
    }
    if (sceneParam) {
      const targetScene = scenes.find((s) => s.id === sceneParam);
      if (targetScene) {
        setCurrentSceneId(sceneParam);
        setActiveCollectionId(getCollectionForScene(sceneParam).id);
        setSelectedHotspot(null);
        setActiveTab('detalhe');
      }
      if (targetScene && hotspotParam) {
      const targetHotspot = targetScene?.hotspots.find((h) => h.id === hotspotParam);
      if (targetHotspot) {
        markReviewed(sceneParam, hotspotParam);
        setSelectedHotspot(targetHotspot);
      }
      }
    }
    if (sceneParam || hotspotParam || collectionParam || searchParams.get('mood')) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectScene = (id: string) => {
    setActiveCollectionId(getCollectionForScene(id).id);
    setCurrentSceneId(id);
    setSelectedHotspot(null);
    setActiveTab('detalhe');
    setPracticeOpen(false);
    setMissionActive(false);
    setMissionDone(false);
  };

  const selectCollection = (collectionId: string) => {
    const collection = scenarioCollections.find((candidate) => candidate.id === collectionId);
    if (!collection || collection.status === 'planned') return;
    setActiveCollectionId(collection.id);
    setSelectedHotspot(null);
    setActiveTab('detalhe');
    setPracticeOpen(false);
    setMissionActive(false);
    setMissionDone(false);
    if (collection.sceneIds[0]) setCurrentSceneId(collection.sceneIds[0]);
  };

  const selectHotspot = (h: Hotspot) => {
    setSelectedHotspot(h);
    markReviewed(scene.id, h.id);
    setActiveTab('detalhe');
    if (missionActive && mission && h.id === mission.steps[missionStep]) {
      setMissionInteractedThisStep(true);
    }
  };

  const jumpToOccurrence = (targetSceneId: string, targetHotspotId: string) => {
    const targetScene = scenes.find((s) => s.id === targetSceneId);
    const targetHotspot = targetScene?.hotspots.find((h) => h.id === targetHotspotId);
    if (!targetScene || !targetHotspot) return;
    setMissionActive(false);
    setMissionDone(false);
    setCurrentSceneId(targetSceneId);
    setActiveCollectionId(getCollectionForScene(targetSceneId).id);
    setSelectedHotspot(targetHotspot);
    markReviewed(targetSceneId, targetHotspotId);
    setActiveTab('detalhe');
  };

  const startMission = () => {
    setMissionActive(true);
    setMissionDone(false);
    setMissionStep(0);
    setMissionInteractedThisStep(false);
    setSelectedHotspot(null);
    setActiveTab('detalhe');
  };

  const exitMission = () => {
    setMissionActive(false);
    setMissionDone(false);
  };

  const missionTargetId = missionActive && mission ? mission.steps[missionStep] : null;

  const advanceMission = () => {
    if (!mission) return;
    if (missionStep + 1 >= mission.steps.length) {
      setMissionDone(true);
      setMissionActive(false);
      markMissionDone(scene.id);
    } else {
      setMissionStep((s) => s + 1);
      setMissionInteractedThisStep(false);
      setSelectedHotspot(null);
    }
  };

  const selectedStage = selectedHotspot ? getStage(scene.id, selectedHotspot.id) : 'novo';
  const selectedStageInfo = selectedHotspot ? getStageInfo(scene.id, selectedHotspot.id) : null;
  const missionAlreadyDone = mission ? Boolean(missionsDone[scene.id]) : false;

  return (
    <section className={`section scenarios-section scenario-theme-${activeCollection.id}`}>
      <div className="section-head">
        <div>
          <h2>{t(activeCollection.titlePt, activeCollection.titleRu)}</h2>
          <p>{t(activeCollection.descriptionPt, activeCollection.descriptionRu)}</p>
        </div>
        {!isEmotionAtelier && <div className="scene-level-badge">
          <span className="level-tag">{scene.level}</span>
          <span className="stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star key={i} size={13} fill={i < scene.difficulty ? 'currentColor' : 'none'} />
            ))}
          </span>
        </div>}
      </div>

      <nav className="scenario-collections" aria-label={t('Coleções de cenários', 'Коллекции сцен')}>
        {scenarioCollections.map((collection) => {
          const Icon = collectionIcons[collection.id] ?? House;
          const planned = collection.status === 'planned';
          return (
            <button
              key={collection.id}
              type="button"
              className={`collection-${collection.id} ${collection.id === activeCollection.id ? 'active' : ''}`}
              onClick={() => selectCollection(collection.id)}
              disabled={planned}
              title={planned ? t('Coleção planejada', 'Коллекция запланирована') : undefined}
            >
              <Icon size={16} />
              <span>{t(collection.titlePt, collection.titleRu)}</span>
              {collection.status === 'in-production' && <span className="collection-status"><Clock3 size={11} /> beta</span>}
              {planned && <span className="collection-status">{t('em breve', 'скоро')}</span>}
            </button>
          );
        })}
      </nav>

      {!isEmotionAtelier && <div className="scene-tabs">
        {visibleScenes.map((s) => {
          const Icon = sceneIcons[s.id] ?? Sofa;
          return (
            <button
              key={s.id}
              className={s.id === currentSceneId ? 'active' : ''}
              onClick={() => selectScene(s.id)}
            >
              <Icon size={15} /> <span>{t(s.labelPt, s.labelRu)}</span>
              <span className="level-chip">{s.level}</span>
              <span className="count">({counts[s.id].reviewed}/{counts[s.id].total})</span>
            </button>
          );
        })}
      </div>}

      {!isEmotionAtelier && mission && !missionActive && !missionDone && (
        <button className="mission-start-btn" onClick={startMission}>
          <Flag size={14} /> {t('Iniciar missão: ', 'Начать миссию: ')}{lang === 'ru' ? mission.titleRu : mission.titlePt}
          {missionAlreadyDone && <span className="mission-done-chip"><CheckCircle2 size={12} /> {t('concluída', 'выполнено')}</span>}
        </button>
      )}

      {!isEmotionAtelier && missionActive && mission && (
        <div className="mission-bar">
          <div className="mission-bar-head">
            <span className="mission-bar-title"><Flag size={13} /> {lang === 'ru' ? mission.titleRu : mission.titlePt}</span>
            <button className="icon-btn" onClick={exitMission} aria-label={t('Sair da missão', 'Выйти из миссии')}><X size={14} /></button>
          </div>
          <div className="mission-bar-progress">
            <div className="bar"><span style={{ width: ((missionStep) / mission.steps.length) * 100 + '%' }} /></div>
            <small>{missionStep + 1} / {mission.steps.length}</small>
          </div>
          <button className="sr-btn know mission-next-btn" disabled={!missionInteractedThisStep} onClick={advanceMission}>
            <ArrowRight size={14} /> {missionStep + 1 >= mission.steps.length
              ? t('Concluir missão', 'Завершить миссию')
              : t('Próximo passo', 'Следующий шаг')}
          </button>
        </div>
      )}

      {!isEmotionAtelier && missionDone && (
        <div className="mission-complete">
          <PartyPopper size={18} />
          {t('Missão concluída! Você encontrou todos os itens desta situação.', 'Миссия выполнена! Вы нашли все предметы этой ситуации.')}
        </div>
      )}

      {isEmotionAtelier ? <AtelieEmocoes initialMoodId={requestedMoodId} /> : <div className="scenario-wrap">
        <SceneStage
          scene={scene}
          getStage={getStage}
          activeId={selectedHotspot?.id ?? null}
          onSelect={selectHotspot}
          missionTargetId={missionActive ? missionTargetId : undefined}
        />
        <InfoPanel
          scene={scene}
          selected={selectedHotspot}
          stage={selectedStage}
          stageInfo={selectedStageInfo}
          reviewedCount={counts[scene.id].reviewed}
          masteredCount={counts[scene.id].mastered}
          reviewedIds={reviewed[scene.id] ?? new Set()}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onJumpTo={jumpToOccurrence}
          onPracticeClick={() => {
            if (counts[scene.id].reviewed >= 3) {
              setPracticeKey((k) => k + 1);
              setPracticeOpen(true);
            }
          }}
        />
        {practiceOpen && (
          <PracticeModal
            key={practiceKey}
            scene={scene}
            reviewedIds={Array.from(reviewed[scene.id] ?? [])}
            masteredIds={Array.from(mastered[scene.id] ?? [])}
            getStage={(hotspotId) => getStage(scene.id, hotspotId)}
            onCorrect={(hotspotId) => advanceReview(scene.id, hotspotId)}
            onAttempt={(hotspotId, kind, correct) => {
              const occurrence = contentRepository.getOccurrence(`${scene.id}:${hotspotId}`);
              if (occurrence) recordAttempt({
                itemId: occurrence.lexicalItemId, itemType: 'lexical-item',
                exerciseTemplateId: kind === 'choice' ? 'exercise-choice' : 'exercise-order',
                modality: kind === 'choice' ? 'reading' : 'writing', correct,
                usedSupportLanguage: settings.supportLang, durationMs: 0,
                errorCode: correct ? undefined : kind === 'choice' ? 'scene-choice' : 'scene-word-order',
              });
            }}
            onClose={() => setPracticeOpen(false)}
          />
        )}
      </div>}
    </section>
  );
}
