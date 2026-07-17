param(
  [switch]$Execute,
  [ValidateSet('all', 'feminine', 'masculine')]
  [string]$Gender = 'all',
  [Alias('Mood')]
  [string[]]$OnlyMood = @(),
  [ValidateSet('low', 'medium', 'high', 'auto')]
  [string]$Quality = 'medium',
  [string]$Model = 'gpt-image-2',
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $repoRoot
$referenceImage = Join-Path $repoRoot 'public\assets\scenarios\emotions\reference\matrioskinha-reference.png'
$python = Join-Path $workspaceRoot '.venv\Scripts\python.exe'
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$imageGen = Join-Path $codexHome 'skills\.system\imagegen\scripts\image_gen.py'

if (-not (Test-Path -LiteralPath $referenceImage)) {
  throw "Imagem de referência não encontrada: $referenceImage"
}
if (-not (Test-Path -LiteralPath $python)) {
  throw "Python do workspace não encontrado: $python"
}
if (-not (Test-Path -LiteralPath $imageGen)) {
  throw "CLI de imagem do Codex não encontrado: $imageGen"
}
if ($Execute -and -not $env:OPENAI_API_KEY) {
  throw 'Defina OPENAI_API_KEY no ambiente antes de usar -Execute. O modo de planejamento não precisa de chave.'
}

$moods = @(
  [pscustomobject]@{ Id = 'feliz'; Feminine = 'feliz'; Masculine = 'feliz'; Cue = 'open joyful smile, bright crescent eyes, lifted cheeks, welcoming open hands' },
  [pscustomobject]@{ Id = 'triste'; Feminine = 'triste'; Masculine = 'triste'; Cue = 'downturned mouth, glossy teary eyes, lowered gaze, gently slumped shoulders' },
  [pscustomobject]@{ Id = 'apaixonada'; Feminine = 'apaixonada'; Masculine = 'apaixonado'; Cue = 'warm blushing cheeks, tender smile, sparkling eyes, hands held over the heart' },
  [pscustomobject]@{ Id = 'preocupada'; Feminine = 'preocupada'; Masculine = 'preocupado'; Cue = 'knitted eyebrows, tense small mouth, hands clasped together, attentive worried gaze' },
  [pscustomobject]@{ Id = 'assustada'; Feminine = 'assustada'; Masculine = 'assustado'; Cue = 'wide eyes, small open mouth, raised shoulders, hands close to the face' },
  [pscustomobject]@{ Id = 'calma'; Feminine = 'calma'; Masculine = 'calmo'; Cue = 'soft closed eyes, peaceful half-smile, relaxed shoulders, hands resting naturally' },
  [pscustomobject]@{ Id = 'irritada'; Feminine = 'irritada'; Masculine = 'irritado'; Cue = 'lowered eyebrows, firm mouth, flushed cheeks, arms held firmly at the sides' },
  [pscustomobject]@{ Id = 'surpresa'; Feminine = 'surpresa'; Masculine = 'surpreso'; Cue = 'raised eyebrows, round open eyes and mouth, hands lifted in spontaneous surprise' },
  [pscustomobject]@{ Id = 'cansada'; Feminine = 'cansada'; Masculine = 'cansado'; Cue = 'heavy half-closed eyelids, small yawn, drooping posture, one hand near the cheek' },
  [pscustomobject]@{ Id = 'animada'; Feminine = 'animada'; Masculine = 'animado'; Cue = 'radiant grin, shining eyes, energetic raised hands, lively forward posture' },
  [pscustomobject]@{ Id = 'timida'; Feminine = 'tímida'; Masculine = 'tímido'; Cue = 'small shy smile, rosy cheeks, sideways gaze, hands modestly together' },
  [pscustomobject]@{ Id = 'confiante'; Feminine = 'confiante'; Masculine = 'confiante'; Cue = 'steady direct gaze, assured smile, upright posture, hands confidently at the waist' },
  [pscustomobject]@{ Id = 'orgulhosa'; Feminine = 'orgulhosa'; Masculine = 'orgulhoso'; Cue = 'warm proud smile, chin gently lifted, upright posture, one hand over the chest' },
  [pscustomobject]@{ Id = 'envergonhada'; Feminine = 'envergonhada'; Masculine = 'envergonhado'; Cue = 'deep blush, hesitant smile, lowered eyes, one hand partially hiding the face' },
  [pscustomobject]@{ Id = 'confusa'; Feminine = 'confusa'; Masculine = 'confuso'; Cue = 'one eyebrow raised, uncertain mouth, slight head tilt, palms gently turned upward' },
  [pscustomobject]@{ Id = 'aliviada'; Feminine = 'aliviada'; Masculine = 'aliviado'; Cue = 'relieved exhale, softened eyes, relaxed smile, shoulders visibly releasing tension' }
)

if ($OnlyMood.Count -gt 0) {
  $moodIds = @($moods | ForEach-Object { $_.Id })
  $unknown = @($OnlyMood | Where-Object { $_ -notin $moodIds })
  if ($unknown.Count -gt 0) {
    throw "Mood(s) desconhecido(s): $($unknown -join ', ')"
  }
  $moods = @($moods | Where-Object { $_.Id -in $OnlyMood })
}

$characters = @(
  [pscustomobject]@{
    Gender = 'feminine'
    Folder = 'matrioskinha'
    Name = 'Matrioskinha'
    Identity = 'Preserve the same female Matrioskinha identity, round nesting-doll silhouette, blonde fringe, navy-and-ivory folk coat and delicate silver floral ornament from Image 1.'
    Styling = 'Keep her warm Brazilian-Russian storybook personality. Simplify accessories for emotional clarity; no sword and no prayer beads.'
  },
  [pscustomobject]@{
    Gender = 'masculine'
    Folder = 'misha'
    Name = 'Misha Matriôshkin'
    Identity = 'Use Image 1 as the visual style and shape-language reference to create a clearly distinct male nesting-doll counterpart named Misha Matriôshkin, with short chestnut hair, kind dark eyes and a slightly broader round silhouette.'
    Styling = 'Dress him in a faded navy Soviet-era-inspired worker jacket, burgundy scarf, brass mechanical wristwatch and restrained geometric modernist embroidery. Nostalgic everyday design only; no real political insignia, no propaganda and no military uniform.'
  }
)

if ($Gender -ne 'all') {
  $characters = @($characters | Where-Object { $_.Gender -eq $Gender })
}

$jobs = @(foreach ($character in $characters) {
  foreach ($mood in $moods) {
    $label = if ($character.Gender -eq 'feminine') { $mood.Feminine } else { $mood.Masculine }
    $outputDir = Join-Path $repoRoot "public\assets\scenarios\emotions\$($character.Folder)"
    $output = Join-Path $outputDir "$($mood.Id).png"
    $prompt = @"
Use case: stylized-concept
Asset type: portrait emotion card for a bilingual educational web app
Input image: Image 1 is the visual reference for character design, medium, palette and finish.
Primary request: Create $($character.Name) expressing the Portuguese mood "$label" with unmistakable emotional readability.
Subject: $($character.Identity) $($character.Styling)
Expression and body language: $($mood.Cue).
Style/medium: polished whimsical storybook illustration, soft painterly 3D volume, clean rounded shapes, subtle folk-art details, child-friendly but not infantile.
Composition/framing: centered full nesting-doll character, portrait orientation, entire silhouette visible, consistent scale and generous padding for a card crop.
Scene/backdrop: the same deep navy atelier backdrop with a subtle warm blue floor glow and sparse golden dust; no scenery competing with the face.
Lighting/mood: soft cinematic key light focused on eyes, eyebrows, mouth, cheeks and hands; expression must remain legible at thumbnail size.
Constraints: one character only; preserve series consistency; no text, captions, logos, watermark, weapons, religious objects or extra limbs.
Avoid: photorealism, horror, caricature distortion, busy background, political symbols, propaganda, military insignia.
"@
    [pscustomobject]@{ Character = $character.Name; Gender = $character.Gender; Mood = $mood.Id; Output = $output; Prompt = $prompt }
  }
})

Write-Output "Ateliê das Emoções: $($jobs.Count) imagem(ns) planejada(s)."
Write-Output "Modelo: $Model | Qualidade: $Quality | Execução: $Execute"

foreach ($job in $jobs) {
  Write-Output "[$($job.Gender)] $($job.Mood) -> $($job.Output)"
  if (-not $Execute) { continue }

  $optimizedOutput = [System.IO.Path]::ChangeExtension($job.Output, '.webp')
  if ((Test-Path -LiteralPath $optimizedOutput) -and -not $Force) {
    Write-Output "Já otimizado, ignorando geração: $optimizedOutput"
    continue
  }

  $outputDir = Split-Path -Parent $job.Output
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
  $arguments = @(
    $imageGen, 'edit',
    '--model', $Model,
    '--image', $referenceImage,
    '--prompt', $job.Prompt,
    '--quality', $Quality,
    '--size', '1024x1536',
    '--out', $job.Output
  )
  if ($Force) { $arguments += '--force' }

  & $python @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao gerar $($job.Gender)/$($job.Mood)."
  }
}

if (-not $Execute) {
  Write-Output 'Planejamento concluído sem chamadas de API. Use -Execute somente quando quiser gerar e consumir créditos.'
} else {
  Push-Location $repoRoot
  try {
    & 'C:\Program Files\nodejs\npm.cmd' run art:sync
    if ($LASTEXITCODE -ne 0) { throw 'A geração terminou, mas o funil de otimização falhou.' }
  } finally {
    Pop-Location
  }
}
