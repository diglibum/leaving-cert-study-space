import type { AnswerResult } from '../problems/check'

export const resultText: Record<AnswerResult, string> = {
  correct: 'Correct.',
  wrong: 'Not quite. Check the form and try again.',
  empty: 'No answer yet.',
  invalid: 'No answer yet.',
}

export const keyboardHint =
  'Switch your keyboard to the language you are practising. Capital letters and stress marks do not matter, and for Russian neither does the difference between \u0451 and \u0435.'
