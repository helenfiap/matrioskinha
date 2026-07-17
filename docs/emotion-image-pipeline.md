# Funil de imagens do Ateliê das Emoções

O funil transforma os arquivos finais de geração em assets leves para o app sem perder os originais.

## Fluxo

```text
PNG/JPG novo no diretório do mood
  → valida personagem e nome do mood
  → calcula SHA-256 e compara com o manifesto
  → arquiva o original em pasta versionada por hash
  → redimensiona sem recortar para até 768 × 1152
  → converte para WebP qualidade 82
  → grava o WebP em public
  → remove somente a cópia pesada de public
  → Ateliê carrega o WebP automaticamente
```

Entradas monitoradas:

```text
public/assets/scenarios/emotions/matrioskinha/<mood>.png
public/assets/scenarios/emotions/misha/<mood>.png
```

Originais preservados:

```text
assets-originals/scenarios/emotions/<personagem>/<mood>/<hash>.png
```

Saídas consumidas pelo app:

```text
public/assets/scenarios/emotions/<personagem>/<mood>.webp
```

As imagens em `public/assets/scenarios/emotions/reference` não são processadas.

## Comandos

Processar tudo que chegou desde a última execução:

```powershell
npm run art:sync
```

Manter o funil observando a pasta durante a geração manual:

```powershell
npm run art:watch
```

Validar hashes, originais e WebPs:

```powershell
npm run art:verify
```

O comando `npm run check` também executa `art:verify`.

## Integração com o gerador por API

Ao executar:

```powershell
npm run art:moods -- -Execute
```

o gerador chama `art:sync` ao final. Se um `<mood>.webp` já existir, a chamada de API correspondente é ignorada, a menos que seja usado `-Force`.

## Manifesto de diff

`assets-originals/scenarios/emotions/pipeline-manifest.json` registra por personagem/mood:

- hash do original e do WebP;
- dimensões de entrada e saída;
- tamanho antes e depois;
- percentual economizado;
- indicação de arquivo acima do limite;
- caminhos do original arquivado e do asset público;
- instante do processamento.

Quando um novo arquivo com o mesmo nome e hash diferente chega, o original anterior permanece arquivado e o WebP público é substituído de forma segura.

## Parâmetros fixados

- limite para sinalizar fonte grande: 600 KB;
- resolução web máxima: 768 × 1152;
- proporção recomendada de entrada: 2:3;
- WebP: qualidade 82, effort 6;
- nenhuma ampliação de imagens pequenas;
- nenhuma alteração das referências.

