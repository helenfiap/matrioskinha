import type { HotspotState } from '../../types';
import { useProgress } from '../../context/ProgressContext';

export function useSceneProgress() {
  const {
    reviewed, mastered, markReviewed, markMastered, advanceReview, getStage, getStageInfo, sceneCounts,
  } = useProgress();

  const getState = (sceneId: string, hotspotId: string): HotspotState => {
    if (mastered[sceneId]?.has(hotspotId)) return 'mastered';
    if (reviewed[sceneId]?.has(hotspotId)) return 'explored';
    return 'new';
  };

  return {
    reviewed, mastered, markReviewed, markMastered, advanceReview, getStage, getStageInfo, getState,
    counts: sceneCounts,
  };
}
