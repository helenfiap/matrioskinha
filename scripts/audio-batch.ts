import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';

type AudioBatch = 'words' | 'examples' | 'scene-verbs' | 'scene-phrases';
type Command = 'plan' | 'generate' | 'verify';
type LexicalItem = { id: string; lemmaPt: string; displayPt?: string | null };
type Phrase = { id: string; kind: 'example' | 'scene-verb' | 'scene-phrase'; pt: string };
type AudioItem = { id: string; batch: AudioBatch; text: string; relativePath: string };
type LockEntry = { hash: string; voice: string; relativePath: string; generatedAt: string };
type AudioLock = { schemaVersion: 1; provider: 'edge-tts'; entries: Record<string, LockEntry> };
type EdgeCommand = { command: string; prefix: string[]; label: string };

const locale = 'pt-BR';
const defaultFemaleVoice = 'pt-BR-FranciscaNeural';
const defaultMaleVoice = 'pt-BR-AntonioNeural';
const dataDirectory = resolve('src', 'content', 'data');
const outputDirectory = resolve('public', 'assets', 'audio', locale);
const lockPath = join(outputDirectory, 'audio-lock.json');
const catalogPath = join(outputDirectory, 'audio-catalog.json');
const validBatches: AudioBatch[] = ['words', 'examples', 'scene-verbs', 'scene-phrases'];

