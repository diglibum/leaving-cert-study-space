import { createRng, int, pick, round } from './rng'
import type { PracticeProblem, ProblemBody, ProblemGenerator, ProblemPart, Rng } from './types'

/*
 * Original practice problems for Leaving Certificate Biology (Higher). They
 * are written for this app, not copied or adapted from any exam paper. Biology
 * has fewer calculations than the other sciences, so these cover the numerical
 * skills the specification names: magnification, Simpson's Diversity Index,
 * genetic crosses, rates and percentage changes. Numbers come from a seed and
 * every answer is computed in code.
 */

const show = (value: number, decimals = 4) => String(Number(value.toFixed(decimals)))

function part(label: string, prompt: string, value: number, unit: string, decimals: number): ProblemPart {
  return { label, prompt, answer: round(value, decimals), unit, decimals }
}

function cells(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const drawn = int(rng, 20, 90)
    const magnification = pick(rng, [40, 100, 200, 400, 1000])
    const actualMicrometres = (drawn * 1000) / magnification
    const other = int(rng, 10, 60) / 10
    return {
      statement: `A student draws a plant cell from a photograph. The drawing of the cell is ${drawn} mm long and the photograph was taken at a magnification of x${magnification}.`,
      parts: [
        part('(a)', 'Find the real length of the cell, in micrometres (1 mm = 1000 micrometres).', actualMicrometres, 'micrometres', 1),
        part('(b)', `A nucleus in the same cell has a real diameter of ${show(other, 1)} micrometres. How long, in mm, would it appear in the drawing?`, (other * magnification) / 1000, 'mm', 2),
      ],
      solution: [
        `Real size = image size / magnification = ${drawn} mm / ${magnification} = ${show(drawn / magnification, 4)} mm = ${show(actualMicrometres, 1)} micrometres.`,
        `Image size = real size x magnification = ${show(other, 1)} x ${magnification} = ${show(other * magnification, 1)} micrometres = ${show((other * magnification) / 1000, 2)} mm.`,
      ],
    }
  }
  const eyepiece = pick(rng, [5, 10, 15])
  const objective = pick(rng, [4, 10, 20, 40])
  const total = eyepiece * objective
  const lowField = pick(rng, [4, 5, 6]) * 1000
  const lowMagnification = 40
  const field = (lowField * lowMagnification) / total
  return {
    statement: `A light microscope has an eyepiece lens of x${eyepiece} and an objective lens of x${objective}. At a total magnification of x${lowMagnification} the field of view is ${lowField} micrometres wide. The width of the field of view is inversely proportional to the total magnification.`,
    parts: [
      part('(a)', 'Find the total magnification with the lenses described.', total, 'x', 0),
      part('(b)', 'Find the width of the field of view at that magnification, in micrometres.', field, 'micrometres', 1),
    ],
    solution: [
      `Total magnification = eyepiece x objective = ${eyepiece} x ${objective} = ${total}.`,
      `Field of view x magnification stays constant: ${lowField} x ${lowMagnification} / ${total} = ${show(field, 1)} micrometres.`,
    ],
  }
}

function biomolecules(rng: Rng): ProblemBody {
  const total = pick(rng, [1000, 2000, 2400, 3000, 5000])
  const percent = int(rng, 18, 32)
  const a = (total * percent) / 100
  const g = (total - 2 * a) / 2
  return {
    statement: `A sample of double-stranded DNA has ${total} nucleotides in total. ${percent}% of the nucleotides carry the base adenine.`,
    parts: [
      part('(a)', 'How many nucleotides carry thymine?', a, '', 0),
      part('(b)', 'How many nucleotides carry cytosine?', g, '', 0),
      part('(c)', 'What percentage of the bases are guanine or cytosine?', ((total - 2 * a) / total) * 100, '%', 0),
    ],
    solution: [
      `Adenine pairs with thymine, so the numbers are equal: ${percent}% of ${total} = ${show(a, 0)}.`,
      `Adenine and thymine together are ${show(2 * a, 0)}. The rest, ${show(total - 2 * a, 0)}, is cytosine and guanine in equal numbers: ${show(g, 0)} each.`,
      `G + C = 100% - ${2 * percent}% = ${100 - 2 * percent}%.`,
    ],
  }
}

