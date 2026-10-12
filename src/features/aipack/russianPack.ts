import type { ClozePart, ClozeText } from '../revision/problems/types'
import { russian } from '../revision/subjects/russian'
import { russianCloze } from '../revision/subjects/russianCloze'
import { russianCulture } from '../revision/subjects/russianCulture'
import { russianPools } from '../revision/subjects/russianExercises'
import { listThemes } from '../revision/subjects/russianLists'
import { newsSections } from '../revision/subjects/russianMatching'
import { oralBanks } from '../revision/subjects/russianOral'
import { paperRefs, paperYears } from '../revision/subjects/russianPapers'
import { stringifyCompact } from './format'

/*
 * Builds the Russian files of the AI pack from the same data the app uses, so
 * an answer key can never drift from the exercises. The files are plain JSON
 * for a learner to give to an AI tutor by hand; the app itself never calls an
 * AI. Run `npm run build:ai-pack` after changing any Russian data.
 */

export const russianPackFiles = {
  topics: 'russian-topics.json',
  drills: 'russian-drills.json',
  cloze: 'russian-cloze.json',
  matching: 'russian-matching.json',
  lists: 'russian-word-lists.json',
  speaking: 'russian-speaking.json',
} as const

type Pools = Readonly<Record<string, { lang: string; promptLang: string; instruction: string; items: readonly unknown[] }>>

function drills(pools: Pools) {
  return Object.fromEntries(
    Object.entries(pools).map(([id, pool]) => [
      id,
      {
        answerLanguage: pool.lang,
        promptLanguage: pool.promptLang,
        instruction: pool.instruction,
        items: pool.items,
      },
    ]),
  )
}

function clozeText(text: ClozeText, index: number) {
  const gaps: { gap: number; base: string; answers: readonly string[]; note: string }[] = []
  const paragraphs = text.paragraphs.map((paragraph) =>
    paragraph
      .map((part: ClozePart) => {
        if (typeof part === 'string') return part
        gaps.push({ gap: gaps.length + 1, base: part.base, answers: part.answers, note: part.note })
        return `(${gaps.length}) ___ [${part.base}]`
      })
      .join(''),
  )
  return { id: `cloze-${index + 1}`, title: text.title, summary: text.summary, paragraphs, gaps }
}

const topicPractice = (id: string): string[] => {
  const files: string[] = []
  if (id in russianPools || id in russianCulture || id === 'ru-culture-essay') files.push(russianPackFiles.drills)
  if (id === 'ru-written-expression') files.push(russianPackFiles.cloze)
  if (id === 'ru-structuring-discourse') files.push(russianPackFiles.matching)
  if (['ru-vocab-me', 'ru-vocab-world', 'ru-language-awareness'].includes(id)) files.push(russianPackFiles.lists)
  if (id in oralBanks) files.push(russianPackFiles.speaking)
  return files
}

export function buildRussianPack(): Record<string, unknown> {
  return {
    [russianPackFiles.topics]: {
      subject: 'Russian (Leaving Certificate, Higher Level only)',
      exam: 'Oral, aural and a written paper. The official papers are not included: the learner brings the question text from their own copy.',
      topics: russian.topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        area: topic.area,
        practiceFiles: topicPractice(topic.id),
        recallPrompts: topic.recall ?? [],
      })),
      checkProfiles: russian.checkProfiles,
      pastPaperPointers: {
        note: 'Own-words descriptions of where each exam part sits in the official Higher papers.',
        years: paperYears,
        parts: paperRefs,
      },
    },
    [russianPackFiles.drills]: {
      note: 'Gap-fill, translation and culture quiz items. `items[].answers` lists every accepted answer; the first is the model answer. Compare ignoring case, stress marks, final punctuation and the difference between the two letters for e.',
      pools: { ...drills(russianPools), ...drills(russianCulture) },
    },
    [russianPackFiles.cloze]: {
      note: 'Connected texts in the format of the grammar question. Each gap shows the base form in brackets. `gaps[].answers` lists every accepted form; the first is the model answer.',
      texts: russianCloze.map(clozeText),
    },
    [russianPackFiles.matching]: {
      note: 'Structuring discourse: match each short news item to the newspaper section it belongs to. Use sections[].name as the section label; `note` gives the key words that point to it.',
      sections: newsSections.map(({ name, gloss, items }) => ({ name, gloss, items })),
    },
    [russianPackFiles.lists]: {
      note: 'Semantic fields. The learner names five different Russian words that belong to the theme; accept any word on the list or another word that clearly belongs.',
      themes: listThemes,
    },
    [russianPackFiles.speaking]: {
      note: 'Oral exam practice. There is no answer key: give feedback on the learner\'s spoken answer or transcript with the checkProfiles speaking profile.',
      banks: oralBanks,
    },
  }
}

export function renderPack(files: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(files).map(([name, data]) => [name, `${stringifyCompact(data, 4)}\n`]))
}
