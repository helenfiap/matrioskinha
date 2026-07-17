# Baseline entregue e roadmap do ciclo pedagógico

**Projeto:** Matrioskinha App 2  
**Data da baseline:** 17 de julho de 2026  
**Commit de origem:** `93da25b` — `integrando verbos e cenarios`  
**Branch de prototipagem:** `prototype/pedagogical-cycle`  
**Origem:** clone limpo da versão de produção do `matrioskinha-app`  
**Objetivo deste documento:** congelar o estado funcional recebido e orientar a implantação do novo motor de interações pedagógicas sem regressão do produto atual.

---

## 1. Resumo executivo

A baseline atual já é um produto educacional bilíngue funcional, e não apenas
um protótipo visual. Ela reúne conteúdo canônico validado, cenários exploráveis,
Ateliê das Emoções, conjugação português–russo, áudio em lote, progresso local,
revisão espaçada, registro de tentativas, testes automatizados e navegação
semântica entre as áreas do produto.

A próxima evolução não substituirá essas superfícies. Ela introduzirá uma camada
entre a Knowledge Base e a interface: um **motor de prática orientado por
habilidades**, capaz de planejar sequências contextuais e produzir diferentes
tipos de interação — exercício, comparação, produção guiada, conversa e micro
missão — a partir das entidades e relações já existentes.

O princípio central da implantação será:

```text
Knowledge Base
      ↓
DNA pedagógico derivado
      ↓
Planejador de prática
      ↓
Interações de aprendizagem
      ↓
Evidências por entidade e habilidade
      ↓
Próxima recomendação e revisão
```

O app de produção continuará preservado. Todo o trabalho descrito aqui começa no
`matrioskinha-app2`, na branch `prototype/pedagogical-cycle`.

---

## 2. Identidade e isolamento da baseline

| Item | Estado |
| --- | --- |
| Diretório de trabalho | `C:\Users\helen\Documents\matrioskinha\matrioskinha-app2` |
| Commit clonado | `93da25bc3220a91348711e08a871e0b69a87dc5c` |
| Branch de protótipo | `prototype/pedagogical-cycle` |
| Referência de produção | remoto local `production-snapshot` |
| Repositório de produção | preservado em `matrioskinha-app` |
| Backup do antigo app2 | `matrioskinha-app2-backup-before-pedagogy-20260717` |
| Dependências | instaladas com `npm ci` |
| Auditoria npm | 156 pacotes, zero vulnerabilidades no momento da clonagem |

O remoto foi nomeado `production-snapshot` deliberadamente. A branch de
prototipagem não possui um `origin` de publicação configurado, reduzindo o risco
de enviar experimentos diretamente ao repositório implantado pela Vercel.

---

## 3. Produto entregue na baseline

### 3.1 Superfícies e rotas

| Rota | Superfície | Entrega atual |
| --- | --- | --- |
| `#/` | Dashboard | continuidade, indicadores e acesso às áreas principais |
| `#/trilha` | Trilha | aula, desafios e cinco formatos de exercício existentes |
| `#/vocab` | Vocabulário | pictogramas, áudio, tradução e links para ocorrências em cenários |
| `#/cenarios` | Cenários | coleções, hotspots, missões, cultura, verbos, frases e prática |
| `#/cenarios?collection=emotions` | Ateliê | 16 moods, gênero, artes, áudio, exemplos, verbos e expressões |
| `#/conjugador` | Conjugador | 112 infinitivos e paradigmas português–russo completos |
| `#/progresso` | Progresso | métricas, fila de revisão e erros recorrentes |
| `#/config` | Preferências | idioma, apoio linguístico e velocidade do áudio |

Todas as telas compartilham `AppShell`, Sidebar e Topbar. O roteamento usa
`HashRouter`, compatível com hospedagem estática na Vercel.

### 3.2 Bilinguismo

- interface alternável entre português e russo;
- termos principais e traduções de apoio apresentados conjuntamente nos
  contextos pedagógicos;
- exemplos e notas culturais bilíngues;
- Ateliê com gênero feminino e masculino;
- nomes dos personagens localizados: `Matrioskinha` / `Матрёшкинка` e
  `Misha Matriôshkin` / `Миша Матрёшкин`;
- textos alternativos e rótulos acessíveis também respondem ao idioma ativo.

### 3.3 Cenários e coleções

