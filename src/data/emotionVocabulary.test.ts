import { describe, expect, it } from 'vitest';
import { emotionMoods } from './emotions';
import { emotionVocabularyByMoodId, emotionVocabularyContent } from './emotionVocabulary';

describe('verbos e expressões do Ateliê', () => {
  it('cobre os 16 moods com três verbos e três expressões bilíngues', () => {
    expect(emotionVocabularyContent).toHaveLength(16);
    expect(new Set(emotionVocabularyContent.map((entry) => entry.moodId)).size).toBe(16);
    expect(emotionVocabularyContent.map((entry) => entry.moodId).sort()).toEqual(emotionMoods.map((mood) => mood.id).sort());
    for (const mood of emotionMoods) {
      const content = emotionVocabularyByMoodId.get(mood.id);
      expect(content?.verbs).toHaveLength(3);
      expect(content?.expressions).toHaveLength(3);
      expect(content?.verbs.every((term) => term.pt && term.ru)).toBe(true);
      expect(content?.expressions.every((term) => term.pt && term.ru)).toBe(true);
    }
  });

  it('mantém IDs únicos dentro de cada mood e categoria', () => {
    for (const content of emotionVocabularyContent) {
      expect(new Set(content.verbs.map((term) => term.id)).size).toBe(content.verbs.length);
      expect(new Set(content.expressions.map((term) => term.id)).size).toBe(content.expressions.length);
    }
  });
});
