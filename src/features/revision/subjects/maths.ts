import type { RevisionSubject, RevisionTopic } from '../types'
import { hasMathsProblems } from '../problems/mathsProblems'
import { mathsPaperParts } from './mathsPapers'
import { mathsRecall } from './mathsRecall'

type TopicInput = Omit<RevisionTopic, 'higherOnly'> & { higherOnly?: boolean }

function topic(input: TopicInput): RevisionTopic {
  return { higherOnly: false, recall: mathsRecall[input.id], hasProblems: hasMathsProblems(input.id), ...input }
}

/**
 * Topics follow the Leaving Certificate Mathematics syllabus (examination from
 * 2015, Higher Level) and the 2019 to 2026 papers: Paper 1 covers algebra,
 * functions, calculus, number, complex numbers, sequences and financial maths;
 * Paper 2 covers statistics, probability, geometry and trigonometry. The order
 * starts with the algebra that everything else uses, and then alternates
 * between the two papers so that the learner revisits both early. Sizes are
 * rough estimates. The 2027 arrangements keep the same content but give choice:
 * five of six questions in Section A and three of four in Section B on each paper.
 */
export const maths: RevisionSubject = {
  id: 'maths',
  name: 'Mathematics',
  paperParts: mathsPaperParts,
  choiceNote:
    'In the 2027 exam you do five of the six questions in Section A (30 marks each) and three of the four in Section B (50 marks each), on each paper.',
  // 150 minutes for 300 marks: about 15 minutes for a 30-mark question and 25 for a 50-mark question.
  minutesPerQuestion: 20,
  topics: [
    topic({ id: 'mt-algebra', area: 'Paper 1', size: 2, title: 'Algebra: expressions, factorising, fractions and completing the square' }),
    topic({ id: 'mt-equations', area: 'Paper 1', size: 3, title: 'Equations and inequalities: quadratic, simultaneous, modulus' }),
    topic({ id: 'mt-coord-line', area: 'Paper 2', size: 2, title: 'Coordinate geometry of the line: slope, distance, angle and internal division' }),
    topic({ id: 'mt-indices-logs', area: 'Paper 1', size: 2, title: 'Indices, surds, irrational numbers and logarithms' }),
    topic({ id: 'mt-trig-triangles', area: 'Paper 2', size: 3, title: 'Trigonometry of triangles: sine rule, cosine rule, area, 3D problems' }),
    topic({ id: 'mt-polynomials', area: 'Paper 1', size: 2, title: 'Polynomials and the binomial theorem: factors, remainders, cubics, expansions' }),
    topic({ id: 'mt-probability', area: 'Paper 2', size: 3, title: 'Probability: rules, conditional probability, binomial, expected value' }),
    topic({ id: 'mt-counting', area: 'Paper 2', size: 1, title: 'Counting: permutations and combinations' }),
    topic({ id: 'mt-functions', area: 'Paper 1', size: 3, title: 'Functions: composite, inverse, transformations and graphs' }),
    topic({ id: 'mt-differentiation', area: 'Paper 1', size: 3, title: 'Differentiation: first principles and the rules' }),
    topic({ id: 'mt-coord-circle', area: 'Paper 2', size: 2, title: 'Coordinate geometry of the circle' }),
    topic({ id: 'mt-calc-applications', area: 'Paper 1', size: 3, title: 'Applications of differentiation: tangents, rates, optimisation, curve sketching' }),
    topic({ id: 'mt-stats-data', area: 'Paper 2', size: 2, title: 'Statistics: summarising data, correlation and line of best fit' }),
    topic({ id: 'mt-integration', area: 'Paper 1', size: 3, title: 'Integration: rules, areas, average value and the trapezoidal rule' }),
    topic({ id: 'mt-trig-identities', area: 'Paper 2', size: 3, title: 'Trigonometric functions, identities and equations' }),
    topic({ id: 'mt-sequences', area: 'Paper 1', size: 3, title: 'Sequences and series: arithmetic, geometric, limits, induction, infinite sums' }),
    topic({ id: 'mt-normal', area: 'Paper 2', size: 2, title: 'The normal distribution and z-scores' }),
    topic({ id: 'mt-complex', area: 'Paper 1', size: 3, title: 'Complex numbers: algebra, Argand diagram, polar form and De Moivre' }),
    topic({ id: 'mt-inference', area: 'Paper 2', size: 2, title: 'Inference: margin of error, confidence intervals, hypothesis tests' }),
    topic({ id: 'mt-financial', area: 'Paper 1', size: 3, title: 'Financial and consumer arithmetic: compound interest, present value, loans, depreciation, tax' }),
    topic({ id: 'mt-exp-growth', area: 'Paper 1', size: 2, title: 'Exponential and logarithmic functions, growth and decay models' }),
    topic({ id: 'mt-radians-arcs', area: 'Paper 2', size: 1, title: 'Radians, arc length and sector area' }),
    topic({ id: 'mt-geometry', area: 'Paper 2', size: 3, title: 'Geometry: theorems, proofs, constructions, similar triangles and enlargements' }),
    topic({ id: 'mt-measurement', area: 'Paper 2', size: 2, title: 'Area, perimeter, nets, surface area and volume of solids' }),
  ],
}
