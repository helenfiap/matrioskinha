export type Lang = 'pt' | 'ru';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  cat?: string;
  func?: { pt: string; ru: string };
  relatedIds?: string[];
  pt: string;
  ru: string;
  gender: string;
  plural: string;
  examplePt: string;
  exampleRu: string;
}

export interface VerbPhrase {
  pt: string;
  ru: string;
}

export interface CultureNote {
  pt: string;
  ru: string;
}

export interface Scene {
  id: string;
  img: string;
  labelPt: string;
  labelRu: string;
  icon: string;
  level: string;
  difficulty: number;
  hotspots: Hotspot[];
  verbs: VerbPhrase[];
  phrases: VerbPhrase[];
  culture: CultureNote[];
}

export type HotspotState = 'new' | 'explored' | 'mastered';

export interface ConjPerson {
  key: 'eu' | 'tu' | 'voce' | 'nos' | 'vos' | 'eles';
  pt: string;
  ru: string;
}

export interface RussianPastForms {
  masculine: string;
  feminine: string;
  neuter: string;
  plural: string;
  // true para construções de sujeito invertido (ex.: gostar -> "мне понравилось"),
  // onde a forma não concorda com a pessoa gramatical e o seletor de gênero não se aplica.
  invariant?: boolean;
}

export interface ConjugatorVerb {
  id: string;
  pt: string;
  ru: string;
  forms: Record<ConjPerson['key'], string>;
  ruForms: Record<ConjPerson['key'], string>;
  note?: string;
  noteRu?: string;
  pretPerf?: Record<ConjPerson['key'], string>;
  pretPeritoRu?: RussianPastForms;
}

export interface VocabItem {
  icon: string;
  pt: string;
  ru: string;
}

export type ChallengeKey = 'choice' | 'flash' | 'order' | 'listen' | 'registro';
