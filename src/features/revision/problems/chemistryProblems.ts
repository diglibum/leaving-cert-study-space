import { createRng, int, pick, round } from './rng'
import type { PracticeProblem, ProblemBody, ProblemGenerator, ProblemPart, Rng } from './types'

/*
 * Original practice problems for Leaving Certificate Chemistry (Higher). They
 * are written for this app, not copied or adapted from any exam paper. Numbers
 * come from a seed and every answer is computed in code. Each statement lists
 * the relative atomic masses and constants it needs, so the learner does not
 * need a book open (in the exam the Formulae and Tables booklet gives them).
 */

const show = (value: number, decimals = 4) => String(Number(value.toFixed(decimals)))

function part(label: string, prompt: string, value: number, unit: string, decimals: number): ProblemPart {
  return { label, prompt, answer: round(value, decimals), unit, decimals }
}

const AR: Record<string, number> = {
  H: 1, C: 12, N: 14, O: 16, F: 19, Na: 23, Mg: 24, Al: 27, P: 31, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 63.5, Zn: 65, Br: 80, I: 127,
}

const arNote = (symbols: readonly string[]) => `Relative atomic masses: ${symbols.map((s) => `${s} = ${AR[s]}`).join(', ')}.`

/** Molar mass from element counts, for example { C: 2, H: 6, O: 1 }. */
function molarMass(counts: Record<string, number>): number {
  return Object.entries(counts).reduce((sum, [symbol, n]) => sum + AR[symbol] * n, 0)
}

const AVOGADRO = 6.022
const MOLAR_VOLUME = 22.4
const GAS_CONSTANT = 8.31

const compounds = [
  { name: 'sodium chloride', formula: 'NaCl', counts: { Na: 1, Cl: 1 } },
  { name: 'calcium carbonate', formula: 'CaCO3', counts: { Ca: 1, C: 1, O: 3 } },
  { name: 'glucose', formula: 'C6H12O6', counts: { C: 6, H: 12, O: 6 } },
  { name: 'sulfuric acid', formula: 'H2SO4', counts: { H: 2, S: 1, O: 4 } },
  { name: 'ammonia', formula: 'NH3', counts: { N: 1, H: 3 } },
  { name: 'ethanol', formula: 'C2H5OH', counts: { C: 2, H: 6, O: 1 } },
  { name: 'magnesium chloride', formula: 'MgCl2', counts: { Mg: 1, Cl: 2 } },
  { name: 'sodium hydroxide', formula: 'NaOH', counts: { Na: 1, O: 1, H: 1 } },
] as const

const elementsOf = (counts: Record<string, number>) => Object.keys(counts)

function matter(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const m1 = int(rng, 8, 30) * 0.5 + 10
    const lost = round(m1 * 0.44, 2)
    const remaining = round(m1 - lost, 2)
    const molesCo2 = lost / 44
    return {
      statement: `${show(m1, 2)} g of pure calcium carbonate is heated strongly in an open crucible until it has all decomposed to calcium oxide. CaCO3 -> CaO + CO2. The solid left has a mass of ${show(remaining, 2)} g. ${arNote(['C', 'O'])}`,
      parts: [
        part('(a)', 'Find the mass lost, in g, as carbon dioxide escaped.', lost, 'g', 2),
        part('(b)', 'Find the moles of carbon dioxide released (M = 44 g/mol).', molesCo2, 'mol', 3),
        part('(c)', 'Find the volume this gas would occupy at STP, in litres (molar volume 22.4 L/mol).', molesCo2 * MOLAR_VOLUME, 'L', 2),
      ],
      solution: [
        `Mass is conserved overall. The solid loses the gas that escapes: ${show(m1, 2)} - ${show(remaining, 2)} = ${show(lost, 2)} g.`,
        `Moles = mass / molar mass = ${show(lost, 2)} / 44 = ${show(molesCo2, 3)} mol.`,
        `Volume at STP = moles x 22.4 = ${show(molesCo2 * MOLAR_VOLUME, 2)} L.`,
      ],
    }
  }
  const mass = int(rng, 20, 90) + 0.5
  const volume = int(rng, 10, 40) + 0.5
  const density = mass / volume
  const other = int(rng, 15, 80)
  return {
    statement: `A sample of a pure liquid has a mass of ${show(mass, 1)} g and a volume of ${show(volume, 1)} cm^3.`,
    parts: [
      part('(a)', 'Find the density, in g/cm^3.', density, 'g/cm^3', 3),
      part('(b)', `Find the mass of ${other} cm^3 of the same liquid.`, density * other, 'g', 2),
      part('(c)', 'Find the volume of 100 g of the liquid, in cm^3.', 100 / density, 'cm^3', 1),
    ],
    solution: [
      `Density = mass / volume = ${show(mass, 1)} / ${show(volume, 1)} = ${show(density, 3)} g/cm^3.`,
      `Mass = density x volume = ${show(density, 3)} x ${other} = ${show(density * other, 2)} g.`,
      `Volume = mass / density = 100 / ${show(density, 3)} = ${show(100 / density, 1)} cm^3.`,
    ],
  }
}

function atomicStructure(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.34) {
    const a = int(rng, 20, 80)
    const b = a + pick(rng, [1, 2, 2, 3])
    const pa = int(rng, 40, 85)
    const mean = (a * pa + b * (100 - pa)) / 100
    return {
      statement: `An element X has two isotopes, X-${a} and X-${b}. In a natural sample, ${pa}% of the atoms are X-${a} and ${100 - pa}% are X-${b}.`,
      parts: [
        part('(a)', 'Find the relative atomic mass of the element, to two decimal places.', mean, '', 2),
        part('(b)', `Find the number of neutrons in X-${b} if the atomic number is ${Math.floor(a / 2)}.`, b - Math.floor(a / 2), '', 0),
      ],
      solution: [
        `Relative atomic mass = (${a} x ${pa} + ${b} x ${100 - pa}) / 100 = ${show(mean, 2)}.`,
        `Neutrons = mass number - atomic number = ${b} - ${Math.floor(a / 2)} = ${b - Math.floor(a / 2)}.`,
      ],
    }
  }
  if (roll < 0.67) {
    const upper = int(rng, 30, 60) / 10
    const lower = int(rng, 5, 25) / 10
    const energy = upper - lower
    const h = 6.63
    const c = 3.0
    const frequency = (energy * 1e-19) / (h * 1e-34) / 1e14
    const wavelength = ((c * 1e8) / (frequency * 1e14)) * 1e9
    return {
      statement: `An electron in a hydrogen-like atom falls from an energy level with energy ${show(upper, 1)} x 10^-19 J to a lower level with energy ${show(lower, 1)} x 10^-19 J, and a photon is emitted. Em - En = hf. Planck constant h = 6.63 x 10^-34 J s, speed of light c = 3.00 x 10^8 m/s.`,
      parts: [
        part('(a)', 'Find the energy of the photon, in units of 10^-19 J.', energy, 'x 10^-19 J', 1),
        part('(b)', 'Find the frequency of the photon, in units of 10^14 Hz, to two decimal places.', frequency, 'x 10^14 Hz', 2),
        part('(c)', 'Find the wavelength of the photon, in nm, to the nearest nm.', wavelength, 'nm', 0),
      ],
      solution: [
        `Energy of photon = ${show(upper, 1)} - ${show(lower, 1)} = ${show(energy, 1)} x 10^-19 J.`,
        `f = E / h = ${show(energy, 1)} x 10^-19 / 6.63 x 10^-34 = ${show(frequency, 2)} x 10^14 Hz.`,
        `Wavelength = c / f = 3.00 x 10^8 / ${show(frequency, 2)} x 10^14 = ${show(wavelength, 0)} nm.`,
      ],
    }
  }
  const atomicNumber = int(rng, 8, 30)
  const neutrons = atomicNumber + int(rng, 0, 8)
  const charge = pick(rng, [-3, -2, -1, 1, 2, 3])
  return {
    statement: `A particle has ${atomicNumber} protons and ${neutrons} neutrons, and it has an overall charge of ${charge > 0 ? '+' : '-'}${Math.abs(charge)}.`,
    parts: [
      part('(a)', 'Find the mass number.', atomicNumber + neutrons, '', 0),
      part('(b)', 'Find the number of electrons.', atomicNumber - charge, '', 0),
    ],
    solution: [
      `Mass number = protons + neutrons = ${atomicNumber} + ${neutrons} = ${atomicNumber + neutrons}.`,
      `Electrons = protons - charge = ${atomicNumber} - (${charge}) = ${atomicNumber - charge}.`,
    ],
  }
}

