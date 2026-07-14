import { scenes } from '../data/scenarios';
import type { Hotspot } from '../types';

export type RelationKind = 'mesma_palavra' | 'relacionado';

export interface GraphOccurrence {
  sceneId: string;
  sceneLabelPt: string;
  sceneLabelRu: string;
  hotspotId: string;
  pt: string;
  ru: string;
  relation: RelationKind;
}

function normalizeLemma(pt: string): string {
  let s = pt.toLowerCase().trim();
  for (const article of ['os ', 'as ', 'o ', 'a ']) {
    if (s.startsWith(article)) {
      s = s.slice(article.length);
      break;
    }
  }
  return s;
}

interface Occurrence {
  sceneId: string;
  hotspot: Hotspot;
}

// index: lemma -> every occurrence of that word across all 8 scenes.
// This is built automatically from existing content — no extra authoring
// needed: any two hotspots that happen to share the same pt lemma (e.g.
// "a toalha" in banheiro and "a toalha" em lavanderia) become graph edges.
const lemmaIndex = new Map<string, Occurrence[]>();
scenes.forEach((scene) => {
  scene.hotspots.forEach((hotspot) => {
    const lemma = normalizeLemma(hotspot.pt);
    const list = lemmaIndex.get(lemma) ?? [];
    list.push({ sceneId: scene.id, hotspot });
    lemmaIndex.set(lemma, list);
  });
});

function sceneById(sceneId: string) {
  return scenes.find((s) => s.id === sceneId);
}

function toOccurrence(sceneId: string, hotspot: Hotspot, relation: RelationKind): GraphOccurrence | null {
  const scene = sceneById(sceneId);
  if (!scene) return null;
  return {
    sceneId,
    sceneLabelPt: scene.labelPt,
    sceneLabelRu: scene.labelRu,
    hotspotId: hotspot.id,
    pt: hotspot.pt,
    ru: hotspot.ru,
    relation,
  };
}

/**
 * Retorna as ocorrências relacionadas a um hotspot: outras aparições da
 * mesma palavra em cenas diferentes (aresta automática) e relações
 * curadas por função/uso via `relatedIds` (aresta manual, mesma cena).
 * Este é o "primórdio" do grafo semântico — nós = ocorrências de hotspot,
 * arestas = mesma palavra ou relação de função curada.
 */
export function getRelatedOccurrences(sceneId: string, hotspotId: string): GraphOccurrence[] {
  const scene = sceneById(sceneId);
  const hotspot = scene?.hotspots.find((h) => h.id === hotspotId);
  if (!scene || !hotspot) return [];

  const result: GraphOccurrence[] = [];
  const seen = new Set<string>([sceneId + ':' + hotspotId]);

  const lemma = normalizeLemma(hotspot.pt);
  const sameWord = lemmaIndex.get(lemma) ?? [];
  sameWord.forEach((occ) => {
    const key = occ.sceneId + ':' + occ.hotspot.id;
    if (seen.has(key)) return;
    seen.add(key);
    const g = toOccurrence(occ.sceneId, occ.hotspot, 'mesma_palavra');
    if (g) result.push(g);
  });

  (hotspot.relatedIds ?? []).forEach((relatedId) => {
    const key = sceneId + ':' + relatedId;
    if (seen.has(key)) return;
    const relatedHotspot = scene.hotspots.find((h) => h.id === relatedId);
    if (!relatedHotspot) return;
    seen.add(key);
    const g = toOccurrence(sceneId, relatedHotspot, 'relacionado');
    if (g) result.push(g);
  });

  return result;
}

/** Número total de arestas "mesma palavra" no grafo — útil para diagnósticos/debug. */
export function countSameWordEdges(): number {
  let total = 0;
  lemmaIndex.forEach((occs) => {
    if (occs.length > 1) total += occs.length;
  });
  return total;
}
