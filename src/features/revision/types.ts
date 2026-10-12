import type { PracticeSet } from './problems/types'
import type { CheckProfile } from './problems/aiCheck'

export type Confidence = 'weak' | 'okay' | 'strong'
export type CourseLevel = 'higher' | 'ordinary'
export type RevisionPhase = 'build' | 'practise' | 'exam' | 'light'

/** 0 = Sunday ... 6 = Saturday, matching `Date.getUTCDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface RevisionTopic {
  id: string
  /** Applied Mathematics strand from the specification. */
  strand?: 2 | 3 | 4
  /** The kind of skill, for subjects that write their own task steps. */
  area?: string
  title: string
  /** Relative size (1 small, 3 large); used only to share time between topics. */
  size: 1 | 2 | 3
  higherOnly: boolean
  /** Closed-book prompts used in learn blocks and light review. */
  recall?: readonly string[]
  /** True when the app can generate practice problems for this topic. */
  hasProblems?: boolean
  /** True when the subject can generate typed language exercises for this topic. */
  hasExercises?: boolean
}

/** Points to one part of a past exam question; the question itself stays in the official paper. */
export interface PaperPart {
  year: number
  /** For subjects with two written papers, 1 or 2; the question numbers restart in each paper. */
  paper?: number
  /** Names the paper when it is not a year, for example "Sample paper 1" (use `paper` to order several). */
  label?: string
  question: number
  /** Lettered part such as "a", or an empty string when the question has none. */
  part: string
  topics: readonly string[]
  /** A short description written for this app, not the exam wording. */
  summary: string
}

/** One timed step of a block, with optional concrete items to work on. */
export interface BlockTask {
  minutes: number
  text: string
  /** Concrete things to work on, such as questions or prompts. */
  items: string[]
}

export interface SubjectTaskContext {
  block: PlanBlock
  topic: RevisionTopic | undefined
  subject: RevisionSubject
  level: CourseLevel
  /** How many earlier blocks in the plan have the same kind and topic. */
  occurrence: number
  date: string
  topicProgress: Readonly<Record<string, { outcome: 'got-it' | 'shaky' }>>
}

export interface RevisionSubject {
  id: string
  name: string
  /** Subjects that need different steps from the default write one function per block kind. */
  tasks?: Partial<Record<BlockKind, (context: SubjectTaskContext) => BlockTask[]>>
  /** Replaces the default one-line help of a block kind. */
  help?: Partial<Record<BlockKind, string>>
  /** How the "check with an AI" prompt is worded: for working out (default) or for writing in a language. */
  checkKind?: 'working' | 'writing'
  /** For writing subjects: the kinds of task the learner can pick so the check follows the real marking scheme. */
  checkProfiles?: readonly CheckProfile[]
  /** Makes a typed exercise set for a topic; the same seed gives the same set. */
  exercises?: (topicId: string, seed: string) => PracticeSet | undefined
  /** Topics in the suggested study order. */
  topics: readonly RevisionTopic[]
  /** Past paper parts mapped to topics, used to suggest concrete questions. */
  paperParts?: readonly PaperPart[]
  /** One sentence on how the exam lets the learner choose questions; the default is the Applied Mathematics rule. */
  choiceNote?: string
  /** False when the exam has no Formulae and Tables booklet, so task wording does not mention it. Defaults to true. */
  formulaeBooklet?: boolean
  /** Minutes an average question deserves in the exam, used to size timed work. */
  minutesPerQuestion?: number
}

export interface RevisionSubjectSetup {
  subjectId: string
  level: CourseLevel
  confidence: Confidence
}

export interface RevisionSetup {
  /** First day of the plan, `YYYY-MM-DD`. Re-plan by passing today's date. */
  startDate: string
  /** First exam day, `YYYY-MM-DD`. The plan ends the day before. */
  examDate: string
  subjects: readonly RevisionSubjectSetup[]
  /** Minutes available per weekday. Missing or 0 means a rest day. */
  minutesByWeekday: Partial<Record<Weekday, number>>
}

export type BlockKind =
  | 'learn-topic'
  | 'practise-topic'
  | 'timed-questions'
  | 'review-mistakes'
  | 'choose-questions'
  | 'light-review'

export interface PlanBlock {
  subjectId: string
  minutes: number
  kind: BlockKind
  /** Set for blocks tied to one topic (build and practise phases). */
  topicId?: string
}

export interface PlanDay {
  date: string
  phase: RevisionPhase
  blocks: PlanBlock[]
}

export interface RevisionPlan {
  days: PlanDay[]
  /** First date of each phase that occurs in the plan. */
  phaseStarts: Partial<Record<RevisionPhase, string>>
  /** Course level chosen for each subject, so that subjects can write steps for the right exam. */
  levels?: Readonly<Record<string, CourseLevel>>
}
