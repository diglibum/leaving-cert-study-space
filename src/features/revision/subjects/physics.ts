import type { RevisionSubject, RevisionTopic } from '../types'
import { hasPhysicsProblems } from '../problems/physicsProblems'
import { physicsPaperParts } from './physicsPapers'
import { physicsRecall } from './physicsRecall'

type TopicInput = Omit<RevisionTopic, 'higherOnly'> & { higherOnly?: boolean }

function topic(input: TopicInput): RevisionTopic {
  return { higherOnly: false, recall: physicsRecall[input.id], hasProblems: hasPhysicsProblems(input.id), ...input }
}

/**
 * Topics follow the four strands of the new Leaving Certificate Physics
 * specification, first examined in 2027: Forces and Motion, Wave Motion and
 * Energy Transfer, Electric and Magnetic Fields, and Modern Physics, plus the
 * unifying strand on the nature of science. This list was fully checked
 * against the specification text (U1-U4 and units 1.1-4.6), the equations
 * page and the two SEC sample papers. Out-of-spec content such as moments, gas
 * laws, relativity, Hubble's law and capacitors is left out or reworded.
 * Revision runs from scientific inquiry and mechanics through waves and
 * electricity to modern physics. The written paper is 60% of the marks; the
 * Practice Investigation (40%) is not part of this plan.
 */
export const physics: RevisionSubject = {
  id: 'physics',
  name: 'Physics',
  paperParts: physicsPaperParts,
  choiceNote:
    'In the written exam you answer Question 1 and any five other questions, 50 marks each. The Practice Investigation (40% of the marks) is done in school and is not part of this plan.',
  // 150 minutes for 6 questions of 50 marks.
  minutesPerQuestion: 25,
  topics: [
    topic({ id: 'ph-measurement', area: 'Nature of science', size: 2, title: 'Scientific inquiry, measurement and models' }),
    topic({ id: 'ph-motion', area: 'Forces and Motion', size: 3, title: 'Kinematics, vectors and motion graphs' }),
    topic({ id: 'ph-forces-momentum', area: 'Forces and Motion', size: 3, title: 'Forces, pressure, density, momentum and Hooke\u2019s law' }),
    topic({ id: 'ph-energy', area: 'Forces and Motion', size: 3, title: 'Work, power, energy and conservation' }),
    topic({ id: 'ph-circular-gravity', area: 'Forces and Motion', size: 3, title: 'Gravitation, escape speed and circular motion' }),
    topic({ id: 'ph-heat', area: 'Wave Motion and Energy Transfer', size: 2, title: 'Temperature, heat, latent heat and insulation' }),
    topic({ id: 'ph-waves', area: 'Wave Motion and Energy Transfer', size: 3, title: 'Wave motion, sound, stationary waves and Doppler effect' }),
    topic({ id: 'ph-light', area: 'Wave Motion and Energy Transfer', size: 3, title: 'Reflection, refraction, lenses and electromagnetic radiation' }),
    topic({ id: 'ph-electric-fields', area: 'Electric and Magnetic Fields', size: 3, title: 'Charge interactions, electric fields and potential' }),
    topic({ id: 'ph-circuits', area: 'Electric and Magnetic Fields', size: 3, title: 'Current electricity, mains safety and power' }),
    topic({ id: 'ph-magnetism', area: 'Electric and Magnetic Fields', size: 3, title: 'Magnetic fields, motors, induction and transformers' }),
    topic({ id: 'ph-electronics', area: 'Electric and Magnetic Fields', size: 2, title: 'Semiconductors, diodes, sensors and transistors' }),
    topic({ id: 'ph-quantum', area: 'Modern Physics', size: 3, title: 'Electrons, photoelectric emission, X-rays and atoms' }),
    topic({ id: 'ph-nuclear', area: 'Modern Physics', size: 3, title: 'Radioactivity, nuclear stability, fission and fusion' }),
    topic({ id: 'ph-particles', area: 'Modern Physics', size: 2, title: 'Mass-energy, fundamental particles and forces' }),
    topic({ id: 'ph-astronomy', area: 'Modern Physics', size: 2, title: 'Emission spectra and Doppler applications' }),
  ],
}
