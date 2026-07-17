import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public', 'assets', 'scenarios', 'emotions');
const ORIGINALS_ROOT = path.join(PROJECT_ROOT, 'assets-originals', 'scenarios', 'emotions');
const MANIFEST_PATH = path.join(ORIGINALS_ROOT, 'pipeline-manifest.json');
const CHARACTERS = ['matrioskinha', 'misha'] as const;
const MOODS = new Set([
  'feliz', 'triste', 'apaixonada', 'preocupada', 'assustada', 'calma', 'irritada', 'surpresa',
  'cansada', 'animada', 'timida', 'confiante', 'orgulhosa', 'envergonhada', 'confusa', 'aliviada',
]);
const INPUT_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);
const MAX_WIDTH = 768;
const MAX_HEIGHT = 1152;
const MAX_SOURCE_BYTES = 600 * 1024;
const WEBP_QUALITY = 82;

type CharacterId = (typeof CHARACTERS)[number];

interface PipelineEntry {
  character: CharacterId;
  mood: string;
  sourceSha256: string;
  outputSha256: string;
  sourceBytes: number;
  outputBytes: number;
  savedPercent: number;
  sourceDimensions: { width: number; height: number };
  outputDimensions: { width: number; height: number };
  sourceWasOversized: boolean;
  aspectRatio: number;
  archivePath: string;
  publicPath: string;
  processedAt: string;
}

interface PipelineManifest {
  schemaVersion: 1;
  settings: { maxWidth: number; maxHeight: number; maxSourceBytes: number; webpQuality: number };
  entries: Record<string, PipelineEntry>;
}

interface SyncResult {
  processed: number;
  unchanged: number;
  rejected: number;
  sourceBytes: number;
  outputBytes: number;
}

function relativeFromRoot(filePath: string) {
  return path.relative(PROJECT_ROOT, filePath).split(path.sep).join('/');
}

async function exists(filePath: string) {
  try { await access(filePath); return true; } catch { return false; }
}

