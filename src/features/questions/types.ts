export interface EssayQuestion {
  id: string
  year: number
  // Question number within Paper 1, Section II (Composing).
  questionNumber: number
  // General theme printed on the paper, for example "Connections".
  theme: string
  // Exact SEC task wording, without the lead-in that refers to the exam texts.
  task: string
  // Path of the official paper inside the repository.
  paper: string
  // 2024–2026 are primary practice; 2023 is additional.
  tier: 'primary' | 'additional'
}
