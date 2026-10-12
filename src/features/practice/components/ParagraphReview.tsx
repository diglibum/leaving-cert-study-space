import { toPlainText } from '../../essays/richText'
import {
  paragraphTagLabels,
  paragraphTags,
  splitParagraphs,
  summariseParagraphs,
  type ParagraphTag,
  type ParagraphTags,
} from '../../feedback/paragraphs'

interface ParagraphReviewProps {
  draft: string
  tags: ParagraphTags
  onChange: (tags: ParagraphTags) => void
}

function excerpt(paragraph: string, length: number): string {
  const text = paragraph.replace(/\s+/g, ' ')
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

function ParagraphReview({ draft, tags, onChange }: ParagraphReviewProps) {
  const paragraphs = splitParagraphs(toPlainText(draft))
  const summary = summariseParagraphs(paragraphs, tags)
  const marked = summary.total - summary.untagged
  const reflective = summary.counts.felt + summary.counts.learned

  function setTag(paragraph: string, value: string) {
    const next: ParagraphTags = {}
    for (const candidate of paragraphs) {
      if (tags[candidate]) next[candidate] = tags[candidate]
    }
    if (value) next[paragraph] = value as ParagraphTag
    else delete next[paragraph]
    onChange(next)
  }

  return (
    <section className="self-check-section" aria-labelledby="paragraph-heading">
      <h3 id="paragraph-heading">1. Facts and reflection</h3>
      <p>
        Mark each paragraph of your essay by what it mostly does. Good personal
        essays move from what happened to what it meant to you.
      </p>

      {paragraphs.length === 0 ? (
        <p>Write your essay in step 4 first. Its paragraphs will appear here.</p>
      ) : (
        <>
          <ol className="paragraph-list">
            {paragraphs.map((paragraph, index) => (
              <li key={`${index}-${paragraph}`}>
                <p className="paragraph-text">{excerpt(paragraph, 220)}</p>
                <select
                  aria-label={`Type of paragraph ${index + 1}: ${excerpt(paragraph, 40)}`}
                  value={tags[paragraph] ?? ''}
                  onChange={(event) => setTag(paragraph, event.target.value)}
                >
                  <option value="">Not marked</option>
                  {paragraphTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {paragraphTagLabels[tag]}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ol>

          <p className="paragraph-summary" role="status">
            Marked {marked} of {summary.total} paragraphs. {paragraphTagLabels.happened}:{' '}
            {summary.counts.happened}. {paragraphTagLabels.felt}: {summary.counts.felt}.{' '}
            {paragraphTagLabels.learned}: {summary.counts.learned}.
          </p>
          {marked >= 3 && reflective / marked < 0.3 && (
            <p className="paragraph-advice">
              Most of the paragraphs you marked describe what happened. Pick one
              and add what you thought or felt, and what it taught you.
            </p>
          )}
        </>
      )}
    </section>
  )
}

export default ParagraphReview
