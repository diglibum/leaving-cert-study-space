import { generateProblem as generateAppliedMathsProblem, hasProblems as hasAppliedMathsProblems } from './appliedMathsProblems'
import { generateBiologyProblem, hasBiologyProblems } from './biologyProblems'
import { generateChemistryProblem, hasChemistryProblems } from './chemistryProblems'
import { generateMathsProblem, hasMathsProblems } from './mathsProblems'
import { generatePhysicsProblem, hasPhysicsProblems } from './physicsProblems'
import type { PracticeProblem } from './types'

/** Practice problems for every subject that has them, found by topic id. */
export function hasPracticeProblems(topicId: string): boolean {
  return hasAppliedMathsProblems(topicId) || hasMathsProblems(topicId) || hasChemistryProblems(topicId) || hasBiologyProblems(topicId) || hasPhysicsProblems(topicId)
}

export function generatePracticeProblem(topicId: string, seed: string): PracticeProblem | undefined {
  return generateAppliedMathsProblem(topicId, seed) ?? generateMathsProblem(topicId, seed) ?? generateChemistryProblem(topicId, seed) ?? generateBiologyProblem(topicId, seed) ?? generatePhysicsProblem(topicId, seed)
}