function sha256(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function loadManifest(): Promise<PipelineManifest> {
  if (!(await exists(MANIFEST_PATH))) {
    return {
      schemaVersion: 1,
      settings: { maxWidth: MAX_WIDTH, maxHeight: MAX_HEIGHT, maxSourceBytes: MAX_SOURCE_BYTES, webpQuality: WEBP_QUALITY },
      entries: {},
    };
  }
  const parsed = JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as PipelineManifest;
  if (parsed.schemaVersion !== 1 || !parsed.entries) throw new Error('Manifesto do pipeline inválido.');
  return parsed;
}

async function saveManifest(manifest: PipelineManifest) {
  await mkdir(ORIGINALS_ROOT, { recursive: true });
  const ordered: PipelineManifest = {
    ...manifest,
    entries: Object.fromEntries(Object.entries(manifest.entries).sort(([a], [b]) => a.localeCompare(b))),
  };
  await writeFile(MANIFEST_PATH, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
}

async function inputFiles() {
  const files: Array<{ character: CharacterId; mood: string; sourcePath: string }> = [];
  for (const character of CHARACTERS) {
    const characterDir = path.join(PUBLIC_ROOT, character);
    if (!(await exists(characterDir))) continue;
    for (const entry of await readdir(characterDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (!INPUT_EXTENSIONS.has(extension)) continue;
      files.push({ character, mood: path.basename(entry.name, extension), sourcePath: path.join(characterDir, entry.name) });
    }
  }
  return files.sort((a, b) => `${a.character}/${a.mood}`.localeCompare(`${b.character}/${b.mood}`));
}

async function processInput(
  input: { character: CharacterId; mood: string; sourcePath: string },
  manifest: PipelineManifest,
): Promise<'processed' | 'unchanged' | 'rejected'> {
  const key = `${input.character}/${input.mood}`;
  if (!MOODS.has(input.mood)) {
    console.warn(`REJEITADO ${key}: nome não pertence aos 16 moods previstos.`);
    return 'rejected';
  }

  const sourceBuffer = await readFile(input.sourcePath);
  const sourceHash = sha256(sourceBuffer);
  const outputPath = path.join(PUBLIC_ROOT, input.character, `${input.mood}.webp`);
  const current = manifest.entries[key];
  if (current?.sourceSha256 === sourceHash && await exists(outputPath)) {
    await unlink(input.sourcePath);
    console.log(`IGUAL     ${key}: original duplicado removido; WebP já está atualizado.`);
    return 'unchanged';
  }

  const image = sharp(sourceBuffer, { failOn: 'error' }).rotate();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    console.warn(`REJEITADO ${key}: dimensões não puderam ser lidas.`);
    return 'rejected';
  }
  const aspectRatio = metadata.width / metadata.height;
  if (aspectRatio < 0.62 || aspectRatio > 0.71) {
    console.warn(`AVISO     ${key}: proporção ${aspectRatio.toFixed(3)} fora da faixa vertical esperada (~2:3).`);
  }

  const extension = path.extname(input.sourcePath).toLowerCase();
  const archiveDir = path.join(ORIGINALS_ROOT, input.character, input.mood);
  const archivePath = path.join(archiveDir, `${sourceHash.slice(0, 16)}${extension}`);
  await mkdir(archiveDir, { recursive: true });
  if (!(await exists(archivePath))) await copyFile(input.sourcePath, archivePath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryOutput = `${outputPath}.tmp-${process.pid}`;
  await sharp(sourceBuffer, { failOn: 'error' })
    .rotate()
    .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6, smartSubsample: true })
    .toFile(temporaryOutput);
  await rename(temporaryOutput, outputPath);

  const outputBuffer = await readFile(outputPath);
  const outputMetadata = await sharp(outputBuffer).metadata();
  const sourceBytes = sourceBuffer.length;
  const outputBytes = outputBuffer.length;
  manifest.entries[key] = {
    character: input.character,
    mood: input.mood,
    sourceSha256: sourceHash,
    outputSha256: sha256(outputBuffer),
    sourceBytes,
    outputBytes,
    savedPercent: Math.round((1 - outputBytes / sourceBytes) * 10000) / 100,
    sourceDimensions: { width: metadata.width, height: metadata.height },
    outputDimensions: { width: outputMetadata.width!, height: outputMetadata.height! },
    sourceWasOversized: sourceBytes > MAX_SOURCE_BYTES || metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT,
    aspectRatio: Math.round(aspectRatio * 10000) / 10000,
    archivePath: relativeFromRoot(archivePath),
    publicPath: relativeFromRoot(outputPath),
    processedAt: new Date().toISOString(),
  };

  await unlink(input.sourcePath);
  console.log(`OTIMIZADO ${key}: ${(sourceBytes / 1024).toFixed(0)} KB → ${(outputBytes / 1024).toFixed(0)} KB (-${manifest.entries[key].savedPercent}%).`);
  return 'processed';
}

async function syncOnce(quietWhenEmpty = false): Promise<SyncResult> {
  const manifest = await loadManifest();
  const result: SyncResult = { processed: 0, unchanged: 0, rejected: 0, sourceBytes: 0, outputBytes: 0 };
  const inputs = await inputFiles();
  for (const input of inputs) {
    try {
      const before = (await stat(input.sourcePath)).size;
      const status = await processInput(input, manifest);
      result[status] += 1;
      if (status === 'processed') {
        const entry = manifest.entries[`${input.character}/${input.mood}`];
        result.sourceBytes += before;
        result.outputBytes += entry.outputBytes;
      }
    } catch (error) {
      result.rejected += 1;
      console.error(`ERRO      ${input.character}/${input.mood}:`, error);
    }
  }
  await saveManifest(manifest);
  if (inputs.length || !quietWhenEmpty) {
    console.log(`Resumo: ${result.processed} processado(s), ${result.unchanged} inalterado(s), ${result.rejected} rejeitado(s).`);
  }
  if (result.processed) {
    console.log(`Lote: ${(result.sourceBytes / 1024 / 1024).toFixed(2)} MB → ${(result.outputBytes / 1024 / 1024).toFixed(2)} MB.`);
  }
  return result;
}

async function verify() {
  const manifest = await loadManifest();
  let invalid = 0;
  for (const [key, entry] of Object.entries(manifest.entries)) {
    const outputPath = path.join(PROJECT_ROOT, entry.publicPath);
    const archivePath = path.join(PROJECT_ROOT, entry.archivePath);
    if (!(await exists(outputPath)) || !(await exists(archivePath))) {
      console.error(`INVÁLIDO  ${key}: original arquivado ou WebP ausente.`);
      invalid += 1;
      continue;
    }
    const outputBuffer = await readFile(outputPath);
    if (sha256(outputBuffer) !== entry.outputSha256) {
      console.error(`INVÁLIDO  ${key}: hash do WebP diverge do manifesto.`);
      invalid += 1;
    }
  }
  if (invalid) throw new Error(`${invalid} entrada(s) inválida(s) no funil de imagens.`);
  console.log(`Funil válido: ${Object.keys(manifest.entries).length} mood(s) otimizado(s) e arquivado(s).`);
}

async function watch() {
  console.log(`Monitorando ${relativeFromRoot(PUBLIC_ROOT)} a cada 2 segundos. Pressione Ctrl+C para encerrar.`);
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try { await syncOnce(true); } finally { running = false; }
  };
  await tick();
  setInterval(tick, 2000);
}

const command = process.argv[2] ?? 'sync';
if (command === 'sync') await syncOnce();
else if (command === 'verify') await verify();
else if (command === 'watch') await watch();
else throw new Error(`Comando desconhecido: ${command}. Use sync, verify ou watch.`);
