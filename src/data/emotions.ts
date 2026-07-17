export interface EmotionMood {
  id: string;
  emoji: string;
  pt: { feminine: string; masculine: string };
  ru: { feminine: string; masculine: string };
  expressionCue: string;
}

export const EMOTION_ATELIER_PROGRESS_ID = 'emotion-atelier';

export const emotionCharacters = {
  feminine: {
    id: 'matrioskinha',
    name: { pt: 'Matrioskinha', ru: 'Матрёшкинка' },
    imageBasePath: '/assets/scenarios/emotions/matrioskinha',
  },
  masculine: {
    id: 'misha-matrioshkin',
    name: { pt: 'Misha Matriôshkin', ru: 'Миша Матрёшкин' },
    imageBasePath: '/assets/scenarios/emotions/misha',
  },
} as const;

export const emotionMoods: EmotionMood[] = [
  { id: 'feliz', emoji: '😊', pt: { feminine: 'feliz', masculine: 'feliz' }, ru: { feminine: 'счастливая', masculine: 'счастливый' }, expressionCue: 'open joyful smile, bright crescent eyes, lifted cheeks, welcoming open hands' },
  { id: 'triste', emoji: '😢', pt: { feminine: 'triste', masculine: 'triste' }, ru: { feminine: 'грустная', masculine: 'грустный' }, expressionCue: 'downturned mouth, glossy teary eyes, lowered gaze, gently slumped shoulders' },
  { id: 'apaixonada', emoji: '😍', pt: { feminine: 'apaixonada', masculine: 'apaixonado' }, ru: { feminine: 'влюблённая', masculine: 'влюблённый' }, expressionCue: 'warm blushing cheeks, tender smile, sparkling eyes, hands held over the heart' },
  { id: 'preocupada', emoji: '😟', pt: { feminine: 'preocupada', masculine: 'preocupado' }, ru: { feminine: 'обеспокоенная', masculine: 'обеспокоенный' }, expressionCue: 'knitted eyebrows, tense small mouth, hands clasped together, attentive worried gaze' },
  { id: 'assustada', emoji: '😱', pt: { feminine: 'assustada', masculine: 'assustado' }, ru: { feminine: 'испуганная', masculine: 'испуганный' }, expressionCue: 'wide eyes, small open mouth, raised shoulders, hands close to the face' },
  { id: 'calma', emoji: '😌', pt: { feminine: 'calma', masculine: 'calmo' }, ru: { feminine: 'спокойная', masculine: 'спокойный' }, expressionCue: 'soft closed eyes, peaceful half-smile, relaxed shoulders, hands resting naturally' },
  { id: 'irritada', emoji: '😠', pt: { feminine: 'irritada', masculine: 'irritado' }, ru: { feminine: 'раздражённая', masculine: 'раздражённый' }, expressionCue: 'lowered eyebrows, firm mouth, flushed cheeks, arms held firmly at the sides' },
  { id: 'surpresa', emoji: '😮', pt: { feminine: 'surpresa', masculine: 'surpreso' }, ru: { feminine: 'удивлённая', masculine: 'удивлённый' }, expressionCue: 'raised eyebrows, round open eyes and mouth, hands lifted in spontaneous surprise' },
  { id: 'cansada', emoji: '😴', pt: { feminine: 'cansada', masculine: 'cansado' }, ru: { feminine: 'уставшая', masculine: 'уставший' }, expressionCue: 'heavy half-closed eyelids, small yawn, drooping posture, one hand near the cheek' },
  { id: 'animada', emoji: '🤩', pt: { feminine: 'animada', masculine: 'animado' }, ru: { feminine: 'воодушевлённая', masculine: 'воодушевлённый' }, expressionCue: 'radiant grin, shining eyes, energetic raised hands, lively forward posture' },
  { id: 'timida', emoji: '☺️', pt: { feminine: 'tímida', masculine: 'tímido' }, ru: { feminine: 'застенчивая', masculine: 'застенчивый' }, expressionCue: 'small shy smile, rosy cheeks, sideways gaze, hands modestly together' },
  { id: 'confiante', emoji: '😎', pt: { feminine: 'confiante', masculine: 'confiante' }, ru: { feminine: 'уверенная', masculine: 'уверенный' }, expressionCue: 'steady direct gaze, assured smile, upright posture, hands confidently at the waist' },
  { id: 'orgulhosa', emoji: '🫡', pt: { feminine: 'orgulhosa', masculine: 'orgulhoso' }, ru: { feminine: 'гордая', masculine: 'гордый' }, expressionCue: 'warm proud smile, chin gently lifted, upright posture, one hand over the chest' },
  { id: 'envergonhada', emoji: '🫣', pt: { feminine: 'envergonhada', masculine: 'envergonhado' }, ru: { feminine: 'смущённая', masculine: 'смущённый' }, expressionCue: 'deep blush, hesitant smile, lowered eyes, one hand partially hiding the face' },
  { id: 'confusa', emoji: '😕', pt: { feminine: 'confusa', masculine: 'confuso' }, ru: { feminine: 'растерянная', masculine: 'растерянный' }, expressionCue: 'one eyebrow raised, uncertain mouth, slight head tilt, palms gently turned upward' },
  { id: 'aliviada', emoji: '😮‍💨', pt: { feminine: 'aliviada', masculine: 'aliviado' }, ru: { feminine: 'испытывающая облегчение', masculine: 'испытывающий облегчение' }, expressionCue: 'relieved exhale, softened eyes, relaxed smile, shoulders visibly releasing tension' },
];