function voiceFor(item: AudioItem, override?: string): string {
  if (override) return override;
  const femaleVoice = process.env.EDGE_TTS_FEMALE_VOICE || defaultFemaleVoice;
  const maleVoice = process.env.EDGE_TTS_MALE_VOICE || defaultMaleVoice;
  return item.batch === 'words' || item.batch === 'scene-verbs' ? femaleVoice : maleVoice;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function slugify(text: string): string {
  return normalizeText(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function safeId(id: string): string {
  return id.replace(/:/g, '--').replace(/[^a-zA-Z0-9_-]/g, '-');
}

function buildAudioItems(): AudioItem[] {
  const lexicalItems = readJson<LexicalItem[]>(join(dataDirectory, 'lexical-items.json'));
  const phrases = readJson<Phrase[]>(join(dataDirectory, 'phrases.json'));
  const words: AudioItem[] = lexicalItems.map((item) => ({
    id: item.id, batch: 'words', text: normalizeText(item.displayPt || item.lemmaPt),
    relativePath: `words/${safeId(item.id)}.mp3`,
  }));
  const examples: AudioItem[] = phrases.filter((phrase) => phrase.kind === 'example').map((phrase) => ({
    id: phrase.id, batch: 'examples', text: normalizeText(phrase.pt),
    relativePath: `examples/${safeId(phrase.id)}.mp3`,
  }));
  const uniqueSceneVerbs = new Map<string, Phrase>();
  for (const phrase of phrases.filter((candidate) => candidate.kind === 'scene-verb')) {
    uniqueSceneVerbs.set(normalizeText(phrase.pt).toLocaleLowerCase(locale), phrase);
  }
  const sceneVerbs: AudioItem[] = [...uniqueSceneVerbs.values()].map((phrase) => ({
    id: `scene-verb:${slugify(phrase.pt)}`, batch: 'scene-verbs', text: normalizeText(phrase.pt),
    relativePath: `scene-verbs/${slugify(phrase.pt)}.mp3`,
  }));
  const scenePhrases: AudioItem[] = phrases.filter((phrase) => phrase.kind === 'scene-phrase').map((phrase) => ({
    id: phrase.id, batch: 'scene-phrases', text: normalizeText(phrase.pt),
    relativePath: `scene-phrases/${safeId(phrase.id)}.mp3`,
  }));
  return [...words, ...examples, ...sceneVerbs, ...scenePhrases];
}

function itemHash(item: AudioItem, voice: string): string {
  return createHash('sha256').update(JSON.stringify({ provider: 'edge-tts', voice, locale, text: item.text })).digest('hex');
}

function readLock(): AudioLock {
  if (!existsSync(lockPath)) return { schemaVersion: 1, provider: 'edge-tts', entries: {} };
  return readJson<AudioLock>(lockPath);
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeJsonIfChanged(path: string, value: unknown): void {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  if (existsSync(path) && readFileSync(path, 'utf8') === next) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, next, 'utf8');
}

function isValidAudio(path: string): boolean {
  if (!existsSync(path) || statSync(path).size < 256) return false;
  const header = readFileSync(path).subarray(0, 3);
  return header.toString('ascii') === 'ID3' || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0);
}

function getOption(name: string): string | undefined {
  const exactIndex = process.argv.indexOf(`--${name}`);
  if (exactIndex >= 0) return process.argv[exactIndex + 1];
  const inline = process.argv.find((argument) => argument.startsWith(`--${name}=`));
  return inline?.slice(name.length + 3);
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function selectedBatch(): AudioBatch | undefined {
  const batch = getOption('batch');
  if (!batch || batch === 'all') return undefined;
  if (!validBatches.includes(batch as AudioBatch)) throw new Error(`Lote inválido: ${batch}. Use ${validBatches.join(', ')} ou all.`);
  return batch as AudioBatch;
}

function selectedItems(items: AudioItem[]): AudioItem[] {
  const batch = selectedBatch();
  const filtered = batch ? items.filter((item) => item.batch === batch) : items;
  const limitText = getOption('limit');
  if (!limitText) return filtered;
  const limit = Number.parseInt(limitText, 10);
  if (!Number.isInteger(limit) || limit <= 0) throw new Error('--limit deve ser um inteiro positivo.');
  return filtered.slice(0, limit);
}

function stateFor(item: AudioItem, voiceOverride: string | undefined, lock: AudioLock): 'current' | 'missing' | 'stale' | 'invalid' {
  const path = join(outputDirectory, item.relativePath);
  if (!existsSync(path)) return 'missing';
  if (!isValidAudio(path)) return 'invalid';
  if (lock.entries[item.id]?.hash !== itemHash(item, voiceFor(item, voiceOverride))) return 'stale';
  return 'current';
}

function printPlan(items: AudioItem[], voiceOverride: string | undefined, lock: AudioLock): void {
  console.log(`\nPlano de áudio Matrioskinha — ${locale} / ${voiceOverride || 'vozes alternadas por lote'}\n`);
  for (const batch of validBatches) {
    const batchItems = items.filter((item) => item.batch === batch);
    const characters = batchItems.reduce((total, item) => total + item.text.length, 0);
    const batchVoice = batchItems[0] ? voiceFor(batchItems[0], voiceOverride) : voiceFor({ batch } as AudioItem, voiceOverride);
    console.log(`${batch.padEnd(14)} ${String(batchItems.length).padStart(3)} arquivos  ${String(characters).padStart(5)} caracteres  ${batchVoice}`);
  }
  const states = items.reduce<Record<string, number>>((totals, item) => {
    const state = stateFor(item, voiceOverride, lock);
    totals[state] = (totals[state] || 0) + 1;
    return totals;
  }, {});
  console.log(`\nTotal: ${items.length} arquivos / ${items.reduce((total, item) => total + item.text.length, 0)} caracteres`);
  console.log(`Atuais: ${states.current || 0} | Ausentes: ${states.missing || 0} | Desatualizados: ${states.stale || 0} | Inválidos: ${states.invalid || 0}\n`);
}

function catalog(items: AudioItem[], voiceOverride?: string): unknown {
  return { schemaVersion: 1, provider: 'edge-tts', locale,
    voices: { female: process.env.EDGE_TTS_FEMALE_VOICE || defaultFemaleVoice, male: process.env.EDGE_TTS_MALE_VOICE || defaultMaleVoice },
    items: items.map((item) => ({ ...item, voice: voiceFor(item, voiceOverride), src: `/assets/audio/${locale}/${item.relativePath}` })) };
}

function edgeCandidates(): EdgeCommand[] {
  const candidates: EdgeCommand[] = [];
  if (process.env.EDGE_TTS_COMMAND) candidates.push({ command: process.env.EDGE_TTS_COMMAND, prefix: [], label: process.env.EDGE_TTS_COMMAND });
  const workspaceVenvPython = resolve('..', '.venv', 'Scripts', 'python.exe');
  if (existsSync(workspaceVenvPython)) {
    candidates.push({ command: workspaceVenvPython, prefix: ['-m', 'edge_tts'], label: '..\\.venv\\Scripts\\python.exe -m edge_tts' });
  }
  candidates.push(
    { command: 'edge-tts', prefix: [], label: 'edge-tts' },
    { command: 'py', prefix: ['-m', 'edge_tts'], label: 'py -m edge_tts' },
    { command: 'python', prefix: ['-m', 'edge_tts'], label: 'python -m edge_tts' },
    { command: 'python3', prefix: ['-m', 'edge_tts'], label: 'python3 -m edge_tts' },
  );
  return candidates;
}

function findEdgeCommand(): EdgeCommand {
  for (const candidate of edgeCandidates()) {
    const result = spawnSync(candidate.command, [...candidate.prefix, '--help'], { windowsHide: true, stdio: 'ignore' });
    if (result.status === 0) return candidate;
  }
  throw new Error('Edge TTS não encontrado. Instale no venv da raiz com: uv pip install --python ..\\.venv\\Scripts\\python.exe --upgrade edge-tts');
}

function runEdge(command: EdgeCommand, voice: string, text: string, outputPath: string): Promise<void> {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command.command,
      [...command.prefix, '--voice', voice, '--text', text, '--write-media', outputPath],
      { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(stderr.trim() || `Edge TTS encerrou com código ${code}.`));
    });
  });
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

