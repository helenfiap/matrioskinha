import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Globe2, Heart, ImageOff, MessageCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLearning } from '../../context/LearningContext';
import { useProgress } from '../../context/ProgressContext';
import { emotionCharacters, emotionMoods, EMOTION_ATELIER_PROGRESS_ID, type EmotionMood } from '../../data/emotions';
import { emotionLearningByMoodId } from '../../data/emotionLearning';
import { STAGE_LABELS } from '../../domain/progress';
import { AudioButton } from '../../components/AudioButton';
import { audioAssets } from '../../lib/audioAssets';
import { selectGenderedAudioText, type AudioVoiceRole } from '../../lib/audioNaming';

type EmotionGender = 'feminine' | 'masculine';

function EmotionArtwork({ mood, gender, lang, large = false }: { mood: EmotionMood; gender: EmotionGender; lang: 'pt' | 'ru'; large?: boolean }) {
  const [sourceFormat, setSourceFormat] = useState<'webp' | 'png' | 'missing'>('webp');
  const character = emotionCharacters[gender];
  const src = `${character.imageBasePath}/${mood.id}.${sourceFormat === 'webp' ? 'webp' : 'png'}`;

  useEffect(() => setSourceFormat('webp'), [mood.id, gender]);

  return (
    <div className={`emotion-artwork ${large ? 'large' : ''} ${sourceFormat === 'missing' ? 'missing' : ''}`}>
      {sourceFormat !== 'missing' ? (
        <img
          src={src}
          alt={`${character.name}: ${lang === 'ru' ? mood.ru[gender] : mood.pt[gender]}`}
          onError={() => setSourceFormat((current) => current === 'webp' ? 'png' : 'missing')}
        />
      ) : (
        <div
          className="emotion-artwork-fallback"
          role="img"
          aria-label={lang === 'ru' ? `Иллюстрация ${character.name} ещё не добавлена` : `Arte de ${character.name} ainda não adicionada`}
        >
          <span aria-hidden="true">{mood.emoji}</span>
          <ImageOff size={large ? 22 : 15} />
        </div>
      )}
    </div>
  );
}

function BilingualLine({ pt, ru, primaryLang, audioVoice }: {
  pt: string;
  ru: string;
  primaryLang: 'pt' | 'ru';
  audioVoice?: AudioVoiceRole;
}) {
  return (
    <div className="bilingual-audio-row">
      <div className="bilingual-line">
        {primaryLang === 'ru' ? (
          <><p lang="ru">{ru}</p><p lang="pt-BR">{pt}</p></>
        ) : (
          <><p lang="pt-BR">{pt}</p><p lang="ru">{ru}</p></>
        )}
      </div>
      {audioVoice && <AudioButton src={audioAssets.emotion(pt, audioVoice)} label={pt} />}
    </div>
  );
}