function periodicTable(rng: Rng): ProblemBody {
  const group = int(rng, 1, 3)
  const values: number[] = [int(rng, 400, 900)]
  for (let k = 1; k < 5; k += 1) {
    const factor = k === group ? 4.5 + rng() * 2 : k < group ? 1.6 + rng() * 0.5 : 1.15 + rng() * 0.3
    values.push(Math.round(values[k - 1] * factor))
  }
  const jump = values[group] / values[group - 1]
  return {
    statement: `The first five successive ionisation energies of an element (not a real element's data) are ${values.join(', ')} kJ/mol.`,
    parts: [
      part('(a)', 'After which ionisation (1st, 2nd, 3rd ...) does the energy jump most? Give the number.', group, '', 0),
      part('(b)', 'How many electrons are in the outer shell of the element?', group, '', 0),
      part('(c)', 'By what factor does the energy rise across the biggest jump, to one decimal place?', jump, '', 1),
    ],
    solution: [
      `Divide each value by the one before it. The largest ratio is between ionisations ${group} and ${group + 1}.`,
      `A big jump shows that the next electron comes from a new, inner shell, so the outer shell holds ${group} electron${group === 1 ? '' : 's'}.`,
      `${values[group]} / ${values[group - 1]} = ${show(jump, 1)}.`,
    ],
  }
}

function mole(rng: Rng): ProblemBody {
  const roll = rng()
  const compound = pick(rng, compounds)
  const M = molarMass(compound.counts)
  const note = arNote(elementsOf(compound.counts))
  if (roll < 0.4) {
    const mass = int(rng, 20, 400) / 10
    const moles = mass / M
    const molecules = moles * AVOGADRO
    const element = elementsOf(compound.counts)[0]
    const atomsPer = (compound.counts as Record<string, number>)[element]
    return {
      statement: `A sample of ${compound.name}, ${compound.formula}, has a mass of ${show(mass, 1)} g. ${note} Avogadro constant = 6.022 x 10^23 per mole.`,
      parts: [
        part('(a)', 'Find the molar mass, in g/mol.', M, 'g/mol', 1),
        part('(b)', 'Find the number of moles in the sample.', moles, 'mol', 3),
        part('(c)', `Find the number of ${element} atoms in the sample, in units of 10^23.`, molecules * atomsPer, 'x 10^23', 2),
      ],
      solution: [
        `M(${compound.formula}) = ${elementsOf(compound.counts).map((s) => `${(compound.counts as Record<string, number>)[s]} x ${AR[s]}`).join(' + ')} = ${show(M, 1)} g/mol.`,
        `Moles = mass / M = ${show(mass, 1)} / ${show(M, 1)} = ${show(moles, 3)} mol.`,
        `${element} atoms = moles x 6.022 x 10^23 x ${atomsPer} = ${show(molecules * atomsPer, 2)} x 10^23.`,
      ],
    }
  }
  if (roll < 0.75) {
    const mass = int(rng, 20, 250) / 10
    const volume = pick(rng, [100, 200, 250, 500])
    const moles = mass / M
    const conc = (moles * 1000) / volume
    const target = Math.round((conc / pick(rng, [2, 4, 5])) * 1000) / 1000
    const dilutionVolume = ((target * 250) / conc)
    return {
      statement: `${show(mass, 1)} g of ${compound.name}, ${compound.formula}, is dissolved in water and made up to ${volume} cm^3 of solution. ${note}`,
      parts: [
        part('(a)', 'Find the concentration, in mol/L.', conc, 'mol/L', 3),
        part('(b)', 'Find the concentration, in g/L.', (mass * 1000) / volume, 'g/L', 1),
        part('(c)', `What volume of this solution, in cm^3, must be diluted to 250 cm^3 to give a solution of concentration ${show(target, 3)} mol/L?`, dilutionVolume, 'cm^3', 1),
      ],
      solution: [
        `Moles = ${show(mass, 1)} / ${show(M, 1)} = ${show(moles, 3)} mol in ${volume} cm^3, so concentration = ${show(moles, 3)} x 1000 / ${volume} = ${show(conc, 3)} mol/L.`,
        `Grams per litre = ${show(mass, 1)} x 1000 / ${volume} = ${show((mass * 1000) / volume, 1)} g/L.`,
        `Dilution: C1 x V1 = C2 x V2, so V1 = ${show(target, 3)} x 250 / ${show(conc, 3)} = ${show(dilutionVolume, 1)} cm^3.`,
      ],
    }
  }
  const mass = int(rng, 20, 200) / 10
  const gas = pick(rng, [
    { name: 'carbon dioxide', formula: 'CO2', M: 44 },
    { name: 'oxygen', formula: 'O2', M: 32 },
    { name: 'nitrogen', formula: 'N2', M: 28 },
    { name: 'methane', formula: 'CH4', M: 16 },
  ])
  const moles = mass / gas.M
  return {
    statement: `A sample of ${gas.name}, ${gas.formula}, has a mass of ${show(mass, 1)} g. Take M(${gas.formula}) = ${gas.M} g/mol and the molar volume of a gas at STP as 22.4 L/mol.`,
    parts: [
      part('(a)', 'Find the number of moles.', moles, 'mol', 3),
      part('(b)', 'Find the volume at STP, in litres.', moles * MOLAR_VOLUME, 'L', 2),
      part('(c)', 'Find the number of molecules, in units of 10^22.', moles * AVOGADRO * 10, 'x 10^22', 1),
    ],
    solution: [
      `Moles = ${show(mass, 1)} / ${gas.M} = ${show(moles, 3)} mol.`,
      `Volume = ${show(moles, 3)} x 22.4 = ${show(moles * MOLAR_VOLUME, 2)} L.`,
      `Molecules = ${show(moles, 3)} x 6.02 x 10^23 = ${show(moles * AVOGADRO * 10, 1)} x 10^22.`,
    ],
  }
}

