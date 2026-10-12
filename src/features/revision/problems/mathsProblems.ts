import { createRng, int, pick, round } from './rng'
import type { PracticeProblem, ProblemBody, ProblemGenerator, ProblemPart, Rng } from './types'

/*
 * Original practice problems for Leaving Certificate Mathematics (Higher). They
 * are written for this app, not copied or adapted from any exam paper. Numbers
 * come from a seed and every answer is computed in code. Normal probabilities
 * use z rounded to two places, as with the tables in the Formulae and Tables.
 */

const show = (value: number, decimals = 4) => String(Number(value.toFixed(decimals)))
const rad = (degrees: number) => (degrees * Math.PI) / 180
const deg = (radians: number) => (radians * 180) / Math.PI

function part(label: string, prompt: string, value: number, unit: string, decimals: number): ProblemPart {
  return { label, prompt, answer: round(value, decimals), unit, decimals }
}

/** "+ 3" or "- 3", for building expressions. */
const sg = (n: number) => (n < 0 ? `- ${-n}` : `+ ${n}`)

/** The standard normal distribution function. */
function phi(z: number): number {
  const x = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t
  const erf = 1 - poly * Math.exp(-x * x)
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf)
}

function factorial(n: number): number {
  let result = 1
  for (let i = 2; i <= n; i += 1) result *= i
  return result
}

function choose(n: number, k: number): number {
  let result = 1
  for (let i = 1; i <= k; i += 1) result = (result * (n - k + i)) / i
  return Math.round(result)
}

function algebra(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const p = pick(rng, [-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7])
    const q = int(rng, -12, 12)
    const c = p * p + q
    return {
      statement: `Write f(x) = x^2 ${sg(2 * p)}x ${sg(c)} in the form (x + p)^2 + q, where p and q are constants.`,
      parts: [
        part('(a)', 'Find p.', p, '', 0),
        part('(b)', 'Find q.', q, '', 0),
        part('(c)', 'Find the value of x at which f(x) has its minimum.', -p, '', 0),
      ],
      solution: [
        `Half the coefficient of x is ${p}, so f(x) = (x + ${p})^2 - ${p * p} ${sg(c)}. Write that as (x + ${p})^2 ${sg(q)}.`,
        `So p = ${p} and q = ${q}.`,
        `The square is smallest (zero) when x = ${-p}, so the minimum is at x = ${-p}.`,
      ],
    }
  }
  const a = int(rng, 2, 6)
  let b = int(rng, 2, 7)
  if (b === a) b += 1
  const m = int(rng, 1, 5)
  const n = int(rng, 1, 5)
  const x = (b * m + a * n) / (a - b)
  return {
    statement: `Solve ${a}/(x + ${m}) = ${b}/(x - ${n}) for x.`,
    parts: [part('(a)', 'Find x, to two decimal places if it is not a whole number.', x, '', 2)],
    solution: [
      `Cross-multiply: ${a}(x - ${n}) = ${b}(x + ${m}), so ${a}x - ${a * n} = ${b}x + ${b * m}.`,
      `Collect the x terms: (${a} - ${b})x = ${b * m} + ${a * n}, so x = ${show(x, 2)}.`,
    ],
  }
}

function equations(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.34) {
    const r1 = int(rng, 1, 9)
    const r2 = -int(rng, 1, 9)
    const b = -(r1 + r2)
    const c = r1 * r2
    return {
      statement: `Solve x^2 ${sg(b)}x ${sg(c)} = 0.`,
      parts: [part('(a)', 'Give the larger root.', r1, '', 0), part('(b)', 'Give the smaller root.', r2, '', 0)],
      solution: [
        `Look for two numbers with product ${c} and sum ${b}: ${-r1} and ${-r2}.`,
        `So (x - ${r1})(x ${sg(-r2)}) = 0 and the roots are ${r1} and ${r2}.`,
      ],
    }
  }
  if (roll < 0.67) {
    const x = int(rng, -6, 8)
    const y = int(rng, -6, 8)
    let a1 = int(rng, 1, 5)
    let b1 = int(rng, 1, 5)
    let a2 = int(rng, 1, 5)
    let b2 = -int(rng, 1, 5)
    if (a1 * b2 - a2 * b1 === 0) b2 -= 1
    const c1 = a1 * x + b1 * y
    const c2 = a2 * x + b2 * y
    a1 = Math.abs(a1)
    b1 = Math.abs(b1)
    a2 = Math.abs(a2)
    return {
      statement: `Solve the simultaneous equations ${a1}x + ${b1}y = ${c1} and ${a2}x ${sg(b2)}y = ${c2}.`,
      parts: [part('(a)', 'Find x.', x, '', 0), part('(b)', 'Find y.', y, '', 0)],
      solution: [
        `Eliminate y: multiply the first equation by ${Math.abs(b2)} and the second by ${b1}, then combine the two equations to remove y.`,
        `This gives x = ${x}. Substitute back into one equation to get y = ${y}.`,
        `Check in the other equation: ${a2}(${x}) ${sg(b2)}(${y}) = ${c2}.`,
      ],
    }
  }
  const p = int(rng, 2, 7)
  const q = int(rng, 1, 15)
  const r = int(rng, 5, 40)
  const smallest = Math.floor((r + q) / p) + 1
  return {
    statement: `Find the smallest integer x that satisfies ${p}x - ${q} > ${r}.`,
    parts: [part('(a)', 'Find the smallest integer x.', smallest, '', 0)],
    solution: [
      `Add ${q}: ${p}x > ${r + q}. Divide by ${p}: x > ${show((r + q) / p, 3)}.`,
      `The smallest integer greater than that is ${smallest}. (If the division is exact, x must be strictly greater.)`,
    ],
  }
}

function polynomials(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const r = int(rng, 1, 4)
    const s = int(rng, -5, 5)
    let t = int(rng, -5, 5)
    if (t === s) t += 1
    const p = -(s + t)
    const q = s * t
    const k = p - r
    const m = q - r * p
    const n = -r * q
    return {
      statement: `x = ${r} is a root of f(x) = x^3 + kx^2 ${sg(m)}x ${sg(n)}, where k is a constant. The other two roots are whole numbers.`,
      parts: [
        part('(a)', 'Find k.', k, '', 0),
        part('(b)', 'Find the larger of the other two roots.', Math.max(s, t), '', 0),
        part('(c)', 'Find the smaller of the other two roots.', Math.min(s, t), '', 0),
      ],
      solution: [
        `f(${r}) = 0, so ${r ** 3} + ${r * r}k ${sg(m * r)} ${sg(n)} = 0, which gives k = ${k}.`,
        `Divide by (x - ${r}) to get x^2 ${sg(p)}x ${sg(q)}.`,
        `Factorise: (x ${sg(-s)})(x ${sg(-t)}). The other roots are ${Math.max(s, t)} and ${Math.min(s, t)}.`,
      ],
    }
  }
  const a = int(rng, 1, 3)
  const b = int(rng, -6, 6)
  const c = int(rng, -8, 8)
  const d = int(rng, -10, 10)
  const r = pick(rng, [-3, -2, -1, 1, 2, 3])
  const remainder = a * r ** 3 + b * r * r + c * r + d
  return {
    statement: `f(x) = ${a}x^3 ${sg(b)}x^2 ${sg(c)}x ${sg(d)} is divided by (x ${sg(-r)}).`,
    parts: [part('(a)', 'Find the remainder.', remainder, '', 0)],
    solution: [
      `By the remainder theorem the remainder is f(${r}).`,
      `f(${r}) = ${a}(${r ** 3}) ${sg(b * r * r)} ${sg(c * r)} ${sg(d)} = ${remainder}.`,
    ],
  }
}

