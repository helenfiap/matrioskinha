# Fase P2 — Planejador e prática contextual

**Estado:** implementada em 17 de julho de 2026  
**Branch:** `prototype/pedagogical-cycle`  
**Base:** domínio pedagógico da P1

## Resultado

A P2 transforma as capacidades da P1 em sessões contextuais de três passos. O
mesmo drawer atende os três primeiros pontos de entrada:

- mood selecionado no Ateliê;
- infinitivo expandido no Conjugador;
- hotspot selecionado em um cenário.

No Ateliê, o antigo botão **Preciso praticar**, que apenas registrava uma
dificuldade, passa a ser **Praticar agora · P2** quando a flag está ativa. Assim,
a intenção de praticar abre imediatamente a atividade e não é registrada como
erro. No Conjugador e nos hotspots, o botão é **Praticar · P2**.

## Feature flag

Após validação no protótipo, a P2 foi promovida e fica ativa por padrão em
desenvolvimento e produção. A variável permanece disponível como kill switch:

```env
VITE_PEDAGOGICAL_CYCLE=false
```

A flag também pode ser controlada localmente:

```js
localStorage.setItem('matrioskinha-feature-pedagogical-cycle', 'true');
location.reload();
```

Um valor local `false` também desliga a experiência. Com a flag desligada, as
superfícies entregues na baseline permanecem inalteradas.

## Planejador determinístico

`PracticePlanner` recebe:

- `KnowledgeEntityRef` de origem;
- seed opcional;
- gênero selecionado;
- preferência de idioma de apoio.

A mesma origem com a mesma seed produz exatamente a mesma sessão, incluindo
ordem, distratores, pessoa verbal e IDs. Cada sessão contém três interações.

Composição inicial:

| Origem | Sequência preferencial |
| --- | --- |
| Emoção | reconhecimento → associação → conjugação de verbo relacionado |
| Verbo | reconhecimento → associação contextual → conjugação |
| Hotspot | reconhecimento → associação → reconhecimento de entidade relacionada |

Quando uma entidade não possui uma associação disponível, o planejador utiliza
reconhecimento de uma entidade relacionada ou da própria origem, sem inventar
relações.

## Geradores

### RecognitionGenerator

- produz escolha única com um único enunciado no idioma da interface;
- usa a tradução russa como estímulo e mantém as alternativas em português;
- seleciona distratores do mesmo tipo de entidade;
- usa ordem determinística;
- inclui apenas assets validados.

### AssociationGenerator

- escolhe uma relação real do grafo;
- exclui outras relações válidas da lista de distratores;
- mantém a entidade de origem no contexto;
- fornece a entidade relacionada como próxima recomendação.

### ConjugationGenerator

- aceita apenas verbos com paradigma completo;
- escolhe uma das seis pessoas de forma determinística;
- remove formas duplicadas das alternativas;
- conserva português e russo no contrato;
- mantém as respostas em português mesmo quando a interface está em russo.

Todas as saídas passam pelo schema Zod e pelo `InteractionValidator` antes de
entrar em uma sessão.

## Política de idioma dos exercícios

O idioma da interface e o idioma pedagógico são tratados separadamente. Menus,
instruções e feedback podem acompanhar o toggle português/russo, mas uma questão
nunca exibe dois enunciados em paralelo. Como o produto ensina português:

- as alternativas permanecem em português;
- a tradução do enunciado não é mostrada abaixo da questão;
- o botão de áudio não escreve a resposta correta antes da escolha;
- o áudio pode funcionar como pista auditiva intencional;
- traduções podem reaparecer no feedback, nunca como vazamento pré-resposta.

## Drawer e acessibilidade

O `PracticeDrawer`:

- é compartilhado por todas as páginas;
- apresenta uma interação por vez;
- funciona como painel lateral no desktop e bottom sheet no mobile;
- restaura o foco ao botão de origem;
- fecha com Escape;
- mantém Tab e Shift+Tab dentro do diálogo;
- respeita `prefers-reduced-motion`;
- passou em auditoria Axe WCAG A e AA.

O renderer inicial cobre escolha única, suficiente para os três geradores da
P2. O contrato permanece preparado para ordenação, comparação, autoavaliação e
produção guiada nas próximas fases.

## Evidências

Cada resposta continua sendo persistida pelo `LearningContext` como `Attempt`.
O schema foi expandido de maneira retrocompatível com um bloco opcional:

```ts
pedagogy: {
  entityRef;
  skill;
  generatorId;
  interactionId;
  sessionId;
}
```

Isso permite que tentativas antigas continuem válidas e que as novas carreguem
proveniência suficiente para evidência por habilidade nas próximas fases.

## Inventário verificado

O gate `npm run pedagogy:verify` planeja duas vezes cada origem com a mesma seed
e compara os resultados. Estado atual:

| Medida | Quantidade |
| --- | ---: |
| Origens verificadas | 218 |
| Sessões determinísticas | 218 |
| Interações geradas | 654 |
| Reconhecimento | 350 |
| Associação | 176 |
| Conjugação | 128 |

As origens são 16 emoções, 112 verbos e 90 hotspots.

## Áudio no navegador

A P2 tornou o registro de assets parte do bundle do navegador. Para não importar
JSON diretamente de `public`, o pipeline de áudio passa a manter a projeção
gerada `src/pedagogy/assets/generatedAudioSources.ts`. `audio:verify` falha se a
projeção estiver desatualizada, e `audio:generate` a atualiza junto do catálogo.

## Testes acrescentados

- determinismo e mudança por seed;
- cadeia mood → verbo → conjugação;
- preservação de contexto de hotspot;
- adaptação de interação para `Attempt`;
- avaliação objetiva;
- abertura do drawer, persistência e retorno de foco;
- fluxo E2E completo de três passos;
- viewport mobile, Escape e Axe.

## Próxima fase

Antes da P3, a P2.5 deverá introduzir a fundação de storage pedagógico local:
repositórios assíncronos, IndexedDB, migração do `localStorage`, snapshot
retomável de sessão e schemas versionados. A P3 então poderá criar cadeias entre
módulos sobre uma memória persistente, sem mudar os contratos entregues aqui.