A baseline possui cinco macrocoleções:

1. Ateliê das Emoções;
2. Cenários da Casa;
3. Cidade e Serviços;
4. Mobilidade;
5. Viagem pelo Brasil, planejada.

Há oito cenários ativos e 90 hotspots:

- Sala;
- Cozinha;
- Quarto;
- Banheiro;
- Lavanderia;
- Supermercado;
- Farmácia;
- Transporte.

Cada hotspot pode conter lema, tradução, gênero, plural, função, exemplo,
áudios, estágio de aprendizagem e relações com ocorrências equivalentes.

### 3.4 Ateliê das Emoções

O Ateliê entrega:

- 16 moods bilíngues;
- alternância entre personagem feminina e masculina;
- adjetivos no gênero adequado;
- exemplo contextual;
- expressão para falar de si;
- três verbos relacionados por mood;
- três expressões relacionadas por mood;
- nota de uso e curiosidade cultural;
- desafio de aplicação pessoal;
- progresso contextual e revisão espaçada;
- links dos verbos para o Conjugador;
- retorno do Conjugador para o mood de origem.

O pipeline visual confirmou **24 artes de mood otimizadas e arquivadas**. As
artes ausentes usam fallback acessível e entram automaticamente quando seus
arquivos forem processados.

### 3.5 Conjugador e base verbal

O índice canônico contém:

| Medida | Quantidade |
| --- | ---: |
| Infinitivos únicos | 112 |
| Quadros completos | 112 |
| Verbos históricos no Knowledge Core JSON | 50 |
| Conjugações da camada expandida | 62 |
| Lemas com áudio exato de infinitivo | 67 |
| Construções infinitivas relacionadas com áudio | 3 |

Cada quadro inclui:

- seis pessoas do presente em português;
- seis formas correspondentes no presente russo;
- seis pessoas do pretérito perfeito em português;
- passado russo masculino, feminino, neutro e plural;
- colocação pronominal nos reflexivos;
- notas contextuais quando a equivalência russa depende do complemento;
- links para todos os cenários e moods de origem.

As três construções relacionadas atuais são:

- `pegar` → `pegar o ônibus`;
- `sentir` → `sentir saudade`;
- `tomar` → `tomar banho`.

Frases conjugadas não são tratadas como relações do infinitivo.

### 3.6 Áudio

O pacote contém **460 MP3 pt-BR presentes e atualizados**, gerenciados por
catálogo e lockfile. O pipeline:

- planeja apenas arquivos ausentes ou alterados;
- usa nomes e hashes determinísticos;
- evita duplicação;
- diferencia palavras, exemplos, verbos, frases e conteúdo do Ateliê;
- oferece verificação física antes do build;
- suporta reprodução normal e lenta;
- impede sobreposição de dois áudios.

Áudio de lema só é exibido quando o arquivo pronuncia exatamente o infinitivo.
Por isso, `sentir saudade` não é usado como áudio isolado de `sentir`.

### 3.7 Knowledge Base e navegação semântica

O `semanticGraph.ts` centraliza as relações entre:

- termos lexicais equivalentes;
- ocorrências em cenários;
- verbos e construções infinitivas;
- contextos de cena;
- moods do Ateliê;
- Conjugador;
- Vocabulário;
- revisão direcionada.

Fluxos já operacionais:

```text
Ateliê → verbo → Conjugador → contexto → cenário/mood
Vocabulário → ocorrência → cenário → revisão
Cenário → verbo útil → Conjugador
Expressão infinitiva → contexto de origem
```

A normalização ignora caixa, espaços redundantes e artigos em comparações
lexicais. Construções como `pegar (o ônibus)` e `pegar o ônibus` resolvem para o
mesmo lema canônico.

---

## 4. Arquitetura técnica atual

### 4.1 Stack

- React 19;
- TypeScript 6;
- Vite 8;
- React Router 6;
- Zod 4;
- Vitest e Testing Library;
- Playwright, Chromium e Axe;
- Sharp para imagens;
- Edge TTS no pipeline externo de áudio.

### 4.2 Camadas existentes

```text
src/content/data
  JSONs versionados do Knowledge Core

src/content/schemas.ts
  contratos Zod e integridade estrutural

src/repositories
  conteúdo, preferências, progresso e tentativas

src/domain
  agendamento, domínio e métricas puras

src/context
  composição React do estado da aplicação

src/data
  adaptadores de compatibilidade e conteúdo editorial expandido

src/lib
  áudio, naming, recomendação e grafo semântico

src/pages e src/components
  apresentação e interação
```

