import { contentRepository } from '../repositories/contentRepository';

export const curriculumPhases = contentRepository.listLessons();
export const exerciseTabs = contentRepository.listExerciseTemplates();
