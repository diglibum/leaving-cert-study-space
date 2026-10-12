import { rotate, splitMinutes } from '../taskHelpers'
import { paperFile, paperRefs, type PaperPart } from './russianPapers'
import type { BlockKind, BlockTask, CourseLevel, RevisionTopic, SubjectTaskContext } from '../types'

/** Official names and marks follow the Higher and Ordinary Level arrangements in the SEC 2027 document (see exam-papers/). */
interface ExamPart {
  name: string
  instruction: string
  topics: readonly string[]
  /** Which part of the past papers this is; the tasks then point to the real papers in exam-papers/sec/. */
  paper?: PaperPart
}

/** Topics that match one part of the written or aural paper, so their tasks can name real past papers. */
const topicPart: Readonly<Record<string, PaperPart>> = {
  'ru-reading-strategies': 'comprehension',
  'ru-language-awareness': 'comprehension',
  'ru-structuring-discourse': 'structuring',
  'ru-written-expression': 'grammar',
  'ru-culture-essay': 'essay',
  'ru-guided-writing': 'guided',
  'ru-aural': 'aural',
}

/** Own-words descriptions of a past paper's question, and where to find the files, rotating through the years. */
function paperItems(part: PaperPart | undefined, occurrence: number, count = 1): string[] {
  if (!part) return []
  const refs = paperRefs[part]
  return rotate(refs, occurrence * count, count).flatMap(({ year, text }) => {
    const files =
      part === 'aural'
        ? `Files: questions in ${paperFile(year, 'aural-paper')}; recording ${paperFile(year, 'recording')}; check with the marking scheme in ${paperFile(year, 'marking-scheme')} (the transcript is in its Appendix 2).`
        : `Files: ${paperFile(year, 'paper')}; check with ${paperFile(year, 'marking-scheme')}.`
    return [`${year}: ${text}`, files]
  })
}

const oralPart: ExamPart = {
  name: 'Mock oral: three sections (narrative 40 marks, discursive 30 marks, project 30 marks)',
  instruction:
    'Record yourself: about five minutes talking about yourself, four minutes on one discursive topic, and four minutes on your project with follow-up questions. Listen back and note three errors.',
  topics: ['ru-oral-narrative', 'ru-oral-discursive-ireland', 'ru-oral-discursive-culture', 'ru-oral-contemporary', 'ru-oral-project'],
}

const auralPart: ExamPart = {
  name: 'Aural examination (80 marks): brief conversations, an interview, advertisements and a biography',
  instruction:
    'Play the recording the number of times the paper allows (the recordings are on your computer, not in the app), and answer the questions from the aural paper without pausing. Mark your answers with the marking scheme, then read the transcript to find what you missed.',
  topics: ['ru-aural', 'ru-vocab-world'],
  paper: 'aural',
}

