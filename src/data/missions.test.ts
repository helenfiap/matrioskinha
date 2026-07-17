import { describe, expect, it } from 'vitest';
import { scenes } from './scenarios';
import { getMission, missions } from './missions';

describe('missions', () => {
  it('mantem uma missao valida e completa para cada cena', () => {
    expect(missions).toHaveLength(scenes.length);

    scenes.forEach((scene) => {
      const mission = getMission(scene.id);
      const hotspotIds = new Set(scene.hotspots.map((hotspot) => hotspot.id));

      expect(mission).toBeDefined();
      expect(new Set(mission?.steps).size).toBe(mission?.steps.length);
      expect(mission?.steps.every((step) => hotspotIds.has(step))).toBe(true);
    });
  });

  it('nao inventa missao para uma cena desconhecida', () => {
    expect(getMission('desconhecida')).toBeUndefined();
  });
});
