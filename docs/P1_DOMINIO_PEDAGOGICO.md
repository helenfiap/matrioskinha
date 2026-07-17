# Fase P1 — Domínio pedagógico

**Estado:** implementada em 17 de julho de 2026  
**Branch:** `prototype/pedagogical-cycle`  
**Escopo:** domínio puro, sem alteração de interface ou navegação

## Resultado

A P1 introduz uma camada pedagógica tipada entre o Knowledge Core e os futuros
geradores de prática. Ela adapta o conteúdo já entregue, deriva o que pode ser
ensinado com segurança e preserva a proveniência de cada relação e asset.

O índice atual contém 505 entidades:

| Tipo | Quantidade |
| --- | ---: |
| Item lexical | 89 |
| Ocorrência em cenário | 90 |
| Verbo | 112 |
| Expressão infinitiva relacionada | 3 |
| Emoção | 16 |
| Frase | 187 |
| Cenário | 8 |

As 187 frases incluem as 139 unidades canônicas de cena e as 48 expressões do
Ateliê. O verificador confirma zero chaves duplicadas e zero relações órfãs.

## Contratos implantados

`src/pedagogy/contracts` define:

- `KnowledgeEntityRef`, com sete tipos discriminados;
- `LearningSkill`, incluindo `conjugation` como habilidade explícita;
- `InteractionKind` e modalidades de aprendizagem;
- `PedagogicalEntity` e inventário de assets;
- `TeachingProfile`;
- `PracticeContext`;
- `AnswerSpec` discriminado;
- `LearningInteraction`, com proveniência, dependências, feedback e próxima
  recomendação.

Os schemas Zod em `src/pedagogy/validation` recusam, entre outros casos,
alternativas duplicadas, resposta correta ausente e ordenações que não sejam
uma permutação exata dos tokens.

## Adaptação da Knowledge Base

`PedagogicalEntityRepository` consolida, sem copiar o conteúdo para uma nova
fonte editorial:

- JSONs canônicos do `ContentRepository`;
- índice curado de 112 infinitivos;
- vocabulário e conteúdo de aprendizagem dos 16 moods;
- catálogo incremental de áudio;
- manifesto do pipeline de imagens.

As referências são estáveis no formato `tipo:id`. Locuções mantêm o infinitivo
pai, o contexto de origem e o áudio exato. Itens lexicais mantêm suas diferentes
ocorrências em cena. Verbos e emoções preservam links bidirecionais por meio de
referências resolvíveis.

## Regra de assets

O domínio distingue `validated`, `declared` e `fallback`, mas a inferência
automática de modalidade usa apenas `validated`.

- `listening` só é inferido quando o caminho aparece no catálogo de áudio;
- `image` só é inferido quando a arte aparece no manifesto processado;
- imagens de cenário são consideradas validadas porque já passam pelo gate
  `validate:content`;
- um mood sem arte continua ensinável por texto e áudio, sem receber capacidade
  visual fictícia.

No estado atual, 452 entidades reutilizam pelo menos um áudio validado e 12 dos
16 moods possuem arte processada. Esses totais medem entidades capazes, não
arquivos únicos.

## TeachingProfileResolver

O resolver é determinístico e deriva capacidades a partir de fatos observáveis:

| Evidência | Capacidade ou modalidade derivada |
| --- | --- |
| rótulo bilíngue | `recognition`, `text` |
| asset de áudio validado | `listening`, `audio` |
| arte de mood validada | `image` |
| cenário ou relação contextual | `discovery`, `scene` |
| relação no grafo | `association` |
| frase com dois ou mais tokens | `ordering` |
| paradigma verbal completo | `conjugation` |
| frase, verbo, mood ou ocorrência contextual | `application` |
| múltiplas relações, contextos ou fontes | `transfer` |
| prompt editorial | `production` |
| qualquer entidade catalogada | `review` |

Overrides editoriais são aceitos como exceção explícita e ficam registrados no
perfil; não são persistidos silenciosamente na fonte canônica.

## Contexto de prática

`createPracticeContext` conserva:

- entidade e rota de origem;
- cenário ou mood relacionado;
- gênero selecionado no Ateliê;
- preferência de idioma de apoio;
- disponibilidade efetiva de áudio, imagem e cena.

Isso permite que a P2 abra uma prática e retorne ao mesmo ponto do produto sem
depender de estado implícito da tela.

## Verificação e testes

Execute:

```powershell
npm run pedagogy:verify
npm run test -- --run src/pedagogy
```

O primeiro comando valida referências, assets físicos, coerência entre
modalidades e assets e imprime as matrizes por tipo, habilidade e modalidade.
Ele também faz parte de `npm run check`.

A P1 acrescenta 11 testes unitários cobrindo contratos, ordenação, índice,
relações, assets, capacidades, gênero, contexto e override editorial.

## Limite deliberado da P1

Esta fase não cria exercícios, sessão, drawer, botão ou feature flag. Também não
altera a experiência entregue. O contrato `LearningInteraction` está pronto,
mas suas instâncias só começam a ser produzidas na P2 por geradores puros e por
um planejador determinístico.

## Entrada da P2

> A P2 descrita abaixo foi implementada. Consulte
> [`P2_PLANEJADOR_E_PRATICA_CONTEXTUAL.md`](P2_PLANEJADOR_E_PRATICA_CONTEXTUAL.md).

A próxima fase deve, nesta ordem:

1. criar uma feature flag local inicialmente desligada;
2. implementar geradores de reconhecimento, associação e conjugação;
3. validar toda interação gerada com o schema da P1;
4. criar um `PracticePlanner` determinístico com seed;
5. compor sessões curtas preservando `PracticeContext`;
6. integrar um único botão **Praticar** no Ateliê, Conjugador e hotspot;
7. registrar as respostas como evidências no domínio de progresso existente;
8. validar desktop, mobile, teclado e regressão com a flag desligada.
