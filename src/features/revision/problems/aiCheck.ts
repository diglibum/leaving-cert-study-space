export interface AiCheckInput {
  question: string
  working: string
  /** Answers the learner typed, one per line such as "(a) 12.5". */
  answers?: string[]
  /** Answers computed by the app, so the AI can compare. Only for generated problems. */
  reference?: string[]
}

function section(title: string, body: string): string {
  return `## ${title}\n${body.trim() === '' ? '(empty)' : body.trim()}`
}

/** Plain text the learner copies by hand into any AI tool. The app never sends it anywhere. */
export function buildCheckPrompt(input: AiCheckInput): string {
  const parts = [
    'I am a student preparing for the Leaving Certificate Applied Mathematics Higher Level exam. Please check my working.',
    section('Question', input.question),
    section('My working', input.working),
  ]
  if (input.answers) parts.push(section('My answers', input.answers.join('\n')))
  if (input.reference) parts.push(section('Correct answers calculated by my study app', input.reference.join('\n')))
  parts.push(
    [
      '## What I want',
      '- Check my working line by line and tell me the first line where I went wrong, if any.',
      '- Quote the exact words or lines from my working that each comment refers to.',
      '- Tell me what is correct first, then give up to three specific improvements (method, setting out, units, final answer).',
      '- Give a hint for the next step instead of the full solution.',
      '- If I attach a photo of my handwritten working or sketch, read it as my working and say so if something is unreadable.',
      '- Do not give a mark or a grade.',
    ].join('\n'),
  )
  return parts.join('\n\n')
}

/** What a piece of writing is checked against, such as a past paper question's marking scheme described in our own words. */
export interface CheckProfile {
  id: string
  label: string
  /** Target length in words, if the task has one. */
  words?: number
  /** Things the real marking scheme looks for, in the learner's checklist style. */
  criteria: readonly string[]
}

export interface WritingCheckInput {
  task: string
  text: string
  profile?: CheckProfile
}

export function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

/** For language subjects: a prompt that asks for feedback on the learner's own writing or speech transcript. */
export function buildWritingCheckPrompt(input: WritingCheckInput, subjectName: string): string {
  return [
    `I am a student preparing for the Leaving Certificate ${subjectName} exam. Please check my writing.`,
    section('Task', input.task),
    section('My text', input.text),
    ...(input.profile
      ? [
          section(
            `What this task looks for (${input.profile.label})`,
            [
              ...(input.profile.words ? [`- Target length: about ${input.profile.words} words. My text has ${wordCount(input.text)}.`] : []),
              ...input.profile.criteria.map((criterion) => `- ${criterion}`),
              '- Tell me for each point whether my text meets it, with a quote. This is a checklist, not an exam mark.',
            ].join('\n'),
          ),
        ]
      : []),
    [
      '## What I want',
      '- Quote the exact words from my text that each comment refers to.',
      '- Tell me what works well first, then give up to three specific improvements.',
      '- Group the improvements by: grammar (endings, aspect, verb forms, agreement), vocabulary and natural phrasing, structure and linking, spelling and punctuation.',
      '- For each error, name the rule and give a hint. Do not rewrite my text.',
      '- Say whether I covered every point of the task.',
      '- Do not give a mark or a grade.',
    ].join('\n'),
  ].join('\n\n')
}