function enzymes(rng: Rng): ProblemBody {
  const volume = int(rng, 8, 30) * 2
  const time = int(rng, 4, 12) * 5
  const volume2 = Math.round(volume * pick(rng, [1.5, 1.8, 2.2, 2.5]))
  const time2 = time
  const rate = volume / time
  const rate2 = volume2 / time2
  const factor = rate2 / rate
  return {
    statement: `In an experiment on catalase, a student measures the volume of oxygen released from hydrogen peroxide. At 20 C the enzyme releases ${volume} cm^3 of gas in ${time} seconds. At 30 C it releases ${volume2} cm^3 in ${time2} seconds.`,
    parts: [
      part('(a)', 'Find the rate of reaction at 20 C, in cm^3 per second.', rate, 'cm^3/s', 3),
      part('(b)', 'Find the rate at 30 C, in cm^3 per second.', rate2, 'cm^3/s', 3),
      part('(c)', 'By what factor did the rate increase, to two decimal places?', factor, '', 2),
    ],
    solution: [
      `Rate = volume of product / time = ${volume} / ${time} = ${show(rate, 3)} cm^3/s.`,
      `Rate at 30 C = ${volume2} / ${time2} = ${show(rate2, 3)} cm^3/s.`,
      `Factor = ${show(rate2, 3)} / ${show(rate, 3)} = ${show(factor, 2)}. Above the optimum temperature the rate would fall because the enzyme denatures.`,
    ],
  }
}

function photoResp(rng: Rng): ProblemBody {
  const grams = int(rng, 18, 90) * 2
  const mCo2 = 44
  const mGlucose = 180
  const co2 = (grams * 6 * mCo2) / mGlucose
  const bubbles = int(rng, 6, 30)
  const minutes = pick(rng, [2, 3, 5])
  const light1 = int(rng, 10, 20)
  const light2 = light1 * 2
  const rate1 = bubbles / minutes
  return {
    statement: `Aerobic respiration of glucose: C6H12O6 + 6O2 -> 6CO2 + 6H2O. (Molar masses: glucose 180 g/mol, carbon dioxide 44 g/mol.) In a separate experiment on photosynthesis, an aquatic plant releases ${bubbles} bubbles of oxygen in ${minutes} minutes with the lamp ${light1} cm away. The light intensity is proportional to 1 / distance^2.`,
    parts: [
      part('(a)', `What mass of carbon dioxide is produced when ${grams} g of glucose is fully respired?`, co2, 'g', 1),
      part('(b)', 'Find the rate of oxygen release, in bubbles per minute.', rate1, 'bubbles/min', 2),
      part('(c)', `The lamp is moved to ${light2} cm. By what factor does the light intensity fall?`, (light2 / light1) ** 2, '', 0),
    ],
    solution: [
      `One mole of glucose (180 g) gives 6 mol of CO2 (6 x 44 = 264 g), so ${grams} g gives ${grams} x 264 / 180 = ${show(co2, 1)} g.`,
      `Rate = ${bubbles} / ${minutes} = ${show(rate1, 2)} bubbles per minute.`,
      `Doubling the distance divides the intensity by 2^2 = 4.`,
    ],
  }
}

