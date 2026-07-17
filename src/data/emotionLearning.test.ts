import { describe, expect, it } from 'vitest';
import { emotionMoods } from './emotions';
import { emotionLearningContent, emotionLearningByMoodId } from './emotionLearning';

describe('catálogo pedagógico do Ateliê', () => {
  it('cobre exatamente os 16 moods sem IDs duplicados', () => {
    const moodIds = emotionMoods.map((mood) => mood.id);
    const contentIds = emotionLearningContent.map((content) => content.moodId);
    expect(new Set(contentIds).size).toBe(16);
    expect(contentIds.sort()).toEqual(moodIds.sort());
  });

  it('mantém exemplos, contexto e curiosidade nos dois idiomas', () => {
    emotionMoods.forEach((mood) => {
      const content = emotionLearningByMoodId.get(mood.id);
      expect(content).toBeDefined();
      expect(content?.feminineExample.pt).toBeTruthy();
      expect(content?.feminineExample.ru).toBeTruthy();
      expect(content?.masculineExample.pt).toBeTruthy();
      expect(content?.masculineExample.ru).toBeTruthy();
      expect(content?.contextPrompt.pt).toBeTruthy();
      expect(content?.contextPrompt.ru).toBeTruthy();
      expect(content?.cultureNote.pt).toBeTruthy();
      expect(content?.cultureNote.ru).toBeTruthy();
    });
  });
});

