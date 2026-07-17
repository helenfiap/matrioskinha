import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Layers3, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { conjPersons, curatedInfinitives, type InfinitiveGroup } from '../data/verbs';
import type { RussianPastForms } from '../types';

type Tense = 'presente' | 'pretPerf';
type RuGender = 'masculine' | 'feminine';
type InfinitiveFilter = 'all' | InfinitiveGroup;

function pastCell(forms: RussianPastForms | undefined, personKey: string, gender: RuGender): string {
  if (!forms) return '';
  if (forms.invariant) return forms.neuter;
  const singular = gender === 'masculine' ? forms.masculine : forms.feminine;
  if (personKey === 'eu') return 'я ' + singular;
  if (personKey === 'tu') return 'ты ' + singular;
  if (personKey === 'nos') return 'мы ' + forms.plural;
  if (personKey === 'vos') return 'вы ' + forms.plural;
  if (personKey === 'eles') return 'они ' + forms.plural;
  return '';
}

export function Conjugador() {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [openId, setOpenId] = useState<string | null>(searchParams.get('q') ? null : null);
  const [tense, setTense] = useState<Tense>('presente');
  const [ruGender, setRuGender] = useState<RuGender>('masculine');
  const [infinitiveFilter, setInfinitiveFilter] = useState<InfinitiveFilter>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      const match = curatedInfinitives.find((v) => v.pt.toLowerCase() === q.toLowerCase());
      if (match) setOpenId(match.id);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return curatedInfinitives.filter((verb) => {
      const matchesGroup = infinitiveFilter === 'all' || verb.group === infinitiveFilter;
      const matchesQuery = !q
        || verb.pt.toLowerCase().includes(q)
        || verb.ru.toLowerCase().includes(q)
        || verb.contexts.some((context) => context.pt.toLowerCase().includes(q) || context.ru.toLowerCase().includes(q));
      return matchesGroup && matchesQuery;
    });
  }, [query, infinitiveFilter]);

  const infinitiveGroups: Array<{ id: InfinitiveFilter; pt: string; ru: string }> = [
    { id: 'all', pt: 'Todos', ru: 'Все' },
    { id: 'ar', pt: 'terminação -AR', ru: 'окончание -AR' },
    { id: 'er', pt: 'terminação -ER', ru: 'окончание -ER' },
    { id: 'ir', pt: 'terminação -IR', ru: 'окончание -IR' },
    { id: 'reflexive', pt: 'Reflexivos', ru: 'Возвратные' },
    { id: 'locution', pt: 'Locuções', ru: 'Сочетания' },
    { id: 'other', pt: 'Outros', ru: 'Другие' },
  ];

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{t('Conjugador de verbos', 'Спряжение глаголов')}</h2>
          <p>{t('As seis pessoas do português, lado a lado com a conjugação em russo.', 'Шесть грамматических лиц в португальском, рядом со спряжением в русском.')}</p>
        </div>
      </div>

      <div className="note-card with-mascot" style={{ marginBottom: 18 }}>
        <img className="mascot mascot-md" src="/assets/avatar-teaching.png" alt="" />
        <div className="note-text">
          <p>
            {t(
              '* A forma vós ainda existe na norma culta e em algumas regiões (sobretudo Portugal), mas está em desuso na fala do dia a dia da maioria dos falantes de português no mundo — no Brasil, foi praticamente substituída por vocês. Ela também não é o equivalente do вы formal do russo: вы pode ser singular formal ou plural, enquanto vós é sempre plural e não carrega, por si só, a ideia de formalidade.',
              '* Форма vós всё ещё существует в литературной норме и в некоторых регионах (особенно в Португалии), но вышла из повседневной речи большинства носителей португальского языка в мире — в Бразилии её почти полностью заменили на vocês. Она также не является эквивалентом формального русского «вы»: «вы» может быть формальным единственным числом или множественным числом, а vós — всегда множественное число и само по себе не выражает формальность.'
            )}
          </p>
          <p style={{ marginTop: 10 }}>
            {t(
              'Outra diferença estrutural: no russo, o presente do verbo ser/estar normalmente desaparece da frase (frase sem verbo), e só os verbos imperfectivos têm tempo presente — por isso algumas células abaixo trazem uma nota em vez de uma forma conjugada. Além disso, o passado russo não concorda com a pessoa gramatical, e sim com gênero e número: por isso a coluna russa do pretérito muda conforme o sujeito for masculino ou feminino, e some no plural.',
              'Ещё одно структурное отличие: в русском языке настоящее время глагола «быть» обычно исчезает из фразы (фраза без глагола), а настоящее время есть только у глаголов несовершенного вида — поэтому в некоторых ячейках ниже вместо спряжённой формы стоит примечание. Кроме того, русское прошедшее время согласуется не с грамматическим лицом, а с родом и числом: поэтому русский столбец в прошедшем времени меняется в зависимости от того, мужской подлежащее или женский, а во множественном числе род исчезает.'
            )}
          </p>
        </div>
      </div>

      <label className="search" style={{ marginBottom: 16, display: 'flex' }}>
        <Search size={16} /> <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Buscar verbo (português ou russo)...', 'Найти глагол (на португальском или русском)...')}
        />
      </label>

      <div className="infinitive-overview">
        <div><Layers3 size={18} /><span><strong>{curatedInfinitives.length}</strong>{t('infinitivos catalogados', 'инфинитивов в каталоге')}</span></div>
        <div><CheckCircle2 size={18} /><span><strong>{curatedInfinitives.filter((verb) => verb.hasFullConjugation).length}</strong>{t('quadros completos', 'полных таблиц')}</span></div>
        <p>{t(
          'O índice reúne verbos do Knowledge Core, dos cenários e do Ateliê sem duplicação.',
          'Указатель объединяет без повторов глаголы из базы знаний, сцен и Ателье.'
        )}</p>
      </div>

      <nav className="infinitive-groups" aria-label={t('Grupos de infinitivos', 'Группы инфинитивов')}>
        {infinitiveGroups.map((group) => {
          const count = group.id === 'all'
            ? curatedInfinitives.length
            : curatedInfinitives.filter((verb) => verb.group === group.id).length;
          return (
            <button
              type="button"
              key={group.id}
              className={infinitiveFilter === group.id ? 'active' : ''}
              onClick={() => setInfinitiveFilter(group.id)}
            >
              {t(group.pt, group.ru)} <span>{count}</span>
            </button>
          );
        })}
      </nav>

      <div className="conj-tense-tabs">
        <button className={tense === 'presente' ? 'active' : ''} onClick={() => setTense('presente')}>
          {t('Presente', 'Настоящее время')}
        </button>
        <button className={tense === 'pretPerf' ? 'active' : ''} onClick={() => setTense('pretPerf')}>
          {t('Pretérito perfeito', 'Прошедшее время')}
        </button>
      </div>

      {tense === 'pretPerf' && (
        <div className="gender-toggle">
          <span className="gender-toggle-label">{t('Sujeito no russo:', 'Подлежащее в русском:')}</span>
          <button className={ruGender === 'masculine' ? 'active' : ''} onClick={() => setRuGender('masculine')}>
            {t('masculino (он)', 'мужской (он)')}
          </button>
          <button className={ruGender === 'feminine' ? 'active' : ''} onClick={() => setRuGender('feminine')}>
            {t('feminino (она)', 'женский (она)')}
          </button>
        </div>
      )}

      <div>
        {list.length === 0 && <div className="conj-empty">{t('Nada encontrado.', 'Ничего не найдено.')}</div>}
        {list.map((v) => {
          const open = openId === v.id;
          const hasPret = Boolean(v.pretPeritoRu);
          const showingPret = tense === 'pretPerf' && hasPret;
          const invariant = v.pretPeritoRu?.invariant;
          return (
            <div className={'conj-item' + (open ? ' open' : '')} key={v.id}>
              <button type="button" className="conj-item-head" onClick={() => setOpenId(open ? null : v.id)} aria-expanded={open}>
                <div className="conj-infinitive-title">
                  <div><strong>{v.pt}</strong><span className="ru-inf">{v.ru}</span></div>
                  <span className={`conj-status ${v.hasFullConjugation ? 'complete' : 'indexed'}`}>
                    {v.hasFullConjugation ? t('conjugação completa', 'полное спряжение') : t('infinitivo catalogado', 'инфинитив в каталоге')}
                  </span>
                </div>
                <span className="chevron"><ChevronDown size={16} /></span>
              </button>
              {open && (
                <div className="conj-item-body" style={{ display: 'block' }}>
                  {!v.hasFullConjugation && (
                    <div className="indexed-infinitive-panel">
                      <p>{t(
                        'Este infinitivo já faz parte do vocabulário ativo do produto. A tabela completa português–russo está sinalizada para a próxima rodada de curadoria verbal.',
                        'Этот инфинитив уже входит в активную лексику продукта. Полная португальско-русская таблица отмечена для следующего этапа глагольной редакции.'
                      )}</p>
                    </div>
                  )}
                  {v.hasFullConjugation && tense === 'pretPerf' && !hasPret && (
                    <div className="conj-note">
                      {t('Pretérito perfeito ainda não cadastrado para este verbo.', 'Прошедшее время для этого глагола пока не добавлено.')}
                    </div>
                  )}
                  {showingPret && (
                    <table className="conj-table">
                      <thead>
                        <tr>
                          <th>{t('Pessoa', 'Лицо')}</th>
                          <th>{t('Português', 'Португальский')}</th>
                          <th>{t('Equivalente russo em contexto', 'Русский эквивалент в контексте')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conjPersons.map((p) => (
                          <tr key={p.key}>
                            <td>{lang === 'ru' ? p.ru : p.pt}</td>
                            <td><strong>{v.pretPerf?.[p.key]}</strong></td>
                            <td className="ru-col">
                              {p.key === 'voce' && !invariant ? (
                                <div className="voce-split">
                                  <div><small>você</small> {'вы ' + v.pretPeritoRu?.plural}</div>
                                  <div><small>ele</small> {'он ' + v.pretPeritoRu?.masculine}</div>
                                  <div><small>ela</small> {'она ' + v.pretPeritoRu?.feminine}</div>
                                </div>
                              ) : p.key === 'voce' && invariant ? (
                                v.pretPeritoRu?.neuter
                              ) : (
                                pastCell(v.pretPeritoRu, p.key, ruGender)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {v.hasFullConjugation && !showingPret && tense === 'presente' && (
                    <table className="conj-table">
                      <thead>
                        <tr>
                          <th>{t('Pessoa', 'Лицо')}</th>
                          <th>{t('Português', 'Португальский')}</th>
                          <th>{t('Russo', 'Русский')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conjPersons.map((p) => (
                          <tr key={p.key}>
                            <td>{lang === 'ru' ? p.ru : p.pt}</td>
                            <td><strong>{v.forms[p.key]}</strong></td>
                            <td className="ru-col">{v.ruForms[p.key]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {v.hasFullConjugation && tense === 'presente' && v.note && <div className="conj-note">{lang === 'ru' && v.noteRu ? v.noteRu : v.note}</div>}
                  {showingPret && !invariant && (
                    <div className="conj-note">
                      {t(
                        'No russo, o pretérito não conjuga por pessoa: concorda com gênero e número. As formas acima mudam com o seletor "Sujeito no russo" e voltam ao plural em nós/vós/eles.',
                        'В русском прошедшее время не спрягается по лицам: оно согласуется с родом и числом. Формы выше меняются в зависимости от переключателя «Подлежащее» и переходят во множественное число в мы/вы/они.'
                      )}
                    </div>
                  )}
                  {showingPret && invariant && (
                    <div className="conj-note">
                      {t(
                        'Este verbo tem construção de sujeito invertido em russo: a forma concorda com a coisa que agrada (aqui, neutro), não com a pessoa — por isso não muda com o seletor de gênero.',
                        'У этого глагола в русском обратная конструкция: форма согласуется с тем, что нравится (здесь — средний род), а не с человеком, поэтому она не меняется в зависимости от переключателя рода.'
                      )}
                    </div>
                  )}
                  {v.contexts.length > 0 && (
                    <div className="verb-contexts">
                      <strong>{t('Onde este verbo aparece', 'Где встречается этот глагол')}</strong>
                      <div>{v.contexts.map((context) => (
                        <span key={`${context.kind}:${context.id}`}>{lang === 'ru' ? context.ru : context.pt}</span>
                      ))}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