function cellDivision(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const total = int(rng, 20, 60) * 10
    const dividing = int(rng, 4, 20) * Math.round(total / 100)
    const fraction = dividing / total
    const hours = pick(rng, [20, 24])
    const mitosisMinutes = fraction * hours * 60
    return {
      statement: `A student counts ${total} cells in a root tip squash. ${dividing} of them are in mitosis (prophase, metaphase, anaphase or telophase). The cell cycle of these cells takes ${hours} hours.`,
      parts: [
        part('(a)', 'Find the mitotic index, as a percentage, to one decimal place.', fraction * 100, '%', 1),
        part('(b)', 'Estimate how long, in minutes, a cell spends in mitosis.', mitosisMinutes, 'min', 0),
      ],
      solution: [
        `Mitotic index = cells in mitosis / total cells x 100 = ${dividing} / ${total} x 100 = ${show(fraction * 100, 1)}%.`,
        `Time in mitosis = fraction x length of cycle = ${show(fraction, 4)} x ${hours * 60} min = ${show(mitosisMinutes, 0)} min.`,
      ],
    }
  }
  const codons = int(rng, 40, 300)
  const bases = codons * 3
  const stop = 3
  const mrnaBases = bases + stop
  const copies = int(rng, 3, 6)
  return {
    statement: `A gene codes for a polypeptide that is ${codons} amino acids long. The mRNA is read in codons of three bases, and the stop codon does not code for an amino acid.`,
    parts: [
      part('(a)', 'How many bases of mRNA are read, including the stop codon?', mrnaBases, '', 0),
      part('(b)', 'How many tRNA molecules carrying an amino acid are used for one polypeptide?', codons, '', 0),
      part('(c)', `How many bases are in the DNA that codes for ${copies} identical gene regions, one strand counted only, coding for this polypeptide and its stop codon?`, mrnaBases * copies, '', 0),
    ],
    solution: [
      `${codons} codons x 3 + 3 for the stop codon = ${mrnaBases} bases.`,
      `One tRNA brings in each amino acid, so ${codons} amino acids need ${codons} tRNA (the stop codon has none).`,
      `${mrnaBases} x ${copies} = ${mrnaBases * copies} bases on the coding strand.`,
    ],
  }
}

function inheritance(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.4) {
    const n = int(rng, 6, 40) * 4
    return {
      statement: `In pea plants, tall (T) is dominant to dwarf (t). Two heterozygous tall plants are crossed and produce ${n} seeds, which all grow.`,
      parts: [
        part('(a)', 'What is the expected ratio of tall to dwarf plants, tall as a fraction of the total (as a percentage)?', 75, '%', 0),
        part('(b)', 'How many tall plants do you expect?', (n * 3) / 4, '', 0),
        part('(c)', 'How many of the tall plants do you expect to be homozygous (TT)?', n / 4, '', 0),
      ],
      solution: [
        'Tt x Tt gives TT, Tt, Tt and tt: three tall to one dwarf, so 75% are tall.',
        `Tall = 3/4 x ${n} = ${(n * 3) / 4}.`,
        `TT is 1 in 4 of all offspring: ${n} / 4 = ${n / 4}.`,
      ],
    }
  }
  if (roll < 0.75) {
    const n = int(rng, 4, 20) * 16
    return {
      statement: `In a plant, round seeds (R) are dominant to wrinkled (r), and yellow (Y) is dominant to green (y). Two plants that are heterozygous for both genes (RrYy x RrYy) are crossed and produce ${n} seeds. The two genes are on different chromosomes.`,
      parts: [
        part('(a)', 'How many round yellow seeds do you expect?', (n * 9) / 16, '', 1),
        part('(b)', 'How many wrinkled green seeds do you expect?', n / 16, '', 1),
        part('(c)', 'How many seeds do you expect to be round and green?', (n * 3) / 16, '', 1),
      ],
      solution: [
        `A dihybrid cross gives the ratio 9 : 3 : 3 : 1 out of 16 (Mendel's law of independent assortment). Round yellow = 9/16 x ${n} = ${show((n * 9) / 16, 1)}.`,
        `Wrinkled green = 1/16 x ${n} = ${show(n / 16, 1)}.`,
        `Round green = 3/16 x ${n} = ${show((n * 3) / 16, 1)}.`,
      ],
    }
  }
  const n = int(rng, 5, 25) * 4
  return {
    statement: `Haemophilia is a sex-linked recessive condition carried on the X chromosome. A woman who is a carrier (XHXh) and a man without the condition (XHY) have ${n} children over several families of the same genotypes.`,
    parts: [
      part('(a)', 'How many of the children do you expect to be sons with haemophilia?', n / 4, '', 0),
      part('(b)', 'How many of the children do you expect to be carrier daughters?', n / 4, '', 0),
      part('(c)', 'What percentage of the sons do you expect to have haemophilia?', 50, '%', 0),
    ],
    solution: [
      'The offspring are XHXH, XHXh, XHY and XhY, each 1 in 4.',
      `Affected sons (XhY) = ${n} / 4 = ${n / 4}. Carrier daughters (XHXh) = ${n / 4} too.`,
      'Of the two kinds of sons, one in two has the allele: 50%.',
    ],
  }
}