const higherParts: readonly ExamPart[] = [
  {
    name: 'Comprehension (Section I, questions 1 and 2: 50 marks each, 40 for the questions and 10 for language awareness)',
    instruction:
      'Read a text you have not seen. Answer in English, as the papers ask (an answer in the wrong language earns nothing), giving exactly as many different details as each question asks (2 marks per detail), or write one summary paragraph of four details. Then do one language awareness task: dictionary forms of verbs, words from a semantic field, parts of speech, or the case of noun phrases.',
    topics: ['ru-reading-strategies', 'ru-language-awareness'],
    paper: 'comprehension',
  },
  {
    name: 'Structuring extended discourse (Section I, question 3: 20 marks)',
    instruction: 'Match short news items to the newspaper sections they belong to, then check which key words gave each one away.',
    topics: ['ru-structuring-discourse', 'ru-linking'],
    paper: 'structuring',
  },
  {
    name: 'Grammar (Section II, question 1: 30 marks)',
    instruction:
      'Put the words in brackets into the correct form in a connected text: nouns, adjectives and pronouns are given in the nominative, verbs in the infinitive. Every answer is simply right or wrong: a misspelled word or the wrong tense earns nothing, so check every ending and letter. Then list the rule behind each mistake.',
    topics: ['ru-written-expression', 'ru-cases-nouns', 'ru-adjectives-agreement', 'ru-aspect', 'ru-verbs-tenses', 'ru-prepositions'],
    paper: 'grammar',
  },
  {
    name: 'Short essay on cultural awareness (Section II, question 2: 30 marks)',
    instruction:
      'Choose one cultural topic and write its title (a missing title costs a mark), then about 50 words in Russian with five different facts. In the marking scheme each fact earns 2 marks for content (10 in all), and the language earns 20, so mark the five facts first and then check the language.',
    topics: ['ru-culture-essay', 'ru-culture-knowledge'],
    paper: 'essay',
  },
  {
    name: 'Guided writing (Section II, question 3: 40 marks): a letter, a narrative or a discussion',
    instruction:
      'Choose one option, plan it in five minutes, write about 140 words in Russian, and tick every point the task lists (content 15: one mark per point, with at least one point from each category; language 15; textual coherence 10). A soft sign error costs marks, so check every soft sign. Do not copy phrases word for word from the texts in the paper.',
    topics: ['ru-guided-writing', 'ru-accuracy'],
    paper: 'guided',
  },
  oralPart,
  auralPart,
]

const ordinaryParts: readonly ExamPart[] = [
  {
    name: 'Reading comprehension (Section I: two passages, 60 marks, and a further comprehension, 40 marks)',
    instruction:
      'Read a passage you have not seen, answer every question in Russian, then answer the language and cultural awareness questions.',
    topics: ['ru-reading-strategies'],
  },
  {
    name: 'Mix and match (40 marks) and structuring discourse (20 marks)',
    instruction:
      'Do one exercise of each kind from your own copy of a past paper or from your textbook, then check every answer against the key or with your teacher.',
    topics: ['ru-structuring-discourse', 'ru-linking', 'ru-vocab-me', 'ru-vocab-world', 'ru-cases-nouns'],
  },
  {
    name: 'Short answers on Russian culture (30 marks): two answers of three to five sentences from a choice of five topics',
    instruction: 'Choose two topics you can answer best and write three to five sentences on each, with facts and a short opinion.',
    topics: ['ru-culture-essay', 'ru-culture-knowledge'],
  },
  {
    name: 'Extended writing (30 marks): use the prompts given in the question',
    instruction: 'Cover every prompt in the question. Plan for five minutes, write, then check endings, tenses, linking words and spelling.',
    topics: ['ru-written-expression', 'ru-accuracy'],
  },
  oralPart,
  auralPart,
]

function examParts(level: CourseLevel): readonly ExamPart[] {
  return level === 'ordinary' ? ordinaryParts : higherParts
}

const checkNote = 'For feedback on your own text, use the writing check below.'

type Area = 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'oral' | 'aural' | 'culture'

function areaOf({ topic }: SubjectTaskContext): Area {
  return (topic?.area as Area | undefined) ?? 'grammar'
}

function nameOf({ topic }: SubjectTaskContext): string {
  return topic?.title ?? 'this topic'
}

