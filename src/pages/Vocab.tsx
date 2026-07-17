import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ComponentType } from 'react';
import { ArrowRight, Home, Coffee, Bus, ShoppingCart, Dog, CloudRain, Croissant, Pill, Palmtree, Smartphone, UtensilsCrossed, Compass, Globe2, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { vocabItems } from '../data/vocab';
import { scenes } from '../data/scenarios';
import { audioAssets } from '../lib/audioAssets';
import { AudioButton } from '../components/AudioButton';
import { getLexicalKnowledgeOccurrences } from '../lib/semanticGraph';

const icons: Record<string, ComponentType<{ size?: number }>> = {
  'a casa': Home,
  'o café': Coffee,
  'o ônibus': Bus,
  'o mercado': ShoppingCart,
  'o cachorro': Dog,
  'a chuva': CloudRain,
  'o pão': Croissant,
  'a farmácia': Pill,
  'a praia': Palmtree,
  'o celular': Smartphone,
  'o restaurante': UtensilsCrossed,
  'o caminho': Compass,
};

export function Vocab() {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const brasilRealRef = useRef<HTMLDivElement>(null);
  const focusedItemId = useRef(searchParams.get('item')).current;

  useEffect(() => {
    if (searchParams.get('section') === 'brasil-real' && brasilRealRef.current) {
      brasilRealRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (focusedItemId) {
      document.getElementById(`vocab-${focusedItemId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (searchParams.get('section') || searchParams.get('item')) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{t('Pictogramas por contexto', 'Пиктограммы по ситуациям')}</h2>
          <p>{t('Vocabulário visual organizado por situações reais.', 'Визуальная лексика, организованная по реальным ситуациям.')}</p>
        </div>
      </div>
      <div className="vocab-grid">
        {vocabItems.map((v) => {
          const Icon = icons[v.pt] ?? Home;
          const occurrences = getLexicalKnowledgeOccurrences(v.pt);
          return (
            <article id={`vocab-${v.lexicalItemId}`} className={`vocab ${focusedItemId === v.lexicalItemId ? 'knowledge-focus' : ''}`} key={v.pt}>
              <div className="icon"><Icon size={30} /></div>
              <div className="vocab-term-row">
                <strong>{v.pt}</strong>
                <AudioButton src={audioAssets.word(v.lexicalItemId)} label={v.pt} />
              </div>
              <small>{v.ru}</small>
              {occurrences.length > 0 && (
                <div className="vocab-knowledge-links">
                  {occurrences.map((occurrence) => (
                    <Link key={`${occurrence.sceneId}:${occurrence.hotspotId}`} to={occurrence.href}>
                      <MapPin size={11} /> {t(occurrence.sceneLabelPt, occurrence.sceneLabelRu)} <ArrowRight size={11} />
                    </Link>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="section-head" ref={brasilRealRef} style={{ marginTop: 32 }}>
        <div>
          <h2><Globe2 size={20} style={{ verticalAlign: '-3px', marginRight: 6 }} />{t('Brasil real', 'Реальная Бразилия')}</h2>
          <p>{t(
            'Notas de cultura reunidas de cada cenário — o que os livros não contam sobre o dia a dia brasileiro.',
            'Культурные заметки, собранные из каждого сценария — то, что учебники не рассказывают о бразильской повседневности.'
          )}</p>
        </div>
      </div>
      <div className="culture-layer" style={{ borderTop: 'none', paddingTop: 0 }}>
        {scenes.map((scene) => (
          <div className="culture-block" key={scene.id}>
            <h4>{lang === 'ru' ? scene.labelRu : scene.labelPt}</h4>
            {scene.culture.map((c, i) => (
              <div className="culture-note" key={i}>{lang === 'ru' ? c.ru : c.pt}</div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