function stoichiometry(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.4) {
    const table = [
      { a: 'Mg', b: 'O', na: 1, nb: 1, formula: 'MgO' },
      { a: 'Fe', b: 'O', na: 2, nb: 3, formula: 'Fe2O3' },
      { a: 'Al', b: 'O', na: 2, nb: 3, formula: 'Al2O3' },
      { a: 'Ca', b: 'Cl', na: 1, nb: 2, formula: 'CaCl2' },
      { a: 'Na', b: 'Cl', na: 1, nb: 1, formula: 'NaCl' },
      { a: 'Zn', b: 'S', na: 1, nb: 1, formula: 'ZnS' },
      { a: 'Cu', b: 'O', na: 1, nb: 1, formula: 'CuO' },
    ]
    const c = pick(rng, table)
    const massA = (c.na * AR[c.a] * 10) / 10
    const massB = c.nb * AR[c.b]
    const total = massA + massB
    const pctA = (massA / total) * 100
    const pctB = 100 - pctA
    const molesA = pctA / AR[c.a]
    const molesB = pctB / AR[c.b]
    return {
      statement: `A compound of ${c.a} and ${c.b} contains ${show(pctA, 1)}% ${c.a} and ${show(pctB, 1)}% ${c.b} by mass. ${arNote([c.a, c.b])}`,
      parts: [
        part('(a)', `In 100 g of the compound, find the moles of ${c.a}.`, molesA, 'mol', 3),
        part('(b)', `In 100 g of the compound, find the moles of ${c.b}.`, molesB, 'mol', 3),
        part('(c)', `Find the number of ${c.b} atoms for every ${c.a} atom in the empirical formula, to two decimal places.`, c.nb / c.na, '', 2),
      ],
      solution: [
        `Moles of ${c.a} = ${show(pctA, 1)} / ${AR[c.a]} = ${show(molesA, 3)} mol.`,
        `Moles of ${c.b} = ${show(pctB, 1)} / ${AR[c.b]} = ${show(molesB, 3)} mol.`,
        `Ratio ${c.b} : ${c.a} = ${show(molesB, 3)} / ${show(molesA, 3)} = ${show(c.nb / c.na, 2)}, so the empirical formula is ${c.formula}.`,
      ],
    }
  }
  if (roll < 0.75) {
    const reactions = [
      { text: '2Mg + O2 -> 2MgO', reactant: 'Mg', mR: 24, cR: 2, product: 'MgO', mP: 40, cP: 2, notes: ['Mg', 'O'] },
      { text: 'CaCO3 -> CaO + CO2', reactant: 'CaCO3', mR: 100, cR: 1, product: 'CaO', mP: 56, cP: 1, notes: ['Ca', 'C', 'O'] },
      { text: 'Fe2O3 + 3CO -> 2Fe + 3CO2', reactant: 'Fe2O3', mR: 160, cR: 1, product: 'Fe', mP: 56, cP: 2, notes: ['Fe', 'C', 'O'] },
      { text: '2Na + Cl2 -> 2NaCl', reactant: 'Na', mR: 23, cR: 2, product: 'NaCl', mP: 58.5, cP: 2, notes: ['Na', 'Cl'] },
    ]
    const r = pick(rng, reactions)
    const mass = int(rng, 50, 400) / 10
    const theoretical = (mass / r.mR) * (r.cP / r.cR) * r.mP
    const percent = int(rng, 55, 95)
    const actual = (theoretical * percent) / 100
    return {
      statement: `Consider the reaction ${r.text}. ${show(mass, 1)} g of ${r.reactant} reacts completely (the other reactant is in excess). Take M(${r.reactant}) = ${r.mR} g/mol and M(${r.product}) = ${r.mP} g/mol.`,
      parts: [
        part('(a)', `Find the moles of ${r.reactant} used.`, mass / r.mR, 'mol', 3),
        part('(b)', `Find the theoretical yield of ${r.product}, in g.`, theoretical, 'g', 2),
        part('(c)', `The mass of ${r.product} actually obtained is ${show(actual, 2)} g. Find the percentage yield.`, (round(actual, 2) / theoretical) * 100, '%', 1),
      ],
      solution: [
        `Moles of ${r.reactant} = ${show(mass, 1)} / ${r.mR} = ${show(mass / r.mR, 3)} mol.`,
        `The equation gives ${r.cP} mol ${r.product} per ${r.cR} mol ${r.reactant}, so moles of ${r.product} = ${show((mass / r.mR) * (r.cP / r.cR), 3)}, and mass = ${show(theoretical, 2)} g.`,
        `Percentage yield = actual / theoretical x 100 = ${show(actual, 2)} / ${show(theoretical, 2)} x 100 = ${show((round(actual, 2) / theoretical) * 100, 1)}%.`,
      ],
    }
  }
  const massZn = int(rng, 20, 120) / 10
  const volumeAcid = int(rng, 50, 200)
  const conc = int(rng, 5, 20) / 10
  const molesZn = massZn / 65
  const molesAcid = (conc * volumeAcid) / 1000
  const limitingIsZn = molesZn < molesAcid / 2
  const molesH2 = limitingIsZn ? molesZn : molesAcid / 2
  return {
    statement: `${show(massZn, 1)} g of zinc reacts with ${volumeAcid} cm^3 of hydrochloric acid of concentration ${show(conc, 1)} mol/L. Zn + 2HCl -> ZnCl2 + H2. Take Ar(Zn) = 65 and the molar volume of a gas at STP as 22.4 L/mol.`,
    parts: [
      part('(a)', 'Find the moles of zinc.', molesZn, 'mol', 4),
      part('(b)', 'Find the moles of HCl.', molesAcid, 'mol', 4),
      part('(c)', 'Find the volume of hydrogen, in litres at STP, that is produced.', molesH2 * MOLAR_VOLUME, 'L', 3),
    ],
    solution: [
      `Zn: ${show(massZn, 1)} / 65 = ${show(molesZn, 4)} mol. HCl: ${show(conc, 1)} x ${volumeAcid} / 1000 = ${show(molesAcid, 4)} mol.`,
      `The equation needs 2 mol HCl per mol Zn. The limiting reagent is ${limitingIsZn ? 'zinc' : 'the acid'}.`,
      `Moles of H2 = ${show(molesH2, 4)}, so volume = ${show(molesH2, 4)} x 22.4 = ${show(molesH2 * MOLAR_VOLUME, 3)} L.`,
    ],
  }
}

const ELECTRONEGATIVITY: Record<string, number> = { H: 2.1, C: 2.5, N: 3.0, O: 3.5, F: 4.0, Na: 0.9, Mg: 1.2, Al: 1.5, S: 2.5, Cl: 3.0, K: 0.8, Ca: 1.0, Br: 2.8 }

const lewisTable = [
  { formula: 'H2O', electrons: 8, bonding: 2, lone: 2 },
  { formula: 'NH3', electrons: 8, bonding: 3, lone: 1 },
  { formula: 'CH4', electrons: 8, bonding: 4, lone: 0 },
  { formula: 'HCl', electrons: 8, bonding: 1, lone: 3 },
  { formula: 'CO2', electrons: 16, bonding: 4, lone: 4 },
  { formula: 'N2', electrons: 10, bonding: 3, lone: 2 },
  { formula: 'PCl3', electrons: 26, bonding: 3, lone: 10 },
  { formula: 'CCl4', electrons: 32, bonding: 4, lone: 12 },
  { formula: 'C2H4', electrons: 12, bonding: 6, lone: 0 },
]

function bonding(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const molecule = pick(rng, lewisTable)
    return {
      statement: `Draw the Lewis (dot-and-cross) diagram of ${molecule.formula} so that every atom has an octet (hydrogen has a duet). Count what is in your diagram.`,
      parts: [
        part('(a)', 'How many valence electrons are there in total in the molecule?', molecule.electrons, '', 0),
        part('(b)', 'How many bonding pairs (a double bond counts as 2 pairs)?', molecule.bonding, '', 0),
        part('(c)', 'How many lone pairs in total?', molecule.lone, '', 0),
      ],
      solution: [
        `Add the valence electrons of all atoms in ${molecule.formula}: ${molecule.electrons}.`,
        `Each shared pair is a bonding pair. The diagram has ${molecule.bonding}.`,
        `The remaining electrons form lone pairs: (${molecule.electrons} - 2 x ${molecule.bonding}) / 2 = ${molecule.lone}.`,
      ],
    }
  }
  const pairs: [string, string][] = [['Na', 'Cl'], ['H', 'Cl'], ['C', 'H'], ['O', 'H'], ['K', 'Br'], ['C', 'O'], ['Mg', 'O'], ['H', 'F'], ['N', 'H'], ['Ca', 'Cl']]
  const [x, y] = pick(rng, pairs)
  const diff = Math.abs(ELECTRONEGATIVITY[x] - ELECTRONEGATIVITY[y])
  const kind = diff >= 1.8 ? 'ionic' : diff >= 0.4 ? 'polar covalent' : 'non-polar (pure) covalent'
  return {
    statement: `Pauling electronegativities: ${x} = ${ELECTRONEGATIVITY[x]}, ${y} = ${ELECTRONEGATIVITY[y]}. Use the rough guide: a difference of 1.8 or more is ionic, 0.4 to 1.7 is polar covalent, and below 0.4 is non-polar covalent.`,
    parts: [
      part('(a)', `Find the difference in electronegativity between ${x} and ${y}, to one decimal place.`, diff, '', 1),
      part('(b)', 'Type 1 if the bond is ionic, 2 if polar covalent and 3 if non-polar covalent.', kind === 'ionic' ? 1 : kind === 'polar covalent' ? 2 : 3, '', 0),
    ],
    solution: [
      `${Math.max(ELECTRONEGATIVITY[x], ELECTRONEGATIVITY[y])} - ${Math.min(ELECTRONEGATIVITY[x], ELECTRONEGATIVITY[y])} = ${show(diff, 1)}.`,
      `${show(diff, 1)} puts the bond in the ${kind} range, so the answer to (b) is ${kind === 'ionic' ? 1 : kind === 'polar covalent' ? 2 : 3}.`,
    ],
  }
}

