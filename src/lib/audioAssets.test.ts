import { describe, expect, it } from 'vitest';
import { audioAssets } from './audioAssets';
import { selectGenderedAudioText } from './audioNaming';

describe('audioAssets', () => {
  it('maps canonical ids to generated word and phrase files', () => {
    expect(audioAssets.word('lex-alcool-em-gel')).toBe('/assets/audio/pt-BR/words/lex-alcool-em-gel.mp3');
    expect(audioAssets.example('sala:sofa:example')).toBe('/assets/audio/pt-BR/examples/sala--sofa--example.mp3');
    expect(audioAssets.scenePhrase('supermercado:phrase:1')).toBe('/assets/audio/pt-BR/scene-phrases/supermercado--phrase--1.mp3');
  });

  it('uses the same normalized slug as the batch generator for verbs', () => {
    expect(audioAssets.sceneVerb('pegar (o ônibus)')).toBe('/assets/audio/pt-BR/scene-verbs/pegar-o-onibus.mp3');
  });

  it('deduplicates emotion paths by normalized text and voice role', () => {
    expect(audioAssets.emotion('  Eu estou feliz. ', 'female')).toBe(audioAssets.emotion('Eu   estou feliz.', 'female'));
    expect(audioAssets.emotion('Eu estou feliz.', 'male')).not.toBe(audioAssets.emotion('Eu estou feliz.', 'female'));
  });

  it('selects the spoken gender form instead of sending a slash to TTS', () => {
    const phrase = 'Eu estou cansada / cansado e preciso descansar.';
    expect(selectGenderedAudioText(phrase, 'female')).toBe('Eu estou cansada e preciso descansar.');
    expect(selectGenderedAudioText(phrase, 'male')).toBe('Eu estou cansado e preciso descansar.');
  });
});