function learnRead(area: Area, name: string, first: boolean): string {
  switch (area) {
    case 'grammar':
      return first
        ? `Read the rules for "${name}" in your textbook or grammar book. Copy the main table or list of rules onto one page in your own words, and say each example aloud.`
        : `Carry on with "${name}": do written exercises on the part you found hardest, from short drills to full sentences. Check every answer and note the rule behind each mistake.`
    case 'vocabulary':
      return first
        ? `Collect about 20 words and phrases for "${name}" from your notes or textbook. Write each with its gender (nouns), a stress mark and a short example.`
        : `Add 10 new words and phrases to your list for "${name}". Sort them into groups and mark the ones you keep forgetting.`
    case 'reading':
      return first
        ? 'Read one passage from your textbook or a past paper: first for the gist (three minutes), then again, underlining names, numbers and linking words. Look up at most five words before answering any question.'
        : 'Read a second passage in the same way. This time, before you read, look only at the questions and decide what kind of answer each one needs.'
    case 'writing':
      return first
        ? `Study one model answer for "${name}" from your teacher, textbook or a past paper. Underline its structure and linking phrases and note which tenses and cases it uses.`
        : `Re-read your last piece on "${name}" and your corrections. List three phrases you want to reuse and the three mistakes you want to avoid.`
    case 'oral':
      return first
        ? `Write short notes on "${name}": key words, not sentences, for about two minutes of speaking. Look up the words you are missing.`
        : `Update your notes on "${name}". Add one opinion with a reason and one story or example you can tell in the past tense.`
    case 'aural':
      return 'Listen once to a Russian recording (past paper, news or podcast) without reading anything, and write down the gist. Listen again and note names, numbers, times and places.'
    case 'culture':
      return first
        ? `Pick one part of "${name}" and write five key facts with names and dates in your own words. Then look up and learn the Russian words you will need.`
        : `Choose a second part of "${name}" and do the same: five key facts, and the Russian words you will need.`
  }
}

/** Steps for topics that match one question of the written paper, in place of the general steps for their area. */
const learnOverrides: Record<string, string> = {
  'ru-language-awareness':
    'Take a short Russian text, for example one of your fact sheets. List the infinitive of ten verbs in it, name the part of speech of ten words, and name the case of ten noun phrases. Check them in a dictionary or with your teacher.',
  'ru-written-expression':
    'Take a paragraph you know well, such as one of your fact sheets. Rewrite it with every noun, adjective and pronoun in the nominative in brackets and every verb in the infinitive. Leave it for a day, then fill in the correct forms and check them against the original.',
  'ru-culture-essay':
    'Pick one cultural topic and write about 50 words in Russian from memory, with a title and five factual details. Mark the five facts, then check the language. Write the same piece again, trying to use more accurate endings.',
  'ru-guided-writing':
    'Write about 140 words in Russian on one guided writing task, covering every listed point. Check endings, aspect, linking words and spelling, and count the words.',
  'ru-structuring-discourse':
    'Take ten short texts, such as news items, and name the newspaper section or heading for each. Underline the key words that gave each one away, and check your answers.',
}

const projectSteps =
  'Choose a project topic from the syllabus (culture, Ireland and Russia, contemporary life) and agree it with your teacher. Write a short text of about 150 words, a list of 20 key words and five facts. Then write the questions an examiner might ask about it.'

learnOverrides['ru-oral-project'] = projectSteps
learnOverrides['ru-aural'] =
  'Choose one past aural paper. Play the recording of the first section without the questions and write what you hear: names, numbers, times and places. Then play it again with the questions from the aural paper and answer them.'

const practiseOverrides: Record<string, string> = {
  'ru-oral-project':
    'Present your project aloud for about two minutes, then answer five questions about it that a partner or your teacher asks without warning. Record it and note three mistakes.',
  'ru-aural':
    'Do one full aural paper under exam conditions: play each recording as many times as the paper allows, answer without pausing, then mark it with the marking scheme and read the transcript in its Appendix 2.',
  'ru-written-expression':
    'Do two full grammar texts under time: one of your fact sheets with gaps, and one from a past paper. Fill in every word in brackets, then check each form against the key or with your teacher.',
  'ru-culture-essay':
    'Write two short essays of about 50 words with five facts each, on two different cultural topics, under time. Check that each one has a title, five clear facts and correct endings.',
  'ru-guided-writing':
    'Write a full 140-word guided writing task under time, covering every listed point, then count the words and check your language.',
  'ru-structuring-discourse':
    'Do two full matching tasks from a past paper or your textbook under time, and write down why you chose each answer.',
  'ru-language-awareness':
    'Do two language awareness tasks from past papers or your textbook: one on dictionary forms or parts of speech, and one on the case of noun phrases.',
}

