import { scenes } from '../data/scenarios';
import { curatedInfinitives, type VerbContext } from '../data/verbs';
import { vocabItems } from '../data/vocab';
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

export function normalizeKnowledgeTerm(pt: string): string {
  let s = pt.toLocaleLowerCase('pt-BR').trim().replace(/\s+/g, ' ');
  for (const article of ['os ', 'as ', 'o ', 'a ']) {
    if (s.startsWith(article)) {
      s = s.slice(article.length);
      break;
    }
  }
  return s;
}

function normalizeVerbTerm(pt: string): string {
  return pt.toLocaleLowerCase('pt-BR')
    .replace(/\s*\(([^)]*)\)/g, ' $1')
    .trim()
    .replace(/\s+/g, ' ');
}

export interface VerbKnowledgeNode {
  lemma: string;
  ru: string;
  conjugatorHref: string;
  contexts: Array<VerbContext & { href: string }>;
}

export interface LexicalKnowledgeOccurrence {
  sceneId: string;
  sceneLabelPt: string;
  sceneLabelRu: string;
  hotspotId: string;
  pt: string;
  ru: string;
  href: string;
}

export interface LexicalKnowledgeNode {
  pt: string;
  ru: string;
  vocabularyHref: string;
  occurrences: LexicalKnowledgeOccurrence[];
}

export function getVerbKnowledgeNode(text: string): VerbKnowledgeNode | null {
  const normalized = normalizeVerbTerm(text);
  const verb = curatedInfinitives.find((candidate) =>
    normalizeVerbTerm(candidate.pt) === normalized
    || candidate.relatedExpressions.some((expression) => normalizeVerbTerm(expression.pt) === normalized),
  );
  if (!verb) return null;
  return {
    lemma: verb.pt,
    ru: verb.ru,
    conjugatorHref: `/conjugador?q=${encodeURIComponent(verb.pt)}`,
    contexts: verb.contexts.map((context) => ({
      ...context,
      href: context.kind === 'scene'
        ? `/cenarios?scene=${encodeURIComponent(context.id)}`
        : `/cenarios?collection=emotions&mood=${encodeURIComponent(context.id)}`,
    })),
  };
}

export function getLexicalKnowledgeOccurrences(text: string): LexicalKnowledgeOccurrence[] {
  const lemma = normalizeKnowledgeTerm(text);
  return scenes.flatMap((scene) => scene.hotspots
    .filter((hotspot) => normalizeKnowledgeTerm(hotspot.pt) === lemma)
    .map((hotspot) => ({
      sceneId: scene.id,
      sceneLabelPt: scene.labelPt,
      sceneLabelRu: scene.labelRu,
      hotspotId: hotspot.id,
      pt: hotspot.pt,
      ru: hotspot.ru,
      href: `/cenarios?scene=${encodeURIComponent(scene.id)}&hotspot=${encodeURIComponent(hotspot.id)}`,
    })),
  );
}

export function getLexicalKnowledgeNode(text: string): LexicalKnowledgeNode | null {
  const lemma = normalizeKnowledgeTerm(text);
  const vocabulary = vocabItems.find((item) => normalizeKnowledgeTerm(item.pt) === lemma);
  if (!vocabulary) return null;
  return {
    pt: vocabulary.pt,
    ru: vocabulary.ru,
    vocabularyHref: `/vocab?item=${encodeURIComponent(vocabulary.lexicalItemId)}`,
    occurrences: getLexicalKnowledgeOccurrences(vocabulary.pt),
  };
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
    const lemma = normalizeKnowledgeTerm(hotspot.pt);
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

  const lemma = normalizeKnowledgeTerm(hotspot.pt);
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