### 4.3 Persistência

O produto ainda é local-first:

- preferências em `localStorage` por `PreferencesRepository`;
- progresso em `ProgressRepository`;
- tentativas em `AttemptRepository`;
- contratos versionados e migração de estados legados;
- usuário lógico `local-user`;
- ausência deliberada de backend e autenticação nesta baseline.

### 4.4 Aprendizagem e revisão atuais

O `LearningContext` registra tentativas. O domínio atual calcula:

- acurácia;
- independência do idioma de apoio;
- variedade de modalidade;
- evidência de domínio;
- erros recorrentes;
- repetição espaçada com avaliações `again`, `hard`, `good` e `easy`.

O domínio de revisão é útil e será preservado. A próxima arquitetura acrescentará
evidência por **habilidade**, sem apagar tentativas nem substituir o agendador.

### 4.5 Exercícios existentes

Há cinco renderizadores na Trilha:

| Chave | Formato atual | Competência declarada |
| --- | --- | --- |
| `choice` | escolha contextual | contexto |
| `flash` | flashcard visual | visual |
| `order` | ordenar frase | sintaxe |
| `listen` | compreensão oral | escuta |
| `registro` | classificar registro | registro |

O `PracticeModal` dos cenários oferece prática contextual adicional. Entretanto,
os conteúdos ainda são decididos pelos próprios módulos. Essa é a fronteira que
o novo motor irá substituir progressivamente.

---

## 5. Qualidade confirmada na clonagem

| Gate | Resultado |
| --- | --- |
| `npm run validate:content` | 8 cenas, 90 ocorrências, 78 itens lexicais de cena e 50 verbos Core válidos |
| `npm run art:verify` | 24 moods otimizados e arquivados |
| `npm run audio:verify` | 460 MP3 válidos |
| `npm run verbs:verify` | 112 lemas, 112 quadros, 67 áudios de lema e 3 relações |
| `npm run test` | 59 testes aprovados |
| `npm run test:e2e` | 13 fluxos aprovados |
| Acessibilidade automatizada | Dashboard, cenário e Ateliê sem violações WCAG A/AA detectadas |
| `npm run lint` | aprovado |
| `npm run typecheck` | aprovado |
| `npm run build` | aprovado |

O build mantém um aviso não bloqueante de bundle JavaScript acima de 500 kB. O
code splitting deverá ser considerado antes de o novo motor aumentar o bundle.

---

## 6. Limitações e débitos conhecidos

1. **Persistência apenas local:** não há sincronização entre dispositivos.
2. **Knowledge Core híbrido:** 50 verbos estão nos JSONs históricos; 62 estão na
   camada expandida TypeScript. A migração integral deverá ser posterior ao
   protótipo, para não misturar mudança de modelo e mudança pedagógica.
3. **Exercícios acoplados à tela:** os renderizadores atuais contêm parte da
   seleção de conteúdo e da avaliação.
4. **Progresso agregado:** ainda não existe domínio completo por
   entidade × habilidade.
5. **Confusões pouco estruturadas:** erros recorrentes são identificados, mas não
   existe matriz explícita entre resposta esperada e selecionada.
6. **Produção livre:** não há avaliação confiável de texto ou fala aberta.
7. **Áudio conjugado:** há áudio de lemas, expressões e frases, mas não das 112
   tabelas em todas as pessoas e tempos.
8. **Artes pendentes:** oito combinações de mood/personagem ainda dependem do
   pipeline de imagem.
9. **Bundle único:** a maior parte das telas ainda entra no mesmo chunk inicial.
10. **IA ausente por decisão:** nenhuma geração de conteúdo ocorre em runtime.

Esses limites não bloqueiam o protótipo. Eles definem fronteiras para evitar que
o novo motor prometa capacidades ainda não sustentadas por dados ou assets.

---

## 7. Arquitetura-alvo do ciclo pedagógico

### 7.1 Princípios

1. Um único botão contextual: **Praticar**.
2. O exercício nasce da habilidade, não da seção.
3. Conhecimento, planejamento, renderização e evidência são camadas diferentes.
4. Capacidades pedagógicas são derivadas dos dados e assets, com overrides
   editoriais apenas quando necessário.
