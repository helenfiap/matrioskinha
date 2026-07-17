# Curadoria de infinitivos

O Conjugador mantém duas camadas complementares:

- **quadro completo**: os 112 verbos do índice, com formas pessoais em
  português e russo no presente e no passado;
- **índice canônico**: 112 infinitivos únicos derivados do Knowledge Core, dos
  verbos úteis dos cenários e do vocabulário do Ateliê das Emoções.

Os 50 paradigmas históricos permanecem no Knowledge Core. Os outros 62 ficam na
camada curada `expandedVerbConjugations`, ligada aos mesmos lemas, contextos e
fontes lexicais. A interface consome uma única coleção canônica, sem duplicar os
verbos que aparecem em mais de um cenário ou emoção.

Cada quadro contém as seis pessoas do presente e do pretérito perfeito em
português. O equivalente russo contém as seis formas do presente e, no passado,
masculino, feminino, neutro e plural. Verbos reflexivos usam os pronomes do
português brasileiro (`me`, `te`, `se`, `nos`, `vos`, `se`) e as formas
reflexivas correspondentes em russo.

## Regras de consolidação

- comparação em minúsculas com espaços normalizados;
- complementos entre parênteses são removidos para a identidade do infinitivo:
  `pegar (o ônibus)` reaproveita `pegar`;
- verbos compartilhados acumulam contextos: `relaxar` pertence a cenário e
  emoção sem ser duplicado;
- locuções são ligadas ao lema: `tomar banho` aparece em `tomar` e `sentir
  saudade` aparece em `sentir`;
- formas pronominais permanecem distintas: `acalmar-se` não é reduzido a
  `acalmar`.

## Expressões relacionadas

A seção funciona como um índice de **construções no infinitivo** que ampliam o
lema e já possuem MP3. Ela não agrega frases contextuais nem formas conjugadas:

- `pegar` → `pegar o ônibus` (áudio de `scene-verbs`);
- `sentir` → `sentir saudade` (áudio de `emotion-verbs`);
- `tomar` → `tomar banho` (áudio de `scene-verbs`).

Frases como `Sinto muito.` e `Vou tomar banho rapidinho.` continuam disponíveis
nos módulos em que são ensinadas, mas não aparecem como relações do infinitivo.
Cada relação é marcada no modelo como `form: 'infinitive'`. Áudios futuros por
pessoa e tempo verbal formarão uma camada separada, sem alterar esta associação.

Além das relações, o lema recebe um botão próprio quando já existe um MP3 que
pronuncia exatamente aquele infinitivo. Atualmente são 67 lemas com áudio. Uma
gravação mais longa não é usada como substituta: `sentir saudade` permanece em
`sentir` como expressão relacionada, mas não vira áudio do lema `sentir`.

## Seções atuais

| Grupo | Quantidade |
|---|---:|
| terminação `-AR` | 61 |
| terminação `-ER` | 24 |
| terminação `-IR` | 10 |
| reflexivos | 17 |
| **Total** | **112** |

A busca global e a busca interna do Conjugador consomem o mesmo índice. Ao
abrir um infinitivo, a interface informa se há quadro completo e mostra em quais
cenários ou emoções o verbo aparece.
