import type { TopicProgress } from './progress'
import { rotate, splitMinutes } from './taskHelpers'
import type { BlockTask, PaperPart, PlanBlock, RevisionPlan, RevisionSubject, RevisionTopic } from './types'

export { splitMinutes }
export type { BlockTask }

export interface TaskContext {
  plan: RevisionPlan
  date: string
  index: number
  subject: RevisionSubject | undefined
  topicProgress: Readonly<Record<string, TopicProgress>>
}

const DEFAULT_MINUTES_PER_QUESTION = 19

function paperName({ year, paper, label }: { year: number; paper?: number; label?: string }): string {
  if (label) return label
  return paper === undefined ? String(year) : `${year} Paper ${paper}`
}

export function describePart(part: PaperPart): string {
  return `${paperName(part)} question ${part.question}${part.part ? ` part (${part.part})` : ''}: ${part.summary}`
}

function questionKey(part: PaperPart): string {
  return `${part.year}-${part.paper ?? 0}-${part.question}`
}

interface PaperQuestion {
  year: number
  paper?: number
  label?: string
  question: number
  topics: string[]
  summary: string
}

function groupQuestions(parts: readonly PaperPart[]): PaperQuestion[] {
  const grouped = new Map<string, PaperQuestion>()
  for (const part of parts) {
    const key = questionKey(part)
    const entry = grouped.get(key) ?? { year: part.year, paper: part.paper, label: part.label, question: part.question, topics: [], summary: '' }
    for (const topic of part.topics) if (!entry.topics.includes(topic)) entry.topics.push(topic)
    entry.summary = entry.summary ? `${entry.summary}; ${part.summary}` : part.summary
    grouped.set(key, entry)
  }
  return [...grouped.values()]
}

function describeQuestion(question: PaperQuestion): string {
  return `${paperName(question)} question ${question.question}: ${question.summary}`
}

function byNewest<T extends { year: number; paper?: number; question: number }>(a: T, b: T): number {
  return b.year - a.year || (a.paper ?? 0) - (b.paper ?? 0) || a.question - b.question
}

/** How many earlier blocks in the plan have the same kind (and topic) as this one. */
function occurrenceOf(plan: RevisionPlan, date: string, index: number): number {
  const target = plan.days.find((day) => day.date === date)?.blocks[index]
  if (!target) return 0
  let count = 0
  for (const day of plan.days) {
    if (day.date > date) break
    day.blocks.forEach((block, blockIndex) => {
      if (day.date === date && blockIndex >= index) return
      if (block.subjectId === target.subjectId && block.kind === target.kind && block.topicId === target.topicId) count += 1
    })
  }
  return count
}

function findTopic(subject: RevisionSubject | undefined, id: string | undefined): RevisionTopic | undefined {
  return subject?.topics.find((topic) => topic.id === id)
}

function learnTasks(block: PlanBlock, topic: RevisionTopic | undefined, subject: RevisionSubject | undefined, occurrence: number): BlockTask[] {
  const [read, recall, attempt] = splitMinutes(block.minutes, [45, 25, 30])
  const candidates = (subject?.paperParts ?? []).filter((part) => topic && part.topics.includes(topic.id)).sort(byNewest)
  const oldest = [...candidates].reverse()
  const pick = rotate(oldest, occurrence, 1)
  const name = topic?.title ?? 'this topic'
  const booklet = subject?.formulaeBooklet !== false
  const prompts = topic?.recall ?? []
  const promptCount = Math.min(prompts.length, Math.max(2, Math.floor(recall / 2.5)))
  const tasks: BlockTask[] = [
    {
      minutes: read,
      text:
        occurrence === 0
          ? `Read your notes or textbook on "${name}" and follow two worked examples or diagrams line by line.${booklet ? ' Keep the Formulae and Tables booklet open and note which formulae it gives you.' : ''}`
          : `Carry on with "${name}": do textbook exercises on the part you found hardest, from easy to exam style.${booklet ? ' Keep the Formulae and Tables booklet open.' : ''}`,
      items: [],
    },
    {
      minutes: recall,
      text: 'Close your notes. Answer these on paper from memory, then check and correct in a different colour:',
      items: rotate(prompts, occurrence * promptCount, promptCount),
    },
  ]
  const withProblem = topic?.hasProblems === true
  if (withProblem) {
    tasks.push({
      minutes: attempt,
      text:
        pick.length > 0
          ? 'Solve the practice problem below without notes and check your answers. For more, try this past paper part:'
          : 'Solve the practice problem below without notes and check your answers.',
      items: pick.map(describePart),
    })
  } else {
    tasks.push(
      pick.length > 0
        ? { minutes: attempt, text: 'Try this past paper part without notes:', items: pick.map(describePart) }
        : { minutes: attempt, text: 'Make up and solve one example of your own on this topic without notes.', items: [] },
    )
  }
  return tasks
}

function practiseTasks(block: PlanBlock, topic: RevisionTopic | undefined, subject: RevisionSubject | undefined, occurrence: number): BlockTask[] {
  const [warmUp, solve, mark] = splitMinutes(block.minutes, [15, 70, 15])
  const count = Math.min(4, Math.max(1, Math.round(block.minutes / 15)))
  const candidates = (subject?.paperParts ?? []).filter((part) => topic && part.topics.includes(topic.id)).sort(byNewest)
  const picks = rotate(candidates, occurrence * count, count)
  const prompts = topic?.recall ?? []
  return [
    {
      minutes: warmUp,
      text: 'Warm-up, no notes. Answer aloud or on paper:',
      items: rotate(prompts, occurrence * 2, 2),
    },
    {
      minutes: solve,
      text: topic?.hasProblems
        ? 'Solve the practice problems below, showing every step. For more, work on these past paper parts:'
        : 'Solve these past paper parts under light time pressure, showing every step as you would in the exam:',
      items: picks.map(describePart),
    },
    {
      minutes: mark,
      text: 'Check each answer against the marking scheme. Write down which step lost marks and why, and redo that step.',
      items: [],
    },
  ]
}

