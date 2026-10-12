import type { RevisionSubject, RevisionTopic } from '../types'
import { russianRecall } from './russianRecall'
import { russianExercise, russianExerciseTopics } from './russianSources'
import { russianTasks } from './russianTasks'

type TopicInput = Omit<RevisionTopic, 'higherOnly'> & { higherOnly?: boolean }

function topic(input: TopicInput): RevisionTopic {
  return { higherOnly: false, recall: russianRecall[input.id], hasExercises: russianExerciseTopics.includes(input.id), ...input }
}

/**
 * Topics follow the Higher Level examination structure in the SEC Assessment
 * Arrangements 2027, the syllabus and the 2019 to 2026 Higher papers (see
 * exam-papers/): the oral (narrative conversation, discursive conversation on
 * three cultural topics, and the project), the aural, and the written paper
 * (two reading comprehensions, structuring discourse, written expression with
 * grammar, a short essay on Russian culture and guided writing), plus the
 * grammar, vocabulary and cultural knowledge they rest on. The order puts the
 * oral topics early, because the oral exam is held before the written papers.
 * Only Higher Level is covered. Sizes are rough estimates. Most topics have
 * practice sets (see russianSources.ts); the app holds no past paper
 * questions, so the learner brings those from their own copy and the tasks
 * point to the file in exam-papers/sec/.
 */