export function AtelieEmocoes() {
  const { lang, t } = useLanguage();
  const { getStage, getStageInfo, markReviewed, advanceReview, failReview } = useProgress();
  const { recordAttempt } = useLearning();
  const [gender, setGender] = useState<EmotionGender>('feminine');
  const [selectedMoodId, setSelectedMoodId] = useState(emotionMoods[0].id);

  const selectedMood = emotionMoods.find((mood) => mood.id === selectedMoodId) ?? emotionMoods[0];
  const selectedContent = emotionLearningByMoodId.get(selectedMood.id)!;
  const selectedStage = getStage(EMOTION_ATELIER_PROGRESS_ID, selectedMood.id);
  const selectedProgress = getStageInfo(EMOTION_ATELIER_PROGRESS_ID, selectedMood.id);
  const selectedCharacter = emotionCharacters[gender];

  const progress = (() => {
    const items = emotionMoods.map((mood) => getStageInfo(EMOTION_ATELIER_PROGRESS_ID, mood.id));
    return {
      explored: items.filter((item) => item.intervalIndex >= 1).length,
      practiced: items.filter((item) => item.intervalIndex >= 3).length,
      mastered: items.filter((item) => item.intervalIndex >= 6).length,
    };
  })();

  const selectMood = (moodId: string) => {
    setSelectedMoodId(moodId);
    markReviewed(EMOTION_ATELIER_PROGRESS_ID, moodId);
  };

  const registerContextUse = () => {
    if (selectedProgress.intervalIndex === 0) markReviewed(EMOTION_ATELIER_PROGRESS_ID, selectedMood.id);
    else advanceReview(EMOTION_ATELIER_PROGRESS_ID, selectedMood.id);
    recordAttempt({
      itemId: `emotion-${selectedMood.id}`,
      itemType: 'emotion',
      exerciseTemplateId: 'emotion-context',
      modality: 'context',
      correct: true,
      usedSupportLanguage: true,
      durationMs: 0,
    });
  };

  const registerDifficulty = () => {
    if (selectedProgress.intervalIndex === 0) markReviewed(EMOTION_ATELIER_PROGRESS_ID, selectedMood.id);
    else failReview(EMOTION_ATELIER_PROGRESS_ID, selectedMood.id);
    recordAttempt({
      itemId: `emotion-${selectedMood.id}`,
      itemType: 'emotion',
      exerciseTemplateId: 'emotion-context',
      modality: 'context',
      correct: false,
      usedSupportLanguage: true,
      durationMs: 0,
      errorCode: 'emotion-context',
    });
  };

  const genderLabelPt = gender === 'feminine' ? 'Ela está' : 'Ele está';
  const voiceRole: AudioVoiceRole = gender === 'feminine' ? 'female' : 'male';
  const example = gender === 'feminine' ? selectedContent.feminineExample : selectedContent.masculineExample;
  const selfExpressionPt = selectGenderedAudioText(selectedContent.selfExpression.pt, voiceRole);

  return (
    <div className="emotion-atelier">
      <div className="atelier-learning-head">
        <div>
          <span className="atelier-eyebrow"><Sparkles size={14} /> {t('Ateliê bilíngue', 'Двуязычное ателье')}</span>
          <h3>
            {t('Sentir, observar e dizer', 'Чувствовать, наблюдать и говорить')}
            <small lang={lang === 'ru' ? 'pt-BR' : 'ru'}>{t('Чувствовать, наблюдать и говорить', 'Sentir, observar e dizer')}</small>
          </h3>
          <p>{t(
            'Português e russo permanecem juntos em cada card, exemplo e curiosidade.',
            'Португальский и русский всегда показаны вместе в каждой карточке, примере и заметке.'
          )}</p>
          <p lang={lang === 'ru' ? 'pt-BR' : 'ru'}>{t(
            'Португальский и русский всегда показаны вместе в каждой карточке, примере и заметке.',
            'Português e russo permanecem juntos em cada card, exemplo e curiosidade.'
          )}</p>
        </div>
        <div className="atelier-progress-summary" aria-label={t('Progresso do Ateliê', 'Прогресс в Ателье')}>
          <div><strong>{progress.explored}/16</strong><span>{t('exploradas', 'изучено')}</span></div>
          <div><strong>{progress.practiced}</strong><span>{t('em contexto', 'в контексте')}</span></div>
          <div><strong>{progress.mastered}</strong><span>{t('dominadas', 'освоено')}</span></div>
        </div>
      </div>

      <div className="atelier-controls">
        <div className="gender-toggle" role="group" aria-label={t('Personagem para os exemplos', 'Персонаж для примеров')}>
          <span className="gender-toggle-label">{t('Personagem', 'Персонаж')}</span>
          <button type="button" className={gender === 'feminine' ? 'active' : ''} onClick={() => setGender('feminine')}>
            {emotionCharacters.feminine.name} · {t('ela', 'она')}
          </button>
          <button type="button" className={gender === 'masculine' ? 'active' : ''} onClick={() => setGender('masculine')}>
            {emotionCharacters.masculine.name} · {t('ele', 'он')}
          </button>
        </div>
        <span className="atelier-auto-assets">{t(
          'As artes aparecem automaticamente quando os PNGs são adicionados.',
          'Иллюстрации появятся автоматически после добавления PNG.'
        )}</span>
      </div>

      <div className="mood-learning-grid" aria-label={t('Cards bilíngues de emoções', 'Двуязычные карточки эмоций')}>
        {emotionMoods.map((mood) => {
          const stage = getStage(EMOTION_ATELIER_PROGRESS_ID, mood.id);
          const stageLabels = STAGE_LABELS[stage];
          return (
            <button
              type="button"
              className={`mood-learning-card stage-${stage} ${mood.id === selectedMood.id ? 'active' : ''}`}
              key={mood.id}
              onClick={() => selectMood(mood.id)}
              aria-pressed={mood.id === selectedMood.id}
            >
              <EmotionArtwork mood={mood} gender={gender} lang={lang} />
              <div className="mood-card-copy">
                <strong lang={lang === 'ru' ? 'ru' : 'pt-BR'}>{lang === 'ru' ? mood.ru[gender] : mood.pt[gender]}</strong>
                <span lang={lang === 'ru' ? 'pt-BR' : 'ru'}>{lang === 'ru' ? mood.pt[gender] : mood.ru[gender]}</span>
              </div>
              <small className="mood-stage">{t(stageLabels.pt, stageLabels.ru)}</small>
            </button>
          );
        })}
      </div>

      <section className="emotion-detail-card" aria-live="polite">
        <div className="emotion-detail-visual">
          <EmotionArtwork mood={selectedMood} gender={gender} lang={lang} large />
          <div className="emotion-character-name">{selectedCharacter.name}</div>
        </div>

        <div className="emotion-detail-content">
          <div className="emotion-detail-title">
            <span>{selectedMood.emoji}</span>
            <div>
              <h3 lang={lang === 'ru' ? 'ru' : 'pt-BR'}>{lang === 'ru' ? selectedMood.ru[gender] : `${genderLabelPt} ${selectedMood.pt[gender]}`}</h3>
              <p lang={lang === 'ru' ? 'pt-BR' : 'ru'}>{lang === 'ru' ? `${genderLabelPt} ${selectedMood.pt[gender]}` : selectedMood.ru[gender]}</p>
            </div>
            <AudioButton src={audioAssets.emotion(selectedMood.pt[gender], voiceRole)} label={selectedMood.pt[gender]} />
            <span className={`emotion-stage-badge stage-${selectedStage}`}>
              {t(STAGE_LABELS[selectedStage].pt, STAGE_LABELS[selectedStage].ru)}
            </span>
          </div>

          <div
            className="emotion-progress-track"
            role="progressbar"
            aria-label={t('Progresso de uso no contexto', 'Прогресс использования в контексте')}
            aria-valuemin={0}
            aria-valuemax={6}
            aria-valuenow={selectedProgress.intervalIndex}
          >
            <span style={{ width: `${(selectedProgress.intervalIndex / 6) * 100}%` }} />
          </div>

          <div className="emotion-info-block">
            <h4><MessageCircle size={16} /> {t('Exemplo no contexto', 'Пример в контексте')}</h4>
            <BilingualLine pt={example.pt} ru={example.ru} primaryLang={lang} audioVoice={voiceRole} />
          </div>

          <div className="emotion-info-block self-expression">
            <h4><Heart size={16} /> {t('Para falar de si', 'Как сказать о себе')}</h4>
            <BilingualLine pt={selfExpressionPt} ru={selectedContent.selfExpression.ru} primaryLang={lang} audioVoice={voiceRole} />
          </div>

          <div className="emotion-info-grid">
            <div className="emotion-info-block">
              <h4><BookOpen size={16} /> {t('Como usar', 'Как использовать')}</h4>
              <BilingualLine pt={selectedContent.usageNote.pt} ru={selectedContent.usageNote.ru} primaryLang={lang} audioVoice="male" />
            </div>
            <div className="emotion-info-block culture">
              <h4><Globe2 size={16} /> {t('Curiosidade cultural', 'Культурная заметка')}</h4>
              <BilingualLine pt={selectedContent.cultureNote.pt} ru={selectedContent.cultureNote.ru} primaryLang={lang} audioVoice="female" />
            </div>
          </div>

          <div className="emotion-context-challenge">
            <strong>{t('Use no seu contexto', 'Используй в своём контексте')}</strong>
            <BilingualLine pt={selectedContent.contextPrompt.pt} ru={selectedContent.contextPrompt.ru} primaryLang={lang} audioVoice="female" />
          </div>

          <div className="emotion-detail-actions">
            <button type="button" className="sr-btn" onClick={registerDifficulty}>
              <RotateCcw size={15} /> {t('Preciso praticar', 'Нужно повторить')}
            </button>
            <button type="button" className="sr-btn know" onClick={registerContextUse}>
              <CheckCircle2 size={15} /> {t('Usei no contexto', 'Использовал(а) в контексте')}
            </button>
          </div>

          <div className="emotion-progress-help">
            <span>{t(
              'Cada uso contextual avança a revisão espaçada desta emoção.',
              'Каждое использование в контексте продвигает интервальное повторение этой эмоции.'
            )}</span>
            <span lang={lang === 'ru' ? 'pt-BR' : 'ru'}>{t(
              'Каждое использование в контексте продвигает интервальное повторение этой эмоции.',
              'Cada uso contextual avança a revisão espaçada desta emoção.'
            )}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