const shapes = [
  { formula: 'CH4', pairs: 4, lone: 0, angle: 109.5, shape: 'tetrahedral' },
  { formula: 'NH3', pairs: 4, lone: 1, angle: 107, shape: 'pyramidal' },
  { formula: 'H2O', pairs: 4, lone: 2, angle: 104.5, shape: 'bent' },
  { formula: 'BF3', pairs: 3, lone: 0, angle: 120, shape: 'trigonal planar' },
  { formula: 'BeCl2', pairs: 2, lone: 0, angle: 180, shape: 'linear' },
]

function intermolecularForces(rng: Rng): ProblemBody {
  const s = pick(rng, shapes)
  return {
    statement: `Use the VSEPR theory (electron pairs around the central atom repel as far apart as possible) on the molecule ${s.formula}.`,
    parts: [
      part('(a)', 'How many pairs of electrons are around the central atom?', s.pairs, '', 0),
      part('(b)', 'How many of these are lone pairs?', s.lone, '', 0),
      part('(c)', 'Give the approximate bond angle, in degrees.', s.angle, 'degrees', 1),
    ],
    solution: [
      `The central atom of ${s.formula} has ${s.pairs} pairs of electrons: bonding pairs plus lone pairs.`,
      `Of these ${s.lone} ${s.lone === 1 ? 'is a lone pair' : 'are lone pairs'}, and the shape is ${s.shape}.`,
      `Lone pairs push bonding pairs closer, so the angle is about ${s.angle} degrees.`,
    ],
  }
}

function gases(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.5) {
    const n = int(rng, 5, 40) / 10
    const celsius = int(rng, 0, 100)
    const pressure = int(rng, 80, 300)
    const kelvin = celsius + 273
    const volume = (n * GAS_CONSTANT * kelvin) / pressure
    return {
      statement: `${show(n, 1)} mol of an ideal gas is at ${celsius} degrees C and a pressure of ${pressure} kPa. PV = nRT with R = 8.31 J/(mol K). With the pressure in kPa, the volume comes out in litres.`,
      parts: [
        part('(a)', 'Convert the temperature to kelvin.', kelvin, 'K', 0),
        part('(b)', 'Find the volume of the gas, in litres.', volume, 'L', 2),
        part('(c)', 'The gas is compressed to half that volume at the same temperature. Find the new pressure, in kPa.', pressure * 2, 'kPa', 0),
      ],
      solution: [
        `T = ${celsius} + 273 = ${kelvin} K.`,
        `V = nRT / P = ${show(n, 1)} x 8.31 x ${kelvin} / ${pressure} = ${show(volume, 2)} L.`,
        `At constant temperature and amount, P x V is constant, so halving the volume doubles the pressure: ${pressure * 2} kPa.`,
      ],
    }
  }
  const mass = int(rng, 10, 80) / 10
  const molar = pick(rng, [16, 28, 32, 44, 64, 71])
  const celsius = int(rng, 10, 60)
  const kelvin = celsius + 273
  const pressure = int(rng, 90, 200)
  const n = mass / molar
  const volume = (n * GAS_CONSTANT * kelvin) / pressure
  return {
    statement: `A mass of ${show(mass, 1)} g of a gas with molar mass ${molar} g/mol is at ${celsius} degrees C and ${pressure} kPa. Take R = 8.31 J/(mol K); pressure in kPa gives volume in litres.`,
    parts: [
      part('(a)', 'Find the moles of gas.', n, 'mol', 4),
      part('(b)', 'Find the volume of the gas, in litres.', volume, 'L', 3),
      part('(c)', 'Find the density of the gas, in g/L.', mass / volume, 'g/L', 3),
    ],
    solution: [
      `n = mass / M = ${show(mass, 1)} / ${molar} = ${show(n, 4)} mol.`,
      `V = nRT / P = ${show(n, 4)} x 8.31 x ${kelvin} / ${pressure} = ${show(volume, 3)} L.`,
      `Density = mass / volume = ${show(mass, 1)} / ${show(volume, 3)} = ${show(mass / volume, 3)} g/L.`,
    ],
  }
}

const alkanes = [
  { n: 1, name: 'methane', isomers: 1 },
  { n: 2, name: 'ethane', isomers: 1 },
  { n: 3, name: 'propane', isomers: 1 },
  { n: 4, name: 'butane', isomers: 2 },
  { n: 5, name: 'pentane', isomers: 3 },
  { n: 6, name: 'hexane', isomers: 5 },
]

function hydrocarbons(rng: Rng): ProblemBody {
  const alkane = pick(rng, alkanes)
  if (rng() < 0.5) {
    const mass = int(rng, 10, 100) / 10
    const M = alkane.n * 12 + (2 * alkane.n + 2)
    const moles = mass / M
    const co2 = moles * alkane.n * 44
    const o2 = moles * ((3 * alkane.n + 1) / 2) * MOLAR_VOLUME
    return {
      statement: `${alkane.name.charAt(0).toUpperCase()}${alkane.name.slice(1)}, C${alkane.n}H${2 * alkane.n + 2}, burns completely in excess oxygen to give carbon dioxide and water. A sample has a mass of ${show(mass, 1)} g. Ar: C = 12, H = 1. Take M(CO2) = 44 g/mol and the molar volume at STP as 22.4 L/mol.`,
      parts: [
        part('(a)', `Find the moles of ${alkane.name} (M = ${M} g/mol).`, moles, 'mol', 4),
        part('(b)', 'Find the mass of carbon dioxide produced, in g.', co2, 'g', 2),
        part('(c)', 'Find the volume of oxygen needed, in litres at STP.', o2, 'L', 2),
      ],
      solution: [
        `M = ${alkane.n} x 12 + ${2 * alkane.n + 2} x 1 = ${M} g/mol, so moles = ${show(mass, 1)} / ${M} = ${show(moles, 4)} mol.`,
        `C${alkane.n}H${2 * alkane.n + 2} + ${show((3 * alkane.n + 1) / 2, 1)}O2 -> ${alkane.n}CO2 + ${alkane.n + 1}H2O. Moles of CO2 = ${alkane.n} x ${show(moles, 4)}, mass = ${show(co2, 2)} g.`,
        `Moles of O2 = ${show((3 * alkane.n + 1) / 2, 1)} x ${show(moles, 4)}, so the volume = ${show(o2, 2)} L.`,
      ],
    }
  }
  const alkene = alkane.n === 1 ? alkanes[1] : alkane
  const n = alkene.n
  const sigma = 3 * n - 1
  return {
    statement: `Consider the alkene with ${n} carbon atoms and one carbon-carbon double bond (C${n}H${2 * n}), and the alkane with ${n} carbon atoms (C${n}H${2 * n + 2}).`,
    parts: [
      part('(a)', 'How many hydrogen atoms are in the alkene?', 2 * n, '', 0),
      part('(b)', 'How many sigma bonds are in the alkene molecule?', sigma, '', 0),
      part('(c)', 'How many sigma bonds are in the alkane molecule?', 3 * n + 1, '', 0),
    ],
    solution: [
      `Alkenes follow CnH2n, so with n = ${n} there are ${2 * n} hydrogen atoms.`,
      `Count C-H bonds (${2 * n}) and C-C bonds (${n - 1}, with the double bond contributing one sigma and one pi): ${2 * n} + ${n - 1} = ${sigma} sigma bonds, plus 1 pi bond.`,
      `The alkane has ${2 * n + 2} C-H bonds and ${n - 1} C-C bonds, so ${3 * n + 1} sigma bonds.`,
    ],
  }
}

