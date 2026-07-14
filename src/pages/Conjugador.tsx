import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { conjPersons, conjugatorVerbs } from '../data/verbs';
import type { RussianPastForms } from '../types';

type Tense = 'presente' | 'pretPerf';
type RuGender = 'masculine' | 'feminine';

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

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      const match = conjugatorVerbs.find((v) => v.pt.toLowerCase() === q.toLowerCase());
      if (match) setOpenId(match.id);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conjugatorVerbs;
    return conjugatorVerbs.filter((v) => v.pt.toLowerCase().includes(q) || v.ru.toLowerCase().includes(q));
  }, [query]);

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

      <div className="scene-tabs" style={{ marginBottom: 16 }}>
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
              <div className="conj-item-head" onClick={() => setOpenId(open ? null : v.id)}>
                <div><strong>{v.pt}</strong><span className="ru-inf">{v.ru}</span></div>
                <span className="chevron"><ChevronDown size={16} /></span>
              </div>
              {open && (
                <div className="conj-item-body" style={{ display: 'block' }}>
                  {tense === 'pretPerf' && !hasPret && (
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
                  {!showingPret && tense === 'presente' && (
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
                  {tense === 'presente' && v.note && <div className="conj-note">{lang === 'ru' && v.noteRu ? v.noteRu : v.note}</div>}
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