function indicesLogs(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const a = pick(rng, [2, 3, 5, 7])
    const b = int(rng, 20, 400)
    const x = Math.log(b) / Math.log(a)
    return {
      statement: `Solve ${a}^x = ${b} by taking logarithms.`,
      parts: [part('(a)', 'Find x, to four decimal places.', x, '', 4)],
      solution: [`Take logs: x log ${a} = log ${b}.`, `x = log ${b} / log ${a} = ${show(x, 4)}.`],
    }
  }
  const p = int(rng, 2, 4)
  const q = int(rng, 0, p - 1)
  const x0 = 2 ** p
  const k = 2 ** p - 2 ** q
  return {
    statement: `Solve log_2(x) + log_2(x - ${k}) = ${p + q}, where x > ${k}.`,
    parts: [part('(a)', 'Find x.', x0, '', 0)],
    solution: [
      `Combine the logs: log_2(x(x - ${k})) = ${p + q}, so x(x - ${k}) = 2^${p + q} = ${2 ** (p + q)}.`,
      `Then x^2 - ${k}x - ${2 ** (p + q)} = 0, with roots ${x0} and ${-(2 ** q)}. Only x > ${k} is allowed, so x = ${x0}.`,
    ],
  }
}

function complexNumbers(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const a = int(rng, -6, 6)
    const b = pick(rng, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    const c = int(rng, -6, 6)
    const d = pick(rng, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    const re = a * c - b * d
    const im = a * d + b * c
    return {
      statement: `z1 = ${a} ${sg(b)}i and z2 = ${c} ${sg(d)}i, where i^2 = -1. Work out z1 x z2 in the form x + yi.`,
      parts: [part('(a)', 'Find the real part x.', re, '', 0), part('(b)', 'Find the imaginary part y.', im, '', 0), part('(c)', 'Find |z1|.', Math.hypot(a, b), '', 2)],
      solution: [
        `Multiply out: (${a})(${c}) + (${a})(${d})i + (${b})(${c})i + (${b})(${d})i^2.`,
        `Real part = ${a * c} - (${b * d}) = ${re}. Imaginary part = ${a * d} + ${b * c} = ${im}.`,
        `|z1| = sqrt(${a}^2 + ${b}^2) = ${show(Math.hypot(a, b), 2)}.`,
      ],
    }
  }
  const r = int(rng, 2, 4)
  const theta = pick(rng, [15, 20, 25, 30, 40, 45])
  const n = pick(rng, [3, 4, 5, 6])
  const rawAngle = n * theta
  const angle = ((rawAngle % 360) + 360) % 360
  return {
    statement: `z = ${r}(cos ${theta} degrees + i sin ${theta} degrees). Use De Moivre's theorem to find z^${n}.`,
    parts: [
      part('(a)', `Find the modulus of z^${n}.`, r ** n, '', 0),
      part('(b)', `Find the principal argument of z^${n}, in degrees.`, angle, 'degrees', 0),
      part('(c)', `Find the real part of z^${n}, to two decimal places.`, r ** n * Math.cos(rad(angle)), '', 2),
    ],
    solution: [
      `De Moivre: z^${n} = ${r}^${n}(cos ${n}x${theta} degrees + i sin ${n}x${theta} degrees).`,
      `Modulus ${r ** n}. The raw argument is ${rawAngle} degrees, so the principal argument is ${angle} degrees.`,
      `Real part = ${r ** n} cos ${angle} degrees = ${show(r ** n * Math.cos(rad(angle)), 2)}.`,
    ],
  }
}

function sequences(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const a = int(rng, 2, 12)
    const d = int(rng, 2, 7)
    const n = int(rng, 15, 30)
    const tn = a + (n - 1) * d
    const sn = (n * (2 * a + (n - 1) * d)) / 2
    const bound = int(rng, 8, 20) * 10 + a
    const firstN = Math.floor((bound - a) / d) + 2
    return {
      statement: `An arithmetic sequence has first term ${a} and common difference ${d}.`,
      parts: [
        part('(a)', `Find T_${n}.`, tn, '', 0),
        part('(b)', `Find S_${n}, the sum of the first ${n} terms.`, sn, '', 0),
        part('(c)', `Find the smallest n for which T_n is greater than ${bound}.`, firstN, '', 0),
      ],
      solution: [
        `T_n = a + (n - 1)d, so T_${n} = ${a} + ${n - 1} x ${d} = ${tn}.`,
        `S_n = n/2 (2a + (n - 1)d) = ${n}/2 x (${2 * a} + ${(n - 1) * d}) = ${sn}.`,
        `Solve ${a} + (n - 1) x ${d} > ${bound}: n > ${show((bound - a) / d + 1, 3)}, so n = ${firstN}.`,
      ],
    }
  }
  const a = int(rng, 2, 20)
  const r = pick(rng, [0.5, 0.6, 0.75, 0.8])
  return {
    statement: `A geometric series has first term ${a} and common ratio ${r}.`,
    parts: [
      part('(a)', 'Find the sum to infinity.', a / (1 - r), '', 2),
      part('(b)', 'Find the 5th term.', a * r ** 4, '', 3),
      part('(c)', 'Find the sum of the first 8 terms.', (a * (1 - r ** 8)) / (1 - r), '', 2),
    ],
    solution: [
      `S_infinity = a / (1 - r) = ${a} / ${show(1 - r, 2)} = ${show(a / (1 - r), 2)}, because |r| < 1.`,
      `T_5 = a r^4 = ${a} x ${r}^4 = ${show(a * r ** 4, 3)}.`,
      `S_8 = a(1 - r^8) / (1 - r) = ${show((a * (1 - r ** 8)) / (1 - r), 2)}.`,
    ],
  }
}