export const russian: RevisionSubject = {
  id: 'russian',
  name: 'Russian',
  checkKind: 'writing',
  checkProfiles: [
    {
      id: 'short-essay',
      label: 'Short essay on culture (about 50 words)',
      words: 50,
      criteria: [
        'There is a title; a missing title loses a mark.',
        'There are five different facts about the topic. List each fact I gave and say which one is weak or repeated.',
        'An introductory remark counts for at most one fact.',
        'Language: endings, tenses, spelling and word order, with the rule for each error.',
      ],
    },
    {
      id: 'guided-writing',
      label: 'Guided writing: letter, narrative or discussion (about 140 words)',
      words: 140,
      criteria: [
        'Every point of the task is covered; list each point and where I covered it. At least one point from each category must appear.',
        'Language: endings, aspect, verb forms, vocabulary and spelling, including the soft sign.',
        'Textual coherence: the text hangs together with linking words, the right register and a clear beginning and ending.',
        'I did not copy phrases word for word from the paper.',
      ],
    },
    {
      id: 'comprehension',
      label: 'Comprehension answers (in English)',
      criteria: [
        'Each answer gives the number of different details the question asks for; point out any that give too few or repeat the same detail.',
        'The answer is in the language the paper asks for, which is English for most questions.',
        'A summary paragraph has four details from the text and is in my own words.',
      ],
    },
    {
      id: 'speaking',
      label: 'Transcript of what I said (oral)',
      criteria: [
        'I answered the question that was asked and added a reason or an opinion.',
        'I used the past, present and future where they fit.',
        'The language is natural spoken Russian: cases after prepositions, verb forms and linking words.',
      ],
    },
  ],
  tasks: russianTasks,
  exercises: russianExercise,
  help: {
    'learn-topic': 'Learn the topic from your notes, then close them and say or write what you remember. Then use it in your own sentences.',
    'practise-topic': 'Use the topic in a real task: exercises, a full reading passage, a piece of writing, or a spoken answer.',
    'choose-questions': 'Read the task and every option or prompt, decide in the first 5 minutes what you will write, then write it under time.',
    'timed-questions': 'Work on one part of the exam under time, without notes, as in the real exam.',
    'review-mistakes': 'Go back over your recent corrections, find the rule behind each, and redo the work from a blank page.',
    'light-review': 'Skim your notes and word lists and say a few answers aloud. No new work.',
  },
  topics: [
    topic({ id: 'ru-vocab-me', area: 'vocabulary', size: 2, title: 'Vocabulary about yourself: family, home, school, free time' }),
    topic({ id: 'ru-oral-narrative', area: 'oral', size: 3, title: 'Oral: general conversation about yourself and your life (narrative)' }),
    topic({ id: 'ru-cases-nouns', area: 'grammar', size: 3, title: 'Noun cases: six cases, singular and plural, endings and spelling rules' }),
    topic({ id: 'ru-verbs-tenses', area: 'grammar', size: 2, title: 'Verbs: conjugation, past, present and future, reflexive verbs' }),
    topic({ id: 'ru-adjectives-agreement', area: 'grammar', size: 2, title: 'Adjectives, possessives and pronouns: agreement in gender, number and case' }),
    topic({ id: 'ru-vocab-world', area: 'vocabulary', size: 3, title: 'Vocabulary for wider topics: health, travel, work, environment, technology' }),
    topic({ id: 'ru-language-awareness', area: 'grammar', size: 1, title: 'Language awareness: dictionary forms, parts of speech and cases' }),
    topic({ id: 'ru-aspect', area: 'grammar', size: 2, title: 'Verb aspect: perfective and imperfective' }),
    topic({ id: 'ru-prepositions', area: 'grammar', size: 2, title: 'Prepositions and the cases they take' }),
    topic({ id: 'ru-reading-strategies', area: 'reading', size: 2, title: 'Reading comprehension: detail questions and summary writing' }),
    topic({ id: 'ru-oral-discursive-ireland', area: 'oral', size: 2, title: 'Oral: everyday life in Ireland and in a Russian-speaking community' }),
    topic({ id: 'ru-motion-verbs', area: 'grammar', size: 3, title: 'Verbs of motion and their prefixes' }),
    topic({ id: 'ru-numerals-time', area: 'grammar', size: 2, title: 'Numerals, dates, time and quantity' }),
    topic({ id: 'ru-culture-knowledge', area: 'culture', size: 3, title: 'Cultural awareness: geography and general facts about Russia' }),
    topic({ id: 'ru-culture-places', area: 'culture', size: 2, title: 'Culture: cities, sights and tourism' }),
    topic({ id: 'ru-culture-nature', area: 'culture', size: 2, title: 'Culture: nature, climate and animals' }),
    topic({ id: 'ru-culture-people', area: 'culture', size: 2, title: 'Culture: writers, composers, artists and scientists' }),
    topic({ id: 'ru-culture-society', area: 'culture', size: 2, title: 'Culture: education, sport, family and everyday life' }),
    topic({ id: 'ru-culture-traditions', area: 'culture', size: 2, title: 'Culture: festivals, food and fairy tales' }),
    topic({ id: 'ru-oral-discursive-culture', area: 'oral', size: 2, title: 'Oral: aspects of culture in a Russian-speaking community' }),
    topic({ id: 'ru-oral-project', area: 'oral', size: 3, title: 'Oral: the project (presentation and questions)' }),
    topic({ id: 'ru-linking', area: 'grammar', size: 2, title: 'Linking ideas: conjunctions, relative clauses, participles, reported speech' }),
    topic({ id: 'ru-structuring-discourse', area: 'reading', size: 2, title: 'Structuring discourse: matching and organising short texts' }),
    topic({ id: 'ru-oral-contemporary', area: 'oral', size: 2, title: 'Oral: aspects of contemporary life in a Russian-speaking community' }),
    topic({ id: 'ru-written-expression', area: 'writing', size: 2, title: 'Written expression with grammar: putting words into the correct form in a text' }),
    topic({ id: 'ru-culture-essay', area: 'writing', size: 2, title: 'Short essay on Russian culture: about 50 words with five facts' }),
    topic({ id: 'ru-guided-writing', area: 'writing', size: 3, higherOnly: true, title: 'Guided writing: letter, narrative or discussion' }),
    topic({ id: 'ru-moods-comparison', area: 'grammar', size: 2, title: 'Imperative, conditional, comparatives and superlatives' }),
    topic({ id: 'ru-aural', area: 'aural', size: 2, title: 'Aural: listening for gist and detail' }),
    topic({ id: 'ru-accuracy', area: 'writing', size: 1, title: 'Accuracy: spelling, stress, punctuation and proofreading' }),
  ],
}
