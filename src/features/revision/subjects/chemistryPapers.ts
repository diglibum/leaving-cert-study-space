import type { PaperPart } from '../types'

/**
 * Parts of the two SEC sample papers for the new Leaving Certificate Chemistry
 * specification (Higher Level, first examined in 2027), mapped to study topics.
 * There are no past papers for this specification yet. Each entry only points
 * to a question in the official sample paper; the summaries are written for
 * this app and are not exam wording. The sample papers are marked 2027 so they
 * sort first.
 */
export const chemistryPaperParts: readonly PaperPart[] = [
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'a', topics: ['ch-atomic-structure'], summary: 'interpret emission spectrum quantities and identify elements from spectral lines' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'b', topics: ['ch-thermochemistry'], summary: 'combine enthalpy equations with Hess\'s law to find reaction enthalpy' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'c', topics: ['ch-periodic-table', 'ch-atomic-structure'], summary: 'define first ionisation energy and explain second-period trend exceptions' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'd', topics: ['ch-imf-shapes', 'ch-bonding', 'ch-organic'], summary: 'show dipoles and intermolecular attractions allowing propanone to mix with water' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 1, part: 'e', topics: ['ch-investigation', 'ch-mole', 'ch-volumetric'], summary: 'plan an exact-volume iron(II) solution preparation from iron tablets' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 2, part: 'a', topics: ['ch-organic', 'ch-imf-shapes'], summary: 'name alcohol isomers, classify them, and explain bent oxygen geometry' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 2, part: 'b', topics: ['ch-organic'], summary: 'predict esterification products, draw the ester, and justify using reflux' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 2, part: 'c', topics: ['ch-organic', 'ch-imf-shapes'], summary: 'describe soap production from esters and explain surfactant action' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 3, part: 'a', topics: ['ch-bonding', 'ch-atomic-structure', 'ch-imf-shapes'], summary: 'justify ionic bonding, write chloride ion configuration, and explain solubility' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 3, part: 'b', topics: ['ch-electrochemistry'], summary: 'identify electrode products and explain oxidation-reduction in a galvanic cell' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 3, part: 'c', topics: ['ch-stoichiometry', 'ch-mole', 'ch-acids-bases'], summary: 'use neutralisation stoichiometry to calculate masses, volumes, and solution concentration' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 4, part: 'a', topics: ['ch-rates', 'ch-investigation'], summary: 'calculate reaction rates from a graph and evaluate catalyst effectiveness' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 4, part: 'b', topics: ['ch-mole', 'ch-stoichiometry', 'ch-gases'], summary: 'convert solution strength into moles and oxygen gas volume' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 4, part: 'c', topics: ['ch-electrochemistry'], summary: 'assign oxidation numbers and balance a redox equation involving peroxide' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 5, part: 'a', topics: ['ch-environment'], summary: 'explain flocculation, microplastic contamination, UV treatment, and why UV can be preferred to chlorination' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 5, part: 'b', topics: ['ch-environment'], summary: 'describe how water treatment can cut emissions through cleaner energy' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 5, part: 'c', topics: ['ch-equilibrium', 'ch-acids-bases'], summary: 'work with acid dissociation equilibrium, Kc, and shifts in pH' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 6, part: 'a', topics: ['ch-acids-bases', 'ch-volumetric', 'ch-investigation'], summary: 'compare acid-base behaviour and interpret titration curves and measurements' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 6, part: 'b', topics: ['ch-volumetric', 'ch-acids-bases', 'ch-mole'], summary: 'use titration data to find moles, concentration, and weak-acid pH' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 7, part: 'a', topics: ['ch-hydrocarbons', 'ch-thermochemistry', 'ch-rates'], summary: 'draw and compare butene isomers, combustion, and isomerisation energy' },
  { year: 2027, paper: 1, label: 'Sample paper 1', question: 7, part: 'b', topics: ['ch-hydrocarbons', 'ch-organic', 'ch-investigation'], summary: 'describe ethene preparation, its oxidation test, and chlorine addition mechanism' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'a', topics: ['ch-bonding', 'ch-periodic-table', 'ch-atomic-structure'], summary: 'predict bonding, formula, and electron arrangement for beryllium fluoride' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'b', topics: ['ch-thermochemistry'], summary: 'define bond enthalpy and calculate methane combustion enthalpy from bond energies' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'c', topics: ['ch-environment'], summary: 'explain how the carbon cycle influences natural and enhanced greenhouse warming' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'd', topics: ['ch-atomic-structure'], summary: 'use boron isotope data to find neutrons, average mass, and non-whole isotope masses' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 1, part: 'e', topics: ['ch-organic', 'ch-hydrocarbons'], summary: 'describe free-radical chlorination steps and identify a termination hydrocarbon product' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 2, part: 'a', topics: ['ch-environment', 'ch-investigation', 'ch-electrochemistry'], summary: 'interpret emissions data, judge source reliability, and determine nitrogen oxidation numbers' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 2, part: 'b', topics: ['ch-atomic-structure', 'ch-stoichiometry', 'ch-acids-bases', 'ch-bonding'], summary: 'work with a fertiliser formula, ion structure, ammonium behaviour, and a nitrate test' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 2, part: 'c', topics: ['ch-equilibrium', 'ch-thermochemistry'], summary: 'use temperature evidence and Kc to analyse the nitrogen dioxide equilibrium' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 3, part: 'a', topics: ['ch-hydrocarbons', 'ch-investigation'], summary: 'analyse ethene preparation apparatus, safety, and combustion behaviour in the laboratory' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 3, part: 'b', topics: ['ch-organic', 'ch-environment'], summary: 'name and draw poly(ethene), then link its chemical stability to non-biodegradability' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 3, part: 'c', topics: ['ch-hydrocarbons'], summary: 'draw and name four structural or geometric alkene isomers of C4H8' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 4, part: '', topics: ['ch-volumetric', 'ch-acids-bases', 'ch-organic'], summary: 'analyse a vinegar titration, including burette work, curve interpretation, standardisation, calculations, and the acidity of ethanoic acid' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 5, part: 'a', topics: ['ch-organic'], summary: 'identify the primary, secondary, and tertiary alcohol groups in a molecule' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 5, part: 'b', topics: ['ch-organic'], summary: 'state the oxidation products formed from different classes of alcohols' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 5, part: 'c', topics: ['ch-organic', 'ch-rates'], summary: 'identify a reagent and catalyst, then explain surface-adsorption catalysis' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 5, part: 'd', topics: ['ch-organic', 'ch-acids-bases'], summary: 'show alcohol acidity, draw an ester, and name ester isomers' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 5, part: 'e', topics: ['ch-gases', 'ch-mole'], summary: 'use gas data to calculate the mass of propan-1-ol vapour' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 6, part: 'a', topics: ['ch-electrochemistry', 'ch-environment'], summary: 'explain lithium-ion cell structure, reactions, and one environmental consequence' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 6, part: 'b', topics: ['ch-organic', 'ch-stoichiometry', 'ch-investigation'], summary: 'analyse alcohol oxidation conditions, purity checking, and percentage yield' },
  { year: 2027, paper: 2, label: 'Sample paper 2', question: 7, part: '', topics: ['ch-rates', 'ch-investigation', 'ch-stoichiometry', 'ch-thermochemistry', 'ch-bonding'], summary: 'interpret a mass-loss investigation using stoichiometry, graphing, energy change, and ion tests' },
]
