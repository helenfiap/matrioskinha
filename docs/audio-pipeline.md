# Pipeline de áudio

O pacote de áudio é derivado automaticamente do Knowledge Core. Palavras e
frases são lidas de `lexical-items.json` e `phrases.json`, sem uma segunda
planilha manual.

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
- `all`: todos os 223 áudios únicos.

Para gerar apenas um lote:

```powershell
npm run audio:generate -- --batch scene-phrases
```

## Configuração

Por padrão, as vozes são alternadas de forma estável por lote:

- `words` e `scene-verbs`: `pt-BR-FranciscaNeural`;
- `examples` e `scene-phrases`: `pt-BR-AntonioNeural`.

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

O Edge TTS precisa de internet, mas não de credenciais. Execute o gerador
localmente antes do build/deploy; o navegador consome apenas os MP3 estáticos.