function learnAttempt(area: Area, name: string): string {
  switch (area) {
    case 'grammar':
      return `Write ten sentences of your own about your life that use "${name}". Check each one in your grammar book and correct mistakes in a different colour.`
    case 'vocabulary':
      return 'Cover the Russian side and say each word from the English, then do the reverse. Write five or six sentences about your own life using at least eight of the words.'
    case 'reading':
      return 'Answer the questions on the passage in the language the paper asks for, giving as many different details as each question asks for. Check them and note why any answer would lose marks.'
    case 'writing':
      return `Write a short version (eight to ten sentences) on "${name}" without looking at the model. Check it: every point covered, endings and aspect, linking words, spelling. ${checkNote}`
    case 'oral':
      return 'Speak your answer aloud for two minutes while recording it on your phone. Listen back and write down three mistakes or places where you hesitated, then say it again.'
    case 'aural':
      return 'Listen to a second recording and answer the questions without pausing. Then replay it with a transcript, if you have one, and mark what you missed.'
    case 'culture':
      return `Without notes, say or write a short answer on "${name}" in Russian, then check the facts and the language.`
  }
}

function attemptText(topic: RevisionTopic | undefined, area: Area, name: string): string {
  const base = (topic && learnOverrides[topic.id]) ?? learnAttempt(area, name)
  if (!topic?.hasExercises) return base
  return area === 'oral'
    ? `Answer the speaking prompts below aloud without notes, then check yourself against the list. Then: ${base}`
    : `Do the exercise set below without notes and check it. Then: ${base}`
}

function mainText(topic: RevisionTopic | undefined, area: Area, name: string): string {
  return (topic && practiseOverrides[topic.id]) ?? practiseMain(area, name)
}

function learn(context: SubjectTaskContext): BlockTask[] {
  const { block, topic, occurrence } = context
  const area = areaOf(context)
  const name = nameOf(context)
  const [read, recall, attempt] = splitMinutes(block.minutes, [45, 25, 30])
  const prompts = topic?.recall ?? []
  const promptCount = Math.min(prompts.length, Math.max(2, Math.floor(recall / 2.5)))
  return [
    { minutes: read, text: learnRead(area, name, occurrence === 0), items: paperItems(topic && topicPart[topic.id], occurrence) },
    {
      minutes: recall,
      text: 'Close your notes. Answer these aloud or on paper from memory, then check and correct in a different colour:',
      items: rotate(prompts, occurrence * promptCount, promptCount),
    },
    {
      minutes: attempt,
      text: attemptText(topic, area, name),
      items: [],
    },
  ]
}

function practiseMain(area: Area, name: string): string {
  switch (area) {
    case 'grammar':
      return `Do mixed exercises that combine "${name}" with the cases and tenses you already know: about 30 sentences from your workbook or your teacher\u2019s sheets, with no notes.`
    case 'vocabulary':
      return `Use the words for "${name}" in real tasks: speak for three minutes on the topic, then write about ten sentences on it, with no word list in front of you.`
    case 'reading':
      return 'Do a full reading comprehension from your own copy of a past paper under light time pressure, giving as many different details as each question asks for.'
    case 'writing':
      return `Write one full piece on "${name}" under time, from a past paper task or one your teacher gives you. Plan for five minutes first. ${checkNote}`
    case 'oral':
      return `Do a full four to five minute spoken practice on "${name}" with a partner, a teacher or your phone recorder. After each answer, ask yourself a follow-up question and answer that too.`
    case 'aural':
      return 'Do a full aural section from a past paper, or an equivalent set of recordings, under exam conditions, playing each recording as the paper instructs.'
    case 'culture':
      return `Write a short essay on "${name}" under time, with facts, an opinion and a conclusion. ${checkNote}`
  }
}

function practise(context: SubjectTaskContext): BlockTask[] {
  const { block, topic, occurrence } = context
  const [warmUp, main, mark] = splitMinutes(block.minutes, [15, 70, 15])
  return [
    { minutes: warmUp, text: 'Warm-up, no notes. Answer aloud or on paper:', items: rotate(topic?.recall ?? [], occurrence * 2, 2) },
    {
      minutes: main,
      text: topic?.hasExercises
        ? `Start with the exercise sets below, without notes. Then: ${mainText(topic, areaOf(context), nameOf(context))}`
        : mainText(topic, areaOf(context), nameOf(context)),
      items: paperItems(topic && topicPart[topic.id], occurrence + 3, 2),
    },
    {
      minutes: mark,
      text: 'Check your work against your textbook answers, the marking scheme or your teacher\u2019s comments. List the errors that repeat and the rule behind each, then redo two sentences correctly.',
      items: [],
    },
  ]
}