function financial(rng: Rng): ProblemBody {
  const principal = int(rng, 4, 40) * 500
  const rate = pick(rng, [2, 3, 4, 5, 6])
  const years = int(rng, 3, 10)
  const monthly = (1 + rate / 100) ** (1 / 12) - 1
  const loan = int(rng, 5, 30) * 1000
  const months = pick(rng, [24, 36, 48, 60])
  const payment = (loan * monthly) / (1 - (1 + monthly) ** -months)
  return {
    statement: `A sum of EUR ${principal} is invested at an annual equivalent rate of ${rate}%, with compound interest.`,
    parts: [
      part('(a)', `Find the value after ${years} years, in EUR.`, principal * (1 + rate / 100) ** years, 'EUR', 2),
      part('(b)', 'Find the equivalent monthly rate, as a percentage to four decimal places.', monthly * 100, '%', 4),
      part(
        '(c)',
        `A loan of EUR ${loan} is repaid in ${months} equal monthly payments, the first one month after the loan, at the same annual equivalent rate. Find the monthly payment, in EUR.`,
        payment,
        'EUR',
        2,
      ),
    ],
    solution: [
      `F = P(1 + i)^t = ${principal} x ${show(1 + rate / 100, 2)}^${years} = ${show(principal * (1 + rate / 100) ** years, 2)}.`,
      `Monthly rate: (1 + i)^12 = ${show(1 + rate / 100, 2)}, so i = ${show(monthly * 100, 4)}%.`,
      `Loan formula: A = P i / (1 - (1 + i)^-n) = ${loan} x ${show(monthly, 6)} / (1 - ${show((1 + monthly) ** -months, 6)}) = ${show(payment, 2)}.`,
    ],
  }
}

function functions(rng: Rng): ProblemBody {
  const a = int(rng, 2, 5)
  const b = int(rng, -4, 6)
  const c = b - int(rng, 1, 6)
  const k = int(rng, 1, 4)
  const m = int(rng, 5, 30)
  const disc = a * a - 4 * (c - b)
  const larger = (a + Math.sqrt(disc)) / 2
  return {
    statement: `f(x) = ${a}x ${sg(b)} and g(x) = x^2 ${sg(c)}.`,
    parts: [
      part('(a)', `Find f(g(${k})).`, a * (k * k + c) + b, '', 0),
      part('(b)', `Find f^-1(${m}), where f^-1 is the inverse of f.`, (m - b) / a, '', 2),
      part('(c)', 'Find the larger solution of f(x) = g(x), to two decimal places.', larger, '', 2),
    ],
    solution: [
      `g(${k}) = ${k * k + c}, so f(g(${k})) = ${a}(${k * k + c}) ${sg(b)} = ${a * (k * k + c) + b}.`,
      `Let y = ${a}x ${sg(b)}. Then x = (y - ${b}) / ${a}, so f^-1(${m}) = ${show((m - b) / a, 2)}.`,
      `Solve x^2 ${sg(c)} = ${a}x ${sg(b)}, so x^2 - ${a}x ${sg(c - b)} = 0, and x = (${a} + sqrt(${disc})) / 2 = ${show(larger, 2)}.`,
    ],
  }
}

function expGrowth(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const n0 = int(rng, 2, 9) * 100
    const t1 = pick(rng, [2, 3, 4])
    const n1 = Math.round(n0 * pick(rng, [1.5, 2, 2.5, 3]))
    const k = Math.log(n1 / n0) / t1
    return {
      statement: `The number of bacteria in a culture is N = N0 e^(kt), where t is in hours. At t = 0 there are ${n0}, and at t = ${t1} there are ${n1}.`,
      parts: [
        part('(a)', 'Find k, to four decimal places.', k, 'per hour', 4),
        part('(b)', 'Find the number after 10 hours, to the nearest whole number.', n0 * Math.exp(10 * k), '', 0),
        part('(c)', 'Find how long the number takes to double, in hours to two decimal places.', Math.log(2) / k, 'hours', 2),
      ],
      solution: [
        `${n1} = ${n0}e^(${t1}k), so k = ln(${n1}/${n0}) / ${t1} = ${show(k, 4)}.`,
        `N(10) = ${n0}e^(10k) = ${show(n0 * Math.exp(10 * k), 0)}.`,
        `Doubling: e^(kt) = 2, so t = ln 2 / k = ${show(Math.log(2) / k, 2)} hours.`,
      ],
    }
  }
  const a0 = int(rng, 4, 20) * 10
  const half = pick(rng, [4, 6, 8, 12, 20])
  const k = Math.log(2) / half
  const t = int(rng, 10, 40)
  return {
    statement: `A radioactive sample has mass A = ${a0} e^(-kt) grams after t days, and its half-life is ${half} days.`,
    parts: [
      part('(a)', 'Find k, to four decimal places.', k, 'per day', 4),
      part('(b)', `Find the mass after ${t} days, to two decimal places.`, a0 * Math.exp(-k * t), 'g', 2),
      part('(c)', 'Find how long it takes for the mass to fall to 10% of the original, in days to one decimal place.', Math.log(10) / k, 'days', 1),
    ],
    solution: [
      `After one half-life the mass is half: e^(-k x ${half}) = 1/2, so k = ln 2 / ${half} = ${show(k, 4)}.`,
      `A(${t}) = ${a0} e^(-${show(k, 4)} x ${t}) = ${show(a0 * Math.exp(-k * t), 2)} g.`,
      `Solve e^(-kt) = 0.1: t = ln 10 / k = ${show(Math.log(10) / k, 1)} days.`,
    ],
  }
}

function differentiation(rng: Rng): ProblemBody {
  const roll = rng()
  let label: string
  let f: (x: number) => number
  let df: (x: number) => number
  let x0: number
  let method: string
  if (roll < 0.34) {
    const a = int(rng, 2, 4)
    const b = int(rng, -3, 3)
    const n = int(rng, 3, 5)
    x0 = int(rng, 1, 2)
    label = `(${a}x ${sg(b)})^${n}`
    f = (x) => (a * x + b) ** n
    df = (x) => n * a * (a * x + b) ** (n - 1)
    method = `chain rule: f'(x) = ${n} x ${a} x (${a}x ${sg(b)})^${n - 1}`
  } else if (roll < 0.67) {
    const m = int(rng, 2, 3)
    const k = pick(rng, [-1, 1, 2])
    x0 = 1
    label = `x^${m} e^(${k}x)`
    f = (x) => x ** m * Math.exp(k * x)
    df = (x) => (m * x ** (m - 1) + k * x ** m) * Math.exp(k * x)
    method = `product rule: f'(x) = (${m}x^${m - 1} + ${k}x^${m}) e^(${k}x)`
  } else {
    const c = int(rng, 1, 4)
    x0 = int(rng, 1, 3)
    label = `x / (x + ${c})`
    f = (x) => x / (x + c)
    df = (x) => c / (x + c) ** 2
    method = `quotient rule: f'(x) = ${c} / (x + ${c})^2`
  }
  const slope = df(x0)
  const value = f(x0)
  return {
    statement: `f(x) = ${label}. Find the tangent to the curve at x = ${x0}.`,
    parts: [
      part('(a)', `Find f(${x0}), to three decimal places.`, value, '', 3),
      part('(b)', `Find f'(${x0}), the slope of the tangent, to three decimal places.`, slope, '', 3),
      part('(c)', 'The tangent has equation y = mx + c. Find c, to three decimal places.', value - slope * x0, '', 3),
    ],
    solution: [
      `Substitute x = ${x0}: f(${x0}) = ${show(value, 3)}.`,
      `Differentiate using the ${method}. Then f'(${x0}) = ${show(slope, 3)}.`,
      `Use y - ${show(value, 3)} = ${show(slope, 3)}(x - ${x0}): c = ${show(value, 3)} - ${show(slope, 3)} x ${x0} = ${show(value - slope * x0, 3)}.`,
    ],
  }
}

