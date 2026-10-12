import type { RevisionSubject, RevisionTopic } from '../types'
import { hasBiologyProblems } from '../problems/biologyProblems'
import { biologyPaperParts } from './biologyPapers'
import { biologyRecall } from './biologyRecall'

type TopicInput = Omit<RevisionTopic, 'higherOnly'> & { higherOnly?: boolean }

function topic(input: TopicInput): RevisionTopic {
  return { higherOnly: false, recall: biologyRecall[input.id], hasProblems: hasBiologyProblems(input.id), ...input }
}

/**
 * Topics follow the units of the new Leaving Certificate Biology specification,
 * first examined in 2027: Organisation of Life, Structures and Processes of
 * Life, and Interactions of Life. Unit 2.6 is split into four topics because it
 * covers membrane transport, kidneys, digestion, breathing, circulation and
 * plants. The unifying strand, Nature of Science, is grouped into one revision
 * topic because its learning outcomes apply across the whole course. The
 * written paper is 60% of the marks; the Practice Investigation (40%) is not
 * part of this plan. The only papers for this specification are the two SEC
 * sample papers.
 */
export const biology: RevisionSubject = {
  id: 'biology',
  name: 'Biology',
  paperParts: biologyPaperParts,
  choiceNote:
    'In the written exam you answer Question 1 and any five other questions, 50 marks each. The Practice Investigation (40% of the marks) is done in school and is not part of this plan.',
  formulaeBooklet: false,
  // 150 minutes for 6 questions of 50 marks.
  minutesPerQuestion: 25,
  topics: [
    topic({ id: 'bi-cells', area: 'Organisation of Life', size: 2, title: 'Cells: organelles, microscopy and magnification' }),
    topic({ id: 'bi-biomolecules', area: 'Organisation of Life', size: 3, title: 'Biomolecules, minerals, vitamins and food tests' }),
    topic({ id: 'bi-life-classification', area: 'Organisation of Life', size: 2, title: 'Characteristics of life, viruses, domains and classification' }),
    topic({ id: 'bi-enzymes', area: 'Structures and Processes of Life', size: 2, title: 'Enzymes and the factors that affect them' }),
    topic({ id: 'bi-photo-resp', area: 'Structures and Processes of Life', size: 3, title: 'Photosynthesis and respiration' }),
    topic({ id: 'bi-cell-division', area: 'Structures and Processes of Life', size: 3, title: 'Cell division, protein synthesis, mutations and cancer' }),
    topic({ id: 'bi-inheritance', area: 'Organisation of Life', size: 3, title: 'Genetic inheritance, chromosomes and epigenetics' }),
    topic({ id: 'bi-evolution', area: 'Organisation of Life', size: 2, title: 'Evolution, natural selection and the evidence' }),
    topic({ id: 'bi-osmosis-urinary', area: 'Structures and Processes of Life', size: 2, title: 'Membrane transport, osmosis and the urinary system' }),
    topic({ id: 'bi-digestion-gases', area: 'Structures and Processes of Life', size: 3, title: 'Digestion, diet and gas exchange' }),
    topic({ id: 'bi-circulation', area: 'Structures and Processes of Life', size: 2, title: 'The heart, blood vessels and blood' }),
    topic({ id: 'bi-plant-transport', area: 'Structures and Processes of Life', size: 2, title: 'Plant tissues, transport and transpiration' }),
    topic({ id: 'bi-response', area: 'Structures and Processes of Life', size: 3, title: 'Response: nervous, endocrine, immune, musculoskeletal and plant systems' }),
    topic({ id: 'bi-reproduction', area: 'Structures and Processes of Life', size: 3, title: 'Human and plant reproduction' }),
    topic({ id: 'bi-ecology', area: 'Interactions of Life', size: 3, title: 'Ecology, biodiversity and ecosystems' }),
    topic({ id: 'bi-microorganisms', area: 'Interactions of Life', size: 3, title: 'Microorganisms, microbiomes and nutrient cycles' }),
    topic({ id: 'bi-genetic-engineering', area: 'Interactions of Life', size: 2, title: 'Genetic engineering, DNA profiling and sequencing' }),
    topic({ id: 'bi-investigation', area: 'Nature of Science', size: 3, title: 'Nature of Science: investigations, models and evaluating evidence' }),
  ],
}
