import { audioSlug, emotionAudioRelativePath, safeAudioId, type AudioVoiceRole } from './audioNaming';

const audioBase = '/assets/audio/pt-BR';

export const audioAssets = {
  word: (lexicalItemId: string) => `${audioBase}/words/${safeAudioId(lexicalItemId)}.mp3`,
  example: (phraseId: string) => `${audioBase}/examples/${safeAudioId(phraseId)}.mp3`,
  sceneVerb: (text: string) => `${audioBase}/scene-verbs/${audioSlug(text)}.mp3`,
  scenePhrase: (phraseId: string) => `${audioBase}/scene-phrases/${safeAudioId(phraseId)}.mp3`,
  emotion: (text: string, voiceRole: AudioVoiceRole) => `${audioBase}/${emotionAudioRelativePath(text, voiceRole)}`,
};
