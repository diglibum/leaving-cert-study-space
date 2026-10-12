import type { RevisionSubject, RevisionTopic } from '../types'
import { hasChemistryProblems } from '../problems/chemistryProblems'
import { chemistryPaperParts } from './chemistryPapers'
import { chemistryRecall } from './chemistryRecall'

type TopicInput = Omit<RevisionTopic, 'higherOnly'> & { higherOnly?: boolean }

function topic(input: TopicInput): RevisionTopic {
  return { higherOnly: false, recall: chemistryRecall[input.id], hasProblems: hasChemistryProblems(input.id), ...input }
}

/**
 * Topics follow the full 2027 Leaving Certificate Chemistry specification,
 * checked against every strand and learning outcome. The list keeps the broad
 * app topics already in use, but aligns their wording with the new
 * specification and leaves out out-of-spec material such as amines and amides.
 * The written paper is 60% of the marks; the Practice Investigation (40%) is
 * done in school and is not part of this plan. The only written papers for
 * this specification are the two SEC sample papers.
 */
export const chemistry: RevisionSubject = {
  id: 'chemistry',
  name: 'Chemistry',
  paperParts: chemistryPaperParts,
  choiceNote:
    'In the written exam you answer Question 1 and any five other questions, 50 marks each. The Practice Investigation (40% of the marks) is done in school and is not part of this plan.',
  // 150 minutes for 6 questions of 50 marks.
  minutesPerQuestion: 25,
  topics: [
    topic({ id: 'ch-atomic-structure', area: 'Nature of Matter', size: 3, title: 'Atomic structure: models, spectra, isotopes and electron configuration' }),
    topic({ id: 'ch-periodic-table', area: 'Nature of Matter', size: 2, title: 'The periodic table: groups, trends and ionisation energies' }),
    topic({ id: 'ch-mole', area: 'Nature of Matter', size: 3, title: 'The mole, relative mass, solutions and concentration' }),
    topic({ id: 'ch-stoichiometry', area: 'Nature of Matter', size: 3, title: 'Stoichiometry: formulae, equations, yield and limiting reagent' }),
    topic({ id: 'ch-matter', area: 'Nature of Matter', size: 2, title: 'Matter: kinetic theory, separation and conservation of mass' }),
    topic({ id: 'ch-bonding', area: 'Behaviour of Matter', size: 3, title: 'Chemical bonding, Lewis diagrams and identifying ions' }),
    topic({ id: 'ch-imf-shapes', area: 'Behaviour of Matter', size: 2, title: 'Intermolecular forces, molecular shape and polarity' }),
    topic({ id: 'ch-gases', area: 'Behaviour of Matter', size: 2, title: 'Gases and the ideal gas equation' }),
    topic({ id: 'ch-hydrocarbons', area: 'Behaviour of Matter', size: 3, title: 'Hydrocarbons: sources, properties, isomerism and ethene' }),
    topic({ id: 'ch-thermochemistry', area: 'Interactions of Matter', size: 3, title: 'Thermochemistry: enthalpy, Hess\u2019s law and combustion' }),
    topic({ id: 'ch-rates', area: 'Interactions of Matter', size: 2, title: 'Rates of reaction and catalysis' }),
    topic({ id: 'ch-equilibrium', area: 'Interactions of Matter', size: 3, title: 'Chemical equilibrium, Kc and Le Ch\u00e2telier' }),
    topic({ id: 'ch-acids-bases', area: 'Interactions of Matter', size: 3, title: 'Acids and bases: theories, pH, Ka and indicators' }),
    topic({ id: 'ch-electrochemistry', area: 'Interactions of Matter', size: 3, title: 'Redox, electrochemistry and cells' }),
    topic({ id: 'ch-volumetric', area: 'Matter in our World', size: 3, title: 'Volumetric analysis and titrations' }),
    topic({ id: 'ch-organic', area: 'Matter in our World', size: 3, title: 'Organic chemistry: functional groups, reactions, polymers and pharmaceuticals' }),
    topic({ id: 'ch-environment', area: 'Matter in our World', size: 3, title: 'Our chemical environment: climate, water, lithium-ion cells and carbon allotropes' }),
    topic({ id: 'ch-investigation', area: 'Nature of science', size: 2, title: 'Working scientifically: research, design, data and evaluation' }),
  ],
}