5. Toda interação mantém proveniência e IDs das entidades usadas.
6. O planejador nunca cria uma interação que os assets ou o schema não suportem.
7. Produção livre começa com orientação e autoavaliação, não com correção falsa.
8. A revisão existente permanece a fonte de agendamento.
9. O protótipo precisa funcionar sem backend e sem IA.

### 7.2 Taxonomia inicial de habilidades

```ts
type LearningSkill =
  | 'discovery'
  | 'recognition'
  | 'association'
  | 'listening'
  | 'ordering'
  | 'conjugation'
  | 'application'
  | 'transfer'
  | 'production'
  | 'review';
```

Progressão recomendada:

```text
Descobrir → Reconhecer → Relacionar → Aplicar
          → Transferir → Produzir → Revisar
```

Nem toda entidade precisa suportar todas as habilidades.

### 7.3 DNA pedagógico derivado

O conteúdo canônico não deverá receber dezenas de flags duplicadas. Um
`TeachingProfileResolver` combinará entidade, grafo e inventário de assets.

```ts
interface TeachingProfile {
  entityRef: KnowledgeEntityRef;
  capabilities: LearningSkill[];
  modalities: Array<'text' | 'audio' | 'image' | 'scene'>;
  difficultyRange: [number, number];
  relationIds: string[];
  editorialOverrides?: Partial<Record<LearningSkill, boolean>>;
}
```

Regras iniciais:

- imagem válida → reconhecimento visual;
- áudio válido → escuta;
- paradigma completo → conjugação e transformação temporal;
- ocorrência em cena → descoberta contextual;
- relação no grafo → associação e transferência;
- frase validada → ordenação;
- prompt editorial → produção guiada.

### 7.4 Contrato de entidade

O motor deverá trabalhar com referências discriminadas, não com objetos genéricos
sem tipo:

```ts
type KnowledgeEntityRef =
  | { type: 'lexical-item'; id: string }
  | { type: 'scene-occurrence'; id: string }
  | { type: 'verb'; id: string }
  | { type: 'verb-expression'; id: string }
  | { type: 'emotion'; id: string }
  | { type: 'phrase'; id: string }
  | { type: 'scene'; id: string };
```

### 7.5 Contexto de prática

```ts
interface PracticeContext {
  origin: KnowledgeEntityRef;
  originRoute: string;
  sceneId?: string;
  moodId?: string;
  selectedGender?: 'feminine' | 'masculine';
  supportLanguage: boolean;
  availableAssets: {
    audio: boolean;
    image: boolean;
    scene: boolean;
  };
}
```

O contexto garante que um exercício iniciado em Transporte reutilize a imagem e
os itens de Transporte, em vez de trocar silenciosamente para um exemplo genérico.

### 7.6 LearningInteraction

```ts
type InteractionKind =
  | 'exercise'
  | 'comparison'
  | 'challenge'
  | 'conversation'
  | 'micro-mission'
  | 'guided-production';

interface LearningInteraction {
  id: string;
  kind: InteractionKind;
  sourceEntityRefs: KnowledgeEntityRef[];
  generatorId: string;
  skill: LearningSkill;
  difficulty: number;
  estimatedSeconds: number;
  dependencies: string[];
  tags: string[];
  context: PracticeContext;
  prompt: { pt: string; ru: string };
  assets?: { audio?: string; image?: string; sceneId?: string };
  answerSpec: AnswerSpec;
  feedback: {
    correct: { pt: string; ru: string };
    incorrect: { pt: string; ru: string };
  };
  nextRecommendation?: {
    skill: LearningSkill;
    entityRef?: KnowledgeEntityRef;
  };
  provenance: 'generated' | 'editorial';
}
```

`AnswerSpec` será uma união discriminada para escolha, ordenação, comparação,
autoavaliação e produção guiada. Isso evita fingir que toda interação tem uma
única `correctAnswer` textual.

### 7.7 Planejador e geradores

Responsabilidades:

- **TeachingProfileResolver:** determina o que pode ser ensinado;
- **PracticePlanner:** escolhe habilidades, ordem e dificuldade;
- **SkillGenerator:** cria uma interação compatível;
- **InteractionValidator:** verifica schema, referências e respostas;
- **RendererRegistry:** seleciona o componente visual;
- **InteractionEvaluator:** avalia quando houver resposta objetiva;
- **EvidenceRecorder:** registra tentativa e evidência por habilidade;
- **ReviewPolicy:** recomenda retorno sem substituir o agendador atual.