function calculusApplications(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.34) {
    const p = int(rng, 1, 4)
    const q = int(rng, -10, 10)
    return {
      statement: `f(x) = x^3 - ${3 * p * p}x ${sg(q)}. Find its turning points.`,
      parts: [
        part('(a)', 'Find the x-coordinate of the local minimum.', p, '', 0),
        part('(b)', 'Find the value of f at the local minimum.', -2 * p ** 3 + q, '', 0),
        part('(c)', 'Find the value of f at the local maximum.', 2 * p ** 3 + q, '', 0),
      ],
      solution: [
        `f'(x) = 3x^2 - ${3 * p * p} = 0, so x = ${p} or x = ${-p}.`,
        `f''(x) = 6x. f''(${p}) is positive, so a minimum at x = ${p}; f(${p}) = ${-2 * p ** 3 + q}.`,
        `f''(${-p}) is negative, so a maximum at x = ${-p}; f(${-p}) = ${2 * p ** 3 + q}.`,
      ],
    }
  }
  if (roll < 0.67) {
    const length = int(rng, 6, 30) * 4
    return {
      statement: `A farmer has ${length} m of fencing for three sides of a rectangular field. The fourth side is a straight wall.`,
      parts: [
        part('(a)', 'Find the width (the two sides at right angles to the wall) that gives the greatest area.', length / 4, 'm', 2),
        part('(b)', 'Find the greatest area.', (length * length) / 8, 'm^2', 2),
      ],
      solution: [
        `Let the two equal sides be x. The side along the wall is ${length} - 2x, so A = x(${length} - 2x).`,
        `dA/dx = ${length} - 4x = 0, so x = ${length / 4}. d2A/dx2 = -4 is negative, so this is a maximum.`,
        `A = ${length / 4} x ${length / 2} = ${(length * length) / 8} m^2.`,
      ],
    }
  }
  const r = int(rng, 2, 9)
  const rate = int(rng, 2, 10) * 10
  const drdt = rate / (4 * Math.PI * r * r)
  return {
    statement: `A spherical balloon is inflated so that its volume increases at ${rate} cm^3 per second. The volume of a sphere is V = (4/3) pi r^3.`,
    parts: [part('(a)', `Find the rate at which the radius is increasing when r = ${r} cm, in cm per second to four decimal places.`, drdt, 'cm/s', 4)],
    solution: [
      `dV/dr = 4 pi r^2, so dV/dt = 4 pi r^2 x dr/dt.`,
      `${rate} = 4 pi (${r})^2 x dr/dt, so dr/dt = ${show(drdt, 4)} cm/s.`,
    ],
  }
}

function integration(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.34) {
    const p = int(rng, 1, 6)
    const q = int(rng, -6, 6)
    const r = int(rng, -5, 8)
    const lo = int(rng, 0, 2)
    const hi = lo + int(rng, 1, 4)
    const anti = (x: number) => (p * x ** 3) / 3 + (q * x ** 2) / 2 + r * x
    return {
      statement: `Evaluate the integral of (${p}x^2 ${sg(q)}x ${sg(r)}) dx from x = ${lo} to x = ${hi}.`,
      parts: [part('(a)', 'Give the value, to two decimal places.', anti(hi) - anti(lo), '', 2)],
      solution: [
        `An antiderivative is ${show(p / 3, 3)}x^3 ${sg(q / 2)}x^2 ${sg(r)}x.`,
        `Value at ${hi} minus value at ${lo}: ${show(anti(hi), 3)} - ${show(anti(lo), 3)} = ${show(anti(hi) - anti(lo), 2)}.`,
      ],
    }
  }
  if (roll < 0.67) {
    const k = int(rng, 2, 9)
    return {
      statement: `The curve y = x^2 and the line y = ${k}x enclose a region.`,
      parts: [
        part('(a)', 'Find the x-coordinate of the second point where they meet (the first is the origin).', k, '', 0),
        part('(b)', 'Find the area of the region, to two decimal places.', k ** 3 / 6, '', 2),
      ],
      solution: [
        `x^2 = ${k}x gives x = 0 or x = ${k}.`,
        `Area = integral from 0 to ${k} of (${k}x - x^2) dx = [${k}x^2/2 - x^3/3] = ${show(k ** 3 / 6, 2)}.`,
      ],
    }
  }
  const h = pick(rng, [0.5, 1, 2])
  const ys = Array.from({ length: 5 }, () => int(rng, 4, 40) / 2)
  const estimate = (h / 2) * (ys[0] + ys[4] + 2 * (ys[1] + ys[2] + ys[3]))
  const average = estimate / (4 * h)
  return {
    statement: `The values of a function at equally spaced points, ${h} apart, are ${ys.join(', ')}. Use the trapezoidal rule with 4 strips.`,
    parts: [
      part('(a)', 'Estimate the area under the curve, to two decimal places.', estimate, '', 2),
      part('(b)', 'Use it to estimate the average value of the function over this interval.', average, '', 2),
    ],
    solution: [
      `Area ~ (h/2)[first + last + 2(sum of the middle values)] = (${h}/2)[${ys[0]} + ${ys[4]} + 2(${ys[1] + ys[2] + ys[3]})] = ${show(estimate, 2)}.`,
      `Average value = area / length of interval = ${show(estimate, 2)} / ${4 * h} = ${show(average, 2)}.`,
    ],
  }
}

function trigIdentities(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const [o, a, h] = pick(rng, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]])
    const sin = o / h
    const cos = a / h
    return {
      statement: `A is an acute angle and sin A = ${o}/${h}.`,
      parts: [
        part('(a)', 'Find cos A, to four decimal places.', cos, '', 4),
        part('(b)', 'Find sin 2A, to four decimal places.', 2 * sin * cos, '', 4),
        part('(c)', 'Find cos 2A, to four decimal places.', 1 - 2 * sin * sin, '', 4),
      ],
      solution: [
        `cos^2 A = 1 - sin^2 A = 1 - ${show(sin * sin, 4)}, so cos A = ${show(cos, 4)} (A is acute).`,
        `sin 2A = 2 sin A cos A = 2 x ${show(sin, 4)} x ${show(cos, 4)} = ${show(2 * sin * cos, 4)}.`,
        `cos 2A = 1 - 2 sin^2 A = ${show(1 - 2 * sin * sin, 4)}.`,
      ],
    }
  }
  const theta = pick(rng, [20, 25, 30, 35, 40, 50, 55, 60, 65, 70])
  const useTan = rng() < 0.5
  if (useTan) {
    const t = round(Math.tan(rad(theta)), 3)
    const first = deg(Math.atan(t))
    return {
      statement: `Solve tan x = ${t} for 0 degrees <= x <= 360 degrees.`,
      parts: [
        part('(a)', 'Find the smaller solution, in degrees to one decimal place.', first, 'degrees', 1),
        part('(b)', 'Find the larger solution, in degrees to one decimal place.', first + 180, 'degrees', 1),
      ],
      solution: [`tan x is positive in the first and third quadrants. x = tan^-1(${t}) = ${show(first, 1)}.`, `The other solution is ${show(first, 1)} + 180 = ${show(first + 180, 1)} degrees.`],
    }
  }
  const s = round(Math.sin(rad(theta)), 3)
  const first = deg(Math.asin(s))
  return {
    statement: `Solve sin x = ${s} for 0 degrees <= x <= 360 degrees.`,
    parts: [
      part('(a)', 'Find the smaller solution, in degrees to one decimal place.', first, 'degrees', 1),
      part('(b)', 'Find the larger solution, in degrees to one decimal place.', 180 - first, 'degrees', 1),
    ],
    solution: [`sin x is positive in the first and second quadrants. x = sin^-1(${s}) = ${show(first, 1)}.`, `The second quadrant solution is 180 - ${show(first, 1)} = ${show(180 - first, 1)} degrees.`],
  }
}

