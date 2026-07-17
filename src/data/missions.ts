import { contentRepository, type LegacyMission } from '../repositories/contentRepository';

export type Mission = LegacyMission;
export const missions = contentRepository.listLegacyMissions();
export function getMission(sceneId: string): Mission | undefined {
  return missions.find((mission) => mission.sceneId === sceneId);
}
