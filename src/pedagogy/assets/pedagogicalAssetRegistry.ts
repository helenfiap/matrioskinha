import moodImageManifest from '../../../assets-originals/scenarios/emotions/pipeline-manifest.json';
import type { PedagogicalAsset } from '../contracts';
import { validatedAudioSources } from './generatedAudioSources';

interface MoodImageEntry {
  character: string;
  mood: string;
  publicPath: string;
}

export class PedagogicalAssetRegistry {
  private readonly audioSources: Set<string>;
  private readonly moodImages: Map<string, MoodImageEntry>;

  constructor(audioSources: ReadonlySet<string>, moodEntries: readonly MoodImageEntry[]) {
    this.audioSources = new Set(audioSources);
    this.moodImages = new Map(moodEntries.map((entry) => [`${entry.character}/${entry.mood}`, entry]));
  }

  audio(src: string, role?: string): PedagogicalAsset | null {
    return this.audioSources.has(src)
      ? { id: `audio:${src.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-')}`, type: 'audio', src, status: 'validated', role }
      : null;
  }

  moodImage(character: string, mood: string): PedagogicalAsset | null {
    const entry = this.moodImages.get(`${character}/${mood}`);
    if (!entry) return null;
    return {
      id: `image:${character}:${mood}`,
      type: 'image',
      src: `/${entry.publicPath.replace(/^public[\\/]/, '').replace(/\\/g, '/')}`,
      status: 'validated',
      role: character,
    };
  }

  sceneImage(id: string, src: string): PedagogicalAsset {
    return { id: `scene:${id}`, type: 'scene', src, status: 'validated', role: 'context' };
  }

  hasAudio(src: string): boolean {
    return this.audioSources.has(src);
  }
}

export const pedagogicalAssetRegistry = new PedagogicalAssetRegistry(
  validatedAudioSources,
  Object.values(moodImageManifest.entries),
);
