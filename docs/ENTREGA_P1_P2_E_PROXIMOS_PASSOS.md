# Entrega consolidada — Knowledge Base e ciclo pedagógico P1/P2

**Data da consolidação:** 17 de julho de 2026  
**Origem:** `matrioskinha-app2`, branch de protótipo pedagógico  
**Destino:** promoção integral para `matrioskinha-app`, repositório de produção

## 1. Estado desta entrega

Esta versão reúne a aplicação anterior e a primeira camada executável do novo
ciclo pedagógico. A interface deixa de ser apenas uma coleção de páginas e passa
a compartilhar entidades, relações, assets e evidências entre Ateliê, Cenários,
Conjugador, Vocabulário, Trilha, Revisão e Progresso.

Estão entregues:

- baseline React + TypeScript preservada;
- Knowledge Core versionado e validado por schemas Zod;
- Knowledge Base navegável entre emoções, expressões, verbos e cenários;
- Ateliê das Emoções bilíngue com personagens, exemplos e contexto cultural;
- Conjugador expandido, inclusive com verbos reflexivos e expressões no
  infinitivo relacionadas ao lema;
- pipelines incrementais de áudio e imagens;
- P1, domínio pedagógico tipado;
- P2, planejador determinístico e prática contextual;
- evidências de tentativa integradas ao motor de aprendizagem;
- navegação lateral reorganizada segundo a jornada do estudante;
- suíte automatizada de conteúdo, domínio, interface, acessibilidade e build.

Os documentos detalhados que permanecem como fonte complementar são:

- [`BASELINE_E_ROADMAP_CICLO_PEDAGOGICO.md`](BASELINE_E_ROADMAP_CICLO_PEDAGOGICO.md);
- [`P1_DOMINIO_PEDAGOGICO.md`](P1_DOMINIO_PEDAGOGICO.md);
- [`P2_PLANEJADOR_E_PRATICA_CONTEXTUAL.md`](P2_PLANEJADOR_E_PRATICA_CONTEXTUAL.md);
- [`knowledge-navigation.md`](knowledge-navigation.md);
- [`audio-pipeline.md`](audio-pipeline.md);
- [`emotion-image-pipeline.md`](emotion-image-pipeline.md);
- [`verb-curation.md`](verb-curation.md).

## 2. Arquitetura entregue

O fluxo principal está dividido em camadas:

```text
Knowledge Core e assets validados
                ↓
Adaptadores de entidades pedagógicas
                ↓
TeachingProfile + capacidades disponíveis
                ↓
PracticePlanner determinístico
                ↓
Geradores de reconhecimento, associação e conjugação
                ↓
PracticeDrawer compartilhado
                ↓
Attempt validado + métricas derivadas
```

### 2.1 Knowledge Base

Cada objeto pedagógico possui referência estável por tipo e ID. O repositório
unificado resolve emoções, verbos, frases, itens lexicais, cenas e ocorrências de
hotspots sem duplicar conteúdo canônico.

As relações possibilitam navegar e gerar atividades como:

```text
emoção → expressão relacionada → verbo → conjugador
hotspot → item lexical → verbo → expressão no infinitivo
verbo → ocorrência em cenário → contexto → revisão
```

Links entre módulos mantêm o contexto por parâmetros de rota e permitem abrir
diretamente o mood, verbo, cena ou ocorrência relevante.

### 2.2 P1 — domínio pedagógico

A P1 introduziu contratos independentes de React:

- `KnowledgeEntityRef`;
- `LearningSkill` e `InteractionKind`;
- `TeachingProfile`;
- `PracticeContext`;
- `AnswerSpec` discriminado;
- `LearningInteraction`;
- `PracticeSession`;
- schemas de validação e registro de assets pedagógicos.

O resolver de perfis determina capacidades somente quando os pré-requisitos
existem. Uma atividade auditiva depende de MP3 registrado; uma atividade visual
depende de imagem validada; conjugação depende de paradigma completo.

