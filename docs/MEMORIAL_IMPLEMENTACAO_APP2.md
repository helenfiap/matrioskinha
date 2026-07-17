# Memorial de implementação — Matrioskinha App 2

**Estado de referência:** 16 de julho de 2026  
**Stack:** React 19, TypeScript 6, Vite 8 e React Router 6  
**Persistência atual:** navegador (`localStorage`)  
**Distribuição:** aplicação estática compatível com Vercel

## 1. Resumo executivo

O Matrioskinha App 2 evolui o mockup inicial para uma aplicação educacional bilíngue, testável e orientada por dados. A versão atual combina exploração visual de cenários, vocabulário contextual, conjugação, trilha de aprendizagem, missões, revisão espaçada, acompanhamento de progresso e áudio em português brasileiro.

O produto funciona integralmente no navegador, sem backend obrigatório. O conteúdo não está mais espalhado pelas telas: ele foi consolidado em um **Knowledge Core canônico**, validado por schemas Zod e acessado por repositórios. Essa base permite criar novos cenários, exercícios, áudios e experiências sem duplicar o mesmo vocabulário em vários componentes.

## 2. Fases implementadas

### Fase 0 — Fundação e clone seguro

- criação do `matrioskinha-app2` como área de evolução independente;
- preservação visual e funcional do mockup original;
- migração para componentes React + TypeScript;
- configuração do Vite e build de produção;
- roteamento por URL com `HashRouter`, adequado a hospedagem estática;
- organização inicial de páginas, layout, dados e estilos;
- suporte global aos idiomas português e russo.

### Fase 1 — Qualidade e proteção contra regressões

- testes unitários e de componentes com Vitest e Testing Library;
- testes de fluxo real com Playwright e Chromium;
- verificações automáticas de acessibilidade com Axe;
- validação de conteúdo, lint, typecheck, cobertura e build;
- workflow de integração contínua em `.github/workflows/ci.yml`;
- comandos agregados `npm run check` e `npm run check:all`.

### Fase 2 — Knowledge Core e arquitetura de conteúdo

- schemas Zod para todas as entidades centrais;
- JSON versionado como fonte canônica de conteúdo;
- separação entre item lexical e ocorrência dentro de uma cena;
- relações semânticas entre vocabulário, exemplos, verbos, cenas e missões;
- camada de repositório para desacoplar a UI dos arquivos JSON;
- adaptadores de compatibilidade para componentes anteriores;
- scripts para migração e validação estrutural do conteúdo;
- documentação arquitetural em `docs/architecture-phase-2.md`.

### Fase 3 — Motor de aprendizagem

- registro persistente de tentativas e evidências de domínio;
- cálculo de progresso por item, lição e experiência;
- agendamento de revisão espaçada;
- fila de recomendações baseada no estado real do estudante;
- missões contextuais ligadas aos cenários;
- seis estágios de progressão pedagógica;
- painéis de progresso e revisão alimentados pelo domínio;
- documentação arquitetural em `docs/architecture-phase-3.md`.

### Incremento atual — Pacote de áudio

- pipeline incremental em lote baseado no Knowledge Core;
- 223 MP3 pt-BR gerados e validados;
- catálogo e lockfile com texto, voz, caminho e hash;
- integração visual por ícones de alto-falante do Lucide;
- reprodução em cartões de vocabulário e painéis dos cenários;
- prevenção de sobreposição entre dois áudios;
- suporte a reprodução mais lenta;
- estados acessíveis de reprodução e erro.

## 3. Superfícies do produto

| Rota | Tela | Função principal |
| --- | --- | --- |
| `#/` | Dashboard | visão geral, continuidade e indicadores do estudante |
| `#/trilha` | Trilha | progressão por estágios, aulas e exercícios |
| `#/vocab` | Vocabulário | consulta e estudo dos itens lexicais |
| `#/cenarios` | Cenários | exploração por hotspots, contexto, missão e prática |
| `#/conjugador` | Conjugador | consulta dos paradigmas verbais |
| `#/progresso` | Progresso | domínio, revisões e histórico de aprendizagem |
| `#/config` | Configurações | preferências locais e idioma da interface |

O layout compartilhado é composto por `AppShell`, barra lateral e barra superior. A interface usa o mesmo sistema visual em todas as telas e alterna os textos entre português e russo pelo `LanguageContext`.

## 4. Conteúdo canônico

O manifesto validado registra:

| Entidade | Quantidade |
| --- | ---: |
| Ocorrências em cenários | 90 |
| Itens lexicais presentes nos cenários | 78 |
| Itens lexicais totais | 89 |
| Verbos | 50 |
| Cenários | 8 |
| Missões | 8 |

