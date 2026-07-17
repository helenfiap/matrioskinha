export const knowledgeEntityTypes = [
  'lexical-item',
  'scene-occurrence',
  'verb',
  'verb-expression',
  'emotion',
  'phrase',
  'scene',
] as const;

export type KnowledgeEntityType = (typeof knowledgeEntityTypes)[number];

export type KnowledgeEntityRef = {
  [Type in KnowledgeEntityType]: { type: Type; id: string }
}[KnowledgeEntityType];

export interface BilingualText {
  pt: string;
  ru: string;
}

export type PedagogicalAssetType = 'audio' | 'image' | 'scene';
export type PedagogicalAssetStatus = 'validated' | 'declared' | 'fallback';

export interface PedagogicalAsset {
  id: string;
  type: PedagogicalAssetType;
  src: string;
  status: PedagogicalAssetStatus;
  role?: string;
}

export type PedagogicalMetadataValue = string | number | boolean | string[];

export interface PedagogicalEntity {
  ref: KnowledgeEntityRef;
  label: BilingualText;
  route: string;
  assets: PedagogicalAsset[];
  relationRefs: KnowledgeEntityRef[];
  metadata: Record<string, PedagogicalMetadataValue>;
}

export function entityRefKey(ref: KnowledgeEntityRef): string {
  return `${ref.type}:${ref.id}`;
}