function counting(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const n = int(rng, 8, 14)
    const k = int(rng, 3, 5)
    return {
      statement: `A committee of ${k} is chosen from ${n} people. Ciara is one of the ${n} people.`,
      parts: [
        part('(a)', 'How many committees are possible?', choose(n, k), '', 0),
        part('(b)', 'How many of them include Ciara?', choose(n - 1, k - 1), '', 0),
        part('(c)', 'How many do not include Ciara?', choose(n - 1, k), '', 0),
      ],
      solution: [
        `Order does not matter, so use combinations: ${n}C${k} = ${choose(n, k)}.`,
        `If Ciara is on the committee, choose the other ${k - 1} from the remaining ${n - 1}: ${n - 1}C${k - 1} = ${choose(n - 1, k - 1)}.`,
        `Without Ciara, choose all ${k} from the other ${n - 1}: ${n - 1}C${k} = ${choose(n - 1, k)}. (Check: the two cases add up to the total.)`,
      ],
    }
  }
  const word = pick(rng, ['BANANA', 'STATISTICS', 'MISSISSIPPI', 'LEAVING', 'ENGINEER'])
  const counts = new Map<string, number>()
  for (const letter of word) counts.set(letter, (counts.get(letter) ?? 0) + 1)
  const arrangements = (map: Map<string, number>, length: number) => {
    let result = factorial(length)
    for (const value of map.values()) result /= factorial(value)
    return Math.round(result)
  }
  const firstLetter = word[0]
  const rest = new Map(counts)
  rest.set(firstLetter, (rest.get(firstLetter) ?? 1) - 1)
  return {
    statement: `The letters of the word ${word} are rearranged in a line.`,
    parts: [
      part('(a)', 'How many different arrangements are there?', arrangements(counts, word.length), '', 0),
      part('(b)', `How many of them start with the letter ${firstLetter}?`, arrangements(rest, word.length - 1), '', 0),
    ],
    solution: [
      `Divide ${word.length}! by the factorial of each repeated letter's count: ${[...counts.entries()].filter(([, count]) => count > 1).map(([letter, count]) => `${letter} appears ${count} times`).join(', ') || 'no letter repeats'}.`,
      `Total = ${arrangements(counts, word.length)}.`,
      `Fix ${firstLetter} first and arrange the other ${word.length - 1} letters in the same way: ${arrangements(rest, word.length - 1)}.`,
    ],
  }
}

function probability(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.34) {
    const a = int(rng, 2, 8) / 10
    const b = int(rng, 2, 8) / 10
    return {
      statement: `A and B are independent events with P(A) = ${a} and P(B) = ${b}.`,
      parts: [
        part('(a)', 'Find P(A and B).', a * b, '', 4),
        part('(b)', 'Find P(A or B).', a + b - a * b, '', 4),
        part('(c)', 'Find the probability that exactly one of A and B happens.', a * (1 - b) + b * (1 - a), '', 4),
      ],
      solution: [
        `Independent events: P(A and B) = ${a} x ${b} = ${show(a * b)}.`,
        `P(A or B) = P(A) + P(B) - P(A and B) = ${show(a + b - a * b)}.`,
        `Exactly one: ${a}(${show(1 - b, 1)}) + ${b}(${show(1 - a, 1)}) = ${show(a * (1 - b) + b * (1 - a))}.`,
      ],
    }
  }
  if (roll < 0.67) {
    const n = int(rng, 5, 12)
    const p = pick(rng, [0.1, 0.2, 0.25, 0.3, 0.4, 0.5])
    const k = int(rng, 1, Math.min(4, n))
    const exact = choose(n, k) * p ** k * (1 - p) ** (n - k)
    return {
      statement: `A game is won with probability ${p} each time it is played, independently. It is played ${n} times.`,
      parts: [
        part('(a)', `Find the probability of winning exactly ${k} times.`, exact, '', 4),
        part('(b)', 'Find the probability of winning at least once.', 1 - (1 - p) ** n, '', 4),
        part('(c)', 'Find the expected number of wins.', n * p, '', 2),
      ],
      solution: [
        `Binomial: P(X = ${k}) = ${n}C${k} x ${p}^${k} x ${show(1 - p, 2)}^${n - k} = ${show(exact)}.`,
        `P(at least one) = 1 - P(none) = 1 - ${show(1 - p, 2)}^${n} = ${show(1 - (1 - p) ** n)}.`,
        `Expected value = np = ${n} x ${p} = ${show(n * p, 2)}.`,
      ],
    }
  }
  const red = int(rng, 3, 8)
  const blue = int(rng, 3, 8)
  const total = red + blue
  return {
    statement: `A bag holds ${red} red and ${blue} blue counters. Two counters are taken at random without replacement.`,
    parts: [
      part('(a)', 'Find the probability that both are red.', (red * (red - 1)) / (total * (total - 1)), '', 4),
      part('(b)', 'Find the probability that they are different colours.', (2 * red * blue) / (total * (total - 1)), '', 4),
      part('(c)', 'Given that the first is red, find the probability that the second is also red.', (red - 1) / (total - 1), '', 4),
    ],
    solution: [
      `P(both red) = ${red}/${total} x ${red - 1}/${total - 1} = ${show((red * (red - 1)) / (total * (total - 1)))}.`,
      `Different colours: red then blue plus blue then red = 2 x ${red}/${total} x ${blue}/${total - 1} = ${show((2 * red * blue) / (total * (total - 1)))}.`,
      `After one red is gone, ${red - 1} red remain out of ${total - 1}: ${show((red - 1) / (total - 1))}.`,
    ],
  }
}