const fuels = [
  { name: 'methanol', M: 32 },
  { name: 'ethanol', M: 46 },
  { name: 'propan-1-ol', M: 60 },
  { name: 'butan-1-ol', M: 74 },
]

const bondData = [
  { molecule: 'HCl', other: 'Cl-Cl', otherE: 242, product: 'H-Cl', productE: 431 },
  { molecule: 'HBr', other: 'Br-Br', otherE: 193, product: 'H-Br', productE: 366 },
  { molecule: 'HF', other: 'F-F', otherE: 158, product: 'H-F', productE: 567 },
  { molecule: 'HI', other: 'I-I', otherE: 151, product: 'H-I', productE: 299 },
]

function thermochemistry(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.4) {
    const fuel = pick(rng, fuels)
    const water = pick(rng, [100, 150, 200, 250])
    const rise = int(rng, 80, 280) / 10
    const burned = int(rng, 8, 30) / 10
    const q = (water * 4.18 * rise) / 1000
    const moles = burned / fuel.M
    const dH = -(q / moles)
    return {
      statement: `${show(burned, 1)} g of ${fuel.name} (M = ${fuel.M} g/mol) is burned and all the heat warms ${water} g of water by ${show(rise, 1)} K. The specific heat capacity of water is 4.18 J/(g K).`,
      parts: [
        part('(a)', 'Find the heat absorbed by the water, in kJ.', q, 'kJ', 2),
        part('(b)', 'Find the moles of fuel burned.', moles, 'mol', 4),
        part('(c)', 'Find the enthalpy change of combustion, in kJ per mole, including the sign.', dH, 'kJ/mol', 0),
      ],
      solution: [
        `q = m c dT = ${water} x 4.18 x ${show(rise, 1)} = ${show(q * 1000, 0)} J = ${show(q, 2)} kJ.`,
        `Moles = ${show(burned, 1)} / ${fuel.M} = ${show(moles, 4)} mol.`,
        `Heat released per mole = ${show(q, 2)} / ${show(moles, 4)} = ${show(-dH, 0)} kJ/mol, so ΔH = ${show(dH, 0)} kJ/mol because combustion is exothermic.`,
      ],
    }
  }
  if (roll < 0.7) {
    const d = pick(rng, bondData)
    const broken = 436 + d.otherE
    const formed = 2 * d.productE
    const dH = broken - formed
    return {
      statement: `H2 + ${d.other.split('-')[0]}2 -> 2${d.molecule}. Bond enthalpies in kJ/mol: H-H = 436, ${d.other} = ${d.otherE}, ${d.product} = ${d.productE}.`,
      parts: [
        part('(a)', 'Find the total energy needed to break the bonds in the reactants, in kJ.', broken, 'kJ', 0),
        part('(b)', 'Find the total energy released in forming the bonds in the products, in kJ.', formed, 'kJ', 0),
        part('(c)', 'Find the enthalpy change for the reaction as written, in kJ (include the sign).', dH, 'kJ', 0),
      ],
      solution: [
        `Bonds broken: 436 + ${d.otherE} = ${broken} kJ.`,
        `Bonds formed: 2 x ${d.productE} = ${formed} kJ.`,
        `dH = broken - formed = ${broken} - ${formed} = ${dH} kJ.`,
      ],
    }
  }
  const alkane = pick(rng, [
    { name: 'methane', formula: 'CH4', n: 1, hf: -74.8, water: 2 },
    { name: 'ethane', formula: 'C2H6', n: 2, hf: -84.7, water: 3 },
    { name: 'propane', formula: 'C3H8', n: 3, hf: -103.8, water: 4 },
  ])
  const co2 = -393.5
  const h2o = -285.8
  const oxygen = (3 * alkane.n + 1) / 2
  const dH = alkane.n * co2 + alkane.water * h2o - alkane.hf
  return {
    statement: `Standard heats of formation (kJ/mol): ${alkane.name} = ${alkane.hf}, carbon dioxide = ${co2}, liquid water = ${h2o}. Burn ${alkane.name} completely: ${alkane.formula} + ${show(oxygen, 1)}O2 -> ${alkane.n}CO2 + ${alkane.water}H2O (balanced for one mole of ${alkane.name}).`,
    parts: [
      part('(a)', 'Find the sum of the heats of formation of the products, in kJ.', alkane.n * co2 + alkane.water * h2o, 'kJ', 1),
      part('(b)', 'Find the heat of combustion of one mole of the hydrocarbon, in kJ/mol.', dH, 'kJ/mol', 1),
    ],
    solution: [
      `Products: ${alkane.n} x (${co2}) + ${alkane.water} x (${h2o}) = ${show(alkane.n * co2 + alkane.water * h2o, 1)} kJ. Oxygen is an element, so its heat of formation is 0.`,
      `dH = sum products - sum reactants = ${show(alkane.n * co2 + alkane.water * h2o, 1)} - (${alkane.hf}) = ${show(dH, 1)} kJ/mol.`,
    ],
  }
}

function rates(rng: Rng): ProblemBody {
  if (rng() < 0.6) {
    const t1 = pick(rng, [20, 30, 40, 60])
    const t2 = t1 + pick(rng, [30, 40, 60])
    const v1 = int(rng, 10, 40)
    const v2 = v1 + int(rng, 15, 40)
    const rate1 = v1 / t1
    const rate2 = (v2 - v1) / (t2 - t1)
    return {
      statement: `Magnesium reacts with hydrochloric acid and the hydrogen is collected in a gas syringe. After ${t1} s the syringe shows ${v1} cm^3 of gas, and after ${t2} s it shows ${v2} cm^3.`,
      parts: [
        part('(a)', 'Find the average rate over the first interval (0 to the first reading), in cm^3 per second.', rate1, 'cm^3/s', 3),
        part('(b)', 'Find the average rate between the two readings, in cm^3 per second.', rate2, 'cm^3/s', 3),
        part('(c)', 'Find the moles of hydrogen at the second reading, taking the molar volume at room temperature as 24 000 cm^3/mol.', v2 / 24000, 'mol', 5),
      ],
      solution: [
        `Average rate = volume / time = ${v1} / ${t1} = ${show(rate1, 3)} cm^3/s.`,
        `Between the readings: (${v2} - ${v1}) / (${t2} - ${t1}) = ${show(rate2, 3)} cm^3/s. The rate is lower as the reactants are used up.`,
        `Moles = ${v2} / 24000 = ${show(v2 / 24000, 5)} mol.`,
      ],
    }
  }
  const t1 = pick(rng, [20, 25, 30])
  const gap = pick(rng, [10, 20, 30])
  const time1 = pick(rng, [64, 96, 120, 160, 240])
  const factor = 2 ** (gap / 10)
  return {
    statement: `A reaction takes ${time1} s at ${t1} degrees C. Assume the rate doubles for every 10 degrees C rise in temperature.`,
    parts: [
      part('(a)', `By what factor does the rate increase when the temperature is raised to ${t1 + gap} degrees C?`, factor, '', 0),
      part('(b)', `Find the time the reaction takes at ${t1 + gap} degrees C, in seconds.`, time1 / factor, 's', 1),
    ],
    solution: [
      `A rise of ${gap} degrees is ${gap / 10} doubling${gap / 10 === 1 ? '' : 's'}, so the rate is ${factor} times as fast.`,
      `Time is inversely proportional to rate: ${time1} / ${factor} = ${show(time1 / factor, 1)} s.`,
    ],
  }
}

