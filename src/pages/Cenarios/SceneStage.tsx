import { Plus, Eye, Check, CheckCheck, Star } from 'lucide-react';
import type { Scene, Hotspot } from '../../types';
import type { StageKey } from '../../domain/progress';

interface Props {
  scene: Scene;
  getStage: (sceneId: string, hotspotId: string) => StageKey;
  activeId: string | null;
  onSelect: (h: Hotspot) => void;
  missionTargetId?: string | null;
}

const stageIcon: Record<StageKey, typeof Plus> = {
  novo: Plus,
  explorado: Eye,
  reconhecido: Check,
  praticado: Check,
  revisado: CheckCheck,
  dominado: Star,
};

export function SceneStage({ scene, getStage, activeId, onSelect, missionTargetId }: Props) {
  const missionMode = missionTargetId !== undefined && missionTargetId !== null;
  return (
    <div className="scenario-stage">
      <img src={scene.img} alt={'Cenário: ' + scene.id} />
      {scene.hotspots.map((h) => {
        if (missionMode && h.id !== missionTargetId) return null;
        const stage = getStage(scene.id, h.id);
        const isMissionTarget = missionMode && h.id === missionTargetId;
        const cls = ['hotspot', 'stage-' + stage, activeId === h.id ? 'active' : '', isMissionTarget ? 'mission-target' : '']
          .filter(Boolean)
          .join(' ');
        const Icon = isMissionTarget ? Plus : stageIcon[stage];
        return (
          <button
            key={h.id}
            className={cls}
            style={{ left: h.x + '%', top: h.y + '%' }}
            aria-label={h.pt}
            onClick={() => onSelect(h)}
          >
            <Icon size={14} strokeWidth={3} />
          </button>
        );
      })}
    </div>
  );
}
