export type AudioVoiceRole = 'female' | 'male';

export function normalizeAudioText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function audioSlug(text: string): string {
  return normalizeAudioText(text).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function safeAudioId(id: string): string {
  return id.replace(/:/g, '--').replace(/[^a-zA-Z0-9_-]/g, '-');
}

function stableHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
}

export function emotionAudioKey(text: string): string {
  const normalized = normalizeAudioText(text);
  const readable = audioSlug(normalized).slice(0, 42) || 'fala';
  return `${readable}-${stableHash(normalized.toLocaleLowerCase('pt-BR'))}`;
}

export function emotionAudioRelativePath(text: string, voiceRole: AudioVoiceRole): string {
  return `emotions/${voiceRole}/${emotionAudioKey(text)}.mp3`;
}

export function selectGenderedAudioText(text: string, voiceRole: AudioVoiceRole): string {
  const alternative = voiceRole === 'female' ? 1 : 2;
  return normalizeAudioText(text).replace(
    /([\p{L}-]+)\s*\/\s*([\p{L}-]+)/gu,
    (_match, feminine: string, masculine: string) => alternative === 1 ? feminine : masculine,
  );
}
