import { criteria, criterionLabels, checklistItems, ratingLabels } from '../feedback/checklist'
import { paragraphTagLabels, splitParagraphs } from '../feedback/paragraphs'
import { toPlainText } from '../essays/richText'
import type { Essay } from '../essays/types'
import type { EssayQuestion } from '../questions/types'

const SECTIONS: { field: 'material' | 'direction' | 'plan' | 'draft'; title: string }[] = [
  { field: 'material', title: 'Ideas I collected' },
  { field: 'direction', title: 'My chosen focus' },
  { field: 'plan', title: 'My plan' },
  { field: 'draft', title: 'My essay' },
]

function block(title: string, body: string): string {
  return `## ${title}\n${body.trim() === '' ? '(empty)' : body.trim()}`
}

// Builds plain text the learner can copy by hand into any AI tool. Nothing is
// sent anywhere by the app.
export function buildAiExport(essay: Essay, question: EssayQuestion | undefined): string {
  const lines: string[] = [
    '# Request',
    'I am a student preparing for the Leaving Certificate English Higher Level Paper 1 personal essay.',
    'Please give feedback on my essay below. Follow these rules:',
    '- Quote the exact words from my essay that each comment refers to.',
    '- Comment on four areas: clarity of purpose, coherence, language, and mechanics.',
    '- Tell me what works well first, then give up to three specific improvements.',
    '- Help me move from describing events to reflecting on what they meant to me.',
    '- Do not rewrite my essay and do not give a mark or a grade.',
    '',
    block(
      'Question',
      question
        ? `${question.task}\n(Leaving Certificate ${question.year}, Paper 1, question ${question.questionNumber})`
        : 'No question selected.',
    ),
    '',
  ]

  for (const { field, title } of SECTIONS) {
    lines.push(block(title, toPlainText(essay[field], { listMarkers: true })), '')
  }

  const paragraphs = splitParagraphs(toPlainText(essay.draft))
  const tagged = paragraphs.filter((paragraph) => essay.paragraphTags[paragraph])
  if (tagged.length > 0) {
    lines.push('## My own paragraph review')
    for (const paragraph of tagged) {
      lines.push(`- [${paragraphTagLabels[essay.paragraphTags[paragraph]]}] ${paragraph}`)
    }
    lines.push('')
  }

  const answered = checklistItems.filter((item) => essay.checklist[item.id]?.rating)
  if (answered.length > 0) {
    lines.push('## My own checklist')
    for (const criterion of criteria) {
      for (const item of answered.filter((entry) => entry.criterion === criterion)) {
        const answer = essay.checklist[item.id]
        if (!answer.rating) continue
        const note = answer.note.trim() ? ` (${answer.note.trim()})` : ''
        lines.push(
          `- ${criterionLabels[criterion].name}: ${item.prompt} ${ratingLabels[answer.rating]}${note}`,
        )
      }
    }
    lines.push('')
  }

  if (toPlainText(essay.selfCheck).trim()) lines.push(block('My own notes', toPlainText(essay.selfCheck, { listMarkers: true })), '')

  return lines.join('\n').trimEnd() + '\n'
}