function statsData(rng: Rng): ProblemBody {
  const n = int(rng, 7, 9)
  const data = Array.from({ length: n }, () => int(rng, 2, 30))
  const sorted = [...data].sort((a, b) => a - b)
  const mean = data.reduce((sum, value) => sum + value, 0) / n
  const median = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  const sd = Math.sqrt(data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n)
  return {
    statement: `The data set is ${data.join(', ')}. Treat it as a whole population.`,
    parts: [
      part('(a)', 'Find the mean, to two decimal places.', mean, '', 2),
      part('(b)', 'Find the median.', median, '', 1),
      part('(c)', 'Find the standard deviation, to two decimal places.', sd, '', 2),
    ],
    solution: [
      `Mean = sum / n = ${data.reduce((sum, value) => sum + value, 0)} / ${n} = ${show(mean, 2)}.`,
      `Ordered: ${sorted.join(', ')}. The median is ${show(median, 1)}.`,
      `Standard deviation = sqrt(sum of (x - mean)^2 / n) = ${show(sd, 2)}.`,
    ],
  }
}

function normal(rng: Rng): ProblemBody {
  const mu = int(rng, 40, 120)
  const sigma = int(rng, 4, 15)
  const x1 = mu + Math.round(sigma * (int(rng, -20, 25) / 10))
  const x2 = mu + Math.round(sigma * (int(rng, 5, 25) / 10))
  const z1 = round((x1 - mu) / sigma, 2)
  const z2 = round((x2 - mu) / sigma, 2)
  return {
    statement: `X is normally distributed with mean ${mu} and standard deviation ${sigma}. Use z rounded to two decimal places, as in the tables.`,
    parts: [
      part('(a)', `Find the z-value for X = ${x1}, to two decimal places.`, z1, '', 2),
      part('(b)', `Find P(X < ${x1}), to four decimal places.`, phi(z1), '', 4),
      part('(c)', `Find P(X > ${x2}), to four decimal places.`, 1 - phi(z2), '', 4),
    ],
    solution: [
      `z = (x - mean) / standard deviation = (${x1} - ${mu}) / ${sigma} = ${show(z1, 2)}.`,
      `Read the area to the left of z = ${show(z1, 2)} from the tables: ${show(phi(z1))}.`,
      `For X > ${x2}: z = ${show(z2, 2)}, so P(X > ${x2}) = 1 - ${show(phi(z2))} = ${show(1 - phi(z2))}.`,
    ],
  }
}

function inference(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const n = pick(rng, [100, 200, 400, 625, 900, 1000, 1600])
    const percent = int(rng, 30, 70)
    const margin = 100 / Math.sqrt(n)
    return {
      statement: `In a random sample of ${n} people, ${percent}% support a plan. Use the margin of error 1/sqrt(n).`,
      parts: [
        part('(a)', 'Find the margin of error, as a percentage to two decimal places.', margin, '%', 2),
        part('(b)', 'Find the lower end of the 95% confidence interval for the population percentage.', percent - margin, '%', 2),
        part('(c)', 'Find the upper end of the interval.', percent + margin, '%', 2),
      ],
      solution: [
        `Margin of error = 1/sqrt(${n}) = ${show(1 / Math.sqrt(n), 4)}, which is ${show(margin, 2)}%.`,
        `The 95% confidence interval is ${percent}% plus or minus ${show(margin, 2)}%.`,
        `So it runs from ${show(percent - margin, 2)}% to ${show(percent + margin, 2)}%.`,
      ],
    }
  }
  const mu = int(rng, 20, 80)
  const sigma = int(rng, 3, 10)
  const n = pick(rng, [25, 36, 49, 64, 100])
  const mean = mu + (int(rng, 5, 25) / 10) * (sigma / Math.sqrt(n))
  const z = round((mean - mu) / (sigma / Math.sqrt(n)), 2)
  return {
    statement: `A population is believed to have mean ${mu} and standard deviation ${sigma}. A sample of ${n} has mean ${show(mean, 2)}. Test the claim that the mean is ${mu}, using a two-tailed test.`,
    parts: [
      part('(a)', 'Find the standard error, to three decimal places.', sigma / Math.sqrt(n), '', 3),
      part('(b)', 'Find the z-score of the sample mean, to two decimal places.', z, '', 2),
      part('(c)', 'Find the p-value, to four decimal places.', 2 * (1 - phi(Math.abs(z))), '', 4),
    ],
    solution: [
      `Standard error = ${sigma} / sqrt(${n}) = ${show(sigma / Math.sqrt(n), 3)}.`,
      `z = (${show(mean, 2)} - ${mu}) / ${show(sigma / Math.sqrt(n), 3)} = ${show(z, 2)}.`,
      `Two-tailed p-value = 2 x P(Z > ${show(Math.abs(z), 2)}) = ${show(2 * (1 - phi(Math.abs(z))))}. Reject the claim only if this is below the 5% significance level (0.05).`,
    ],
  }
}

function coordLine(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const x1 = int(rng, -6, 6)
    const y1 = int(rng, -6, 6)
    let x2 = int(rng, -6, 6)
    const y2 = int(rng, -6, 6)
    if (x2 === x1) x2 += 3
    const m = (y2 - y1) / (x2 - x1)
    return {
      statement: `A is the point (${x1}, ${y1}) and B is the point (${x2}, ${y2}).`,
      parts: [
        part('(a)', 'Find the length |AB|, to two decimal places.', Math.hypot(x2 - x1, y2 - y1), '', 2),
        part('(b)', 'Find the slope of AB, to two decimal places.', m, '', 2),
        part('(c)', 'Find where the line AB crosses the y-axis, to two decimal places.', y1 - m * x1, '', 2),
      ],
      solution: [
        `|AB| = sqrt((${x2} - ${x1})^2 + (${y2} - ${y1})^2) = ${show(Math.hypot(x2 - x1, y2 - y1), 2)}.`,
        `Slope = (${y2} - ${y1}) / (${x2} - ${x1}) = ${show(m, 2)}.`,
        `Use y - ${y1} = ${show(m, 2)}(x - ${x1}). At x = 0, y = ${y1} - ${show(m, 2)} x ${x1} = ${show(y1 - m * x1, 2)}.`,
      ],
    }
  }
  const x1 = int(rng, 1, 8)
  const y1 = int(rng, -3, 3)
  const x2 = int(rng, -3, 3)
  const y2 = int(rng, 1, 8)
  const m1 = int(rng, 1, 4)
  const rawSlope = -int(rng, 1, 4) / 2
  // Slopes with product -1 are perpendicular and have no tangent formula.
  const m2 = m1 * rawSlope === -1 ? -rawSlope : rawSlope
  const area = Math.abs(x1 * y2 - x2 * y1) / 2
  const a = int(rng, 2, 5)
  const b = int(rng, 1, 4)
  const c = int(rng, -10, 10)
  const px = int(rng, -4, 6)
  const py = int(rng, -4, 6)
  const distance = Math.abs(a * px + b * py + c) / Math.hypot(a, b)
  const angle = deg(Math.atan(Math.abs((m1 - m2) / (1 + m1 * m2))))
  return {
    statement: `O is the origin, P is (${x1}, ${y1}) and Q is (${x2}, ${y2}). The line l has equation ${a}x + ${b}y ${sg(c)} = 0. Two lines have slopes ${m1} and ${m2}.`,
    parts: [
      part('(a)', 'Find the area of triangle OPQ.', area, '', 2),
      part('(b)', `Find the perpendicular distance from (${px}, ${py}) to l, to two decimal places.`, distance, '', 2),
      part('(c)', 'Find the acute angle between the two lines of given slopes, in degrees to one decimal place.', angle, 'degrees', 1),
    ],
    solution: [
      `Area = (1/2)|x1 y2 - x2 y1| = (1/2)|${x1 * y2} - ${x2 * y1}| = ${show(area, 2)}.`,
      `Distance = |${a}(${px}) + ${b}(${py}) ${sg(c)}| / sqrt(${a}^2 + ${b}^2) = ${show(distance, 2)}.`,
      `tan(angle) = |(m1 - m2) / (1 + m1 m2)| = ${show(Math.abs((m1 - m2) / (1 + m1 * m2)), 3)}, so the angle is ${show(angle, 1)} degrees.`,
    ],
  }
}

