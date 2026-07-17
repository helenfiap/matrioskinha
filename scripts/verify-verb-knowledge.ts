import { existsSync } from 'node:fs';
import path from 'node:path';
import { curatedInfinitives } from '../src/data/verbs';
import { audioAssets } from '../src/lib/audioAssets';
import type { RelatedExpressionAudio } from '../src/data/verbs';

function audioSource(audio: RelatedExpressionAudio): string {
  return audio.kind === 'emotion'
    ? audioAssets.emotion(audio.text, audio.voiceRole)
    : audioAssets.sceneVerb(audio.text);
}

const errors: string[] = [];
const uniqueLemmas = new Set(curatedInfinitives.map((verb) => verb.pt));
if (uniqueLemmas.size !== curatedInfinitives.length) errors.push('Há lemas duplicados no índice canônico.');

for (const verb of curatedInfinitives) {
  if (!verb.hasFullConjugation) errors.push(`${verb.pt}: quadro incompleto.`);
  if (Object.values(verb.forms).some((form) => !form)) errors.push(`${verb.pt}: presente em português incompleto.`);
  if (Object.values(verb.ruForms).some((form) => !form)) errors.push(`${verb.pt}: presente em russo incompleto.`);
  if (!verb.pretPerf || Object.values(verb.pretPerf).some((form) => !form)) errors.push(`${verb.pt}: pretérito em português incompleto.`);
  if (!verb.pretPeritoRu || [
    verb.pretPeritoRu.masculine,
    verb.pretPeritoRu.feminine,
    verb.pretPeritoRu.neuter,
    verb.pretPeritoRu.plural,
  ].some((form) => !form)) errors.push(`${verb.pt}: passado em russo incompleto.`);

  const audioLinks = [
    ...(verb.infinitiveAudio ? [{ label: verb.pt, audio: verb.infinitiveAudio }] : []),
    ...verb.relatedExpressions.map((expression) => ({ label: expression.pt, audio: expression.audio })),
  ];
  for (const link of audioLinks) {
    const src = audioSource(link.audio);
    const file = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
    if (!existsSync(file)) errors.push(`${verb.pt} → ${link.label}: áudio ausente em ${src}.`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const infinitiveAudios = curatedInfinitives.filter((verb) => verb.infinitiveAudio).length;
  const relatedAudios = curatedInfinitives.reduce((total, verb) => total + verb.relatedExpressions.length, 0);
  console.log(`Knowledge Base verbal válida: ${curatedInfinitives.length} lemas, ${curatedInfinitives.length} quadros completos, ${infinitiveAudios} áudios de infinitivo e ${relatedAudios} áudios de expressões relacionadas.`);
}