function equilibrium(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const hi = int(rng, 4, 16) / 10
    const h2 = int(rng, 2, 8) / 10
    const i2 = int(rng, 2, 8) / 10
    const kc = (hi * hi) / (h2 * i2)
    return {
      statement: `For the reaction H2(g) + I2(g) <-> 2HI(g) at a certain temperature, the equilibrium concentrations are [H2] = ${show(h2, 1)} mol/L, [I2] = ${show(i2, 1)} mol/L and [HI] = ${show(hi, 1)} mol/L.`,
      parts: [
        part('(a)', 'Find Kc, to two decimal places.', kc, '', 2),
        part('(b)', 'Find [HI] in mol/L at the same temperature when [H2] = [I2] = 1.0 mol/L, to two decimal places.', Math.sqrt(kc), 'mol/L', 2),
      ],
      solution: [
        `Kc = [HI]^2 / ([H2][I2]) = ${show(hi, 1)}^2 / (${show(h2, 1)} x ${show(i2, 1)}) = ${show(kc, 2)}.`,
        `With [H2] = [I2] = 1.0: [HI]^2 = Kc x 1.0 x 1.0, so [HI] = sqrt(${show(kc, 2)}) = ${show(Math.sqrt(kc), 2)} mol/L.`,
      ],
    }
  }
  const start = int(rng, 10, 30) / 10
  const x = round(start * (int(rng, 20, 70) / 100), 2)
  const hiEq = 2 * x
  const left = start - x
  const kc = (hiEq * hiEq) / (left * left)
  return {
    statement: `${show(start, 1)} mol of H2 and ${show(start, 1)} mol of I2 are mixed in a 1.0 L flask and allowed to reach equilibrium: H2 + I2 <-> 2HI. At equilibrium the flask contains ${show(hiEq, 2)} mol of HI.`,
    parts: [
      part('(a)', 'Find the moles of H2 at equilibrium.', left, 'mol', 2),
      part('(b)', 'Find Kc, to two decimal places.', kc, '', 2),
    ],
    solution: [
      `2 mol of HI form from 1 mol of H2 and 1 mol of I2, so ${show(hiEq, 2)} mol of HI used ${show(x, 2)} mol of each: ${show(start, 1)} - ${show(x, 2)} = ${show(left, 2)} mol.`,
      `The volume is 1.0 L, so moles equal concentrations. Kc = ${show(hiEq, 2)}^2 / (${show(left, 2)} x ${show(left, 2)}) = ${show(kc, 2)}.`,
    ],
  }
}

function acidsBases(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.35) {
    const exponent = int(rng, 1, 3)
    const conc = int(rng, 1, 9) / 10 ** exponent
    const pH = -Math.log10(conc)
    const dilution = pick(rng, [10, 100])
    const newPH = -Math.log10(conc / dilution)
    return {
      statement: `A solution of the strong acid HCl has a concentration of ${show(conc, exponent + 1)} mol/L.`,
      parts: [
        part('(a)', 'Find its pH, to two decimal places.', pH, '', 2),
        part('(b)', `The solution is diluted ${dilution} times. Find the new pH, to two decimal places.`, newPH, '', 2),
      ],
      solution: [
        `HCl is fully ionised, so [H+] = ${show(conc, exponent + 1)} mol/L and pH = -log10(${show(conc, exponent + 1)}) = ${show(pH, 2)}.`,
        `After dilution [H+] = ${show(conc / dilution, exponent + 3)} mol/L, so pH = ${show(newPH, 2)}.`,
      ],
    }
  }
  if (roll < 0.7) {
    const conc = int(rng, 1, 90) / 1000
    const pOH = -Math.log10(conc)
    const pH = 14 - pOH
    return {
      statement: `A solution of the strong base NaOH has a concentration of ${show(conc, 3)} mol/L at 25 degrees C, where Kw = [H+][OH-] = 1.0 x 10^-14.`,
      parts: [
        part('(a)', 'Find [OH-], in mol/L.', conc, 'mol/L', 3),
        part('(b)', 'Find pOH, to two decimal places.', pOH, '', 2),
        part('(c)', 'Find the pH, to two decimal places.', pH, '', 2),
      ],
      solution: [
        `NaOH is fully ionised, so [OH-] = ${show(conc, 3)} mol/L.`,
        `pOH = -log10[OH-] = ${show(pOH, 2)}.`,
        `pH + pOH = 14, so pH = 14 - ${show(pOH, 2)} = ${show(pH, 2)}.`,
      ],
    }
  }
  const ka = pick(rng, [1.8, 1.4, 6.3, 4.0]) * 1e-5
  const kaMantissa = ka * 1e5
  const conc = pick(rng, [0.1, 0.2, 0.05, 0.5])
  const h = Math.sqrt(ka * conc)
  const pH = -Math.log10(h)
  return {
    statement: `A weak monoprotic acid HA has Ka = ${show(kaMantissa, 1)} x 10^-5 and a concentration of ${show(conc, 2)} mol/L. Assume [H+] is much smaller than [HA], so [HA] stays at ${show(conc, 2)} mol/L.`,
    parts: [
      part('(a)', 'Find [H+] using Ka = [H+]^2 / [HA], in units of 10^-3 mol/L, to two decimal places.', h * 1000, 'x 10^-3 mol/L', 2),
      part('(b)', 'Find the pH, to two decimal places.', pH, '', 2),
      part('(c)', 'Find the percentage of the acid that is ionised, to two decimal places.', (h / conc) * 100, '%', 2),
    ],
    solution: [
      `[H+]^2 = Ka x [HA] = ${show(ka, 7)} x ${show(conc, 2)}, so [H+] = ${show(h * 1000, 2)} x 10^-3 mol/L.`,
      `pH = -log10(${show(h, 5)}) = ${show(pH, 2)}.`,
      `Percentage ionised = ${show(h, 5)} / ${show(conc, 2)} x 100 = ${show((h / conc) * 100, 2)}%.`,
    ],
  }
}

const halfCells = [
  { metal: 'Mg', ion: 'Mg2+', e: -2.37 },
  { metal: 'Zn', ion: 'Zn2+', e: -0.76 },
  { metal: 'Fe', ion: 'Fe2+', e: -0.44 },
  { metal: 'Ni', ion: 'Ni2+', e: -0.25 },
  { metal: 'Cu', ion: 'Cu2+', e: 0.34 },
  { metal: 'Ag', ion: 'Ag+', e: 0.8 },
]

const oxidationCases = [
  { text: 'Mn in MnO4-', answer: 7, check: 'x + 4(-2) = -1' },
  { text: 'Cr in Cr2O7 2-', answer: 6, check: '2x + 7(-2) = -2' },
  { text: 'S in SO4 2-', answer: 6, check: 'x + 4(-2) = -2' },
  { text: 'N in NO3-', answer: 5, check: 'x + 3(-2) = -1' },
  { text: 'Cl in ClO3-', answer: 5, check: 'x + 3(-2) = -1' },
  { text: 'P in PO4 3-', answer: 5, check: 'x + 4(-2) = -3' },
  { text: 'S in SO3 2-', answer: 4, check: 'x + 3(-2) = -2' },
]