### 2.3 P2 — prática contextual

A P2 adicionou um planejador puro e determinístico. A mesma origem e a mesma
seed geram os mesmos passos, distratores e IDs. O fluxo inicial usa três
interações e está disponível em:

- mood selecionado no Ateliê;
- infinitivo aberto no Conjugador;
- hotspot selecionado em um Cenário.

Os geradores atuais são:

- `RecognitionGenerator`;
- `AssociationGenerator`;
- `ConjugationGenerator`.

O `PracticeDrawer` é único para todos os módulos, atua como painel lateral no
desktop e bottom sheet no mobile, prende o foco durante a atividade, fecha com
Escape e devolve o foco ao ponto de origem.

P1/P2 estão ativas por padrão no build de produção. A configuração
`VITE_PEDAGOGICAL_CYCLE=false` funciona como kill switch operacional.

## 3. Política pedagógica de idioma

O produto ensina português brasileiro a falantes de russo. Por isso, idioma de
interface e idioma da resposta não são equivalentes.

Regras consolidadas:

- menus, instruções e feedback acompanham o toggle português/russo;
- cada questão apresenta somente um enunciado;
- não há tradução paralela abaixo da pergunta;
- alternativas de resposta permanecem em português;
- a tradução russa pode atuar como estímulo de reconhecimento;
- o rótulo do áudio não escreve a resposta antes da escolha;
- o áudio pode ser uma pista auditiva deliberada;
- traduções explicativas podem aparecer após a resposta ou no conteúdo aberto.

Essa separação evita que uma questão bilíngue revele sua própria solução.

## 4. Ateliê das Emoções

O Ateliê tornou-se a superfície de destaque dos Cenários e oferece:

- 16 moods, com tratamento feminino e masculino;
- Matrioskinha e Misha Matrioshkin com nomes em cirílico no modo russo;
- adjetivo isolado como tradução direta;
- frases de aplicação para `ser` e `estar`;
- formas para falar de si;
- explicação de uso;
- curiosidade cultural;
- verbos e expressões relacionados;
- áudio individual e contextual;
- progresso de uso no contexto;
- entrada direta para prática contextual.

As artes são carregadas automaticamente quando um mood validado existe. Até
isso ocorrer, o fallback visual permanece funcional.

## 5. Cenários e navegação da Knowledge Base

Os cenários estão agrupados em macrocoleções com hierarquia visual própria:

- Ateliê das Emoções;
- Casa;
- Cidade e Serviços;
- Mobilidade.

Entidades compartilhadas recebem links contextuais. Um verbo presente em uma
expressão como `pegar o ônibus` pode abrir o infinitivo `pegar`; o Conjugador
lista a expressão relacionada no infinitivo e reutiliza o áudio quando já existe.

## 6. Conjugador e curadoria verbal

O Conjugador consolida verbos do Knowledge Core, Cenários e Ateliê. A entrega
inclui:

- verbos regulares, irregulares e reflexivos;
- presente e pretérito perfeito;
- distinção feminina e masculina no passado russo;
- áudio do infinitivo quando disponível;
- conjugação completa para os paradigmas curados;
- origem e ocorrências do verbo;
- seção de expressões relacionadas no infinitivo;
- links de retorno a moods e cenários;
- entrada para prática contextual.

Expressões relacionadas não são conjugadas como uma unidade artificial. Elas
permanecem no infinitivo e são associadas ao lema que realmente contêm.

## 7. Assets e pipelines

### 7.1 Áudio

O pipeline Edge TTS é incremental, deduplicado e validado por catálogo e
lockfile. Ele alterna vozes quando configurado, não regenera arquivos cujo texto,
voz e fornecedor permanecem iguais e produz uma projeção TypeScript consumível
pelo registro pedagógico no navegador.

Comandos principais:

```powershell
npm run audio:plan
npm run audio:generate
npm run audio:verify
```

### 7.2 Imagens

