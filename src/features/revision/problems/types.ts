export type Rng = () => number

export interface ProblemPart {
  /** "(a)", "(b)", ... */
  label: string
  prompt: string
  answer: number
  unit: string
  /** Decimal places to give the answer to. */
  decimals: number
}

export interface DiagramNode {
  id: string
  x: number
  y: number
}

export interface DiagramEdge {
  from: string
  to: string
  label: string
  highlight?: boolean
}

export interface NetworkDiagram {
  kind: 'network'
  /** Text alternative for screen readers. */
  description: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export interface GraphMark {
  x: number
  y: number
  label: string
  /** Dashed guide lines down to the axes. */
  guides?: boolean
}

export interface GraphDiagram {
  kind: 'graph'
  description: string
  xLabel: string
  yLabel: string
  xMax: number
  yMax: number
  xStep: number
  yStep: number
  lines: { points: [number, number][] }[]
  marks?: GraphMark[]
}

export type Diagram = NetworkDiagram | GraphDiagram

export interface PracticeProblem {
  topicId: string
  statement: string
  parts: ProblemPart[]
  /** Worked steps shown after the learner asks for the solution. */
  solution: string[]
  /** Drawn with the question, for data the learner reads off a picture. */
  diagram?: Diagram
  /** Drawn with the worked solution, for example the chosen edges highlighted. */
  solutionDiagram?: Diagram
}

/** A drawing task: the learner sketches on paper, then compares with the reference. */
export interface SketchTask {
  topicId: string
  prompt: string
  reference: Diagram
  /** Features a correct sketch shows; the learner ticks them off. */
  checklist: string[]
}

export type SketchBody = Omit<SketchTask, 'topicId'>
export type SketchGenerator = (rng: Rng) => SketchBody

export type ProblemBody = Omit<PracticeProblem, 'topicId'>
export type ProblemGenerator = (rng: Rng) => ProblemBody

/** One gap-fill or translation item whose answer is a word or short phrase typed by the learner. */
export interface LanguageItem {
  /** The sentence with a `___` gap, or a word or phrase to translate. */
  prompt: string
  /** Every accepted answer; the first one is shown as the model answer. */
  answers: readonly string[]
  /** One short English explanation of the rule or the word. */
  note: string
  /** Language code of the typed answer when it differs from the exercise, such as `en` for a case name. */
  answerLang?: string
}

/** A set of items on one topic, typed in the language being learned. */
export interface LanguageExercise {
  kind: 'items'
  topicId: string
  /** Language code of the answers, such as `ru`. */
  lang: string
  /** Language code of the prompts, such as `ru` for gap sentences or `en` for words to translate. */
  promptLang: string
  instruction: string
  items: LanguageItem[]
}

export interface LanguagePool {
  lang: string
  promptLang: string
  instruction: string
  items: readonly LanguageItem[]
}

/** One word to put into the right form inside a connected text, as in the exam's grammar question. */
export interface ClozeGap {
  /** The word as printed in brackets, in the nominative or the infinitive. */
  base: string
  /** Every accepted form; the first one is shown as the model answer. */
  answers: readonly string[]
  /** One short English explanation of the form. */
  note: string
}

export type ClozePart = string | ClozeGap

export interface ClozeText {
  title: string
  /** English line on what the text is about. */
  summary: string
  paragraphs: readonly (readonly ClozePart[])[]
}

export interface ClozeExercise {
  kind: 'cloze'
  topicId: string
  instruction: string
  text: ClozeText
}

export interface MatchSection {
  /** Section name in the language being learned. */
  name: string
  /** English meaning, shown only with the answers. */
  gloss: string
}

export interface MatchItem {
  text: string
  /** Index into the exercise's sections. */
  section: number
  /** English reason: the key words that point to the section. */
  note: string
}

/** Match short texts to the headings they belong to. */
export interface MatchExercise {
  kind: 'match'
  topicId: string
  instruction: string
  sections: readonly MatchSection[]
  items: readonly MatchItem[]
}

/** Name several words from a theme. */
export interface ListExercise {
  kind: 'list'
  topicId: string
  lang: string
  instruction: string
  /** English description of the theme, for example "winter". */
  theme: string
  /** How many different words the learner has to give. */
  count: number
  /** Every accepted word or form. */
  accepted: readonly string[]
  note: string
}

export interface SpeakPrompt {
  text: string
  /** English meaning, shown on request. */
  gloss: string
}

/** Questions to answer aloud, with a short self-check. */
export interface SpeakExercise {
  kind: 'speak'
  topicId: string
  lang: string
  instruction: string
  prompts: readonly SpeakPrompt[]
  tips: readonly string[]
  selfCheck: readonly string[]
}

export type PracticeSet = LanguageExercise | ClozeExercise | MatchExercise | ListExercise | SpeakExercise