function osmosisUrinary(rng: Rng): ProblemBody {
  if (rng() < 0.55) {
    const start = int(rng, 40, 120) / 10
    const hypertonicChange = -int(rng, 8, 30) / 10
    const end = start + hypertonicChange
    const control = int(rng, 4, 14) / 10
    const endControl = start + control
    const percent = (hypertonicChange / start) * 100
    return {
      statement: `Potato cylinders are placed in salt solutions. One cylinder starts at ${show(start, 1)} g and finishes at ${show(end, 1)} g in a concentrated salt solution. A second cylinder, in distilled water, finishes at ${show(endControl, 1)} g from the same start mass.`,
      parts: [
        part('(a)', 'Find the percentage change in mass of the cylinder in the salt solution (a negative number for a loss), to one decimal place.', percent, '%', 1),
        part('(b)', 'Find the percentage change in mass of the cylinder in distilled water, to one decimal place.', (control / start) * 100, '%', 1),
      ],
      solution: [
        `Percentage change = change in mass / starting mass x 100 = ${show(hypertonicChange, 1)} / ${show(start, 1)} x 100 = ${show(percent, 1)}%. Water leaves the cells by osmosis because the outside is more concentrated.`,
        `In water: ${show(control, 1)} / ${show(start, 1)} x 100 = ${show((control / start) * 100, 1)}%. Water enters the cells by osmosis.`,
      ],
    }
  }
  const filtrate = pick(rng, [120, 125, 180])
  const reabsorbed = pick(rng, [97, 98, 99])
  const urine = (filtrate * (100 - reabsorbed)) / 100
  return {
    statement: `The kidneys filter ${filtrate} cm^3 of fluid from the blood each minute in the glomeruli. ${reabsorbed}% of the water in the filtrate is reabsorbed into the blood by the tubules and the loop of Henle.`,
    parts: [
      part('(a)', 'How much water is reabsorbed each minute, in cm^3?', (filtrate * reabsorbed) / 100, 'cm^3', 2),
      part('(b)', 'Find the volume of urine made each minute, in cm^3.', urine, 'cm^3', 2),
      part('(c)', 'Find the volume of urine made in 24 hours, in litres.', (urine * 60 * 24) / 1000, 'L', 2),
    ],
    solution: [
      `${reabsorbed}% of ${filtrate} = ${show((filtrate * reabsorbed) / 100, 2)} cm^3.`,
      `Urine = ${filtrate} - ${show((filtrate * reabsorbed) / 100, 2)} = ${show(urine, 2)} cm^3 per minute.`,
      `${show(urine, 2)} x 60 x 24 / 1000 = ${show((urine * 60 * 24) / 1000, 2)} L. ADH changes how much water is reabsorbed.`,
    ],
  }
}