function choose({ block, level }: SubjectTaskContext): BlockTask[] {
  const read = Math.min(5, block.minutes)
  const higher = level === 'higher'
  return [
    {
      minutes: read,
      text: higher
        ? 'Take the guided writing options from a past paper or your textbook. Read every option and note the points each one asks you to cover. In the real 2027 exam you choose between two letters, two narratives and two discussions and write one. Decide which one lets you use the language you know best.'
        : 'Take an extended writing task and a set of short answer topics from a past paper or your textbook. Read the prompts and note every point to cover. In the real exam you answer two of five short answer topics, then write the extended piece using the prompts. Decide which topics you can answer best.',
      items: [],
    },
    {
      minutes: block.minutes - read,
      text: higher
        ? `Write the one you chose under time, covering every point. Then check endings, aspect, linking words and spelling. ${checkNote}`
        : `Write your chosen answers under time, covering every prompt. Then check endings, tenses, linking words and spelling. ${checkNote}`,
      items: [],
    },
  ]
}

function timed({ block, occurrence, topicProgress, level }: SubjectTaskContext): BlockTask[] {
  const shaky = (part: ExamPart) => part.topics.filter((id) => topicProgress[id]?.outcome === 'shaky').length
  const ranked = [...examParts(level)].sort((a, b) => shaky(b) - shaky(a))
  const count = block.minutes >= 90 ? 2 : 1
  const picks = rotate(ranked, occurrence * count, count)
  const minutes = splitMinutes(block.minutes, picks.map(() => 1))
  return picks.map((part, index) => ({
    minutes: minutes[index],
    text: `Work on one part of the exam under time, without notes. ${part.instruction}`,
    items: [part.name, ...paperItems(part.paper, occurrence * count + index)],
  }))
}

function review({ block }: SubjectTaskContext): BlockTask[] {
  const [mark, redo, causes] = splitMinutes(block.minutes, [40, 40, 20])
  return [
    {
      minutes: mark,
      text: 'Take the pieces of work you got wrong or left unfinished in recent blocks. Find every mistake and name its cause: an ending or case, aspect, a verb of motion, agreement, vocabulary, spelling or stress, or a point of the task you did not cover.',
      items: [],
    },
    { minutes: redo, text: 'Redo those tasks from a blank page, or say the answers aloud again, without looking at the corrections.', items: [] },
    {
      minutes: causes,
      text: 'Write the three causes that cost you the most, and one habit that would prevent each. Mark any topic that keeps failing as Shaky above.',
      items: [],
    },
  ]
}

function light({ block, topicProgress, date, subject }: SubjectTaskContext): BlockTask[] {
  const topics = subject.topics
  const shaky = topics.filter((topic) => topicProgress[topic.id]?.outcome === 'shaky')
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000)
  const picks = rotate(shaky.length > 0 ? shaky : topics, day * 3, 3)
  const [skim, test] = splitMinutes(block.minutes, [60, 40])
  return [
    { minutes: skim, text: 'Skim your notes and word lists on these topics. Do not start anything new:', items: picks.map((topic) => topic.title) },
    {
      minutes: test,
      text: 'Close your notes and answer one prompt on each, aloud:',
      items: picks.flatMap((topic) => rotate(topic.recall ?? [], day, 1)),
    },
  ]
}

export const russianTasks: Record<BlockKind, (context: SubjectTaskContext) => BlockTask[]> = {
  'learn-topic': learn,
  'practise-topic': practise,
  'choose-questions': choose,
  'timed-questions': timed,
  'review-mistakes': review,
  'light-review': light,
}
