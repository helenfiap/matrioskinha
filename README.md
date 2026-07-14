# matrioskinha-app (React + TypeScript)

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

## Estrutura de pastas

```
src/
  context/LanguageContext.tsx   -> estado global de idioma (pt/ru) + funcao t(pt, ru)
  types/index.ts                -> tipos compartilhados (Hotspot, Scene, ConjugatorVerb, etc.)
  data/                         -> conteudo bilingue (cenarios, verbos, vocabulario)
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

## Notas de migracao

- Roteamento com react-router-dom (HashRouter), uma rota por tela -- antes era troca de display:none/block via JS puro.
- Todo texto bilingue passou a usar useLanguage() + t(pt, ru) em vez dos atributos data-i18n/data-pt/data-ru.
- O estado de progresso das Cenarios (explorado/dominado por cena) e o desafio diario da Trilha viraram hooks (useSceneProgress, useChallenge) em vez de objetos globais mutaveis.
- As imagens dos cenarios estao em public/assets/scenarios/... -- mesma estrutura de pastas do mockup original.
- Build verificado nesta sessao: tsc -b sem erros e npm run build gera dist/ com sucesso.