function digestionGases(rng: Rng): ProblemBody {
  const tidal = int(rng, 40, 70) * 10
  const rate = int(rng, 10, 20)
  const exerciseRate = rate + int(rng, 6, 14)
  const exerciseTidal = tidal + int(rng, 5, 15) * 50
  return {
    statement: `At rest a person breathes ${rate} times per minute and takes in ${tidal} cm^3 of air with each breath. During exercise the person breathes ${exerciseRate} times per minute and takes in ${exerciseTidal} cm^3 with each breath.`,
    parts: [
      part('(a)', 'Find the volume of air breathed in per minute at rest, in litres.', (tidal * rate) / 1000, 'L', 2),
      part('(b)', 'Find the volume breathed in per minute during exercise, in litres.', (exerciseTidal * exerciseRate) / 1000, 'L', 2),
      part('(c)', 'By what percentage does the volume per minute increase during exercise, to the nearest whole number?', (((exerciseTidal * exerciseRate) / (tidal * rate)) - 1) * 100, '%', 0),
      part('(d)', `Air contains about 21% oxygen. How much oxygen is breathed in per minute at rest, in cm^3?`, ((tidal * rate) * 21) / 100, 'cm^3', 0),
    ],
    solution: [
      `${tidal} x ${rate} = ${tidal * rate} cm^3 = ${show((tidal * rate) / 1000, 2)} L per minute.`,
      `${exerciseTidal} x ${exerciseRate} = ${exerciseTidal * exerciseRate} cm^3 = ${show((exerciseTidal * exerciseRate) / 1000, 2)} L per minute.`,
      `Increase = (${exerciseTidal * exerciseRate} - ${tidal * rate}) / ${tidal * rate} x 100 = ${show((((exerciseTidal * exerciseRate) / (tidal * rate)) - 1) * 100, 0)}%. The brain raises breathing when carbon dioxide levels in the blood rise.`,
      `Oxygen = 21% of ${tidal * rate} = ${show(((tidal * rate) * 21) / 100, 0)} cm^3.`,
    ],
  }
}

function circulation(rng: Rng): ProblemBody {
  const rate = int(rng, 55, 85)
  const stroke = int(rng, 60, 85)
  const exerciseRate = rate + int(rng, 50, 90)
  const exerciseStroke = stroke + int(rng, 10, 40)
  const rest = (rate * stroke) / 1000
  const exercise = (exerciseRate * exerciseStroke) / 1000
  return {
    statement: `Cardiac output is the volume of blood pumped by one ventricle each minute (heart rate x stroke volume). At rest a person has a heart rate of ${rate} beats per minute and a stroke volume of ${stroke} cm^3. During exercise the heart rate is ${exerciseRate} beats per minute and the stroke volume is ${exerciseStroke} cm^3.`,
    parts: [
      part('(a)', 'Find the cardiac output at rest, in litres per minute.', rest, 'L/min', 2),
      part('(b)', 'Find the cardiac output during exercise, in litres per minute.', exercise, 'L/min', 2),
      part('(c)', 'How many times greater is the output during exercise, to two decimal places?', exercise / rest, '', 2),
    ],
    solution: [
      `${rate} x ${stroke} = ${rate * stroke} cm^3 = ${show(rest, 2)} L per minute.`,
      `${exerciseRate} x ${exerciseStroke} = ${exerciseRate * exerciseStroke} cm^3 = ${show(exercise, 2)} L per minute.`,
      `${show(exercise, 2)} / ${show(rest, 2)} = ${show(exercise / rest, 2)}. Muscles need more oxygen and glucose, so the heart pumps more blood.`,
    ],
  }
}

function plantTransport(rng: Rng): ProblemBody {
  const distance = int(rng, 20, 90)
  const time = pick(rng, [5, 10, 15, 20])
  const speedHigh = distance / time
  const lossStart = int(rng, 20, 60) / 10
  const lossEnd = lossStart + int(rng, 6, 20) / 10
  const area = int(rng, 20, 80)
  return {
    statement: `In a potometer experiment, an air bubble moves ${distance} mm in ${time} minutes along a capillary tube as a shoot takes up water. In another trial, a leaf shoot loses ${show(lossStart, 1)} g of water per hour in still air and ${show(lossEnd, 1)} g per hour in a draught, from a total leaf surface area of ${area} cm^2.`,
    parts: [
      part('(a)', 'Find the speed of the bubble, in mm per minute.', speedHigh, 'mm/min', 2),
      part('(b)', 'Find the percentage increase in water loss caused by the draught, to one decimal place.', ((lossEnd - lossStart) / lossStart) * 100, '%', 1),
      part('(c)', 'Find the water loss in the draught per cm^2 of leaf per hour, in mg (1 g = 1000 mg).', ((lossEnd * 1000) / area), 'mg', 1),
    ],
    solution: [
      `Speed = distance / time = ${distance} / ${time} = ${show(speedHigh, 2)} mm/min. The distance moved is a measure of the rate of transpiration.`,
      `Increase = (${show(lossEnd, 1)} - ${show(lossStart, 1)}) / ${show(lossStart, 1)} x 100 = ${show(((lossEnd - lossStart) / lossStart) * 100, 1)}%. Air movement removes water vapour, so the gradient is steeper.`,
      `${show(lossEnd, 1)} x 1000 / ${area} = ${show((lossEnd * 1000) / area, 1)} mg per cm^2 per hour.`,
    ],
  }
}

