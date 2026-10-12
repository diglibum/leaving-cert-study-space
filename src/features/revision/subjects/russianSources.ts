import { createRng, pick, shuffled } from '../problems/rng'
import { generateLanguageExercise } from '../problems/languageExercise'
import type { LanguagePool, MatchExercise, PracticeSet } from '../problems/types'
import { russianCloze } from './russianCloze'
import { russianCulture } from './russianCulture'
import { russianPools } from './russianExercises'
import { listThemes, themeAccepted } from './russianLists'
import { newsSections } from './russianMatching'
import { oralBanks, speakFromBank } from './russianOral'

/*
 * Every kind of practice a Russian topic can offer. A topic lists several
 * sources and each new set picks one of them, so the learner meets gap
 * sentences, whole texts, matching, word lists and speaking prompts in turn.
 */

type Source = (seed: string) => PracticeSet | undefined

const MATCH_SIZE = 10

const items =
  (pools: Readonly<Record<string, LanguagePool>>, poolId: string, topicId: string): Source =>
  (seed) => {
    const set = generateLanguageExercise(pools, poolId, seed)
    return set && { ...set, topicId }
  }

const clozeSource =
  (topicId: string): Source =>
  (seed) => {
    const rng = createRng(`${topicId}:cloze:${seed}`)
    return {
      kind: 'cloze',
      topicId,
      instruction:
        'Put each word in brackets into the form the text needs, as in the grammar question of the paper. Type only that word.',
      text: pick(rng, russianCloze),
    }
  }

const listSource =
  (topicId: string, themes: readonly string[] = []): Source =>
  (seed) => {
    const rng = createRng(`${topicId}:list:${seed}`)
    const pool = themes.length > 0 ? listThemes.filter((theme) => themes.includes(theme.theme)) : listThemes
    return themeAccepted(pick(rng, pool), topicId)
  }

const speakSource =
  (topicId: string): Source =>
  (seed) =>
    speakFromBank(topicId, createRng(`${topicId}:speak:${seed}`))

const matchSource =
  (topicId: string): Source =>
  (seed) => {
    const rng = createRng(`${topicId}:match:${seed}`)
    const chosen = shuffled(rng, newsSections).slice(0, MATCH_SIZE)
    const exercise: MatchExercise = {
      kind: 'match',
      topicId,
      instruction:
        'Each short news item belongs to one section of a newspaper. Choose the section for each item, as in the structuring discourse question.',
      sections: chosen.map(({ name, gloss }) => ({ name, gloss })),
      items: shuffled(
        rng,
        chosen.map((section, index) => {
          const item = pick(rng, section.items)
          return { text: item.text, note: item.note, section: index }
        }),
      ),
    }
    return exercise
  }

const cultureIds = [
  'ru-culture-knowledge',
  'ru-culture-places',
  'ru-culture-nature',
  'ru-culture-people',
  'ru-culture-society',
  'ru-culture-traditions',
]

const own = (topicId: string): Source => items(russianPools, topicId, topicId)
const culture = (poolId: string, topicId = poolId): Source => items(russianCulture, poolId, topicId)

const sources: Readonly<Record<string, readonly Source[]>> = {
  'ru-vocab-me': [own('ru-vocab-me'), listSource('ru-vocab-me', ['family', 'school', 'food', 'clothes', 'the city'])],
  'ru-vocab-world': [
    own('ru-vocab-world'),
    listSource('ru-vocab-world', ['health', 'travel', 'professions', 'technology', 'nature', 'higher education', 'weather']),
  ],
  'ru-cases-nouns': [own('ru-cases-nouns')],
  'ru-verbs-tenses': [own('ru-verbs-tenses')],
  'ru-adjectives-agreement': [own('ru-adjectives-agreement')],
  'ru-language-awareness': [own('ru-language-awareness'), listSource('ru-language-awareness')],
  'ru-aspect': [own('ru-aspect')],
  'ru-prepositions': [own('ru-prepositions')],
  'ru-motion-verbs': [own('ru-motion-verbs')],
  'ru-numerals-time': [own('ru-numerals-time')],
  'ru-moods-comparison': [own('ru-moods-comparison')],
  'ru-structuring-discourse': [matchSource('ru-structuring-discourse')],
  'ru-written-expression': [clozeSource('ru-written-expression')],
  'ru-culture-essay': cultureIds.map((poolId) => culture(poolId, 'ru-culture-essay')),
  ...Object.fromEntries(cultureIds.map((id) => [id, [culture(id)]])),
  ...Object.fromEntries(Object.keys(oralBanks).map((id) => [id, [speakSource(id)]])),
}

export const russianExerciseTopics: readonly string[] = Object.keys(sources)

export function russianExercise(topicId: string, seed: string): PracticeSet | undefined {
  const list = sources[topicId]
  if (!list) return undefined
  const rng = createRng(`${topicId}:source:${seed}`)
  return pick(rng, list)(seed)
}