Geradores iniciais:

- `RecognitionGenerator`;
- `AssociationGenerator`;
- `ConjugationGenerator`;
- `ListeningGenerator`;
- `OrderingGenerator`;
- `ProductionGenerator`;
- `ReviewGenerator`.

### 7.8 Sessões e cadeias

Uma `PracticeSession` deverá conter de três a cinco interações no MVP. O
planejador pode produzir uma cadeia como:

```text
surpresa
  → reconhecer a arte
  → associar reagir
  → escolher uma forma conjugada
  → aplicar em uma frase
  → sugerir um cenário relacionado
```

A mudança de módulo nunca será automática. O encerramento poderá oferecer:

> Você conectou “reagir” ao cenário Transporte. Abrir o cenário?

### 7.9 Evidência por habilidade e memória de confusão

```ts
interface EntitySkillEvidence {
  entityRef: KnowledgeEntityRef;
  skill: LearningSkill;
  attempts: number;
  correct: number;
  mastery: number;
  lastAttemptAt: string;
  nextReviewAt?: string;
}

interface ConfusionEvidence {
  expected: KnowledgeEntityRef;
  selected: KnowledgeEntityRef;
  skill: LearningSkill;
  count: number;
  lastOccurredAt: string;
}
```

Esses resultados devem ser derivados do log sempre que possível. Uma pessoa que
confunde `surpresa` com `assustada` receberá comparação entre as duas, não apenas
a repetição idêntica da pergunta anterior.

---

## 8. Plano detalhado de implantação

### Fase P0 — Baseline e contratos de proteção

**Objetivo:** congelar o comportamento atual e preparar o protótipo.

Entregas:

- este documento;
- branch isolada;
- inventário automatizado de entidades e assets;
- testes de caracterização das rotas atuais;
- feature flag `pedagogicalCycle` inicialmente desligada;
- ADRs para decisões irreversíveis.

Critérios de aceite:

- todos os gates da baseline permanecem verdes;
- nenhuma mudança visual com a flag desligada;
- produção e app2 continuam independentes.

### Fase P1 — Domínio de interações

**Estado em 17/07/2026:** implementada no app2. A descrição técnica, as métricas
do índice e as decisões de inferência estão em
[`P1_DOMINIO_PEDAGOGICO.md`](P1_DOMINIO_PEDAGOGICO.md).

**Objetivo:** criar contratos puros, sem nova interface.

Entregas:

- `KnowledgeEntityRef`;
- `LearningSkill` e `InteractionKind`;
- `TeachingProfile` e resolver inicial;
- `PracticeContext`;
- `AnswerSpec` discriminado;
- `LearningInteraction` e schema Zod;
- adaptadores para verbo, mood, cena, ocorrência e item lexical;
- validação de IDs e assets.

Critérios de aceite:

- perfis determinísticos para todas as entidades suportadas;
- nenhuma interação de escuta sem MP3 existente;
- nenhuma interação visual sem imagem ou fallback permitido;
- cobertura unitária das matrizes de capacidade.

### Fase P2 — Planejador e primeiro botão Praticar

**Estado em 17/07/2026:** implementada no app2. Consulte
[`P2_PLANEJADOR_E_PRATICA_CONTEXTUAL.md`](P2_PLANEJADOR_E_PRATICA_CONTEXTUAL.md).

**Objetivo:** produzir a primeira sessão contextual ponta a ponta.

Entregas:

- `PracticePlanner` determinístico e seed opcional;
- botão único **Praticar** atrás da feature flag;
- `PracticeDrawer` ou painel responsivo compartilhado;
- sessão de três interações;
- `RecognitionGenerator`;
- `AssociationGenerator`;
- `ConjugationGenerator`;
- adaptadores dos renderizadores atuais;
- registro no `LearningContext` existente.

Primeiros pontos de entrada:

- mood selecionado no Ateliê;
- verbo aberto no Conjugador;
- hotspot selecionado no cenário.

Critérios de aceite:

- o botão preserva o contexto de origem;
- a mesma entidade gera a mesma sessão com a mesma seed;
- respostas produzem `Attempt` válido;
- fechar o painel devolve foco ao botão de origem;
- fluxo funciona no mobile e por teclado.

