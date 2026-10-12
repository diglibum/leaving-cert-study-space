// Helps the learner see how much of the draft is facts and how much is
// reflection, which is the main skill this trainer practises. The review works
// per paragraph so it stays practical for long essays.
export const paragraphTags = ['happened', 'felt', 'learned'] as const

export type ParagraphTag = (typeof paragraphTags)[number]

export const paragraphTagLabels: Record<ParagraphTag, string> = {
  happened: 'Mostly what happened',
  felt: 'Mostly what I thought or felt',
  learned: 'Mostly what I learned or think now',
}

// Keyed by the paragraph's plain text, so editing a paragraph clears its mark.
export type ParagraphTags = Record<string, ParagraphTag>

export function splitParagraphs(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => /[\p{L}\p{N}]/u.test(paragraph))
}

export function normalizeParagraphTags(value: unknown): ParagraphTags {
  if (typeof value !== 'object' || value === null) return {}
  return Object.fromEntries(
    Object.entries(value).filter(([, tag]) =>
      paragraphTags.includes(tag as ParagraphTag),
    ),
  ) as ParagraphTags
}

export interface ParagraphSummary {
  total: number
  counts: Record<ParagraphTag, number>
  untagged: number
}

export function summariseParagraphs(
  paragraphs: string[],
  tags: ParagraphTags,
): ParagraphSummary {
  const counts: Record<ParagraphTag, number> = { happened: 0, felt: 0, learned: 0 }
  let untagged = 0
  for (const paragraph of paragraphs) {
    const tag = tags[paragraph]
    if (tag) counts[tag] += 1
    else untagged += 1
  }
  return { total: paragraphs.length, counts, untagged }
}