function electrochemistry(rng: Rng): ProblemBody {
  if (rng() < 0.55) {
    const i = int(rng, 0, halfCells.length - 2)
    const j = int(rng, i + 1, halfCells.length - 1)
    const anode = halfCells[i]
    const cathode = halfCells[j]
    const emf = cathode.e - anode.e
    const swap = rng() < 0.5
    const [first, second] = swap ? [cathode, anode] : [anode, cathode]
    return {
      statement: `A galvanic cell is built from a ${first.metal}/${first.ion} half-cell (standard reduction potential ${first.e} V) and a ${second.metal}/${second.ion} half-cell (${second.e} V). Both half-cells are at standard conditions and are joined by a salt bridge.`,
      parts: [
        part('(a)', `Type 1 if ${first.metal} is oxidised (the anode) or 2 if ${second.metal} is oxidised.`, swap ? 2 : 1, '', 0),
        part('(b)', 'Find the standard cell voltage E(cell), in volts.', emf, 'V', 2),
      ],
      solution: [
        `The half-cell with the lower reduction potential is oxidised, so ${anode.metal} loses electrons at the anode.`,
        `E(cell) = E(cathode) - E(anode) = ${cathode.e} - (${anode.e}) = ${show(emf, 2)} V.`,
      ],
    }
  }
  const c = pick(rng, oxidationCases)
  const other = pick(rng, oxidationCases)
  return {
    statement: `Work out oxidation numbers using the rules: oxygen is -2 and the numbers add up to the overall charge. Find the oxidation number of: (1) ${c.text}; (2) ${other.text}.`,
    parts: [
      part('(a)', `Oxidation number of ${c.text}.`, c.answer, '', 0),
      part('(b)', `Oxidation number of ${other.text}.`, other.answer, '', 0),
    ],
    solution: [`(1) ${c.check}, so the answer is +${c.answer}.`, `(2) ${other.check}, so the answer is +${other.answer}.`],
  }
}

const titrationAcids = [
  { name: 'hydrochloric acid', ratioAcidPerBase: 1, text: 'HCl + NaOH -> NaCl + H2O', M: 36.5 },
  { name: 'ethanoic acid', ratioAcidPerBase: 1, text: 'CH3COOH + NaOH -> CH3COONa + H2O', M: 60 },
  { name: 'sulfuric acid', ratioAcidPerBase: 0.5, text: 'H2SO4 + 2NaOH -> Na2SO4 + 2H2O', M: 98 },
]

function volumetric(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.55) {
    const acid = pick(rng, titrationAcids)
    const base = int(rng, 5, 20) / 100
    const titre = int(rng, 180, 280) / 10
    const pipette = 25
    const molesBase = (base * titre) / 1000
    const molesAcid = molesBase * acid.ratioAcidPerBase
    const concAcid = (molesAcid * 1000) / pipette
    return {
      statement: `${pipette} cm^3 samples of ${acid.name} are titrated against sodium hydroxide of concentration ${show(base, 2)} mol/L. The mean titre is ${show(titre, 1)} cm^3. ${acid.text}. Take M(acid) = ${acid.M} g/mol.`,
      parts: [
        part('(a)', 'Find the moles of sodium hydroxide in the mean titre.', molesBase, 'mol', 5),
        part('(b)', `Find the concentration of the ${acid.name}, in mol/L.`, concAcid, 'mol/L', 4),
        part('(c)', 'Find the concentration in g/L.', concAcid * acid.M, 'g/L', 2),
      ],
      solution: [
        `Moles of NaOH = ${show(base, 2)} x ${show(titre, 1)} / 1000 = ${show(molesBase, 5)} mol.`,
        `The equation gives ${acid.ratioAcidPerBase === 1 ? '1 mol acid per mol NaOH' : '1 mol acid per 2 mol NaOH'}: moles of acid = ${show(molesAcid, 5)} in ${pipette} cm^3, so concentration = ${show(concAcid, 4)} mol/L.`,
        `Mass concentration = ${show(concAcid, 4)} x ${acid.M} = ${show(concAcid * acid.M, 2)} g/L.`,
      ],
    }
  }
  if (roll < 0.8) {
    const dilution = 10
    const base = int(rng, 10, 12) / 100
    const titre = int(rng, 160, 200) / 10
    const dilutedConc = (base * titre) / 25
    const original = dilutedConc * dilution
    const gPerL = original * 60
    return {
      statement: `A vinegar sample is diluted ${dilution} times. 25.0 cm^3 of the diluted vinegar needs a mean titre of ${show(titre, 1)} cm^3 of ${show(base, 2)} mol/L NaOH. The acid is ethanoic acid, CH3COOH (M = 60 g/mol), which reacts 1 : 1 with NaOH.`,
      parts: [
        part('(a)', 'Find the concentration of the diluted vinegar, in mol/L.', dilutedConc, 'mol/L', 4),
        part('(b)', 'Find the concentration of the original vinegar, in mol/L.', original, 'mol/L', 3),
        part('(c)', 'Find the percentage w/v (g per 100 cm^3) of ethanoic acid in the original vinegar.', gPerL / 10, '%', 2),
      ],
      solution: [
        `Moles NaOH = ${show(base, 2)} x ${show(titre, 1)} / 1000, equal to moles of acid in 25.0 cm^3, so concentration = ${show(dilutedConc, 4)} mol/L.`,
        `Multiply by the dilution factor ${dilution}: ${show(original, 3)} mol/L.`,
        `${show(original, 3)} x 60 = ${show(gPerL, 2)} g/L, which is ${show(gPerL / 10, 2)} g per 100 cm^3.`,
      ],
    }
  }
  const conc = int(rng, 4, 12) / 100
  const titre = int(rng, 120, 220) / 10
  const molesThio = (conc * titre) / 1000
  const molesI2 = molesThio / 2
  const mass = molesI2 * 254
  return {
    statement: `Iodine reacts with sodium thiosulfate: I2 + 2S2O3 2- -> 2I- + S4O6 2-. The iodine in a solution needed ${show(titre, 1)} cm^3 of ${show(conc, 2)} mol/L sodium thiosulfate to reach the end point. Take M(I2) = 254 g/mol.`,
    parts: [
      part('(a)', 'Find the moles of thiosulfate used.', molesThio, 'mol', 5),
      part('(b)', 'Find the moles of iodine in the sample.', molesI2, 'mol', 5),
      part('(c)', 'Find the mass of iodine in the sample, in mg.', mass * 1000, 'mg', 1),
    ],
    solution: [
      `Moles of thiosulfate = ${show(conc, 2)} x ${show(titre, 1)} / 1000 = ${show(molesThio, 5)} mol.`,
      `2 mol thiosulfate react with 1 mol iodine, so moles of iodine = ${show(molesI2, 5)} mol.`,
      `Mass = ${show(molesI2, 5)} x 254 = ${show(mass, 4)} g = ${show(mass * 1000, 1)} mg.`,
    ],
  }
}

const esterRoutes = [
  { acid: 'ethanoic acid', alcohol: 'ethanol', ester: 'ethyl ethanoate', Macid: 60, Mester: 88 },
  { acid: 'ethanoic acid', alcohol: 'methanol', ester: 'methyl ethanoate', Macid: 60, Mester: 74 },
  { acid: 'propanoic acid', alcohol: 'ethanol', ester: 'ethyl propanoate', Macid: 74, Mester: 102 },
]

const empiricals = [
  { empirical: 'CH2O', mass: 30, formulas: ['C2H4O2', 'C3H6O3', 'C6H12O6'] },
  { empirical: 'CH2', mass: 14, formulas: ['C3H6', 'C4H8', 'C5H10'] },
  { empirical: 'CH', mass: 13, formulas: ['C2H2', 'C6H6'] },
  { empirical: 'C2H5', mass: 29, formulas: ['C4H10'] },
]

