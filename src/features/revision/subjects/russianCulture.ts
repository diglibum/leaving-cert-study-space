import type { LanguagePool } from '../problems/types'

/*
 * Cultural awareness quizzes for the Russian Higher paper: short essay
 * topics (geography, cities, nature and animals, writers and composers,
 * education, sport, festivals, food and fairy tales). Cyrillic is allowed
 * here (see AGENTS.md). Facts are well established and the wording is our own. The learner answers in Russian, so each
 * answer is one word or short name, and the note gives one useful extra fact
 * to use in an essay.
 */

const quiz = (instruction: string, items: LanguagePool['items']): LanguagePool => ({
  lang: 'ru',
  promptLang: 'en',
  instruction,
  items,
})

const ask = 'Answer in Russian with the word or name asked for. Type only that word or name.'

export const russianCulture: Readonly<Record<string, LanguagePool>> = {
  'ru-culture-knowledge': quiz(ask, [
    { prompt: 'The capital of Russia', answers: ['Москва'], note: 'Moscow is among the twenty largest cities in the world.' },
    { prompt: 'The largest country in the world: what is it called in Russian?', answers: ['Россия'], note: 'More than 17 million square kilometres.' },
    { prompt: 'The lake in Russia that is the deepest in the world', answers: ['Байкал'], note: 'Lake Baikal in Siberia.' },
    { prompt: 'The longest railway in the world, across Russia: the ___ magistral. Give the adjective (Trans-Siberian).', answers: ['Транссибирская'], note: 'Транссибирская магистраль joins Moscow and Vladivostok.' },
    { prompt: 'The official language of Russia', answers: ['русский', 'русский язык'], note: 'Republics may introduce a second official language.' },
    { prompt: 'The mountains that mark the border between Europe and Asia: the ___ mountains. Give the adjective (Ural).', answers: ['Уральские'], note: 'Among the oldest mountains on the planet.' },
    { prompt: 'The longest river in Europe, which flows through Russia', answers: ['Волга'], note: 'The Volga is the longest river in Europe.' },
    { prompt: 'The Russian word for the traditional pancake eaten at Maslenitsa (plural)', answers: ['блины'], note: 'Blini are a symbol of the sun and of spring.' },
    { prompt: 'The Russian word for a traditional hot tea urn', answers: ['самовар'], note: 'Tea is an important part of Russian culture.' },
    { prompt: 'The Russian word for a country house where people spend the summer', answers: ['дача'], note: 'Spending summer at the dacha is a Russian tradition.' },
    { prompt: 'The letter of the Russian alphabet that appeared only at the end of the eighteenth century', answers: ['ё'], note: 'The Russian alphabet today has 33 letters.' },
    { prompt: 'The Russian word for the fortress in the centre of Moscow', answers: ['Кремль'], note: 'The Moscow Kremlin is the largest medieval fortress in the world.' },
  ]),

  'ru-culture-places': quiz(ask, [
    { prompt: 'The "northern capital" of Russia, founded by Peter the Great', answers: ['Санкт-Петербург', 'Санкт Петербург', 'Петербург'], note: 'Founded in 1703 on the Neva.' },
    { prompt: 'The famous square in Moscow next to the Kremlin: the ___ Square. Give the adjective (Red).', answers: ['Красная'], note: 'Красная площадь.' },
    { prompt: 'The museum in St Petersburg in the former Winter Palace', answers: ['Эрмитаж'], note: 'It is famous for its collections and also for its cats.' },
    { prompt: 'The river that flows through St Petersburg', answers: ['Нева'], note: 'The Neva flows from Lake Ladoga to the Gulf of Finland.' },
    { prompt: 'Complete the Russian name of the cathedral on Red Square: собор Василия ___.', answers: ['Блаженного', 'Василия Блаженного'], note: 'Собор Василия Блаженного.' },
    { prompt: 'Complete the Russian name of the famous Moscow theatre for ballet and opera: Большой ___.', answers: ['театр', 'Большой театр'], note: 'Большой театр, the Bolshoi.' },
    { prompt: 'The "Golden Ring": ___ кольцо. Give the adjective (golden).', answers: ['Золотое'], note: 'A route of ancient towns near Moscow, such as Vladimir and Suzdal.' },
    { prompt: 'The city of the 2014 Winter Olympics, on the Black Sea', answers: ['Сочи'], note: 'Sochi is a seaside and ski resort.' },
    { prompt: 'The peninsula in the Far East with volcanoes', answers: ['Камчатка'], note: 'The Kamchatka peninsula has many active volcanoes.' },
    { prompt: 'The Russian word for "metro"', answers: ['метро', 'метрополитен'], note: 'The Moscow metro stations look like palaces; the St Petersburg metro is one of the deepest in the world.' },
    { prompt: 'The largest city of Siberia (hint: starts with Н)', answers: ['Новосибирск'], note: 'Novosibirsk has a population of over a million.' },
    { prompt: 'The Russian word for "sight" or "attraction" (singular)', answers: ['достопримечательность'], note: 'Туристы любят осматривать достопримечательности.' },
  ]),

  'ru-culture-nature': quiz(ask, [
    { prompt: 'A large brown animal of the Russian taiga', answers: ['медведь', 'бурый медведь'], note: 'Бурый медведь lives in the taiga.' },
    { prompt: 'The big striped cat of the Far East', answers: ['тигр', 'амурский тигр', 'уссурийский тигр'], note: 'The Amur (Ussuri) tiger lives in the Far East.' },
    { prompt: 'A large animal with antlers that lives in forests (elk)', answers: ['лось'], note: 'Moose live in the European and Siberian forests.' },
    { prompt: 'An Arctic fox', answers: ['песец'], note: 'Песец lives in the tundra.' },
    { prompt: 'A walrus', answers: ['морж'], note: 'Walruses live in Arctic waters.' },
    { prompt: 'A reindeer', answers: ['северный олень', 'олень'], note: 'Дикий северный олень lives in the tundra and taiga.' },
    { prompt: 'The Russian word for a polar bear (white bear)', answers: ['белый медведь'], note: 'White bears and walruses are typical Arctic animals.' },
    { prompt: 'The Russian word for "squirrel"', answers: ['белка'], note: 'Squirrels live in the taiga.' },
    { prompt: 'A wolf', answers: ['волк'], note: 'Wolves live in European Russia and in Siberia.' },
    { prompt: 'The Russian word for a lynx', answers: ['рысь'], note: 'Рысь is a large wild cat.' },
    { prompt: 'The huge forest of Siberia: the Siberian ___.', answers: ['тайга'], note: 'The Siberian taiga is the largest forest area in the world.' },
    { prompt: 'The treeless Arctic plain in the north, in Russian', answers: ['тундра'], note: 'Typical animals: reindeer and the Arctic fox.' },
  ]),

  'ru-culture-people': quiz(ask, [
    { prompt: 'The great Russian poet, author of «Евгений Онегин» (surname)', answers: ['Пушкин'], note: 'Alexander Pushkin (1799–1837) is the founder of modern Russian literature.' },
    { prompt: 'The author of «Война и мир» and «Анна Каренина» (surname)', answers: ['Толстой'], note: 'Leo Tolstoy.' },
    { prompt: 'The author of «Преступление и наказание» (surname)', answers: ['Достоевский'], note: 'Fyodor Dostoevsky.' },
    { prompt: 'The author of the play «Вишнёвый сад» (surname)', answers: ['Чехов'], note: 'Anton Chekhov wrote short stories and plays.' },
    { prompt: 'The composer of the ballet «Лебединое озеро» (surname)', answers: ['Чайковский'], note: 'Pyotr Tchaikovsky also wrote «Щелкунчик» and «Спящая красавица».' },
    { prompt: 'The Russian composer of «Петя и волк» (surname)', answers: ['Прокофьев'], note: 'Sergei Prokofiev wrote a musical tale for children.' },
    { prompt: 'The author of «Мастер и Маргарита» (surname)', answers: ['Булгаков'], note: 'Mikhail Bulgakov.' },
    { prompt: 'The author of «Мёртвые души» (surname)', answers: ['Гоголь'], note: 'Nikolai Gogol wrote «Мёртвые души» and «Ревизор».' },
    { prompt: 'The Russian painter of «Бурлаки на Волге» (surname)', answers: ['Репин'], note: 'Ilya Repin.' },
    { prompt: 'The first human in space (surname)', answers: ['Гагарин'], note: 'Yuri Gagarin became the first human in space in 1961.' },
    { prompt: 'The famous Russian poet who wrote «Дядя Стёпа» for children (surname)', answers: ['Михалков'], note: 'Sergei Mikhalkov, also author of the lyrics of the national anthem.' },
    { prompt: 'The Russian scientist who created the periodic table of elements (surname)', answers: ['Менделеев'], note: 'Dmitri Mendeleev.' },
  ]),

  'ru-culture-society': quiz(ask, [
    { prompt: 'The Russian word for "education"', answers: ['образование'], note: 'Russia has a high level of education.' },
    { prompt: 'The Russian word for a school-leaver, graduate', answers: ['выпускник'], note: 'The Last Bell ceremony marks the end of school.' },
    { prompt: 'The date on which the Russian school year starts, in words (day and month)', answers: ['первого сентября', 'первое сентября', '1 сентября'], note: 'The first of September is the Day of Knowledge.' },
    { prompt: 'ЕГЭ is the unified ___ exam taken at the end of school. Give the adjective (state).', answers: ['государственный'], note: 'ЕГЭ is the unified state exam.' },
    { prompt: 'The Russian word for "ice hockey" (one word, as people usually say it)', answers: ['хоккей'], note: 'Ice hockey is very popular in Russia.' },
    { prompt: 'The Russian word for the sport "football"', answers: ['футбол'], note: 'Russia hosted the football World Cup in 2018.' },
    { prompt: 'The missing word in зимние ___ спорта (kinds of winter sport)', answers: ['виды'], note: 'Зимние виды спорта: хоккей, лыжи, биатлон, фигурное катание.' },
    { prompt: 'The Russian word for "figure skating"', answers: ['фигурное катание'], note: 'Russian figure skaters are among the best in the world.' },
    { prompt: 'The Russian word for "family"', answers: ['семья'], note: 'Typically several generations meet on holidays.' },
    { prompt: 'The Russian word for "flat/apartment"', answers: ['квартира'], note: 'Most Russians in cities live in flats in blocks.' },
    { prompt: 'The Russian word for "the Russian bath"', answers: ['баня'], note: 'Баня is popular, especially in winter.' },
    { prompt: 'The Russian adjective meaning "multinational"', answers: ['многонациональный', 'многонациональная', 'многонациональное'], note: 'Russia is a multinational country with more than 190 peoples.' },
  ]),

  'ru-culture-traditions': quiz(ask, [
    { prompt: 'The Russian "Father Frost"', answers: ['Дед Мороз'], note: 'Ded Moroz brings gifts at New Year, with his granddaughter Snegurochka.' },
    { prompt: 'His granddaughter, the Snow Maiden', answers: ['Снегурочка'], note: 'Снегурочка.' },
    { prompt: 'The holiday celebrated on 8 March', answers: ['Международный женский день', '8 Марта', 'восьмое марта'], note: 'On 8 March men give women flowers and gifts.' },
    { prompt: 'The week of pancakes before Lent: ___', answers: ['Масленица'], note: 'Масленица ends with burning a straw figure of winter.' },
    { prompt: 'The Russian soup made from beetroot', answers: ['борщ'], note: 'Борщ is served with sour cream.' },
    { prompt: 'The Russian dumplings with meat', answers: ['пельмени'], note: 'Пельмени are associated with the Urals and Siberia.' },
    { prompt: 'The Russian word for "fairy tale"', answers: ['сказка'], note: 'Русская народная сказка.' },
    { prompt: 'The witch who lives in a hut on chicken legs: Баба ___', answers: ['Яга'], note: 'Баба Яга is a character in Russian fairy tales.' },
    { prompt: 'The hero of a tale who catches a firebird, Ivan the ___ (prince)', answers: ['царевич'], note: 'Иван-царевич and the Grey Wolf.' },
    { prompt: 'The "firebird"', answers: ['жар-птица', 'жар птица'], note: 'Жар-птица appears in many Russian fairy tales.' },
    { prompt: 'The immortal evil old man in fairy tales: Кощей ___', answers: ['Бессмертный'], note: 'Кощей Бессмертный.' },
    { prompt: 'The Russian word for the New Year decorated tree', answers: ['ёлка', 'елка', 'новогодняя ёлка'], note: 'A decorated ёлка stands in the home at New Year.' },
  ]),
}
