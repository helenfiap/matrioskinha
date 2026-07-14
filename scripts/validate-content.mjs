#!/usr/bin/env node
// Validador de conteúdo standalone (sem CI, sem dependências novas).
// Lê os arquivos de dados como texto e confere invariantes básicas:
// IDs únicos, coordenadas de hotspot em 0-100, relatedIds/missions
// apontando para hotspots que existem, e traduções obrigatórias não vazias.
//
// Uso: node scripts/validate-content.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

// ---------- scenarios.ts ----------
const scenariosSrc = readFileSync(join(root, 'src/data/scenarios.ts'), 'utf-8');

const sceneBlocks = [...scenariosSrc.matchAll(
  /id: '([\w-]+)'.*?hotspots: \[(.*?)\],\n\s*verbs: \[(.*?)\],\n\s*phrases: \[(.*?)\],\n\s*culture: \[(.*?)\],/gs
)];

if (sceneBlocks.length === 0) {
  fail('scenarios.ts: nenhuma cena encontrada — regex de parsing pode estar desatualizada.');
}

const sceneIds = new Set();
const hotspotsByScene = {};

for (const [, sceneId, hotspotsBlock, verbsBlock, phrasesBlock, cultureBlock] of sceneBlocks) {
  if (sceneIds.has(sceneId)) fail(`scenarios.ts: id de cena duplicado "${sceneId}"`);
  sceneIds.add(sceneId);

  const hotspotIds = new Set();
  // divide o bloco em objetos individuais (cada hotspot começa com "{ id:'"),
  // em vez de um regex único que "vaza" para dentro de func:{pt:..,ru:..}.
  const rawEntries = hotspotsBlock.split(/(?=\{ id:')/).map((s) => s.trim()).filter(Boolean);
  if (rawEntries.length === 0) fail(`scenarios.ts [${sceneId}]: nenhum hotspot encontrado`);

  const hotspots = [];
  for (const entry of rawEntries) {
    const idMatch = entry.match(/\{ id:'([\w-]+)', x:(-?\d+), y:(-?\d+),/);
    // pt/ru reais do hotspot são sempre seguidos por ", gender:" — isso evita
    // capturar por engano o pt/ru aninhado dentro de func:{pt:'..', ru:'..'}.
    const ptRuMatch = entry.match(/pt:'([^']*)', ru:'([^']*)', gender:/);
    if (!idMatch || !ptRuMatch) {
      fail(`scenarios.ts [${sceneId}]: hotspot malformado (não foi possível extrair id/x/y/pt/ru): ${entry.slice(0, 60)}...`);
      continue;
    }
    hotspots.push([entry, idMatch[1], idMatch[2], idMatch[3], entry, ptRuMatch[1], ptRuMatch[2]]);
  }

  for (const [, hid, x, y, midFields, pt, ru] of hotspots) {
    if (hotspotIds.has(hid)) fail(`scenarios.ts [${sceneId}]: id de hotspot duplicado "${hid}"`);
    hotspotIds.add(hid);

    const xNum = Number(x), yNum = Number(y);
    if (xNum < 0 || xNum > 100) fail(`scenarios.ts [${sceneId}/${hid}]: x=${x} fora de 0-100`);
    if (yNum < 0 || yNum > 100) fail(`scenarios.ts [${sceneId}/${hid}]: y=${y} fora de 0-100`);

    if (!pt.trim()) fail(`scenarios.ts [${sceneId}/${hid}]: pt vazio`);
    if (!ru.trim()) fail(`scenarios.ts [${sceneId}/${hid}]: ru vazio`);

    const relatedMatch = midFields.match(/relatedIds:\[([^\]]*)\]/);
    if (relatedMatch) {
      const ids = [...relatedMatch[1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
      for (const relId of ids) {
        // referências são resolvidas depois que soubermos todos os ids da cena (2ª passada)
        hotspotsByScene[sceneId] = hotspotsByScene[sceneId] || { ids: hotspotIds, relations: [] };
        hotspotsByScene[sceneId].relations.push([hid, relId]);
      }
    }
  }
  hotspotsByScene[sceneId] = hotspotsByScene[sceneId] || { ids: hotspotIds, relations: [] };
  hotspotsByScene[sceneId].ids = hotspotIds;

  const verbs = [...verbsBlock.matchAll(/\{ pt:'([^']*)', ru:'([^']*)' \}/g)];
  verbs.forEach(([, pt, ru], i) => {
    if (!pt.trim()) fail(`scenarios.ts [${sceneId}] verbo #${i}: pt vazio`);
    if (!ru.trim()) fail(`scenarios.ts [${sceneId}] verbo #${i}: ru vazio`);
  });

  const phrases = [...phrasesBlock.matchAll(/\{ pt:'([^']*)', ru:'([^']*)' \}/g)];
  phrases.forEach(([, pt, ru], i) => {
    if (!pt.trim()) fail(`scenarios.ts [${sceneId}] frase #${i}: pt vazio`);
    if (!ru.trim()) fail(`scenarios.ts [${sceneId}] frase #${i}: ru vazio`);
  });

  const culture = [...cultureBlock.matchAll(/\{ pt:'([^']*)', ru:'([^']*)' \}/g)];
  if (culture.length === 0) warn(`scenarios.ts [${sceneId}]: nenhuma nota cultural`);
  culture.forEach(([, pt, ru], i) => {
    if (!pt.trim()) fail(`scenarios.ts [${sceneId}] cultura #${i}: pt vazio`);
    if (!ru.trim()) fail(`scenarios.ts [${sceneId}] cultura #${i}: ru vazio`);
  });
}

// 2ª passada: relatedIds precisam apontar para hotspot existente na MESMA cena
for (const [sceneId, { ids, relations }] of Object.entries(hotspotsByScene)) {
  for (const [fromId, toId] of relations) {
    if (!ids.has(toId)) {
      fail(`scenarios.ts [${sceneId}/${fromId}]: relatedIds aponta para "${toId}", que não existe nessa cena`);
    }
  }
}

// ---------- missions.ts ----------
const missionsSrc = readFileSync(join(root, 'src/data/missions.ts'), 'utf-8');
const missionBlocks = [...missionsSrc.matchAll(/sceneId: '(\w+)',.*?steps: \[(.*?)\],/gs)];

const missionSceneIds = new Set();
for (const [, sceneId, stepsBlock] of missionBlocks) {
  if (missionSceneIds.has(sceneId)) fail(`missions.ts: mais de uma missão para a cena "${sceneId}"`);
  missionSceneIds.add(sceneId);

  if (!sceneIds.has(sceneId)) {
    fail(`missions.ts: missão referencia cena inexistente "${sceneId}"`);
    continue;
  }
  const steps = [...stepsBlock.matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  if (steps.length === 0) fail(`missions.ts [${sceneId}]: missão sem passos`);

  const validIds = hotspotsByScene[sceneId]?.ids ?? new Set();
  const seen = new Set();
  for (const step of steps) {
    if (!validIds.has(step)) fail(`missions.ts [${sceneId}]: passo "${step}" não é um hotspot dessa cena`);
    if (seen.has(step)) warn(`missions.ts [${sceneId}]: passo "${step}" repetido na sequência`);
    seen.add(step);
  }
  const missingFromMission = [...validIds].filter((id) => !seen.has(id));
  if (missingFromMission.length > 0) {
    warn(`missions.ts [${sceneId}]: hotspots não cobertos pela missão: ${missingFromMission.join(', ')}`);
  }
}
for (const sceneId of sceneIds) {
  if (!missionSceneIds.has(sceneId)) warn(`missions.ts: cena "${sceneId}" ainda não tem missão`);
}

// ---------- verbs.ts ----------
const verbsSrc = readFileSync(join(root, 'src/data/verbs.ts'), 'utf-8');
const verbBlocks = [...verbsSrc.matchAll(/\{ id:'([\w-]+)', pt:'([^']*)', ru:'([^']*)'.*?\}\}\},?$/gm)];
// fallback: parse per-line since each verb is one line in verbs.ts
const verbLines = verbsSrc.split('\n').filter((l) => l.trim().startsWith("{ id:'"));
const verbIds = new Set();
for (const line of verbLines) {
  const idMatch = line.match(/id:'([\w-]+)'/);
  if (!idMatch) { fail('verbs.ts: linha de verbo sem id reconhecível'); continue; }
  const id = idMatch[1];
  if (verbIds.has(id)) fail(`verbs.ts: id de verbo duplicado "${id}"`);
  verbIds.add(id);

  const ptMatch = line.match(/pt:'([^']*)'/);
  if (!ptMatch || !ptMatch[1].trim()) fail(`verbs.ts [${id}]: pt vazio`);

  const formsMatch = line.match(/forms:\{([^}]*)\}/);
  if (formsMatch) {
    for (const person of ['eu', 'tu', 'voce', 'nos', 'vos', 'eles']) {
      if (!new RegExp(person + ":'[^']+'").test(formsMatch[1])) {
        fail(`verbs.ts [${id}]: forms.${person} ausente ou vazio`);
      }
    }
  } else {
    fail(`verbs.ts [${id}]: campo forms não encontrado`);
  }

  const pretPeritoMatch = line.match(/pretPeritoRu:\{([^}]*)\}/);
  if (pretPeritoMatch) {
    const body = pretPeritoMatch[1];
    const isInvariant = /invariant:true/.test(body);
    for (const field of ['masculine', 'feminine', 'neuter', 'plural']) {
      if (!new RegExp(field + ":'[^']+'").test(body)) {
        fail(`verbs.ts [${id}]: pretPeritoRu.${field} ausente ou vazio`);
      }
    }
    if (isInvariant) {
      // ok, construção de sujeito invertido — não precisa variar por gênero
    }
  }
}

// ---------- relatório ----------
console.log(`Cenas: ${sceneIds.size} | Verbos: ${verbIds.size} | Missões: ${missionSceneIds.size}`);
if (warnings.length > 0) {
  console.log(`\n${warnings.length} aviso(s):`);
  warnings.forEach((w) => console.log('  ⚠ ' + w));
}
if (errors.length > 0) {
  console.log(`\n${errors.length} erro(s):`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  console.log('\nValidação FALHOU.');
  process.exit(1);
}
console.log('\nValidação OK — nenhum erro encontrado.');
