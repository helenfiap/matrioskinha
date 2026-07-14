import { useLanguage } from '../../context/LanguageContext';

export function LessonPanel() {
  const { t } = useLanguage();
  return (
    <div className="lesson-panel">
      <h3>{t('Tu × você — sistema de tratamento no português brasileiro', 'Tu × você — система обращения в бразильском португальском')}</h3>

      <div className="lesson-intro">
        <div>
          <span className="lang-tag pt">Português</span>
          <p>"Tu" e "você" são as duas formas principais de tratamento informal para a segunda pessoa do singular. Embora as duas sirvam para falar diretamente com alguém, pertencem a sistemas gramaticais diferentes: "tu" pede historicamente a conjugação de segunda pessoa ("tu falas"), enquanto "você" pede a conjugação de terceira pessoa ("você fala"), porque "você" nasceu da expressão de tratamento "vossa mercê". Na fala coloquial de várias regiões do Brasil, é muito comum ouvir "tu" combinado com a conjugação de terceira pessoa ("tu fala") — uma forma amplamente usada, ainda que fora da norma culta escrita.</p>
        </div>
        <div>
          <span className="lang-tag ru">Русский</span>
          <p>«Tu» и «você» — это две основные формы неформального обращения на «ты» в бразильском португальском. Хотя обе формы используются для прямого обращения к собеседнику, они принадлежат разным грамматическим системам: «tu» исторически требует спряжения второго лица («tu falas» — «ты говоришь»), а «você» требует спряжения третьего лица («você fala»), потому что «você» произошло от вежливой формы обращения «vossa mercê» («ваша милость»). В разговорной речи многих регионов Бразилии обычно «tu» сочетается со спряжением третьего лица («tu fala») — это широко распространённая форма, хотя она и выходит за рамки литературной письменной нормы.</p>
        </div>
      </div>

      <div className="lesson-block">
        <h4><span className="diamond" /> Conjugação — verbo falar (regular, -ar)</h4>
        <p className="lesson-block-sub">Presente, pretérito perfeito e imperativo, com a forma de norma culta e a forma coloquial lado a lado.</p>
        <table className="conj-table">
          <thead><tr><th>{t('Pronome', 'Местоимение')}</th><th>{t('Presente', 'Настоящее время')}</th><th>{t('Pretérito perfeito', 'Прош. совершенное')}</th><th>{t('Imperativo', 'Повелительное')}</th><th className="ru-col">Русский</th></tr></thead>
          <tbody>
            <tr><td><strong>tu</strong></td><td>falas <em>norma culta</em><br />fala <em>coloquial, muito comum</em></td><td>falaste <em>norma</em><br />falou <em>coloquial</em></td><td>fala!</td><td className="ru-col">ты говоришь / говори!</td></tr>
            <tr><td><strong>você</strong></td><td>fala</td><td>falou</td><td>fale!</td><td className="ru-col">ты (нейтрально) говоришь / говори!</td></tr>
          </tbody>
        </table>
      </div>

      <div className="lesson-block">
        <h4><span className="diamond" /> Conjugação — verbo fazer (irregular)</h4>
        <table className="conj-table">
          <thead><tr><th>{t('Pronome', 'Местоимение')}</th><th>{t('Presente', 'Настоящее время')}</th><th>{t('Pretérito perfeito', 'Прош. совершенное')}</th><th>{t('Imperativo', 'Повелительное')}</th><th className="ru-col">Русский</th></tr></thead>
          <tbody>
            <tr><td><strong>tu</strong></td><td>fazes <em>norma culta</em><br />faz <em>coloquial, muito comum</em></td><td>fizeste <em>norma</em><br />fez <em>coloquial</em></td><td>faz!</td><td className="ru-col">ты делаешь / делай!</td></tr>
            <tr><td><strong>você</strong></td><td>faz</td><td>fez</td><td>faça!</td><td className="ru-col">ты (нейтрально) делаешь / делай!</td></tr>
          </tbody>
        </table>
      </div>

      <div className="lesson-block">
        <h4><span className="diamond" /> Pronomes e possessivos</h4>
        <p className="lesson-block-sub">O pronome oblíquo e o possessivo mudam conforme o pronome de tratamento — mesmo quando o verbo já está na forma coloquial com tu.</p>
        <table className="conj-table">
          <thead><tr><th>{t('Uso', 'Употребление')}</th><th>{t('Com tu', 'С tu')}</th><th>{t('Com você', 'С você')}</th><th className="ru-col">Русский</th></tr></thead>
          <tbody>
            <tr><td>Oblíquo</td><td><strong>te</strong> vi ontem</td><td>vi <strong>você</strong> ontem</td><td className="ru-col">видел тебя вчера</td></tr>
            <tr><td>Companhia</td><td><strong>contigo</strong></td><td>com <strong>você</strong></td><td className="ru-col">с тобой</td></tr>
            <tr><td>Possessivo</td><td><strong>teu</strong> carro</td><td><strong>seu</strong> carro</td><td className="ru-col">твоя машина</td></tr>
          </tbody>
        </table>
        <div className="note-card warn">
          <p><strong>Atenção — erro muito comum mesmo entre nativos:</strong> misturar "tu" com o possessivo "seu" em vez de "teu" (ex.: "Tu viu o seu carro?" em vez de "Tu viu o teu carro?"). O "seu" é ambíguo — pode se referir a "você", "ele" ou "ela" — por isso muitos brasileiros preferem "dele/dela" para evitar confusão.</p>
          <p className="ru-note"><strong>Внимание — очень частая ошибка даже у носителей языка:</strong> смешение «tu» с притяжательным «seu» вместо «teu» (например, «Tu viu o seu carro?» вместо «Tu viu o teu carro?»). «Seu» неоднозначно — может относиться к «você», «ele» или «ela», поэтому многие бразильцы предпочитают «dele/dela», чтобы избежать путаницы.</p>
        </div>
      </div>

      <div className="lesson-block">
        <h4><span className="diamond" /> Exemplos de frases</h4>
        {[
          ['norma culta · região Sul', '"Tu vais à praia hoje?"', 'tradução', 'Ты пойдёшь на пляж сегодня?'],
          ['coloquial · muito comum no Brasil', '"Tu vai à praia hoje?"', 'tradução', 'Ты пойдёшь на пляж сегодня? (разговорный вариант)'],
          ['com você · neutro, amplo uso nacional', '"Você vai à praia hoje?"', 'tradução', 'Ты пойдёшь на пляж сегодня? (нейтральный вариант)'],
          ['pronome oblíquo', '"Eu te vi ontem no mercado."', 'tradução', 'Я видел тебя вчера на рынке.'],
          ['companhia · com tu', '"Vou contigo até a praia."', 'tradução', 'Я пойду с тобой на пляж.'],
          ['companhia · com você, comum em SP/RJ', '"Vou com você até a praia."', 'tradução', 'Я пойду с тобой на пляж.'],
        ].map(([tagPt, pt, tagRu, ru], i) => (
          <div className="example-pair" key={i}>
            <div><span className="tag-mini">{tagPt}</span><div className="pt-line">{pt}</div></div>
            <div><span className="tag-mini">{tagRu}</span><div className="ru-line">{ru}</div></div>
          </div>
        ))}
      </div>

      <div className="lesson-block">
        <h4><span className="diamond" /> Variação regional</h4>
        <table className="conj-table">
          <thead><tr><th>{t('Região', 'Регион')}</th><th>{t('Tendência', 'Тенденция')}</th><th className="ru-col">Русский</th></tr></thead>
          <tbody>
            <tr><td>Sul (Florianópolis, Porto Alegre)</td><td>"tu" predominante, com forte tendência à conjugação de 3ª pessoa na fala</td><td className="ru-col">преобладает «tu», часто со спряжением 3-го лица в речи</td></tr>
            <tr><td>Rio de Janeiro</td><td>"tu" e "você" coexistem; "tu" geralmente com conjugação de 3ª pessoa</td><td className="ru-col">«tu» и «você» сосуществуют; «tu» обычно со спряжением 3-го лица</td></tr>
            <tr><td>São Paulo e maior parte do Sudeste</td><td>"você" predominante; "tu" pouco frequente</td><td className="ru-col">преобладает «você»; «tu» встречается редко</td></tr>
            <tr><td>Norte e parte do Nordeste</td><td>"tu" presente em vários estados, com variação conforme a localidade</td><td className="ru-col">«tu» распространено в ряде штатов, с местными различиями</td></tr>
          </tbody>
        </table>
        <div className="note-card">
          <p>Como Florianópolis é a cidade de referência do curso, o uso de "tu" — inclusive na forma coloquial com verbo de 3ª pessoa — aparece com frequência nos exemplos e diálogos do material.</p>
          <p className="ru-note">Поскольку Флорианополис — базовый город курса, употребление «tu» — включая разговорную форму с глаголом в 3-м лице — часто встречается в примерах и диалогах материала.</p>
        </div>
      </div>
    </div>
  );
}