### Fase P3 — Cadeias e transferência entre módulos

**Objetivo:** transformar listas de perguntas em progressão pedagógica.

Entregas:

- `PracticeSession` com estado explícito;
- dependências entre interações;
- seleção progressiva de habilidade;
- tela de transição e recomendação;
- exercícios de ligação Ateliê ↔ verbo ↔ cenário;
- exercícios de locução e objeto, como `pegar o ônibus`;
- retorno seguro à rota de origem.

Critérios de aceite:

- cadeias têm de três a cinco passos;
- não há troca automática de página;
- cada passo declara as entidades usadas;
- o grafo não produz ciclos infinitos nem relações sem destino.

### Fase P4 — Progresso por habilidade e revisão adaptativa

**Objetivo:** dar memória pedagógica ao sistema.

Entregas:

- agregação `entidade × habilidade`;
- matriz de confusões;
- comparação gerada após erros recorrentes;
- recomendação baseada em fraqueza;
- integração com a fila de revisão;
- visualização de habilidades na tela Progresso;
- migração compatível do estado local.

Critérios de aceite:

- nenhum progresso anterior é perdido;
- mastery por habilidade é derivável das tentativas;
- confusão é registrada apenas quando há duas entidades válidas;
- revisão continua obedecendo ao agendador existente.

### Fase P5 — Escuta, ordenação e produção guiada

**Objetivo:** ampliar modalidades sem inventar assets.

Entregas:

- `ListeningGenerator` condicionado ao catálogo;
- `OrderingGenerator` condicionado a frases validadas;
- produção guiada com scaffolding;
- autoavaliação para respostas abertas;
- feedback bilíngue por habilidade;
- política de dificuldade.

Critérios de aceite:

- todos os MP3 usados passam por `audio:verify`;
- ordenação aceita apenas tokens e soluções revisadas;
- produção livre não recebe nota automática de certo/errado;
- idioma de apoio respeita a configuração do estudante.

### Fase P6 — Conteúdo editorial e micro missões

**Objetivo:** combinar escala automática com intenção autoral.

Entregas:

- repositório de interações editoriais;
- proveniência obrigatória;
- política inicial aproximada de 70% gerado e 30% editorial;
- `MicroMissionPlanner`;
- missões entre módulos;
- objetivos como “encontre três verbos da casa” ou “use duas emoções”.

Critérios de aceite:

- conteúdo editorial usa o mesmo schema das interações geradas;
- a proporção é configurável, não hardcoded na UI;
- missões registram evidências por passo;
- interrupção e retomada não corrompem a sessão.

### Fase P7 — Preparação para IA e backend opcional

**Objetivo:** permitir expansão futura sem confiar cegamente em geração livre.

Entregas possíveis:

- provider de geração atrás de interface;
- entrada limitada a entidades e relações válidas;
- saída validada por schema;
- moderação e limites de custo;
- cache de interações aprovadas;
- autenticação e sincronização remota, em projeto separado.

Critérios de aceite:

- o app continua funcional sem IA;
- nenhuma saída não validada chega ao estudante;
- conteúdo gerado registra modelo, prompt versionado e proveniência;
- dados pessoais não entram no prompt sem política explícita.

---

## 9. Estrutura de pastas proposta

```text
src/
  pedagogy/
    contracts/
      entities.ts
      interactions.ts
      skills.ts
      answers.ts
    profiles/
      teachingProfileResolver.ts
      capabilityRules.ts
    generators/
      recognitionGenerator.ts
      associationGenerator.ts
      conjugationGenerator.ts
      listeningGenerator.ts
      orderingGenerator.ts
      productionGenerator.ts
    planner/
      practicePlanner.ts
      practicePolicy.ts
      sessionBuilder.ts
    evidence/
      skillEvidence.ts
      confusionEvidence.ts
    validation/
      interactionSchemas.ts
      interactionValidator.ts
    adapters/
      verbAdapter.ts
      emotionAdapter.ts
      sceneAdapter.ts
      lexicalAdapter.ts
  components/practice/
    PracticeButton.tsx
    PracticeDrawer.tsx
    PracticeSessionView.tsx
    renderers/
```

O novo domínio não deve ser criado dentro de uma página específica. Também não
deve importar React. Componentes podem importar o domínio; o domínio não pode
importar componentes.

