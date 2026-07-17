import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pedagogicalEntityRepository } from '../src/pedagogy/adapters/pedagogicalEntityRepository';
import { entityRefKey, knowledgeEntityTypes, learningModalities, learningSkills } from '../src/pedagogy/contracts';
import { teachingProfileResolver } from '../src/pedagogy/profiles/teachingProfileResolver';
import { knowledgeEntityRefSchema } from '../src/pedagogy/validation/interactionSchemas';
import { practicePlanner } from '../src/pedagogy/planner/practicePlanner';

const entities = pedagogicalEntityRepository.list();
const errors: string[] = [];
const keys = entities.map((entity) => entityRefKey(entity.ref));

if (new Set(keys).size !== keys.length) errors.push('Há chaves de entidade duplicadas.');
pedagogicalEntityRepository.unresolvedRelations().forEach(({ source, target }) => {
  errors.push(`Relação órfã: ${entityRefKey(source)} -> ${entityRefKey(target)}`);
});

const skillCounts = Object.fromEntries(learningSkills.map((skill) => [skill, 0]));
const modalityCounts = Object.fromEntries(learningModalities.map((modality) => [modality, 0]));

entities.forEach((entity) => {
  const parsed = knowledgeEntityRefSchema.safeParse(entity.ref);
  if (!parsed.success) errors.push(`Referência inválida: ${entityRefKey(entity.ref)}`);
  const profile = teachingProfileResolver.resolve(entity);
  if (profile.capabilities.length === 0) errors.push(`Perfil vazio: ${entityRefKey(entity.ref)}`);
  profile.capabilities.forEach((skill) => { skillCounts[skill] += 1; });
  profile.modalities.forEach((modality) => { modalityCounts[modality] += 1; });
  if (profile.modalities.includes('audio') && !entity.assets.some((asset) => asset.type === 'audio' && asset.status === 'validated')) {
    errors.push(`Modalidade de áudio sem asset validado: ${entityRefKey(entity.ref)}`);
  }
  if (profile.modalities.includes('image') && !entity.assets.some((asset) => asset.type === 'image' && asset.status === 'validated')) {
    errors.push(`Modalidade de imagem sem asset validado: ${entityRefKey(entity.ref)}`);
  }
  entity.assets.filter((asset) => asset.status === 'validated').forEach((asset) => {
    const relative = asset.src.replace(/^\//, '');
    if (!existsSync(join(process.cwd(), 'public', relative))) {
      errors.push(`Asset validado ausente: ${asset.src} (${entityRefKey(entity.ref)})`);
    }
  });
});

const entityCounts = Object.fromEntries(knowledgeEntityTypes.map((type) => [type, pedagogicalEntityRepository.list(type).length]));

const practiceOrigins = ['emotion', 'verb', 'scene-occurrence'] as const;
let sessionCount = 0;
const generatedSkillCounts = Object.fromEntries(learningSkills.map((skill) => [skill, 0]));
practiceOrigins.forEach((type) => {
  pedagogicalEntityRepository.list(type).forEach((entity) => {
    try {
      const session = practicePlanner.plan(entity.ref, { seed: 'pedagogy-verification' });
      const repeated = practicePlanner.plan(entity.ref, { seed: 'pedagogy-verification' });
      sessionCount += 1;
      if (session.interactions.length !== 3) errors.push(`Sessão não possui três passos: ${session.id}`);
      if (JSON.stringify(session) !== JSON.stringify(repeated)) errors.push(`Sessão não determinística: ${session.id}`);
      if (new Set(session.interactions.map((item) => item.id)).size !== session.interactions.length) {
        errors.push(`IDs de interação duplicados: ${session.id}`);
      }
      session.interactions.forEach((interaction) => { generatedSkillCounts[interaction.skill] += 1; });
    } catch (error) {
      errors.push(`Falha ao planejar ${entityRefKey(entity.ref)}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
});

console.log('P1/P2 — relatório do domínio pedagógico');
console.table(entityCounts);
console.table(skillCounts);
console.table(modalityCounts);
console.table(generatedSkillCounts);
console.log(`Entidades: ${entities.length} | Relações órfãs: ${pedagogicalEntityRepository.unresolvedRelations().length}`);
console.log(`Sessões P2 verificadas: ${sessionCount} | Interações: ${sessionCount * 3}`);

if (errors.length > 0) {
  errors.forEach((error) => console.error(`- ${error}`));
  throw new Error(`Validação pedagógica falhou com ${errors.length} erro(s).`);
}

console.log('Validação pedagógica concluída sem inconsistências.');