function coordCircle(rng: Rng): ProblemBody {
  const h = int(rng, -6, 6)
  const k = int(rng, -6, 6)
  if (rng() < 0.5) {
    const r = int(rng, 2, 9)
    const c = h * h + k * k - r * r
    return {
      statement: `A circle has equation x^2 + y^2 ${sg(-2 * h)}x ${sg(-2 * k)}y ${sg(c)} = 0.`,
      parts: [
        part('(a)', 'Find the x-coordinate of the centre.', h, '', 0),
        part('(b)', 'Find the y-coordinate of the centre.', k, '', 0),
        part('(c)', 'Find the radius.', r, '', 0),
      ],
      solution: [
        `Compare with x^2 + y^2 + 2gx + 2fy + c = 0: g = ${-h} and f = ${-k}, so the centre is (-g, -f) = (${h}, ${k}).`,
        `Radius = sqrt(g^2 + f^2 - c) = sqrt(${h * h} + ${k * k} - (${c})) = ${r}.`,
      ],
    }
  }
  const [dx, dy, r] = pick(rng, [[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [-3, 4, 5], [-4, 3, 5]])
  const x0 = h + dx
  const y0 = k + dy
  const radiusSlope = dy / dx
  const tangentSlope = -dx / dy
  return {
    statement: `A circle has centre (${h}, ${k}) and radius ${r}. P is the point (${x0}, ${y0}) on the circle.`,
    parts: [
      part('(a)', 'Find the slope of the radius from the centre to P, to three decimal places.', radiusSlope, '', 3),
      part('(b)', 'Find the slope of the tangent at P, to three decimal places.', tangentSlope, '', 3),
      part('(c)', 'Find where the tangent crosses the y-axis, to two decimal places.', y0 - tangentSlope * x0, '', 2),
    ],
    solution: [
      `Slope of the radius = (${y0} - ${k}) / (${x0} - ${h}) = ${show(radiusSlope, 3)}.`,
      `The tangent is perpendicular to the radius, so its slope is ${show(tangentSlope, 3)}.`,
      `y - ${y0} = ${show(tangentSlope, 3)}(x - ${x0}). At x = 0: y = ${show(y0 - tangentSlope * x0, 2)}.`,
    ],
  }
}

function trigTriangles(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const a = int(rng, 6, 15)
    const b = int(rng, 6, 15)
    const gamma = int(rng, 40, 110)
    const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(gamma)))
    const A = deg(Math.acos((b * b + c * c - a * a) / (2 * b * c)))
    return {
      statement: `In triangle ABC, BC = ${a} cm, AC = ${b} cm and the angle at C is ${gamma} degrees.`,
      parts: [
        part('(a)', 'Find the length of AB, to two decimal places.', c, 'cm', 2),
        part('(b)', 'Find the angle at A, in degrees to one decimal place.', A, 'degrees', 1),
        part('(c)', 'Find the area of the triangle, to two decimal places.', 0.5 * a * b * Math.sin(rad(gamma)), 'cm^2', 2),
      ],
      solution: [
        `Cosine rule: AB^2 = ${a}^2 + ${b}^2 - 2(${a})(${b})cos ${gamma} degrees, so AB = ${show(c, 2)} cm.`,
        `cos A = (${b}^2 + ${show(c, 2)}^2 - ${a}^2) / (2 x ${b} x ${show(c, 2)}), so A = ${show(A, 1)} degrees.`,
        `Area = (1/2)(${a})(${b}) sin ${gamma} degrees = ${show(0.5 * a * b * Math.sin(rad(gamma)), 2)} cm^2.`,
      ],
    }
  }
  const d = int(rng, 20, 80)
  const alpha = int(rng, 20, 55)
  const extra = int(rng, 10, 40)
  const height = d * Math.tan(rad(alpha))
  const beta = deg(Math.atan(height / (d + extra)))
  return {
    statement: `From a point ${d} m from the foot of a vertical tower on level ground, the angle of elevation of the top is ${alpha} degrees.`,
    parts: [
      part('(a)', 'Find the height of the tower, to one decimal place.', height, 'm', 1),
      part('(b)', 'Find the distance from the point to the top of the tower, to one decimal place.', height / Math.sin(rad(alpha)), 'm', 1),
      part('(c)', `The observer walks ${extra} m further from the tower. Find the new angle of elevation, in degrees to one decimal place.`, beta, 'degrees', 1),
    ],
    solution: [
      `tan ${alpha} degrees = h / ${d}, so h = ${show(height, 1)} m.`,
      `sin ${alpha} degrees = h / distance, so the distance is ${show(height / Math.sin(rad(alpha)), 1)} m.`,
      `tan(new angle) = ${show(height, 1)} / ${d + extra}, so the angle is ${show(beta, 1)} degrees.`,
    ],
  }
}

function radiansArcs(rng: Rng): ProblemBody {
  const r = int(rng, 3, 14)
  if (rng() < 0.5) {
    const theta = pick(rng, [30, 45, 60, 72, 80, 100, 120, 150])
    const t = rad(theta)
    return {
      statement: `A sector of a circle has radius ${r} cm and angle ${theta} degrees at the centre.`,
      parts: [
        part('(a)', 'Find the angle in radians, to four decimal places.', t, 'radians', 4),
        part('(b)', 'Find the arc length, to two decimal places.', r * t, 'cm', 2),
        part('(c)', 'Find the area of the sector, to two decimal places.', 0.5 * r * r * t, 'cm^2', 2),
      ],
      solution: [
        `Radians = degrees x pi / 180 = ${show(t, 4)}.`,
        `Arc length l = r theta = ${r} x ${show(t, 4)} = ${show(r * t, 2)} cm.`,
        `Area = (1/2) r^2 theta = ${show(0.5 * r * r * t, 2)} cm^2.`,
      ],
    }
  }
  const t = int(rng, 8, 28) / 10
  return {
    statement: `A sector of a circle has radius ${r} cm and angle ${t} radians at the centre.`,
    parts: [
      part('(a)', 'Find the perimeter of the sector, to two decimal places.', 2 * r + r * t, 'cm', 2),
      part('(b)', 'Find the area of the sector, to two decimal places.', 0.5 * r * r * t, 'cm^2', 2),
      part('(c)', 'The chord joining the ends of the arc cuts off a segment. Find its area, to two decimal places.', 0.5 * r * r * (t - Math.sin(t)), 'cm^2', 2),
    ],
    solution: [
      `Perimeter = 2r + r theta = ${2 * r} + ${show(r * t, 2)} = ${show(2 * r + r * t, 2)} cm.`,
      `Sector area = (1/2) r^2 theta = ${show(0.5 * r * r * t, 2)} cm^2.`,
      `Segment = sector - triangle = (1/2) r^2 (theta - sin theta) = ${show(0.5 * r * r * (t - Math.sin(t)), 2)} cm^2 (use radians on the calculator).`,
    ],
  }
}

