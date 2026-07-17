import { curatedInfinitives, conjPersons } from '../../data/verbs';
import type { LearningInteraction } from '../contracts';
import { deterministicOrder } from './deterministic';
import type { GeneratorInput, SkillGenerator } from './generatorTypes';
import { interactionBase } from './interactionFactory';

export class ConjugationGenerator implements SkillGenerator {
  readonly id = 'conjugation-v1';

  canGenerate(entity: GeneratorInput['entity']): boolean {
    return entity.ref.type === 'verb' && entity.metadata.hasFullConjugation === true
      && curatedInfinitives.some((verb) => verb.id === entity.ref.id);
  }

  generate(input: GeneratorInput): LearningInteraction {
    const verb = curatedInfinitives.find((item) => item.id === input.entity.ref.id);
    if (!verb) throw new Error(`Conjugação não encontrada: ${input.entity.ref.id}`);
    const people = deterministicOrder(conjPersons, `${input.seed}:person:${input.sequence}`, (person) => person.key);
    const person = people[0];
    const distinct = people.filter((candidate, index, all) =>
      all.findIndex((item) => verb.forms[item.key] === verb.forms[candidate.key]) === index).slice(0, 4);
    if (!distinct.some((candidate) => candidate.key === person.key)) distinct[distinct.length - 1] = person;
    const options = deterministicOrder(distinct, `${input.seed}:conjugation-options:${input.sequence}`, (candidate) => candidate.key)
      .map((candidate) => ({
        id: candidate.key,
        label: { pt: verb.forms[candidate.key], ru: verb.ruForms[candidate.key] },
      }));
    return {
      ...interactionBase(input, this.id, 'conjugation', {
        pt: `Escolha a forma de “${verb.pt}” para ${person.pt}, no presente.`,
        ru: `Выбери форму глагола «${verb.pt}» для ${person.ru} в настоящем времени.`,
      }),
      assets: input.entity.assets.filter((asset) => asset.type === 'audio' && asset.status === 'validated'),
      answerSpec: { kind: 'single-choice', options, correctOptionId: person.key },
      feedback: {
        correct: { pt: `${person.pt}: ${verb.forms[person.key]}.`, ru: `${person.ru}: ${verb.ruForms[person.key]}.` },
        incorrect: { pt: `A forma esperada é “${verb.forms[person.key]}”.`, ru: `Правильная форма: «${verb.forms[person.key]}».` },
      },
    };
  }
}

export const conjugationGenerator = new ConjugationGenerator();