O pipeline de moods:

- detecta PNG/JPG colocado no diretório previsto;
- preserva o original fora de `public`;
- gera WebP otimizado;
- registra hash e metadados no manifesto;
- publica somente o derivado adequado à interface;
- não reprocessa conteúdo idêntico.

Comandos principais:

```powershell
npm run art:sync
npm run art:watch
npm run art:verify
```

## 8. Navegação lateral promovida

A navegação agora representa uma jornada pedagógica:

1. **Início:** Visão geral, Minha trilha, Continuar aula;
2. **Explorar:** Ateliê das Emoções, Cenários, Vocabulário visual, Brasil real;
3. **Estudar:** Conjugador de verbos, Tu × você, Áudio e pronúncia;
4. **Praticar:** Banco de exercícios, Revisão;
5. **Acompanhar:** Desempenho;
6. **Configurações:** Preferências.

Atalhos que compartilham a mesma rota possuem seleção exclusiva. Por exemplo,
abrir o Ateliê não deixa Ateliê e Cenários marcados simultaneamente.

## 9. Evidências e memória existentes

Cada resposta da P2 produz um `Attempt` com proveniência pedagógica:

- entidade;
- habilidade;
- gerador;
- interação;
- sessão;
- acerto ou erro;
- duração;
- uso do idioma de apoio.

O estado atual usa persistência local:

- tentativas em `localStorage`, com schema versionado e limite de 1.000;
- progresso com schema versionado;
- preferência de idioma;
- métricas, domínio e erros recorrentes derivados das tentativas.

Limite conhecido: a sessão P2 aberta ainda vive no estado do React e não é
retomada após atualização da página. Essa é a razão para a P2.5.

## 10. Próxima implantação — P2.5 Storage pedagógico

Antes das cadeias maiores da P3, será criada uma camada persistente preparada
para evolução sem custo obrigatório de infraestrutura.

Escopo recomendado:

- interfaces assíncronas de repositório;
- IndexedDB como driver local;
- migração sem perda do `localStorage` atual;
- `PracticeSessionSnapshot` versionado;
- estados `active`, `paused`, `completed` e `abandoned`;
- retomada por seed e versão do plano;
- repositórios de tentativa, progresso, revisão e preferências;
- exportação/importação de dados;
- recuperação de registros inválidos;
- contratos preparados para futura sincronização remota.

IndexedDB não cria custo de serviço. Banco remoto e object storage só serão
necessários quando houver login, múltiplos dispositivos, painel de professor,
backup centralizado ou uploads dinâmicos.

## 11. Roadmap posterior

### P3 — Cadeias e transferência

- sessões de três a cinco passos;
- Ateliê ↔ expressão ↔ verbo ↔ cenário;
- locuções como `pegar o ônibus`;
- transições e recomendação final;
- prevenção de ciclos no grafo;
- pausa e retomada sobre a memória da P2.5.

### P4 — Progresso por habilidade

- evidência por entidade × habilidade;
- matriz de confusões;
- revisão adaptativa;
- recomendações por fraqueza;
- visualização na tela Progresso.

### P5 em diante

- escuta, ordenação e produção guiada;
- conteúdo editorial e micro missões;
- autenticação, backend e sincronização opcionais;
- geração assistida por IA sempre sujeita aos schemas e validadores existentes.

## 12. Gate de entrega e deploy

Antes de promover uma versão, executar:

```powershell
npm run check
npm run test:e2e
```

O gate verifica:

- Knowledge Core;
- integridade de imagens;
- integridade de áudio;
- índice verbal;
- índice e planejamento pedagógico;
- lint;
- tipos;
- testes e cobertura;
- build de produção;
- fluxos reais e acessibilidade no Chromium.

O diretório de produção deve preservar seu próprio `.git`. Arquivos derivados e
locais ignorados — `node_modules`, `dist`, `coverage`, relatórios e `.env` — não
fazem parte do conteúdo versionado a ser promovido.
