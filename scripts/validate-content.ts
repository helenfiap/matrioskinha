import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { contentBundleSchema } from '../src/content/schemas.ts';
import manifest from '../src/content/data/manifest.json' with { type: 'json' };
import lexicalItems from '../src/content/data/lexical-items.json' with { type: 'json' };
import occurrences from '../src/content/data/scene-occurrences.json' with { type: 'json' };
import scenes from '../src/content/data/scenes.json' with { type: 'json' };
import phrases from '../src/content/data/phrases.json' with { type: 'json' };
import cultureNotes from '../src/content/data/culture-notes.json' with { type: 'json' };
import verbs from '../src/content/data/verbs.json' with { type: 'json' };
import missions from '../src/content/data/missions.json' with { type: 'json' };
import vocabulary from '../src/content/data/vocabulary.json' with { type: 'json' };
import lessons from '../src/content/data/lessons.json' with { type: 'json' };
import exerciseTemplates from '../src/content/data/exercise-templates.json' with { type: 'json' };

const bundle = contentBundleSchema.parse({
  manifest, lexicalItems, occurrences, scenes, phrases, cultureNotes,
  verbs, missions, vocabulary, lessons, exerciseTemplates,
});

for (const scene of bundle.scenes) {
  const asset = resolve('public', scene.image.replace(/^\//, ''));
  if (!existsSync(asset)) throw new Error(`Imagem de cena inexistente: ${scene.image}`);
}

const counts = bundle.manifest.counts;
console.log(
  `Knowledge Core válido (schema v${bundle.manifest.schemaVersion}): ` +
  `${counts.scenes} cenas, ${counts.sceneOccurrences} ocorrências, ` +
  `${counts.sceneLexicalItems} itens lexicais de cena, ${counts.verbs} verbos.`,
);
