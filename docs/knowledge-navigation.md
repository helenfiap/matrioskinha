# Navegação da Knowledge Base

O produto usa `semanticGraph.ts` como camada única de resolução entre conteúdo,
contexto e prática. Os componentes não inventam seus próprios lemas ou links.

## Caminhos ativos

- Ateliê → verbo relacionado → Conjugador;
- Conjugador → cenário ou mood em que o verbo aparece;
- expressão infinitiva → contexto de origem;
- cenário → verbo útil → Conjugador;
- item de cenário → entrada equivalente do Vocabulário;
- Vocabulário → todas as ocorrências equivalentes nos cenários;
- item de cenário → revisão direcionada.

A revisão direcionada coloca o item solicitado no topo da fila mesmo quando sua
próxima data ainda não venceu. A resposta continua usando o mesmo agendador de
repetição espaçada e o mesmo registro de tentativas.

## Normalização

- artigos são ignorados na comparação lexical: `ônibus` e `o ônibus`;
- espaços e caixa são normalizados;
- complementos entre parênteses são preservados para exibição, mas resolvidos
  para o lema: `pegar (o ônibus)` e `pegar o ônibus` → `pegar`;
- locuções curadas usam as relações do índice: `sentir saudade` → `sentir` e
  `tomar banho` → `tomar`;
- contextos de emoção abrem diretamente o mood correspondente no Ateliê.

Novos itens ou verbos adicionados às fontes canônicas passam a participar dos
links automaticamente quando compartilham lema normalizado ou contexto.
