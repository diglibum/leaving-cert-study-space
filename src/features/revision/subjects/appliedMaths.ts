import type { RevisionSubject, RevisionTopic } from '../types'
import { appliedMathsPaperParts } from './appliedMathsPapers'
import { hasProblems } from '../problems/appliedMathsProblems'
import { appliedMathsRecall } from './appliedMathsRecall'
import { russian } from './russian'

type TopicInput = Omit<RevisionTopic, 'higherOnly'> & { higherOnly?: boolean }

function topic(input: TopicInput): RevisionTopic {
  return { higherOnly: false, recall: appliedMathsRecall[input.id], hasProblems: hasProblems(input.id), ...input }
}

/**
 * Topics follow the Leaving Certificate Applied Mathematics specification
 * (NCCA, 2019), strands 2 to 4. Strand 1 (modelling) is the unifying strand and
 * is assessed through the modelling project and the contexts of the exam
 * questions, so it is not a study topic here. Higher-only items are those in
 * bold in the specification. The order mixes strands so that networks give a
 * change of pace between mechanics topics. Sizes are rough estimates.
 */
export const appliedMaths: RevisionSubject = {
  id: 'applied-maths',
  name: 'Applied Mathematics',
  paperParts: appliedMathsPaperParts,
  // 150 minutes for 8 answered questions.
  minutesPerQuestion: 19,
  topics: [
    topic({ id: 'am-kinematics-1d', strand: 3, size: 3, title: 'Motion in a straight line: graphs and constant-acceleration formulae' }),
    topic({ id: 'am-calculus-for-motion', strand: 3, size: 2, title: 'Calculus for motion: derivatives, integrals, chain rule' }),
    topic({ id: 'am-network-terms', strand: 2, size: 1, title: 'Networks and their terminology' }),
    topic({ id: 'am-adjacency-matrices', strand: 2, size: 2, title: 'Adjacency matrices and matrix multiplication' }),
    topic({ id: 'am-vectors-2d', strand: 3, size: 3, title: 'Motion in 2D: vector algebra, components, dot product, vector calculus' }),
    topic({ id: 'am-projectiles', strand: 3, size: 2, title: 'Projectile motion' }),
    topic({ id: 'am-spanning-trees', strand: 2, size: 2, title: 'Minimum spanning trees: Kruskal and Prim' }),
    topic({ id: 'am-forces-newton', strand: 3, size: 3, title: 'Forces, free-body diagrams and Newton\u2019s laws' }),
    topic({ id: 'am-planes-friction', strand: 3, size: 3, title: 'Inclined planes, friction, rough and smooth surfaces' }),
    topic({ id: 'am-connected-masses', strand: 3, size: 2, title: 'Connected masses' }),
    topic({ id: 'am-dynamic-programming', strand: 2, size: 3, title: 'Dynamic programming and Bellman\u2019s Principle of Optimality' }),
    topic({ id: 'am-dijkstra', strand: 2, size: 2, title: 'Dijkstra\u2019s algorithm and shortest paths' }),
    topic({ id: 'am-momentum-impulse', strand: 3, size: 2, title: 'Momentum, impulse and conservation of momentum (1D and 2D)' }),
    topic({ id: 'am-collisions', strand: 3, size: 3, title: 'Collisions: coefficient of restitution; oblique collisions are Higher only' }),
    topic({ id: 'am-project-scheduling', strand: 2, size: 2, title: 'Project scheduling: critical path, early and late times, floats' }),
    topic({ id: 'am-resistive-forces', strand: 3, size: 3, title: 'Resistive forces F \u221d v\u207f, integration by parts and by substitution' }),
    topic({ id: 'am-work-energy', strand: 3, size: 3, title: 'Work, energy, conservation of energy, springs and elastic strings' }),
    topic({ id: 'am-circular-motion', strand: 3, size: 2, title: 'Circular motion' }),
    topic({ id: 'am-dimensional-analysis', strand: 3, size: 1, title: 'Dimensional analysis' }),
    topic({ id: 'am-greedy-vs-dp', strand: 2, size: 1, higherOnly: true, title: 'Greedy algorithms versus dynamic programming; justifying algorithms' }),
    topic({ id: 'am-recurrence', strand: 4, size: 1, title: 'Recurrence relations and differences' }),
    topic({ id: 'am-difference-modelling', strand: 4, size: 2, title: 'Modelling with difference equations: growth, loans, supply and demand, disease' }),
    topic({ id: 'am-difference-solving', strand: 4, size: 2, title: 'Solving difference equations: linear and non-linear' }),
    topic({ id: 'am-differential-modelling', strand: 4, size: 2, higherOnly: true, title: 'Modelling with differential equations' }),
    topic({ id: 'am-differential-solving', strand: 4, size: 3, higherOnly: true, title: 'Solving differential equations: separation of variables, reducible second-order, numerical and graphical methods' }),
  ],
}

export const revisionSubjects: readonly RevisionSubject[] = [appliedMaths, russian]
