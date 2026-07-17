# matrioskinha-app2 (React + TypeScript)

Baseline limpo criado a partir do `matrioskinha-app` para a evolucao arquitetural e de produto. O aplicativo original permanece preservado.

Clone do mockup `matrioskinha_mockup_v0/index.html`, reescrito como aplicacao React + TypeScript com Vite, organizada por hierarquia de componentes/telas.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereco mostrado no terminal (geralmente http://localhost:5173).

Para gerar a versao de producao:

```bash
npm run build
npm run preview
```

## Qualidade e testes

```bash
npm run test           # testes unitarios e de componentes
npm run test:coverage  # cobertura dos modulos criticos
npm run test:e2e       # fluxos reais no Chromium + acessibilidade automatizada
npm run check          # conteudo, lint, tipos, testes e build
npm run check:all      # check completo + navegador
```

Na primeira execucao local dos testes de navegador, instale o Chromium gerenciado pelo Playwright:

```bash
npx playwright install chromium
```

O workflow `.github/workflows/ci.yml` executa o mesmo gate em pushes para `main` e pull requests.

## Áudio em lote

O projeto possui um pipeline incremental para gerar o pacote pt-BR com Edge TTS:

```powershell
cd C:\Users\helen\Documents\matrioskinha
uv pip install --python ".\.venv\Scripts\python.exe" --upgrade edge-tts
cd .\matrioskinha-app2
npm run audio:plan
npm run audio:generate -- --batch emotions  # gera somente o incremento do Ateliê
npm run audio:verify
```

Consulte [docs/audio-pipeline.md](docs/audio-pipeline.md) para os lotes, vozes e
opções de regeneração.

O Conjugador consolida os verbos do Knowledge Core, cenários e Ateliê em um
índice único de infinitivos. Consulte [docs/verb-curation.md](docs/verb-curation.md).
As ligações Ateliê ↔ Conjugador ↔ Cenários ↔ Vocabulário ↔ Revisão estão
documentadas em [docs/knowledge-navigation.md](docs/knowledge-navigation.md).

## Imagens do Ateliê

Moods em PNG/JPG podem ser sincronizados e comprimidos automaticamente:

```powershell
npm run art:sync    # processa novos arquivos uma vez
npm run art:watch   # monitora enquanto as imagens são geradas
npm run art:verify  # valida originais, hashes e WebPs
```

Os originais ficam versionados fora de `public`; o Ateliê consome WebP otimizado.
Consulte [docs/emotion-image-pipeline.md](docs/emotion-image-pipeline.md).

## Estrutura de pastas

```
src/
  content/                      -> schemas Zod + Knowledge Core JSON versionado
  repositories/                 -> acesso a conteúdo e persistência local
  domain/                       -> contratos e regras de progresso sem React
  context/LanguageContext.tsx   -> estado global de idioma (pt/ru) + funcao t(pt, ru)
  types/index.ts                -> tipos compartilhados (Hotspot, Scene, ConjugatorVerb, etc.)
  data/                         -> adaptadores temporários para a UI anterior à Fase 2
  layout/                       -> Sidebar, Topbar, AppShell (moldura fixa do app)
  pages/
    Dashboard.tsx
    Vocab.tsx
    Progresso.tsx
    Config.tsx
    Conjugador.tsx
    Trilha/                     -> fases, banco de exercicios (5 tipos) e a aula tu x voce
      Trilha.tsx
      useChallenge.ts
      LessonPanel.tsx
      exercises/                -> um componente por tipo de exercicio
    Cenarios/                   -> hotspots, abas do painel, motor de pratica
      Cenarios.tsx
      SceneStage.tsx
      InfoPanel.tsx
      PracticeModal.tsx
      useSceneProgress.ts
  styles/global.css             -> design system inteiro (cores, tipografia, todos os componentes visuais)
```

A arquitetura, as entidades e a auditoria da migração estão em [docs/architecture-phase-2.md](docs/architecture-phase-2.md). O registro de tentativas, agendador e domínio por evidências estão em [docs/architecture-phase-3.md](docs/architecture-phase-3.md).

## Notas de migracao

- Roteamento com react-router-dom (HashRouter), uma rota por tela -- antes era troca de display:none/block via JS puro.
- Todo texto bilingue passou a usar useLanguage() + t(pt, ru) em vez dos atributos data-i18n/data-pt/data-ru.
- O estado de progresso das Cenarios (explorado/dominado por cena) e o desafio diario da Trilha viraram hooks (useSceneProgress, useChallenge) em vez de objetos globais mutaveis.
- As imagens dos cenarios estao em public/assets/scenarios/... -- mesma estrutura de pastas do mockup original.
- Build verificado nesta sessao: tsc -b sem erros e npm run build gera dist/ com sucesso.