async function generate(items: AudioItem[], allItems: AudioItem[], voiceOverride: string | undefined, lock: AudioLock): Promise<void> {
  const command = findEdgeCommand();
  const force = hasFlag('force');
  const delay = Number.parseInt(getOption('delay') || process.env.EDGE_TTS_DELAY_MS || '400', 10);
  const retries = Number.parseInt(getOption('retries') || '3', 10);
  if (!Number.isFinite(delay) || delay < 0) throw new Error('--delay deve ser zero ou um número positivo.');
  if (!Number.isInteger(retries) || retries < 0) throw new Error('--retries deve ser zero ou um inteiro positivo.');
  mkdirSync(outputDirectory, { recursive: true });
  writeJsonIfChanged(catalogPath, catalog(allItems, voiceOverride));
  console.log(`Edge TTS: ${command.label}`);
  console.log(`Voz: ${voiceOverride || 'Francisca/Antonio por lote'} | Lote: ${selectedBatch() || 'all'} | Itens selecionados: ${items.length}\n`);
  let generated = 0;
  let skipped = 0;
  for (const [index, item] of items.entries()) {
    const itemVoice = voiceFor(item, voiceOverride);
    if (!force && stateFor(item, voiceOverride, lock) === 'current') {
      skipped += 1;
      console.log(`[${index + 1}/${items.length}] já existe  ${item.id}`);
      continue;
    }
    const outputPath = join(outputDirectory, item.relativePath);
    const temporaryPath = `${outputPath}.tmp-${process.pid}.mp3`;
    mkdirSync(dirname(outputPath), { recursive: true });
    rmSync(temporaryPath, { force: true });
    console.log(`[${index + 1}/${items.length}] gerando    ${item.id} — ${itemVoice} — “${item.text}”`);
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        await runEdge(command, itemVoice, item.text, temporaryPath);
        if (!isValidAudio(temporaryPath)) throw new Error('O arquivo retornado não é um MP3 válido.');
        rmSync(outputPath, { force: true });
        renameSync(temporaryPath, outputPath);
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        rmSync(temporaryPath, { force: true });
        if (attempt < retries) {
          console.warn(`  tentativa ${attempt + 1} falhou; repetindo...`);
          await wait(750 * (attempt + 1));
        }
      }
    }
    if (lastError) throw lastError;
    lock.entries[item.id] = { hash: itemHash(item, itemVoice), voice: itemVoice, relativePath: item.relativePath, generatedAt: new Date().toISOString() };
    writeJson(lockPath, lock);
    generated += 1;
    if (delay > 0 && index < items.length - 1) await wait(delay);
  }
  console.log(`\nConcluído: ${generated} gerados, ${skipped} já estavam atualizados.`);
}

function walkMp3(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walkMp3(path);
    return entry.isFile() && entry.name.endsWith('.mp3') ? [path] : [];
  });
}

function verify(items: AudioItem[], voiceOverride: string | undefined, lock: AudioLock): void {
  const failures = items.map((item) => ({ item, state: stateFor(item, voiceOverride, lock) })).filter(({ state }) => state !== 'current');
  const expectedPaths = new Set(items.map((item) => resolve(outputDirectory, item.relativePath)));
  const checkOrphans = !selectedBatch() && !getOption('limit');
  const orphans = checkOrphans ? walkMp3(outputDirectory).filter((path) => !expectedPaths.has(resolve(path))) : [];
  if (failures.length === 0 && orphans.length === 0) {
    console.log(`Áudios válidos: ${items.length} arquivos estão presentes e atualizados.`);
    return;
  }
  for (const { item, state } of failures) console.error(`${state.padEnd(8)} ${item.id} -> ${item.relativePath}`);
  for (const path of orphans) console.warn(`orphan   ${relative(outputDirectory, path)}`);
  console.error(`\nVerificação falhou: ${failures.length} pendências e ${orphans.length} órfãos.`);
  process.exitCode = 1;
}

function printHelp(): void {
  console.log(`\nUso:\n  npm run audio:plan\n  npm run audio:generate -- [--batch words|examples|scene-verbs|scene-phrases|all]\n  npm run audio:verify\n\nOpções:\n  --voice <nome>       Força uma única voz em todos os lotes\n  --batch <lote>       Processa apenas um lote\n  --limit <n>          Limita para teste\n  --force              Regenera itens atuais\n  --delay <ms>         Intervalo entre chamadas (padrão: 400)\n  --retries <n>        Tentativas adicionais (padrão: 3)\n\nPadrão alternado:\n  words, scene-verbs: ${defaultFemaleVoice}\n  examples, scene-phrases: ${defaultMaleVoice}\n`);
}

async function main(): Promise<void> {
  if (hasFlag('help')) { printHelp(); return; }
  const command = (process.argv[2] || 'plan') as Command;
  if (!['plan', 'generate', 'verify'].includes(command)) throw new Error(`Comando inválido: ${command}`);
  const voiceOverride = getOption('voice') || process.env.EDGE_TTS_VOICE;
  const allItems = buildAudioItems();
  const items = selectedItems(allItems);
  const lock = readLock();
  if (command === 'plan') printPlan(items, voiceOverride, lock);
  if (command === 'generate') await generate(items, allItems, voiceOverride, lock);
  if (command === 'verify') verify(items, voiceOverride, lock);
}

main().catch((error: unknown) => {
  console.error(`\nErro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