function ecology(rng: Rng): ProblemBody {
  if (rng() < 0.6) {
    const counts = [int(rng, 3, 20), int(rng, 2, 14), int(rng, 1, 9), int(rng, 1, 6)]
    const total = counts.reduce((a, b) => a + b, 0)
    const sum = counts.reduce((acc, n) => acc + n * (n - 1), 0)
    const index = 1 - sum / (total * (total - 1))
    return {
      statement: `A quadrat survey on a hedgerow finds four species with these numbers of individuals: ${counts.join(', ')}. Simpson's Diversity Index is Ds = 1 - (sum of n(n - 1)) / (N(N - 1)), where n is the number of one species and N the total number of organisms.`,
      parts: [
        part('(a)', 'Find N, the total number of organisms.', total, '', 0),
        part('(b)', 'Find the sum of n(n - 1) for the four species.', sum, '', 0),
        part('(c)', 'Find Ds, to two decimal places.', index, '', 2),
      ],
      solution: [
        `N = ${counts.join(' + ')} = ${total}.`,
        `Sum of n(n - 1) = ${counts.map((n) => `${n} x ${n - 1}`).join(' + ')} = ${sum}.`,
        `Ds = 1 - ${sum} / (${total} x ${total - 1}) = ${show(index, 2)}. A value closer to 1 means higher diversity.`,
      ],
    }
  }
  const carrying = int(rng, 18, 45) * 10
  const current = int(rng, Math.round(carrying * 0.3), Math.round(carrying * 0.6))
  const rise = int(rng, 20, Math.max(25, Math.round((carrying - current) * 0.7)))
  const newPopulation = current + rise
  return {
    statement: `A dune grassland can support about ${carrying} rabbits before resources become limiting. In spring the habitat contains ${current} rabbits. After a breeding season the population rises to ${newPopulation} rabbits.`,
    parts: [
      part('(a)', 'What percentage of the carrying capacity is the spring population, to one decimal place?', (current / carrying) * 100, '%', 1),
      part('(b)', 'How many more rabbits could the habitat support before it reaches carrying capacity?', carrying - newPopulation, '', 0),
      part('(c)', 'What percentage increase took place over the breeding season, to one decimal place?', (rise / current) * 100, '%', 1),
    ],
    solution: [
      `Percentage of carrying capacity = ${current} / ${carrying} x 100 = ${show((current / carrying) * 100, 1)}%.`,
      `Remaining capacity = ${carrying} - ${newPopulation} = ${carrying - newPopulation}.`,
      `Percentage increase = ${rise} / ${current} x 100 = ${show((rise / current) * 100, 1)}%.`,
    ],
  }
}

function microorganisms(rng: Rng): ProblemBody {
  const start = int(rng, 2, 9) * 100
  const doubling = pick(rng, [20, 30, 40])
  const generations = int(rng, 3, 8)
  const minutes = doubling * generations
  const final = start * 2 ** generations
  return {
    statement: `A culture of bacteria starts with ${start} cells and the population doubles every ${doubling} minutes during the log phase of growth. Nutrients do not run out.`,
    parts: [
      part('(a)', `How many generations occur in ${minutes} minutes?`, generations, '', 0),
      part('(b)', `How many cells are there after ${minutes} minutes?`, final, '', 0),
      part('(c)', 'By what factor does the population grow in that time?', 2 ** generations, '', 0),
    ],
    solution: [
      `Generations = ${minutes} / ${doubling} = ${generations}.`,
      `Cells = ${start} x 2^${generations} = ${final}.`,
      `Factor = 2^${generations} = ${2 ** generations}. In real cultures growth later slows in the stationary phase when nutrients run out.`,
    ],
  }
}

