# Pipeline de áudio

O pacote de áudio é derivado automaticamente do Knowledge Core e do catálogo
pedagógico do Ateliê. Palavras e frases gerais são lidas de
`lexical-items.json` e `phrases.json`; as 16 emoções são lidas de
`emotions.ts` e `emotionLearning.ts`. Não existe uma segunda planilha manual.

## Instalação do Edge TTS no venv da raiz

O workspace já possui `.venv` na pasta `matrioskinha`, um nível acima do app. Ele
foi criado pelo `uv` sem `pip.exe`, portanto use `uv pip` em vez de `py -m pip`.

Na raiz `C:\Users\helen\Documents\matrioskinha`:

```powershell
$env:UV_CACHE_DIR = "$env:TEMP\matrioskinha-uv-cache"
uv pip install --python ".\.venv\Scripts\python.exe" --upgrade edge-tts
```

Confirme a instalação:

```powershell
uv pip show --python ".\.venv\Scripts\python.exe" edge-tts
.\.venv\Scripts\python.exe -m edge_tts --version
```

Confira a instalação e as vozes brasileiras:

```powershell
edge-tts --list-voices | Select-String "pt-BR"
```

Não é necessário ativar o venv. Quando executado no `matrioskinha-app2`, o
pipeline encontra automaticamente `..\.venv\Scripts\python.exe`. Como fallback,
ele também tenta `edge-tts`, `py -m edge_tts`, `python -m edge_tts` e
`python3 -m edge_tts`.

## Comandos

Examine os lotes sem usar a internet nem gerar arquivos:

```powershell
npm run audio:plan
```

Faça um teste com três palavras:

```powershell
npm run audio:generate -- --batch words --limit 3
```

Gere todos os áudios pendentes e depois valide o pacote:

```powershell
npm run audio:generate
npm run audio:verify
```

Lotes disponíveis:

- `words`: 89 itens lexicais com artigo quando disponível;
- `examples`: 90 frases de exemplo dos hotspots;
- `scene-verbs`: 27 verbos de cena após deduplicação;
- `scene-phrases`: 17 expressões comunicativas;
- `emotion-lexicon-f`: 16 adjetivos com Matrioskinha/Francisca;
- `emotion-lexicon-m`: 16 adjetivos com Misha/Antonio;
- `emotion-examples-f`: 16 exemplos femininos;
- `emotion-examples-m`: 16 exemplos masculinos;
- `emotion-self-f`: 16 falas de si na forma feminina;
- `emotion-self-m`: 16 falas de si na forma masculina;
- `emotion-context`: 16 perguntas para uso contextual;
- `emotion-usage`: 16 notas de uso;
- `emotion-culture`: 16 curiosidades culturais;
- `emotions`: grupo com os nove lotes do Ateliê, totalizando 144 novos áudios;
- `all`: pacote completo, com os 223 áudios aprovados mais os 144 do Ateliê.

Para gerar apenas um lote:

```powershell
npm run audio:generate -- --batch scene-phrases
```

## Roteiro do Ateliê

O caminho mais curto e seguro é gerar somente o incremento. O primeiro comando
não usa internet e deve mostrar `223 atuais`, `144 ausentes` e nenhum item
desatualizado ou inválido:

```powershell
npm run audio:plan -- --batch emotions
```

Faça uma amostra de cada personagem:

```powershell
npm run audio:generate -- --batch emotion-lexicon-f --limit 2
npm run audio:generate -- --batch emotion-lexicon-m --limit 2
```

Se as vozes estiverem aprovadas, gere os 144 pendentes de uma vez. Os quatro
arquivos da amostra serão reconhecidos pelo lock e ignorados:

```powershell
npm run audio:generate -- --batch emotions
npm run audio:verify -- --batch emotions
npm run audio:verify
```

Também é possível acompanhar lote por lote, nesta ordem pedagógica:

```powershell
npm run audio:generate -- --batch emotion-lexicon-f
npm run audio:generate -- --batch emotion-lexicon-m
npm run audio:generate -- --batch emotion-examples-f
npm run audio:generate -- --batch emotion-examples-m
npm run audio:generate -- --batch emotion-self-f
npm run audio:generate -- --batch emotion-self-m
npm run audio:generate -- --batch emotion-context
npm run audio:generate -- --batch emotion-usage
npm run audio:generate -- --batch emotion-culture
```

## Configuração

Por padrão, as vozes são alternadas de forma estável por lote:

- `words` e `scene-verbs`: `pt-BR-FranciscaNeural`;
- `examples` e `scene-phrases`: `pt-BR-AntonioNeural`.
- Matrioskinha, exemplos femininos, contexto e cultura: `pt-BR-FranciscaNeural`;
- Misha, exemplos masculinos e notas de uso: `pt-BR-AntonioNeural`.

Para forçar uma única voz em todos os lotes:

```powershell
$env:EDGE_TTS_VOICE = "pt-BR-FranciscaNeural"
npm run audio:generate
```

As duas vozes também podem ser substituídas independentemente com
`EDGE_TTS_FEMALE_VOICE` e `EDGE_TTS_MALE_VOICE`.

Também são aceitas as opções `--voice`, `--delay`, `--retries` e `--force`:

```powershell
npm run audio:generate -- --voice pt-BR-FranciscaNeural --delay 600 --retries 4
```

## Saída incremental

Os arquivos são gravados em `public/assets/audio/pt-BR`, separados por lote. O
pipeline mantém:

- `audio-catalog.json`: catálogo consumível pelo aplicativo;
- `audio-lock.json`: hash do texto, voz e fornecedor de cada MP3.

Uma nova execução ignora arquivos válidos cujo hash continua atual. Se o texto
ou a voz mudar, somente os itens afetados são regenerados. O MP3 final só é
substituído depois que a resposta temporária passa pela validação.

No Ateliê, a identidade física é calculada pelo texto normalizado e pelo papel
da voz (`female` ou `male`). Duas referências com o mesmo texto e a mesma voz
apontam para um único MP3; cada referência pedagógica continua registrada em
`sourceRefs` no catálogo. O mesmo texto nas duas vozes é mantido como duas
interpretações legítimas. Expressões como `cansada / cansado` são separadas
antes da geração, portanto o TTS nunca narra a barra nem as duas formas juntas.

Os IDs e caminhos dos 223 arquivos anteriores permanecem intocados. Rodar
`audio:generate -- --batch emotions` apenas incrementa o lockfile e o catálogo.

O Edge TTS precisa de internet, mas não de credenciais. Execute o gerador
localmente antes do build/deploy; o navegador consome apenas os MP3 estáticos.
