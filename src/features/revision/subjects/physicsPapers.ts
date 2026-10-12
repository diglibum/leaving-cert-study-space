import type { PaperPart } from '../types'

/**
 * Parts of the two SEC sample papers for the new Leaving Certificate Physics
 * specification (Higher Level, first examined in 2027), mapped to study topics.
 * There are no past papers for this specification yet. Each entry only points
 * to a question in the official sample paper; the summaries are written for
 * this app and are not exam wording. The sample papers are marked 2027 so they
 * sort first.
 */
export const physicsPaperParts: readonly PaperPart[] = [
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'a', topics: ['ph-light'], summary: 'use mirror and lens models to predict image position and image changes' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'b', topics: ['ph-circuits'], summary: 'calculate equivalent resistance and compare currents in simple bulb circuits' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'c', topics: ['ph-motion', 'ph-forces-momentum', 'ph-circular-gravity'], summary: 'compare scalars and vectors, then analyse forces in a loop and a lift' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'd', topics: ['ph-circular-gravity'], summary: 'calculate gravitational field strength and escape velocity, then discuss launch height' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'e', topics: ['ph-magnetism'], summary: 'sketch a solenoid field and predict how to strengthen it' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'f', topics: ['ph-nuclear'], summary: 'calculate nuclear binding energy for copper-63' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 2, part: 'a', topics: ['ph-measurement', 'ph-circuits'], summary: 'design a bulb I-V experiment, assess error bars, and explain non-ohmic conduction' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 2, part: 'b', topics: ['ph-electronics', 'ph-quantum'], summary: 'identify forward bias and calculate LED photon energy and emission rate' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 2, part: 'c', topics: ['ph-magnetism'], summary: 'relate wheel generator orientation and flux change to induced emf' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 3, part: '', topics: ['ph-heat', 'ph-light', 'ph-energy'], summary: 'analyse heat loss, U-values, solar irradiance and water heating by solar panels' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 4, part: 'a', topics: ['ph-forces-momentum', 'ph-energy', 'ph-measurement'], summary: 'use spring data to verify Hooke\'s law and derive stored energy' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 4, part: 'b', topics: ['ph-energy', 'ph-forces-momentum'], summary: 'link spring motion positions to energy graphs and spring stiffness' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 5, part: 'a', topics: ['ph-quantum', 'ph-electric-fields'], summary: 'explain the photoelectric tube and relate fields, graphs, and stopping potential' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 5, part: 'b', topics: ['ph-quantum'], summary: 'compare emitted electron speeds for different radiation frequencies and intensities' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 5, part: 'c', topics: ['ph-quantum', 'ph-astronomy'], summary: 'contrast atomic models and rank wavelengths from electron transitions' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 6, part: 'a', topics: ['ph-waves', 'ph-light'], summary: 'explain microwave diffraction, interference peaks, and polarising grid behaviour' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 6, part: 'b', topics: ['ph-electronics', 'ph-circuits'], summary: 'show how a transistor switch works and infer sensor circuit thresholds' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 7, part: 'a', topics: ['ph-electric-fields'], summary: 'interpret electric fields, forces, induction charging, and field strength changes' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 7, part: 'b', topics: ['ph-nuclear', 'ph-forces-momentum'], summary: 'write beta decay, compare recoil speeds, and use carbon-14 dating' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'a', topics: ['ph-waves', 'ph-measurement'], summary: 'analyse string harmonics and frequency changes for a stretched string' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'b', topics: ['ph-energy', 'ph-motion'], summary: 'predict how wind speed changes turbine power and kinetic energy' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'c', topics: ['ph-measurement'], summary: 'compare instrument readings and judge percentage error, accuracy and precision' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'd', topics: ['ph-particles'], summary: 'explain proton quark content and deduce its charge from quarks' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'e', topics: ['ph-heat', 'ph-energy'], summary: 'interpret heating curves and calculate the final temperature after melting ice' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'f', topics: ['ph-electric-fields'], summary: 'explain electron deflection between plates and predict the changed path' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 2, part: 'a', topics: ['ph-astronomy', 'ph-quantum'], summary: 'explain line spectra, element identification and Doppler-shifted stellar lines' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 2, part: 'b', topics: ['ph-waves', 'ph-circular-gravity'], summary: 'interpret Doppler data for a rotating speaker and calculate its speed and tension' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 2, part: 'c', topics: ['ph-waves'], summary: 'use ultrasound Doppler shift to find blood speed and assess medical imaging' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 3, part: 'a', topics: ['ph-electric-fields', 'ph-circuits', 'ph-energy'], summary: 'explain lightning-conductor charging and calculate charge flow, resistance and stored energy' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 3, part: 'b', topics: ['ph-circular-gravity', 'ph-measurement'], summary: 'test Kepler\'s law for Saturn\'s moons and estimate Saturn\'s mass' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 4, part: 'a', topics: ['ph-nuclear', 'ph-magnetism', 'ph-energy'], summary: 'compare fission with fusion and analyse energy output and magnetic deflection' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 4, part: 'b', topics: ['ph-particles', 'ph-nuclear'], summary: 'interpret particle-interaction diagrams and beta decay using the standard model' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 5, part: '', topics: ['ph-light'], summary: 'calculate refraction quantities and explain dispersion, critical angle and lens rays' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 6, part: '', topics: ['ph-circuits', 'ph-measurement', 'ph-energy'], summary: 'derive parallel resistance and analyse bulb currents, resistance and energy use' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 7, part: '', topics: ['ph-motion', 'ph-forces-momentum', 'ph-energy'], summary: 'graph cart motion and apply momentum and spring-energy conservation' },
]
