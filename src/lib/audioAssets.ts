const audioBase = '/assets/audio/pt-BR';

function safeId(id: string): string {
  return id.replace(/:/g, '--').replace(/[^a-zA-Z0-9_-]/g, '-');
}

function slugify(text: string): string {
  return text.trim().replace(/\s+/g, ' ').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const audioAssets = {
  word: (lexicalItemId: string) => `${audioBase}/words/${safeId(lexicalItemId)}.mp3`,
  example: (phraseId: string) => `${audioBase}/examples/${safeId(phraseId)}.mp3`,
  sceneVerb: (text: string) => `${audioBase}/scene-verbs/${slugify(text)}.mp3`,
  scenePhrase: (phraseId: string) => `${audioBase}/scene-phrases/${safeId(phraseId)}.mp3`,
};