Entidades principais:

- `LexicalItem`: palavra ou expressão canônica, sentidos e exemplos;
- `SceneOccurrence`: presença e posição de um item em um cenário;
- `Phrase`: exemplo lexical, verbo de cena ou frase comunicativa;
- `Scene`: imagem, nível, ocorrências, frases e notas culturais;
- `Verb`: paradigma verbal canônico;
- `Mission`: objetivo contextual e sequência de itens;
- `Lesson` e `ExerciseTemplate`: estrutura da trilha e dos exercícios;
- `CultureNote`: observação cultural ligada ao contexto;
- `VocabularyCard`: adaptação editorial para a tela de vocabulário.

O schema verifica unicidade de IDs, integridade das referências, pertencimento de ocorrências às cenas, relações semânticas e concordância das contagens do manifesto.

## 5. Cenários disponíveis

| Grupo atual | Cenário | Nível | Hotspots |
| --- | --- | --- | ---: |
| Casa | Sala | A1 | 12 |
| Casa | Cozinha | A1 | 11 |
| Casa | Quarto | A1 | 11 |
| Casa | Banheiro | A1 | 11 |
| Casa | Lavanderia | A1 | 12 |
| Cidade e serviços | Supermercado | A1 | 11 |
| Cidade e serviços | Farmácia | A1 | 11 |
| Mobilidade | Transportes | A1 | 11 |

Cada cenário reúne imagem ilustrada, hotspots posicionados, vocabulário bilíngue, exemplos, relações, verbos úteis, expressões comunicativas, nota cultural, progresso explorado/dominado, prática e missão.

## 6. Motor de aprendizagem e persistência

A camada de domínio funciona sem depender de React. Ela transforma tentativas em evidências e usa essas evidências para atualizar domínio, agendar revisões e recomendar a próxima atividade.

Fluxo principal:

1. o estudante interage com vocabulário, exercício, lição ou missão;
2. a tentativa é gravada pelo `attemptRepository`;
3. o motor calcula domínio e próxima revisão;
4. o progresso é persistido pelo `progressRepository`;
5. Dashboard, Trilha e Progresso refletem o novo estado;
6. a recomendação prioriza pendências e itens no momento de revisão.

As preferências, tentativas e progresso ficam em `localStorage`. A separação por interfaces de repositório prepara uma futura troca por API, conta do usuário e sincronização em nuvem.

## 7. Exercícios e experiências de prática

A Trilha contém banco reutilizável de exercícios e componentes separados por tipo. A implementação cobre cinco famílias de interação, incluindo seleção, associação, ordenação, produção e escuta. Há também aula contextual sobre o contraste **tu x você**.

Os cenários oferecem exploração livre e prática guiada. As missões reaproveitam as mesmas entidades canônicas, evitando criar um segundo conjunto de conteúdo desconectado.

## 8. Pacote de áudio pt-BR

### Inventário

| Lote | Voz padrão | Quantidade |
| --- | --- | ---: |
| Palavras | `pt-BR-FranciscaNeural` | 89 |
| Exemplos | `pt-BR-AntonioNeural` | 90 |
| Verbos de cena deduplicados | `pt-BR-FranciscaNeural` | 27 |
| Frases de cena | `pt-BR-AntonioNeural` | 17 |
| **Total** | duas vozes | **223** |

Os MP3 somam aproximadamente **3,1 MB**; catálogo e lockfile elevam o pacote completo para cerca de **3,24 MB**.

### Operação

```powershell
npm run audio:plan
npm run audio:generate
npm run audio:verify
```

O gerador usa Edge TTS e encontra automaticamente o Python em `..\.venv\Scripts\python.exe`. Ele é incremental: arquivos cujo texto, voz e hash continuam iguais não são solicitados novamente. Os detalhes de instalação, lotes, retries e sobrescrita estão em `docs/audio-pipeline.md`.

No app, o componente `AudioButton` centraliza reprodução, acessibilidade, estado de carregamento, erro e velocidade. O mapeamento entre entidade e MP3 fica em `src/lib/audioAssets.ts`.

## 9. Arquitetura de pastas