function geometry(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const theta = int(rng, 20, 70)
    const phi2 = int(rng, 30, 70)
    return {
      statement: `In a circle, an angle of ${theta} degrees at the circumference stands on the same arc as an angle at the centre. Separately, ABCD is a cyclic quadrilateral with angle A = ${theta + 40} degrees, and PQ is a diameter with R on the circle and angle QPR = ${phi2} degrees.`,
      parts: [
        part('(a)', 'Find the angle at the centre, in degrees.', 2 * theta, 'degrees', 0),
        part('(b)', 'Find angle C of the cyclic quadrilateral, in degrees.', 180 - (theta + 40), 'degrees', 0),
        part('(c)', 'Find angle PQR in triangle PQR, in degrees.', 90 - phi2, 'degrees', 0),
      ],
      solution: [
        `The angle at the centre is twice the angle at the circumference on the same arc: 2 x ${theta} = ${2 * theta}.`,
        `Opposite angles of a cyclic quadrilateral add up to 180: ${180 - (theta + 40)}.`,
        `The angle in a semicircle is 90 degrees, so angle R = 90 and angle PQR = 180 - 90 - ${phi2} = ${90 - phi2}.`,
      ],
    }
  }
  const a = int(rng, 2, 5)
  const b = a + int(rng, 1, 4)
  const bc = int(rng, 4, 12)
  const area = int(rng, 6, 40)
  return {
    statement: `Triangles ABC and DEF are similar. The ratio of corresponding sides, ABC to DEF, is ${a} : ${b}. Side BC corresponds to EF, BC = ${bc} cm, and the area of triangle ABC is ${area} cm^2.`,
    parts: [
      part('(a)', 'Find the length of EF, to two decimal places.', (bc * b) / a, 'cm', 2),
      part('(b)', 'Find the area of DEF, to two decimal places.', (area * b * b) / (a * a), 'cm^2', 2),
    ],
    solution: [
      `Scale factor from ABC to DEF = ${b}/${a}. EF = ${bc} x ${b}/${a} = ${show((bc * b) / a, 2)} cm.`,
      `Areas scale with the square of the scale factor: ${area} x (${b}/${a})^2 = ${show((area * b * b) / (a * a), 2)} cm^2.`,
    ],
  }
}

function measurement(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const r = int(rng, 2, 6)
    const h = int(rng, 3, 12)
    const volume = Math.PI * r * r * h + (2 / 3) * Math.PI * r ** 3
    return {
      statement: `A silo is a cylinder of radius ${r} m and height ${h} m, with a solid hemisphere of the same radius on top.`,
      parts: [
        part('(a)', 'Find the volume, to one decimal place.', volume, 'm^3', 1),
        part('(b)', 'Find the curved surface area (the cylinder side and the hemisphere), to one decimal place.', 2 * Math.PI * r * h + 2 * Math.PI * r * r, 'm^2', 1),
      ],
      solution: [
        `Volume = pi r^2 h + (2/3) pi r^3 = ${show(Math.PI * r * r * h, 2)} + ${show((2 / 3) * Math.PI * r ** 3, 2)} = ${show(volume, 1)} m^3.`,
        `Curved area = 2 pi r h + 2 pi r^2 = ${show(2 * Math.PI * r * h, 2)} + ${show(2 * Math.PI * r * r, 2)} = ${show(2 * Math.PI * r * h + 2 * Math.PI * r * r, 1)} m^2.`,
      ],
    }
  }
  const r = int(rng, 2, 8)
  const h = int(rng, 4, 15)
  const circumference = 2 * Math.PI * r
  const netArea = 2 * Math.PI * r * h + 2 * Math.PI * r * r
  return {
    statement: `A closed cylinder has radius ${r} cm and height ${h} cm. Its net consists of one rectangle and two circles.`,
    parts: [
      part('(a)', 'Find the width of the rectangular part of the net, to two decimal places.', circumference, 'cm', 2),
      part('(b)', 'Find the total area of the net, to one decimal place.', netArea, 'cm^2', 1),
      part('(c)', 'Find the volume of the cylinder, to one decimal place.', Math.PI * r * r * h, 'cm^3', 1),
    ],
    solution: [
      `The rectangle wraps once around the curved surface, so its width is the circumference 2 pi r = 2 pi x ${r} = ${show(circumference, 2)} cm.`,
      `Net area = curved surface area + two circles = 2 pi r h + 2 pi r^2 = ${show(2 * Math.PI * r * h, 2)} + ${show(2 * Math.PI * r * r, 2)} = ${show(netArea, 1)} cm^2.`,
      `Volume = pi r^2 h = pi x ${r}^2 x ${h} = ${show(Math.PI * r * r * h, 1)} cm^3.`,
    ],
  }
}

export const mathsGenerators: Record<string, ProblemGenerator> = {
  'mt-algebra': algebra,
  'mt-equations': equations,
  'mt-polynomials': polynomials,
  'mt-indices-logs': indicesLogs,
  'mt-complex': complexNumbers,
  'mt-sequences': sequences,
  'mt-financial': financial,
  'mt-functions': functions,
  'mt-exp-growth': expGrowth,
  'mt-differentiation': differentiation,
  'mt-calc-applications': calculusApplications,
  'mt-integration': integration,
  'mt-trig-identities': trigIdentities,
  'mt-counting': counting,
  'mt-probability': probability,
  'mt-stats-data': statsData,
  'mt-normal': normal,
  'mt-inference': inference,
  'mt-coord-line': coordLine,
  'mt-coord-circle': coordCircle,
  'mt-trig-triangles': trigTriangles,
  'mt-radians-arcs': radiansArcs,
  'mt-geometry': geometry,
  'mt-measurement': measurement,
}

export function hasMathsProblems(topicId: string): boolean {
  return topicId in mathsGenerators
}

export function mathsProblemTopicIds(): string[] {
  return Object.keys(mathsGenerators)
}

export function generateMathsProblem(topicId: string, seed: string): PracticeProblem | undefined {
  const generator = mathsGenerators[topicId]
  if (!generator) return undefined
  const body = generator(createRng(`${topicId}:${seed}`))
  // Adding 0 turns a negative zero into a plain zero.
  return { topicId, ...body, parts: body.parts.map((part) => ({ ...part, answer: part.answer + 0 })) }
}