---

## 10. Estratégia de testes

### Testes unitários

- resolução de capacidades por tipo de entidade;
- geração determinística;
- qualidade de distratores;
- ausência de respostas ambíguas;
- validação de assets;
- progressão de dificuldade;
- evidência e confusão;
- migração de persistência.

### Testes de propriedade

Para lotes gerados:

- IDs únicos;
- resposta correta nunca aparece duplicada nos distratores;
- todos os IDs resolvem na Knowledge Base;
- todo áudio existe;
- toda imagem existe ou possui fallback permitido;
- prompt e feedback existem nos dois idiomas;
- nenhuma cadeia excede o limite configurado.

### Testes E2E

- Ateliê → Praticar → sessão → evidência;
- Conjugador → Praticar → transformação temporal;
- Cenário → Praticar → associação verbo–objeto;
- erro recorrente → comparação na revisão;
- mobile, teclado, foco e fechamento;
- feature flag desligada preservando a baseline.

### Gate por fase

Toda fase deve passar:

```powershell
npm run validate:content
npm run art:verify
npm run audio:verify
npm run verbs:verify
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

---

## 11. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Gerador cria pergunta ambígua | schema, regras de distrator e testes de propriedade |
| DNA pedagógico diverge dos assets | capacidades derivadas, não copiadas manualmente |
| UI vira um segundo sistema de exercícios | adaptadores dos renderizadores existentes |
| Progresso antigo é perdido | versionamento e migração explícita |
| Cadeias desorientam o usuário | painel único, transições consentidas e retorno à origem |
| Muitos estados simultâneos | `PracticeSession` como máquina de estados explícita |
| Conteúdo gerado perde qualidade autoral | proveniência e mistura editorial configurável |
| Bundle cresce excessivamente | lazy loading do painel e dos renderizadores |
| IA cria conteúdo incorreto | provider opcional, contexto limitado e validação obrigatória |
| Escopo cresce antes do MVP | feature flag e critérios de aceite por fase |

---

## 12. Primeira sprint recomendada

Ordem de execução:

1. criar `src/pedagogy/contracts`;
2. definir `KnowledgeEntityRef`, `LearningSkill`, `AnswerSpec` e
   `LearningInteraction`;
3. criar schemas Zod equivalentes;
4. implementar adaptadores somente para `emotion`, `verb` e
   `scene-occurrence`;
5. criar `TeachingProfileResolver` derivado;
6. gerar relatório de capacidades da baseline;
7. criar `RecognitionGenerator` e `AssociationGenerator` puros;
8. adicionar testes de propriedade;
9. criar feature flag local desligada;
10. integrar o primeiro botão **Praticar** apenas no Ateliê;
11. abrir `PracticeDrawer` com três interações determinísticas;
12. registrar respostas no `LearningContext` atual;
13. validar desktop, mobile, teclado e regressão.

Não entra na primeira sprint:

- IA;
- backend;
- avaliação automática de texto livre;
- áudio de todas as conjugações;
- migração dos 62 verbos para JSON;
- micro missões completas;
- redesign da tela Progresso.

---

## 13. Definição de pronto do primeiro protótipo

O primeiro protótipo estará pronto quando:

- houver um único botão **Praticar** no mood ativo;
- o planner receber o mood e o contexto visual atual;
- uma sessão de três passos combinar reconhecimento e associação;
- todas as interações forem validadas por schema;
- nenhum conteúdo for codificado dentro do componente do Ateliê;
- a resposta gerar `Attempt` com entidade, habilidade e generator ID;
- fechar ou concluir preservar a navegação e o progresso do Ateliê;
- o recurso puder ser desligado sem alterar a experiência da baseline;
- os gates completos continuarem verdes;
- a documentação arquitetural for atualizada com decisões tomadas durante o
  protótipo.

---

## 14. Comandos operacionais

```powershell
cd C:\Users\helen\Documents\matrioskinha\matrioskinha-app2
npm run dev
```

Validação rápida:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Validação completa:

```powershell
npm run check:all
```

Referência de produção:

```powershell
git log production-snapshot/main -1 --oneline
```

O protótipo deve permanecer na branch `prototype/pedagogical-cycle` até que suas
entidades, persistência e experiência estejam suficientemente estáveis para um
plano explícito de integração com a aplicação de produção.
