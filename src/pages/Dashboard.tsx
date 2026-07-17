import { Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { getNextBestAction } from '../lib/recommendation';
import { useLearning } from '../context/LearningContext';

const RING_CIRCUMFERENCE = 97.4;

export function Dashboard() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { metrics } = useLearning();
  const {
    streakDays, studyDaysThisWeek, weeklyGoalTarget,
    pendingReview, challengeDoneCount, challengeTotal, sceneCounts,
  } = useProgress();

  const challengeFrac = challengeTotal ? challengeDoneCount / challengeTotal : 0;
  const nextAction = getNextBestAction({ pendingReviewCount: pendingReview.length, sceneCounts });

  return (
    <section>
      <div className="dash-top">
        <div className="welcome">
          <div className="eyebrow">{t('matrioskinha · painel do aluno', 'matrioskinha · кабинет ученика')}</div>
          <h1>{t('Olá, Demetrio! 👋', 'Привет, Деметрио! 👋')}</h1>
          <div className="next-action-card">
            <div className="next-action-label">{t('Sua próxima ação', 'Твоё следующее действие')}</div>
            <strong>{lang === 'ru' ? nextAction.titleRu : nextAction.titlePt}</strong>
            <p>{lang === 'ru' ? nextAction.descRu : nextAction.descPt}</p>
          </div>
          <button className="pill-btn primary" onClick={() => navigate(nextAction.to)}>
            {lang === 'ru' ? nextAction.ctaRu : nextAction.ctaPt} <ArrowRight size={15} />
          </button>
          <div className="brand-divider" />
        </div>
        <div className="streak-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="label">{t('Sequência de estudo', 'Серия занятий')}</span>
            <img className="mascot mascot-sm" src="/assets/avatar-merits.png" alt="" />
          </div>
          <span className="value"><Flame size={26} /> {streakDays} {t('dias', 'дней')}</span>
          <span className="label" style={{ marginTop: 10 }}>{t('Meta semanal', 'Недельная цель')}</span>
          <span style={{ fontWeight: 700 }}>
            {t(
              `${studyDaysThisWeek} de ${weeklyGoalTarget} dias concluídos`,
              `${studyDaysThisWeek} из ${weeklyGoalTarget} дней выполнено`
            )}
          </span>
        </div>
      </div>

      <div className="path-card">
        <div className="path-head">
          <div>
            <h3>{t('Sua trilha · 8 fases', 'Твой путь · 8 этапов')}</h3>
            <p>{t('Fase 3: Tu, você e o Brasil real', 'Этап 3: Tu, você и реальный язык Бразилии')}</p>
          </div>
          <button className="link-btn" onClick={() => navigate('/trilha')}>{t('Ver todas as lições →', 'Все уроки →')}</button>
        </div>
        <div className="path-track">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => (
            <span key={n} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={'path-step' + (n < 3 ? ' done' : n === 3 ? ' current' : '')}>
                <div className="num">{n}</div>
              </div>
              {i < 7 && <div className="path-line" />}
            </span>
          ))}
        </div>
      </div>

      <div className="mini-stats">
        <div className="stat-card">
          <div className="label">{t('Revisão de hoje', 'Сегодня нужно повторить')}</div>
          <div className="value">{pendingReview.length} {t('itens', 'элементов')}</div>
          <button
            className="link-btn"
            style={{ padding: 0, marginTop: 8 }}
            onClick={() => navigate('/progresso?section=revisao')}
            disabled={pendingReview.length === 0}
          >
            {t('Revisar agora →', 'Повторить сейчас →')}
          </button>
        </div>
        <div className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="label">{t('Desafio diário', 'Ежедневное задание')}</div>
            <div className="value">{challengeDoneCount} / {challengeTotal}</div>
          </div>
          <svg className="ring" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e1d6" strokeWidth={4} />
            <circle
              cx="18" cy="18" r="15.5" fill="none" stroke="#08783f"
              strokeDasharray={`${challengeFrac * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              strokeLinecap="round" strokeWidth={4} transform="rotate(-90 18 18)"
            />
          </svg>
        </div>
        <div className="stat-card">
          <div className="label">{t('Precisão nas tentativas', 'Точность попыток')}</div>
          <div className="value">{metrics.accuracy === null ? '—' : `${Math.round(metrics.accuracy * 100)}%`}</div>
          <div className="label" style={{ marginTop: 8 }}>{metrics.totalAttempts} {t('respostas registradas', 'записанных ответов')}</div>
        </div>
      </div>
    </section>
  );
}
