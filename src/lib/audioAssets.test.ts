import { describe, expect, it } from 'vitest';
import { audioAssets } from './audioAssets';

describe('audioAssets', () => {
  it('maps canonical ids to generated word and phrase files', () => {
    expect(audioAssets.word('lex-alcool-em-gel')).toBe('/assets/audio/pt-BR/words/lex-alcool-em-gel.mp3');
    expect(audioAssets.example('sala:sofa:example')).toBe('/assets/audio/pt-BR/examples/sala--sofa--example.mp3');
    expect(audioAssets.scenePhrase('supermercado:phrase:1')).toBe('/assets/audio/pt-BR/scene-phrases/supermercado--phrase--1.mp3');
  });

  it('uses the same normalized slug as the batch generator for verbs', () => {
    expect(audioAssets.sceneVerb('pegar (o ônibus)')).toBe('/assets/audio/pt-BR/scene-verbs/pegar-o-onibus.mp3');
  });
});