function geneticEngineering(rng: Rng): ProblemBody {
  const total = int(rng, 30, 90) * 100
  const cut1 = int(rng, 8, 14) * 100
  const cut2 = cut1 + int(rng, 6, 16) * 100
  const middle = cut2 - cut1
  const last = total - cut2
  return {
    statement: `A linear piece of DNA is ${total} base pairs (bp) long. A restriction enzyme cuts it at two sites, ${cut1} bp and ${cut2} bp from the left end. The fragments are then separated by gel electrophoresis.`,
    parts: [
      part('(a)', 'Find the size of the left fragment, in base pairs.', cut1, 'bp', 0),
      part('(b)', 'Find the size of the middle fragment, in base pairs.', middle, 'bp', 0),
      part('(c)', 'Find the size of the right fragment, in base pairs.', last, 'bp', 0),
    ],
    solution: [
      `Left fragment = ${cut1} bp.`,
      `Middle fragment = ${cut2} - ${cut1} = ${middle} bp.`,
      `Right fragment = ${total} - ${cut2} = ${last} bp. The three sizes add up to ${total}. On a gel the smallest fragment travels furthest from the wells.`,
    ],
  }
}

function investigation(rng: Rng): ProblemBody {
  const n = 5
  const base = int(rng, 20, 60)
  const values = Array.from({ length: n }, () => base + int(rng, -4, 4))
  const mean = values.reduce((a, b) => a + b, 0) / n
  const range = Math.max(...values) - Math.min(...values)
  const accepted = base + int(rng, -3, 3)
  const percentError = (Math.abs(mean - accepted) / accepted) * 100
  return {
    statement: `A student repeats a measurement five times and records: ${values.join(', ')}. The accepted value is ${accepted}.`,
    parts: [
      part('(a)', 'Find the mean, to one decimal place.', mean, '', 1),
      part('(b)', 'Find the range of the readings.', range, '', 0),
      part('(c)', 'Find the percentage difference between the mean and the accepted value (positive), to one decimal place.', percentError, '%', 1),
    ],
    solution: [
      `Mean = (${values.join(' + ')}) / ${n} = ${show(mean, 1)}.`,
      `Range = ${Math.max(...values)} - ${Math.min(...values)} = ${range}. A small range means the readings are precise.`,
      `Difference = |${show(mean, 1)} - ${accepted}| / ${accepted} x 100 = ${show(percentError, 1)}%. A small difference means accuracy is good.`,
    ],
  }
}

export const biologyGenerators: Record<string, ProblemGenerator> = {
  'bi-biomolecules': biomolecules,
  'bi-cells': cells,
  'bi-inheritance': inheritance,
  'bi-enzymes': enzymes,
  'bi-photo-resp': photoResp,
  'bi-cell-division': cellDivision,
  'bi-osmosis-urinary': osmosisUrinary,
  'bi-digestion-gases': digestionGases,
  'bi-circulation': circulation,
  'bi-plant-transport': plantTransport,
  'bi-ecology': ecology,
  'bi-microorganisms': microorganisms,
  'bi-genetic-engineering': geneticEngineering,
  'bi-investigation': investigation,
}

export function hasBiologyProblems(topicId: string): boolean {
  return topicId in biologyGenerators
}

export function biologyProblemTopicIds(): string[] {
  return Object.keys(biologyGenerators)
}

export function generateBiologyProblem(topicId: string, seed: string): PracticeProblem | undefined {
  const generator = biologyGenerators[topicId]
  if (!generator) return undefined
  const body = generator(createRng(`${topicId}:${seed}`))
  return { topicId, ...body, parts: body.parts.map((p) => ({ ...p, answer: p.answer + 0 })) }
}