```text
src/
  components/        componentes compartilhados, incluindo áudio
  content/           schemas Zod e Knowledge Core JSON
  context/           idioma e estado global de interface
  data/              adaptadores temporários de compatibilidade
  domain/            regras de aprendizagem sem dependência de React
  layout/            moldura compartilhada do aplicativo
  lib/               utilitários e resolução dos assets de áudio
  pages/             telas e fluxos de produto
  repositories/      acesso a conteúdo e persistência
  styles/            design system global
  types/             contratos compartilhados
scripts/
  audio-batch.ts     planejamento, geração e verificação de áudio
  migrate-content.ts migração do conteúdo histórico
  validate-content.ts validação do Knowledge Core
public/assets/
  audio/pt-BR/       223 MP3, catálogo e lockfile
  scenarios/         ilustrações dos cenários
docs/                decisões arquiteturais e operação
tests/               testes de navegador e acessibilidade
```

## 10. Qualidade e comandos de validação

```powershell
npm run validate:content
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run test:e2e
npm run check
npm run check:all
```

Na última validação completa desta versão:

- 13 arquivos de testes unitários/de componentes aprovados;
- 41 testes unitários/de componentes aprovados;
- 8 testes end-to-end aprovados;
- verificações WCAG A/AA automatizadas aprovadas;
- 223 arquivos de áudio aprovados;
- conteúdo, lint, tipos e build aprovados.

O build pode emitir um aviso não bloqueante de chunk JavaScript acima de 500 kB. Isso é uma oportunidade futura de code splitting, não um erro de produção.

## 11. Deploy

- saída de produção: `dist/`;
- comando de build: `npm run build`;
- framework detectável pela Vercel: Vite;
- roteamento: `HashRouter`, sem necessidade de regras de rewrite para as telas internas;
- áudio e imagens: assets estáticos em `public/assets`, copiados para o build;
- secrets: não há credenciais de TTS no frontend; o Edge TTS só é usado no processo local de geração.

## 12. Limitações conhecidas

- progresso e preferências são locais ao navegador; ainda não há login, backend ou sincronização entre dispositivos;
- Edge TTS é uma integração não oficial e deve permanecer ferramenta de geração local, não dependência de runtime do produto;
- a experiência de escuta da Trilha ainda possui conteúdo demonstrativo próprio e não foi inteiramente conectada ao catálogo dos 223 áudios;
- o título editorial dos Cenários ainda remete à casa, embora a coleção já inclua comércio e transportes;
- o bundle principal pode ser reduzido por lazy loading das rotas;
- ainda faltam telemetria de produto, gestão editorial administrativa e testes visuais por screenshot.

## 13. Roadmap recomendado

### Próximo incremento — organização editorial dos cenários

- substituir o agrupamento genérico por coleções claras: **Casa e rotina**, **Cidade e serviços**, **Pessoas e emoções** e **Viagem pelo Brasil**;
- adicionar filtros, cards de coleção e contadores de progresso por coleção;
- revisar títulos e chamadas para não limitar toda a área a “cenários da casa”.

### Ateliê dos Afetos

- cenário dedicado a emoções, estados e adjetivos;
- avatares Matrioskinha com expressões corporais e faciais claras;
- pares contrastivos como alegre/triste, calma/ansiosa, tímido/confiante e cansada/animada;
- práticas de concordância de gênero e número;
- frases socioafetivas: “Como você está?”, “Eu me sinto...”, “Ela parece...”.

### Expansão contextual

- cafeteria/restaurante, escola, trabalho, praça, praia, aeroporto e hospedagem;
- novas notas culturais e missões comunicativas;
- geração do áudio somente para os novos IDs, aproveitando o pipeline incremental;
- conexão completa dos exercícios de escuta ao catálogo de áudio.

### Plataforma

- autenticação e sincronização opcional;
- API editorial e versionamento remoto do Knowledge Core;
- lazy loading e otimização de imagens;
- telemetria com consentimento e métricas pedagógicas;
- painel de autoria para conteúdo e posicionamento de hotspots.

## 14. Checklist antes de publicar

- [ ] executar `npm install` ou `npm ci`;
- [ ] executar `npm run audio:verify`;
- [ ] executar `npm run check:all`;
- [ ] revisar `git status` e garantir que nenhum `.env` foi incluído;
- [ ] confirmar a URL do remoto Git;
- [ ] revisar o diff e criar o commit de release;
- [ ] fazer push para a branch conectada à Vercel;
- [ ] validar o preview/deploy em desktop e mobile.

## 15. Documentos relacionados

- `README.md` — operação rápida do projeto;
- `docs/architecture-phase-2.md` — Knowledge Core e migração;
- `docs/architecture-phase-3.md` — motor de aprendizagem;
- `docs/audio-pipeline.md` — instalação e geração de áudio;
- `public/assets/audio/pt-BR/audio-catalog.json` — catálogo consumido pela interface;
- `public/assets/audio/pt-BR/audio-lock.json` — estado incremental da geração.

