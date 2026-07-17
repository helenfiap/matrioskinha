import { z } from 'zod';

const relatedTermSchema = z.object({
  id: z.string().min(1),
  pt: z.string().min(1),
  ru: z.string().min(1),
});

const emotionVocabularySchema = z.object({
  moodId: z.string().min(1),
  verbs: z.array(relatedTermSchema).length(3),
  expressions: z.array(relatedTermSchema).length(3),
});

export type EmotionVocabulary = z.infer<typeof emotionVocabularySchema>;

export const emotionVocabularyContent = z.array(emotionVocabularySchema).length(16).parse([
  {
    moodId: 'feliz',
    verbs: [
      { id: 'alegrar-se', pt: 'alegrar-se', ru: 'радоваться' },
      { id: 'sorrir', pt: 'sorrir', ru: 'улыбаться' },
      { id: 'comemorar', pt: 'comemorar', ru: 'праздновать' },
    ],
    expressions: [
      { id: 'que-bom', pt: 'Que bom!', ru: 'Как здорово!' },
      { id: 'feliz-por-voce', pt: 'Estou muito feliz por você.', ru: 'Я очень рад / рада за тебя.' },
      { id: 'fez-meu-dia', pt: 'Isso fez meu dia.', ru: 'Это сделало мой день лучше.' },
    ],
  },
  {
    moodId: 'triste',
    verbs: [
      { id: 'entristecer-se', pt: 'entristecer-se', ru: 'печалиться' },
      { id: 'chorar', pt: 'chorar', ru: 'плакать' },
      { id: 'sentir-saudade', pt: 'sentir saudade', ru: 'скучать' },
    ],
    expressions: [
      { id: 'estou-aqui', pt: 'Estou aqui com você.', ru: 'Я рядом с тобой.' },
      { id: 'sinto-muito', pt: 'Sinto muito.', ru: 'Мне очень жаль.' },
      { id: 'nao-estou-bem', pt: 'Hoje não estou bem.', ru: 'Сегодня мне нехорошо.' },
    ],
  },
  {
    moodId: 'apaixonada',
    verbs: [
      { id: 'apaixonar-se', pt: 'apaixonar-se', ru: 'влюбляться' },
      { id: 'amar', pt: 'amar', ru: 'любить' },
      { id: 'admirar', pt: 'admirar', ru: 'восхищаться' },
    ],
    expressions: [
      { id: 'coracao-bate', pt: 'Meu coração bate mais forte.', ru: 'Моё сердце бьётся сильнее.' },
      { id: 'gosto-de-voce', pt: 'Gosto muito de você.', ru: 'Ты мне очень нравишься.' },
      { id: 'parar-de-sorrir', pt: 'Não consigo parar de sorrir.', ru: 'Я не могу перестать улыбаться.' },
    ],
  },
  {
    moodId: 'preocupada',
    verbs: [
      { id: 'preocupar-se', pt: 'preocupar-se', ru: 'беспокоиться' },
      { id: 'pensar', pt: 'pensar', ru: 'думать' },
      { id: 'cuidar', pt: 'cuidar', ru: 'заботиться' },
    ],
    expressions: [
      { id: 'vai-ficar-bem', pt: 'Vai ficar tudo bem?', ru: 'Всё будет хорошо?' },
      { id: 'esta-preocupando', pt: 'Isso está me preocupando.', ru: 'Это меня беспокоит.' },
      { id: 'pensar-com-calma', pt: 'Vamos pensar com calma.', ru: 'Давай спокойно подумаем.' },
    ],
  },
  {
    moodId: 'assustada',
    verbs: [
      { id: 'assustar-se', pt: 'assustar-se', ru: 'пугаться' },
      { id: 'temer', pt: 'temer', ru: 'бояться' },
      { id: 'proteger-se', pt: 'proteger-se', ru: 'защищаться' },
    ],
    expressions: [
      { id: 'que-susto', pt: 'Que susto!', ru: 'Я так испугался / испугалась!' },
      { id: 'fiquei-com-medo', pt: 'Fiquei com medo.', ru: 'Мне стало страшно.' },
      { id: 'coracao-disparou', pt: 'Meu coração disparou.', ru: 'У меня сердце заколотилось.' },
    ],
  },
  {
    moodId: 'calma',
    verbs: [
      { id: 'acalmar-se', pt: 'acalmar-se', ru: 'успокаиваться' },
      { id: 'respirar', pt: 'respirar', ru: 'дышать' },
      { id: 'relaxar', pt: 'relaxar', ru: 'расслабляться' },
    ],
    expressions: [
      { id: 'tudo-bem', pt: 'Está tudo bem.', ru: 'Всё в порядке.' },
      { id: 'vamos-respirar', pt: 'Vamos respirar.', ru: 'Давай подышим.' },
      { id: 'uma-coisa-vez', pt: 'Uma coisa de cada vez.', ru: 'Всё по порядку.' },
    ],
  },
  {
    moodId: 'irritada',
    verbs: [
      { id: 'irritar-se', pt: 'irritar-se', ru: 'раздражаться' },
      { id: 'reclamar', pt: 'reclamar', ru: 'жаловаться' },
      { id: 'acalmar-se', pt: 'acalmar-se', ru: 'успокаиваться' },
    ],
    expressions: [
      { id: 'preciso-minuto', pt: 'Preciso de um minuto.', ru: 'Мне нужна минута.' },
      { id: 'isso-incomodou', pt: 'Isso me incomodou.', ru: 'Меня это задело.' },
      { id: 'conversar-depois', pt: 'Vamos conversar depois.', ru: 'Давай поговорим позже.' },
    ],
  },
  {
    moodId: 'surpresa',
    verbs: [
      { id: 'surpreender-se', pt: 'surpreender-se', ru: 'удивляться' },
      { id: 'descobrir', pt: 'descobrir', ru: 'обнаруживать' },
      { id: 'reagir', pt: 'reagir', ru: 'реагировать' },
    ],
    expressions: [
      { id: 'nossa', pt: 'Nossa!', ru: 'Ничего себе!' },
      { id: 'serio', pt: 'Sério?', ru: 'Правда?' },
      { id: 'nao-esperava', pt: 'Eu não esperava por isso!', ru: 'Я этого не ожидал / не ожидала!' },
    ],
  },
  {
    moodId: 'cansada',
    verbs: [
      { id: 'cansar-se', pt: 'cansar-se', ru: 'уставать' },
      { id: 'descansar', pt: 'descansar', ru: 'отдыхать' },
      { id: 'dormir', pt: 'dormir', ru: 'спать' },
    ],
    expressions: [
      { id: 'preciso-descansar', pt: 'Preciso descansar.', ru: 'Мне нужно отдохнуть.' },
      { id: 'sem-energia', pt: 'Estou sem energia.', ru: 'У меня совсем нет сил.' },
      { id: 'dia-longo', pt: 'Hoje foi um dia longo.', ru: 'Сегодня был долгий день.' },
    ],
  },
  {
    moodId: 'animada',
    verbs: [
      { id: 'animar-se', pt: 'animar-se', ru: 'воодушевляться' },
      { id: 'participar', pt: 'participar', ru: 'участвовать' },
      { id: 'comecar', pt: 'começar', ru: 'начинать' },
    ],
    expressions: [
      { id: 'bora', pt: 'Bora!', ru: 'Давай!' },
      { id: 'mal-posso-esperar', pt: 'Mal posso esperar!', ru: 'Не могу дождаться!' },
      { id: 'muito-legal', pt: 'Vai ser muito legal!', ru: 'Будет здорово!' },
    ],
  },
  {
    moodId: 'timida',
    verbs: [
      { id: 'acanhar-se', pt: 'acanhar-se', ru: 'стесняться' },
      { id: 'evitar', pt: 'evitar', ru: 'избегать' },
      { id: 'aproximar-se', pt: 'aproximar-se', ru: 'приближаться' },
    ],
    expressions: [
      { id: 'ficar-na-minha', pt: 'Posso ficar mais na minha?', ru: 'Можно я немного побуду в стороне?' },
      { id: 'me-acostumando', pt: 'Ainda estou me acostumando.', ru: 'Я пока ещё привыкаю.' },
      { id: 'tempo-para-soltar', pt: 'Preciso de um tempo para me soltar.', ru: 'Мне нужно время, чтобы освоиться.' },
    ],
  },
  {
    moodId: 'confiante',
    verbs: [
      { id: 'confiar', pt: 'confiar', ru: 'доверять' },
      { id: 'acreditar', pt: 'acreditar', ru: 'верить' },
      { id: 'tentar', pt: 'tentar', ru: 'пробовать' },
    ],
    expressions: [
      { id: 'vai-dar-certo', pt: 'Vai dar certo.', ru: 'Всё получится.' },
      { id: 'eu-consigo', pt: 'Eu consigo.', ru: 'Я справлюсь.' },
      { id: 'posso-tentar', pt: 'Posso tentar.', ru: 'Я могу попробовать.' },
    ],
  },
  {
    moodId: 'orgulhosa',
    verbs: [
      { id: 'orgulhar-se', pt: 'orgulhar-se', ru: 'гордиться' },
      { id: 'conquistar', pt: 'conquistar', ru: 'достигать' },
      { id: 'reconhecer', pt: 'reconhecer', ru: 'признавать' },
    ],
    expressions: [
      { id: 'orgulho-voce', pt: 'Tenho orgulho de você.', ru: 'Я горжусь тобой.' },
      { id: 'valeu-pena', pt: 'Valeu a pena.', ru: 'Это того стоило.' },
      { id: 'eu-consegui', pt: 'Eu consegui!', ru: 'У меня получилось!' },
    ],
  },
  {
    moodId: 'envergonhada',
    verbs: [
      { id: 'envergonhar-se', pt: 'envergonhar-se', ru: 'стыдиться' },
      { id: 'corar', pt: 'corar', ru: 'краснеть' },
      { id: 'desculpar-se', pt: 'desculpar-se', ru: 'извиняться' },
    ],
    expressions: [
      { id: 'que-vergonha', pt: 'Que vergonha!', ru: 'Как стыдно!' },
      { id: 'sem-querer', pt: 'Foi sem querer.', ru: 'Я не нарочно.' },
      { id: 'desculpe-engano', pt: 'Desculpe pelo engano.', ru: 'Простите за ошибку.' },
    ],
  },
  {
    moodId: 'confusa',
    verbs: [
      { id: 'confundir-se', pt: 'confundir-se', ru: 'путаться' },
      { id: 'perguntar', pt: 'perguntar', ru: 'спрашивать' },
      { id: 'esclarecer', pt: 'esclarecer', ru: 'прояснять' },
    ],
    expressions: [
      { id: 'nao-entendi', pt: 'Não entendi.', ru: 'Я не понял / не поняла.' },
      { id: 'explicar-outro-jeito', pt: 'Pode explicar de outro jeito?', ru: 'Можно объяснить по-другому?' },
      { id: 'ver-se-entendi', pt: 'Deixe-me ver se entendi.', ru: 'Дайте я проверю, правильно ли я понял / поняла.' },
    ],
  },
  {
    moodId: 'aliviada',
    verbs: [
      { id: 'aliviar', pt: 'aliviar', ru: 'облегчать' },
      { id: 'resolver', pt: 'resolver', ru: 'решать' },
      { id: 'respirar', pt: 'respirar', ru: 'дышать' },
    ],
    expressions: [
      { id: 'que-alivio', pt: 'Que alívio!', ru: 'Какое облегчение!' },
      { id: 'ainda-bem', pt: 'Ainda bem!', ru: 'Как хорошо!' },
      { id: 'respirar-melhor', pt: 'Agora posso respirar melhor.', ru: 'Теперь я могу вздохнуть спокойно.' },
    ],
  },
]);

export const emotionVocabularyByMoodId = new Map(
  emotionVocabularyContent.map((content) => [content.moodId, content]),
);
