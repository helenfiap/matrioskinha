import { useLanguage } from '../context/LanguageContext';
import { useProgress, type SettingsState } from '../context/ProgressContext';

function ToggleRow({
  labelPt, labelRu, settingKey,
}: { labelPt: string; labelRu: string; settingKey: keyof SettingsState }) {
  const { t } = useLanguage();
  const { settings, updateSetting } = useProgress();
  const on = settings[settingKey];
  return (
    <div className="setting-row">
      <span>{t(labelPt, labelRu)}</span>
      <button
        className={'toggle' + (on ? ' on' : '')}
        onClick={() => updateSetting(settingKey, !on)}
        aria-pressed={on}
      />
    </div>
  );
}

export function Config() {
  const { t } = useLanguage();
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{t('Configurações', 'Настройки')}</h2>
          <p>{t('Ajuste o ritmo e a forma de apoio do curso.', 'Настрой темп и формат поддержки курса.')}</p>
        </div>
      </div>
      <div className="panel settings-grid">
        <div>
          <ToggleRow labelPt="Idioma de apoio: Русский" labelRu="Язык поддержки: русский" settingKey="supportLang" />
          <ToggleRow labelPt="Tradução automática" labelRu="Автоматический перевод" settingKey="autoTranslate" />
          <ToggleRow labelPt="Velocidade do áudio reduzida" labelRu="Замедленная скорость аудио" settingKey="slowAudio" />
        </div>
        <div>
          <ToggleRow labelPt="Região de referência: Florianópolis" labelRu="Базовый регион: Флорианополис" settingKey="region" />
          <ToggleRow labelPt="Meta semanal: 5 dias" labelRu="Недельная цель: 5 дней" settingKey="weeklyGoal" />
          <ToggleRow labelPt="Notificação de revisão diária" labelRu="Ежедневное напоминание о повторении" settingKey="reviewNotification" />
        </div>
      </div>
    </section>
  );
}