function organic(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const route = pick(rng, esterRoutes)
    const mass = int(rng, 30, 150) / 10
    const theoretical = (mass / route.Macid) * route.Mester
    const percent = int(rng, 55, 85)
    const actual = round((theoretical * percent) / 100, 2)
    return {
      statement: `An ester is made by refluxing ${route.acid} (M = ${route.Macid} g/mol) with excess ${route.alcohol} and an acid catalyst: acid + alcohol -> ${route.ester} + water, a 1 : 1 reaction. ${show(mass, 1)} g of ${route.acid} is used. M(${route.ester}) = ${route.Mester} g/mol.`,
      parts: [
        part('(a)', 'Find the moles of the acid used.', mass / route.Macid, 'mol', 4),
        part('(b)', `Find the theoretical yield of ${route.ester}, in g.`, theoretical, 'g', 2),
        part('(c)', `The student collects ${show(actual, 2)} g of the pure ester. Find the percentage yield.`, (actual / theoretical) * 100, '%', 1),
      ],
      solution: [
        `Moles = ${show(mass, 1)} / ${route.Macid} = ${show(mass / route.Macid, 4)} mol.`,
        `The reaction is 1 : 1, so the mass of ester = ${show(mass / route.Macid, 4)} x ${route.Mester} = ${show(theoretical, 2)} g.`,
        `Percentage yield = ${show(actual, 2)} / ${show(theoretical, 2)} x 100 = ${show((actual / theoretical) * 100, 1)}%.`,
      ],
    }
  }
  const entry = pick(rng, empiricals)
  const formula = pick(rng, entry.formulas)
  const multiple = Math.round(molarFromFormula(formula) / entry.mass)
  const M = molarFromFormula(formula)
  return {
    statement: `A compound has the empirical formula ${entry.empirical} (empirical formula mass ${entry.mass}) and a relative molecular mass of ${M}.`,
    parts: [
      part('(a)', 'How many empirical formula units are in one molecule?', multiple, '', 0),
      part('(b)', 'How many carbon atoms are in one molecule?', carbonsIn(formula), '', 0),
    ],
    solution: [
      `${M} / ${entry.mass} = ${multiple}, so the molecular formula is ${entry.empirical} repeated ${multiple} times, which is ${formula}.`,
      `${formula} has ${carbonsIn(formula)} carbon atoms.`,
    ],
  }
}

function carbonsIn(formula: string): number {
  const match = /^C(\d*)/.exec(formula)
  return match ? Number(match[1] || 1) : 0
}

function molarFromFormula(formula: string): number {
  let total = 0
  for (const [, symbol, count] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) total += AR[symbol] * Number(count || 1)
  return total
}

function environment(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const methane = int(rng, 2, 40)
    const nitrous = int(rng, 1, 15)
    const carbon = int(rng, 20, 200)
    const co2e = methane * 28 + nitrous * 265 + carbon
    return {
      statement: `A farm emits ${methane} tonnes of methane, ${nitrous} tonnes of dinitrogen oxide (N2O) and ${carbon} tonnes of carbon dioxide in a year. Global warming potentials over 100 years: CO2 = 1, CH4 = 28, N2O = 265.`,
      parts: [
        part('(a)', 'Find the carbon dioxide equivalent of the methane, in tonnes.', methane * 28, 'tonnes', 0),
        part('(b)', 'Find the total emissions of the farm, in tonnes of CO2 equivalent.', co2e, 'tonnes', 0),
        part('(c)', 'What percentage of the total comes from methane, to one decimal place?', ((methane * 28) / co2e) * 100, '%', 1),
      ],
      solution: [
        `CO2 equivalent = mass x GWP, so methane gives ${methane} x 28 = ${methane * 28} tonnes.`,
        `N2O gives ${nitrous} x 265 = ${nitrous * 265}, and CO2 counts as ${carbon}. Total = ${co2e} tonnes.`,
        `${methane * 28} / ${co2e} x 100 = ${show(((methane * 28) / co2e) * 100, 1)}%.`,
      ],
    }
  }
  const ppm = int(rng, 5, 90) / 10
  const volume = pick(rng, [250, 500, 2000, 10000])
  return {
    statement: `A water sample contains nitrate at ${show(ppm, 1)} ppm. Take 1 ppm = 1 mg per litre of water.`,
    parts: [
      part('(a)', `Find the mass of nitrate in ${volume} litres, in mg.`, ppm * volume, 'mg', 1),
      part('(b)', `Find the concentration in g per litre.`, ppm / 1000, 'g/L', 4),
      part('(c)', 'The limit for drinking water is 50 mg/L. Find what percentage of the limit this sample is, to one decimal place.', (ppm / 50) * 100, '%', 1),
    ],
    solution: [
      `${show(ppm, 1)} mg per litre x ${volume} litres = ${show(ppm * volume, 1)} mg.`,
      `${show(ppm, 1)} mg = ${show(ppm / 1000, 4)} g per litre.`,
      `${show(ppm, 1)} / 50 x 100 = ${show((ppm / 50) * 100, 1)}%.`,
    ],
  }
}

function investigation(rng: Rng): ProblemBody {
  const base = int(rng, 200, 260) / 10
  const titres = [base + 3.1, base + (int(rng, -3, 3) / 10), base + (int(rng, -3, 3) / 10), base + (int(rng, -3, 3) / 10)].map((t) => round(t, 1))
  const concordant = titres.slice(1)
  const mean = concordant.reduce((a, b) => a + b, 0) / concordant.length
  const burette = pick(rng, [0.05, 0.1])
  const percentError = ((2 * burette) / mean) * 100
  const accepted = int(rng, 80, 120) / 100
  const measured = round(accepted * (1 + int(rng, -8, 8) / 100), 3)
  return {
    statement: `In a titration a student records four titres, in cm^3: ${titres.map((t) => show(t, 1)).join(', ')}. The first is a rough one and is not used. Each burette reading has an uncertainty of +/- ${show(burette, 2)} cm^3, and the titre is the difference between two readings.`,
    parts: [
      part('(a)', 'Find the mean of the three accurate titres, to two decimal places.', mean, 'cm^3', 2),
      part('(b)', 'Find the percentage uncertainty in the titre (both readings count), to two decimal places.', percentError, '%', 2),
      part('(c)', `The student finds a concentration of ${show(measured, 3)} mol/L and the accepted value is ${show(accepted, 2)} mol/L. Find the percentage difference from the accepted value, to one decimal place (give a positive number).`, (Math.abs(measured - accepted) / accepted) * 100, '%', 1),
    ],
    solution: [
      `Discard the rough titre and average the other three: (${concordant.map((t) => show(t, 1)).join(' + ')}) / 3 = ${show(mean, 2)} cm^3.`,
      `Two readings, each +/- ${show(burette, 2)}, give an uncertainty of ${show(2 * burette, 2)} cm^3, which is ${show(2 * burette, 2)} / ${show(mean, 2)} x 100 = ${show(percentError, 2)}%.`,
      `Difference = |${show(measured, 3)} - ${show(accepted, 2)}| / ${show(accepted, 2)} x 100 = ${show((Math.abs(measured - accepted) / accepted) * 100, 1)}%.`,
    ],
  }
}

export const chemistryGenerators: Record<string, ProblemGenerator> = {
  'ch-matter': matter,
  'ch-atomic-structure': atomicStructure,
  'ch-periodic-table': periodicTable,
  'ch-mole': mole,
  'ch-stoichiometry': stoichiometry,
  'ch-bonding': bonding,
  'ch-imf-shapes': intermolecularForces,
  'ch-gases': gases,
  'ch-hydrocarbons': hydrocarbons,
  'ch-thermochemistry': thermochemistry,
  'ch-rates': rates,
  'ch-equilibrium': equilibrium,
  'ch-acids-bases': acidsBases,
  'ch-electrochemistry': electrochemistry,
  'ch-volumetric': volumetric,
  'ch-organic': organic,
  'ch-environment': environment,
  'ch-investigation': investigation,
}

export function hasChemistryProblems(topicId: string): boolean {
  return topicId in chemistryGenerators
}

export function chemistryProblemTopicIds(): string[] {
  return Object.keys(chemistryGenerators)
}

export function generateChemistryProblem(topicId: string, seed: string): PracticeProblem | undefined {
  const generator = chemistryGenerators[topicId]
  if (!generator) return undefined
  const body = generator(createRng(`${topicId}:${seed}`))
  return { topicId, ...body, parts: body.parts.map((p) => ({ ...p, answer: p.answer + 0 })) }
}
