import { Heart, Images, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { emotionCharacters, emotionMoods } from '../../data/emotions';

export function AtelieEmocoes() {
  const { lang, t } = useLanguage();

  return (
    <div className="emotion-atelier">
      <div className="atelier-hero">
        <img
          src="/assets/scenarios/emotions/reference/matrioskinha-reference.png"
          alt={t('Matrioskinha com uma expressão surpresa', 'Матрёшкинья с удивлённым выражением')}
        />
        <div>
          <span className="atelier-eyebrow"><Sparkles size={14} /> {t('Nova experiência em produção', 'Новый опыт в разработке')}</span>
          <h3>{t('Sentir, observar e dizer', 'Чувствовать, наблюдать и говорить')}</h3>
          <p>{t(
            'Matrioskinha e Misha Matriôshkin vão apresentar cada emoção em pares. Assim, a mesma cena ensina expressão afetiva, vocabulário e concordância de gênero.',
            'Матрёшкинья и Миша Матрёшкин представят каждую эмоцию в паре. Одна сцена будет учить эмоциям, лексике и согласованию рода.'
          )}</p>
          <div className="atelier-characters">
            <span><Heart size={14} /> {emotionCharacters.feminine.name}</span>
            <span><Heart size={14} /> {emotionCharacters.masculine.name}</span>
          </div>
        </div>
      </div>

      <div className="atelier-production-note">
        <Images size={17} />
        <span>{t(
          '16 emoções × 2 personagens = 32 ilustrações previstas. O gerador em lote já está preparado.',
          '16 эмоций × 2 персонажа = 32 запланированные иллюстрации. Пакетный генератор уже подготовлен.'
        )}</span>
      </div>

      <div className="mood-grid" aria-label={t('Emoções planejadas', 'Запланированные эмоции')}>
        {emotionMoods.map((mood) => {
          const labels = lang === 'ru' ? mood.ru : mood.pt;
          return (
            <article className="mood-card" key={mood.id}>
              <span className="mood-emoji" aria-hidden="true">{mood.emoji}</span>
              <div>
                <strong>{labels.feminine}</strong>
                <small>{labels.masculine}</small>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