function questionsFor(subject: RevisionSubject | undefined): { all: PaperQuestion[]; perQuestion: number } {
  const perQuestion = subject?.minutesPerQuestion ?? DEFAULT_MINUTES_PER_QUESTION
  return { all: groupQuestions(subject?.paperParts ?? []), perQuestion: Math.max(1, perQuestion) }
}

function chooseTasks(block: PlanBlock, subject: RevisionSubject | undefined, occurrence: number): BlockTask[] {
  const { all, perQuestion } = questionsFor(subject)
  const papers = [...new Map(all.map((entry) => [`${entry.year}-${entry.paper ?? 0}`, entry])).values()].sort(
    (a, b) => b.year - a.year || (a.paper ?? 0) - (b.paper ?? 0),
  )
  const chosen = papers.length > 0 ? papers[occurrence % papers.length] : undefined
  const paper = chosen ? (chosen.paper === undefined && !chosen.label ? `${chosen.year} paper` : paperName(chosen)) : undefined
  const choose = Math.min(5, block.minutes)
  const solve = block.minutes - choose
  const count = Math.max(1, Math.floor(solve / perQuestion))
  return [
    {
      minutes: choose,
      text: paper
        ? `Take the ${paper}. Read every question and write down the numbers of the questions you would answer. ${subject?.choiceNote ?? 'In the real exam you choose 8 of 10.'}`
        : 'Take a past paper. Read every question and write down the numbers of the questions you would answer.',
      items: [],
    },
    {
      minutes: solve,
      text: `Solve ${count === 1 ? 'one' : count} of the questions you chose under exam time, about ${perQuestion} minutes each, with ${subject?.formulaeBooklet === false ? 'no notes' : 'the Formulae and Tables booklet only'}.`,
      items: [],
    },
  ]
}

function timedTasks(block: PlanBlock, subject: RevisionSubject | undefined, occurrence: number, progress: Readonly<Record<string, TopicProgress>>): BlockTask[] {
  const { all, perQuestion } = questionsFor(subject)
  const count = Math.max(1, Math.floor(block.minutes / perQuestion))
  const shaky = (question: PaperQuestion) => question.topics.filter((id) => progress[id]?.outcome === 'shaky').length
  const ranked = [...all].sort((a, b) => shaky(b) - shaky(a) || byNewest(a, b))
  const picks = rotate(ranked, occurrence * count, count)
  return [
    {
      minutes: block.minutes,
      text: `Solve ${picks.length === 1 ? 'this question' : 'these questions'} under exam time (about ${perQuestion} minutes each), without notes. Questions that include your shaky topics come first:`,
      items: picks.map(describeQuestion),
    },
  ]
}

function reviewTasks(block: PlanBlock): BlockTask[] {
  const [mark, redo, causes] = splitMinutes(block.minutes, [40, 40, 20])
  return [
    {
      minutes: mark,
      text: 'Take the questions you got wrong or left unfinished in recent blocks. Use the marking scheme to find every lost mark and name the cause: method, algebra or arithmetic, units, or misreading the question.',
      items: [],
    },
    { minutes: redo, text: 'Redo those questions from a blank page without looking at the solution.', items: [] },
    {
      minutes: causes,
      text: 'Write the three causes that cost you the most marks, and one habit that would prevent each. Mark any topic that keeps failing as Shaky above.',
      items: [],
    },
  ]
}

function lightTasks(block: PlanBlock, subject: RevisionSubject | undefined, date: string, progress: Readonly<Record<string, TopicProgress>>): BlockTask[] {
  const topics = subject?.topics ?? []
  const shaky = topics.filter((topic) => progress[topic.id]?.outcome === 'shaky')
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000)
  const pool = shaky.length > 0 ? shaky : topics
  const picks = rotate(pool, day * 3, 3)
  const [skim, test] = splitMinutes(block.minutes, [60, 40])
  return [
    { minutes: skim, text: 'Skim your notes and formulae on these topics. Do not start anything new:', items: picks.map((topic) => topic.title) },
    {
      minutes: test,
      text: 'Close your notes and answer one prompt on each, aloud:',
      items: picks.flatMap((topic) => rotate(topic.recall ?? [], day, 1)),
    },
  ]
}

/** Turns a plan block into concrete steps with minutes and, where possible, named questions. */
export function blockTasks({ plan, date, index, subject, topicProgress }: TaskContext): BlockTask[] {
  const block = plan.days.find((day) => day.date === date)?.blocks[index]
  if (!block) return []
  const occurrence = occurrenceOf(plan, date, index)
  const topic = findTopic(subject, block.topicId)
  const custom = subject?.tasks?.[block.kind]
  if (subject && custom) return custom({ block, topic, subject, level: plan.levels?.[block.subjectId] ?? 'higher', occurrence, date, topicProgress })
  switch (block.kind) {
    case 'learn-topic':
      return learnTasks(block, topic, subject, occurrence)
    case 'practise-topic':
      return practiseTasks(block, topic, subject, occurrence)
    case 'choose-questions':
      return chooseTasks(block, subject, occurrence)
    case 'timed-questions':
      return timedTasks(block, subject, occurrence, topicProgress)
    case 'review-mistakes':
      return reviewTasks(block)
    case 'light-review':
      return lightTasks(block, subject, date, topicProgress)
  }
}
