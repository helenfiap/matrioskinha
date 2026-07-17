# Fase 3 — Learning Engine mensurável

## Objetivo

A Fase 3 fecha o primeiro ciclo real de aprendizagem: toda resposta relevante gera uma tentativa validada, a revisão reage a acertos e falhas, e as métricas deixam de depender de exemplos ou de um único clique.

## Attempt Log

`Attempt` registra o objeto praticado, tipo, template de exercício, modalidade, resultado, uso do idioma de apoio, instante e duração. O `AttemptRepository` mantém um log local versionado, limitado às mil tentativas mais recentes. Conteúdo canônico continua fora desse armazenamento.

Os cinco exercícios da Fase 3 e as respostas da fila de revisão registram tentativas. Respostas incorretas incluem um código estável, usado pela análise de erros.

## ReviewScheduler

O agendamento é uma função pura em `domain/learningEngine.ts`. Ele recebe o estado atual e uma avaliação (`again`, `hard`, `good` ou `easy`) e devolve a próxima data, intervalo, instante da revisão e número de lapsos.

Uma falha agora volta ao intervalo inicial, permanece devida no dia e incrementa `lapses`. Um acerto avança no calendário. Essa regra não decide domínio.

## MasteryEvidence

Domínio é calculado a partir do histórico de tentativas, sem ser gravado como verdade paralela. Um item só é considerado dominado quando possui:

- pelo menos quatro respostas corretas;
- acurácia mínima de 80%;
- evidência correta em duas ou mais modalidades;
- pelo menos duas recuperações sem apoio russo.

O score combina acurácia, variedade de modalidade e independência. Alterar o algoritmo não exige migrar o log de tentativas.

## Métricas e interface

A tela Progresso apresenta acurácia real, taxa sem apoio, quantidade de tentativas e erros recorrentes derivados do log. O Dashboard mostra acurácia e volume de respostas. Quando não há evidência, a interface mostra estado vazio — nunca números inventados.

## Limites da fase

Esta fase não adiciona backend, conta multiusuário, áudio natural, geração por IA ou Biblioteca unificada. O repositório local e o usuário `local-user` mantêm o MVP compatível com a arquitetura futura, sem fingir sincronização remota.
