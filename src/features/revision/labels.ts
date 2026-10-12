import type { BlockKind, PlanBlock, RevisionPhase, RevisionSubject } from './types'

export const phaseInfo: Record<RevisionPhase, { label: string; description: string }> = {
  build: {
    label: 'Build',
    description: 'Learn each topic in turn and check yourself without notes. Review old topics when they come due.',
  },
  practise: {
    label: 'Practise',
    description: 'Solve questions on one topic at a time from past papers, and go back to your shaky topics.',
  },
  exam: {
    label: 'Exam mode',
    description: 'Work under time on past paper questions, then use the marking scheme to learn from every mistake.',
  },
  light: {
    label: 'Light review',
    description: 'No new work. Skim your notes and shaky topics, and rest before the exam.',
  },
}

const kindInfo: Record<BlockKind, { title: string; help: string }> = {
  'learn-topic': {
    title: 'Learn',
    help: 'Study the topic, then close your notes and write down what you remember. Try an example without help.',
  },
  'practise-topic': {
    title: 'Practise',
    help: 'Solve questions on this topic from your own copy of the past papers. Check them with the marking scheme.',
  },
  'choose-questions': {
    title: 'Exam practice: choose your questions',
    help: 'Read every question on a past paper, decide in the first 5 minutes which ones you will answer, then solve them under time.',
  },
  'timed-questions': {
    title: 'Timed questions',
    help: 'Pick past paper questions and solve them under exam time, without notes.',
  },
  'review-mistakes': {
    title: 'Review mistakes',
    help: 'Redo the questions you lost marks on, using the marking scheme to see exactly where.',
  },
  'light-review': {
    title: 'Light review',
    help: 'Skim your notes and the topics you marked as shaky. No new work.',
  },
}

export function blockTitle(block: PlanBlock, subject: RevisionSubject | undefined): string {
  const topic = subject?.topics.find((entry) => entry.id === block.topicId)
  const title = kindInfo[block.kind].title
  return topic ? `${title}: ${topic.title}` : title
}

export function blockHelp(block: PlanBlock, subject?: RevisionSubject): string {
  return subject?.help?.[block.kind] ?? kindInfo[block.kind].help
}
