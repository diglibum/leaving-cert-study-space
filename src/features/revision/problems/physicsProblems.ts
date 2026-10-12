import { createRng, int, pick, round } from './rng'
import type { PracticeProblem, ProblemBody, ProblemGenerator, ProblemPart, Rng } from './types'

/*
 * Original practice problems for Leaving Certificate Physics (Higher). They are
 * written for this app, not copied from any exam paper. Numbers come from a
 * seed and every answer is computed in code. Each statement gives the constants
 * it needs (in the exam the Formulae and Tables booklet supplies them).
 */

const show = (value: number, decimals = 4) => String(Number(value.toFixed(decimals)))

function part(label: string, prompt: string, value: number, unit: string, decimals: number): ProblemPart {
  return { label, prompt, answer: round(value, decimals), unit, decimals }
}

const g = 9.81
const bigG = 6.67e-11
const planck = 6.63e-34
const lightSpeed = 3.0e8
const electronCharge = 1.60e-19
const electronMass = 9.11e-31

function measurement(rng: Rng): ProblemBody {
  const n = 5
  const base = int(rng, 20, 90) / 10
  const values = Array.from({ length: n }, () => round(base + int(rng, -5, 5) / 20, 2))
  const mean = values.reduce((a, b) => a + b, 0) / n
  const uncertainty = (Math.max(...values) - Math.min(...values)) / 2
  const percent = (uncertainty / mean) * 100

  return {
    statement: `A student measures the same time interval five times with a stopwatch and records, in seconds: ${values.map((value) => show(value, 2)).join(', ')}. The uncertainty is taken as half the range of the readings.`,
    parts: [
      part('(a)', 'Find the mean time, to two decimal places.', mean, 's', 2),
      part('(b)', 'Find the uncertainty (half the range), to two decimal places.', uncertainty, 's', 2),
      part('(c)', 'Find the percentage uncertainty in the mean, to one decimal place.', percent, '%', 1),
    ],
    solution: [
      `Mean = (${values.map((value) => show(value, 2)).join(' + ')}) / ${n} = ${show(mean, 2)} s.`,
      `Range = ${show(Math.max(...values), 2)} - ${show(Math.min(...values), 2)} = ${show(Math.max(...values) - Math.min(...values), 2)}, so the uncertainty is ${show(uncertainty, 2)} s.`,
      `Percentage uncertainty = ${show(uncertainty, 2)} / ${show(mean, 2)} x 100 = ${show(percent, 1)}%. Repeating measurements helps to reduce the effect of random error.`,
    ],
  }
}

function motion(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const u = int(rng, 2, 12)
    const a = int(rng, 2, 6)
    const t = int(rng, 3, 9)
    const v = u + a * t
    const s = u * t + 0.5 * a * t * t

    return {
      statement: `A cyclist moves in a straight line with an initial velocity of ${u} m/s and a constant acceleration of ${a} m/s^2 for ${t} s.`,
      parts: [
        part('(a)', 'Find the final velocity, in m/s.', v, 'm/s', 1),
        part('(b)', 'Find the distance travelled, in m.', s, 'm', 1),
        part('(c)', 'Find the average velocity, in m/s, to one decimal place.', s / t, 'm/s', 1),
      ],
      solution: [
        `v = u + at = ${u} + ${a} x ${t} = ${show(v, 1)} m/s.`,
        `s = ut + (1/2)at^2 = ${u} x ${t} + 0.5 x ${a} x ${t}^2 = ${show(s, 1)} m.`,
        `Average velocity = s / t = ${show(s, 1)} / ${t} = ${show(s / t, 1)} m/s.`,
      ],
    }
  }

  const vx = int(rng, 3, 12)
  const vy = int(rng, 4, 15)
  const time = int(rng, 10, 40)
  const resultant = Math.sqrt(vx * vx + vy * vy)
  const displacement = resultant * time
  const angle = (Math.atan2(vy, vx) * 180) / Math.PI

  return {
    statement: `A drone moves with a constant velocity of ${vx} m/s east and ${vy} m/s north for ${time} s.`,
    parts: [
      part('(a)', 'Find the magnitude of the velocity, in m/s, to two decimal places.', resultant, 'm/s', 2),
      part('(b)', 'Find the total displacement, in m, to one decimal place.', displacement, 'm', 1),
      part('(c)', 'Find the direction of motion, in degrees north of east, to one decimal place.', angle, 'degrees', 1),
    ],
    solution: [
      `Resultant velocity = sqrt(${vx}^2 + ${vy}^2) = ${show(resultant, 2)} m/s.`,
      `Displacement = vt = ${show(resultant, 2)} x ${time} = ${show(displacement, 1)} m.`,
      `Direction = tan^-1(${vy} / ${vx}) = ${show(angle, 1)} degrees north of east.`,
    ],
  }
}

function forcesMomentum(rng: Rng): ProblemBody {
  const roll = rng()

  if (roll < 0.25) {
    const m1 = int(rng, 2, 8)
    const u1 = int(rng, 3, 10)
    const m2 = int(rng, 2, 8)
    const v = (m1 * u1) / (m1 + m2)
    const ke0 = 0.5 * m1 * u1 * u1
    const ke1 = 0.5 * (m1 + m2) * v * v

    return {
      statement: `A trolley of mass ${m1} kg moves at ${u1} m/s and collides with a stationary trolley of mass ${m2} kg. The two stick together after the collision.`,
      parts: [
        part('(a)', 'Find the common velocity after the collision, in m/s, to two decimal places.', v, 'm/s', 2),
        part('(b)', 'Find the kinetic energy lost, in J, to one decimal place.', ke0 - ke1, 'J', 1),
      ],
      solution: [
        `Momentum is conserved: ${m1} x ${u1} = (${m1} + ${m2})v, so v = ${show(v, 2)} m/s.`,
        `Kinetic energy before = ${show(ke0, 1)} J and after = ${show(ke1, 1)} J, so the loss is ${show(ke0 - ke1, 1)} J.`,
      ],
    }
  }

  if (roll < 0.5) {
    const m = int(rng, 2, 12)
    const angle = pick(rng, [20, 25, 30, 35, 40])
    const mu = pick(rng, [0.1, 0.2, 0.3])
    const rad = (angle * Math.PI) / 180
    const down = m * g * Math.sin(rad)
    const friction = mu * m * g * Math.cos(rad)
    const a = (down - friction) / m

    return {
      statement: `A block of mass ${m} kg slides down a rough slope inclined at ${angle} degrees to the horizontal. The coefficient of friction is ${show(mu, 1)}. Take g = 9.81 m/s^2.`,
      parts: [
        part('(a)', 'Find the component of the weight down the slope, in N, to one decimal place.', down, 'N', 1),
        part('(b)', 'Find the friction force, in N, to one decimal place.', friction, 'N', 1),
        part('(c)', 'Find the acceleration down the slope, in m/s^2, to two decimal places.', a, 'm/s^2', 2),
      ],
      solution: [
        `Weight component = mg sin ${angle} = ${m} x 9.81 x sin ${angle} = ${show(down, 1)} N.`,
        `Friction = mu x normal force = ${show(mu, 1)} x ${m} x 9.81 x cos ${angle} = ${show(friction, 1)} N.`,
        `Net force = ${show(down - friction, 2)} N, so a = F / m = ${show(a, 2)} m/s^2.`,
      ],
    }
  }

  if (roll < 0.75) {
    const blockDensity = pick(rng, [2700, 7800, 8900])
    const volume = int(rng, 2, 8) / 1000
    const depth = int(rng, 10, 35) / 10
    const fluidDensity = 1000
    const mass = blockDensity * volume
    const pressure = depth * fluidDensity * g
    const upthrust = fluidDensity * volume * g

    return {
      statement: `A solid block of density ${blockDensity} kg/m^3 has a volume of ${show(volume, 3)} m^3 and is fully submerged in water at a depth of ${show(depth, 1)} m. Take the density of water as 1000 kg/m^3 and g = 9.81 m/s^2.`,
      parts: [
        part('(a)', 'Find the mass of the block, in kg, to two decimal places.', mass, 'kg', 2),
        part('(b)', 'Find the pressure due to the water at that depth, in kPa, to two decimal places.', pressure / 1000, 'kPa', 2),
        part('(c)', 'Find the upthrust on the block, in N, to two decimal places.', upthrust, 'N', 2),
      ],
      solution: [
        `Mass = density x volume = ${blockDensity} x ${show(volume, 3)} = ${show(mass, 2)} kg.`,
        `Pressure = h rho g = ${show(depth, 1)} x 1000 x 9.81 = ${show(pressure / 1000, 2)} kPa.`,
        `Upthrust = rho V g = 1000 x ${show(volume, 3)} x 9.81 = ${show(upthrust, 2)} N.`,
      ],
    }
  }

  const k = int(rng, 20, 80) * 5
  const x = int(rng, 4, 20) / 100
  const mass = (k * x) / g
  const elasticEnergy = 0.5 * k * x * x

  return {
    statement: `A spring obeys Hooke's law with spring constant ${k} N/m. It is stretched by ${show(x * 100, 0)} cm from its natural length.`,
    parts: [
      part('(a)', 'Find the force needed, in N, to two decimal places.', k * x, 'N', 2),
      part('(b)', 'What mass hung on the spring would produce this extension? Answer in kg, to two decimal places.', mass, 'kg', 2),
      part('(c)', 'Find the elastic potential energy stored in the spring, in J, to three decimal places.', elasticEnergy, 'J', 3),
    ],
    solution: [
      `F = kx = ${k} x ${show(x, 2)} = ${show(k * x, 2)} N.`,
      `At equilibrium, mg = F, so m = F / g = ${show(k * x, 2)} / 9.81 = ${show(mass, 2)} kg.`,
      `E = (1/2)kx^2 = 0.5 x ${k} x ${show(x, 2)}^2 = ${show(elasticEnergy, 3)} J.`,
    ],
  }
}

function energy(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const m = int(rng, 2, 20)
    const h = int(rng, 3, 30)
    const v = Math.sqrt(2 * g * h)
    const time = Math.sqrt((2 * h) / g)
    const power = (m * g * h) / time

    return {
      statement: `An object of mass ${m} kg falls from rest through a height of ${h} m. Ignore air resistance and take g = 9.81 m/s^2.`,
      parts: [
        part('(a)', 'Find the gravitational potential energy lost, in J, to the nearest whole number.', m * g * h, 'J', 0),
        part('(b)', 'Find the speed just before it lands, in m/s, to one decimal place.', v, 'm/s', 1),
        part('(c)', 'Find the average power of the fall, in W, to the nearest whole number.', power, 'W', 0),
      ],
      solution: [
        `Potential energy lost = mgh = ${m} x 9.81 x ${h} = ${show(m * g * h, 0)} J.`,
        `From conservation of energy, (1/2)mv^2 = mgh, so v = sqrt(2gh) = ${show(v, 1)} m/s.`,
        `The fall time is t = sqrt(2h / g) = ${show(time, 3)} s, so average power = energy / time = ${show(power, 0)} W.`,
      ],
    }
  }

  const mass = int(rng, 1, 6) / 4
  const k = int(rng, 4, 20) * 10
  const s = int(rng, 5, 20) / 100
  const stored = 0.5 * k * s * s
  const speed = Math.sqrt((2 * stored) / mass)

  return {
    statement: `A spring of spring constant ${k} N/m is compressed by ${show(s, 2)} m. It then pushes a ${show(mass, 2)} kg block along a smooth horizontal surface.`,
    parts: [
      part('(a)', 'Find the elastic potential energy stored in the spring, in J, to three decimal places.', stored, 'J', 3),
      part('(b)', 'Find the speed of the block as it leaves the spring, in m/s, to two decimal places.', speed, 'm/s', 2),
    ],
    solution: [
      `E = (1/2)ks^2 = 0.5 x ${k} x ${show(s, 2)}^2 = ${show(stored, 3)} J.`,
      `All of this becomes kinetic energy, so (1/2)mv^2 = ${show(stored, 3)} and v = ${show(speed, 2)} m/s.`,
    ],
  }
}

function circularGravity(rng: Rng): ProblemBody {
  const roll = rng()

  if (roll < 0.34) {
    const m = int(rng, 2, 10) / 2
    const r = int(rng, 4, 20) / 10
    const v = int(rng, 3, 12)
    const a = (v * v) / r

    return {
      statement: `A ${show(m, 1)} kg mass is whirled in a horizontal circle of radius ${show(r, 1)} m at a constant speed of ${v} m/s.`,
      parts: [
        part('(a)', 'Find the centripetal acceleration, in m/s^2, to one decimal place.', a, 'm/s^2', 1),
        part('(b)', 'Find the tension in the string, in N, to one decimal place.', m * a, 'N', 1),
        part('(c)', 'Find the period of the motion, in s, to three decimal places.', (2 * Math.PI * r) / v, 's', 3),
      ],
      solution: [
        `a = v^2 / r = ${v}^2 / ${show(r, 1)} = ${show(a, 1)} m/s^2.`,
        `The tension provides the centripetal force, so F = ma = ${show(m, 1)} x ${show(a, 1)} = ${show(m * a, 1)} N.`,
        `T = 2 pi r / v = 2 pi x ${show(r, 1)} / ${v} = ${show((2 * Math.PI * r) / v, 3)} s.`,
      ],
    }
  }

  if (roll < 0.67) {
    const mass = pick(rng, [4.9e24, 5.97e24, 6.42e23, 7.35e22])
    const radius = pick(rng, [2.44e6, 3.39e6, 6.37e6, 1.74e6])
    const height = pick(rng, [2.0e5, 5.0e5, 9.0e5, 3.6e7])
    const surfaceField = (bigG * mass) / (radius * radius)
    const escape = Math.sqrt((2 * bigG * mass) / radius)
    const fieldAtHeight = (bigG * mass) / ((radius + height) * (radius + height))

    return {
      statement: `A planet has a mass of ${mass.toExponential(2)} kg and a radius of ${radius.toExponential(2)} m. A satellite is at a height of ${height.toExponential(2)} m above the surface. Take G = 6.67 x 10^-11 N m^2 kg^-2.`,
      parts: [
        part('(a)', 'Find the gravitational field strength at the surface, in N/kg, to two decimal places.', surfaceField, 'N/kg', 2),
        part('(b)', 'Find the escape velocity from the surface, in km/s, to two decimal places.', escape / 1000, 'km/s', 2),
        part('(c)', 'Find the gravitational field strength at the satellite, in N/kg, to two decimal places.', fieldAtHeight, 'N/kg', 2),
      ],
      solution: [
        `g = GM / r^2 = 6.67 x 10^-11 x ${mass.toExponential(2)} / (${radius.toExponential(2)})^2 = ${show(surfaceField, 2)} N/kg.`,
        `v_e = sqrt(2GM / r) = sqrt(2 x 6.67 x 10^-11 x ${mass.toExponential(2)} / ${radius.toExponential(2)}) = ${show(escape / 1000, 2)} km/s.`,
        `At the satellite, g = GM / (r + h)^2 = ${show(fieldAtHeight, 2)} N/kg.`,
      ],
    }
  }

  const planetMass = 5.97e24
  const orbitalRadius = pick(rng, [7.0e6, 8.0e6, 1.2e7, 4.2e7])
  const speed = Math.sqrt((bigG * planetMass) / orbitalRadius)
  const period = (2 * Math.PI * orbitalRadius) / speed

  return {
    statement: `A satellite orbits a planet of mass 5.97 x 10^24 kg in a circular orbit of radius ${orbitalRadius.toExponential(2)} m. Take G = 6.67 x 10^-11 N m^2 kg^-2.`,
    parts: [
      part('(a)', 'Find the orbital speed, in km/s, to two decimal places.', speed / 1000, 'km/s', 2),
      part('(b)', 'Find the orbital period, in hours, to two decimal places.', period / 3600, 'h', 2),
      part('(c)', 'Find how many complete orbits the satellite makes in 24 hours, to two decimal places.', 86400 / period, '', 2),
    ],
    solution: [
      `For a circular orbit, v = sqrt(GM / r) = ${show(speed / 1000, 2)} km/s.`,
      `T = 2 pi r / v = 2 pi x ${orbitalRadius.toExponential(2)} / ${show(speed, 2)} = ${show(period / 3600, 2)} h.`,
      `Number of orbits in 24 h = 24 / ${show(period / 3600, 2)} = ${show(86400 / period, 2)}.`,
    ],
  }
}

function heat(rng: Rng): ProblemBody {
  if (rng() < 0.55) {
    const m = int(rng, 2, 20) / 10
    const t1 = int(rng, 8, 25)
    const t2 = t1 + int(rng, 30, 70)
    const c = pick(rng, [4180, 900, 385, 2100])
    const energy = m * c * (t2 - t1)
    const latent = pick(rng, [334000, 2260000])
    const mass2 = int(rng, 1, 8) / 10

    return {
      statement: `A sample of mass ${show(m, 1)} kg and specific heat capacity ${c} J kg^-1 K^-1 is heated from ${t1} C to ${t2} C. Separately, a specific latent heat of ${show(latent / 1000, 0)} kJ/kg is used to melt or vaporise ${show(mass2, 1)} kg of a different substance at its melting or boiling point.`,
      parts: [
        part('(a)', 'Find the heat needed to warm the sample, in kJ, to two decimal places.', energy / 1000, 'kJ', 2),
        part('(b)', 'Find the energy needed for the change of state, in kJ, to the nearest whole number.', (latent * mass2) / 1000, 'kJ', 0),
        part('(c)', 'A heater of power 500 W supplies the warming energy. How long does the warming take, in s, to the nearest whole number?', energy / 500, 's', 0),
      ],
      solution: [
        `Q = mc(delta theta) = ${show(m, 1)} x ${c} x ${t2 - t1} = ${show(energy, 0)} J = ${show(energy / 1000, 2)} kJ.`,
        `For the change of state, Q = ml = ${show(mass2, 1)} x ${latent} = ${show((latent * mass2) / 1000, 0)} kJ.`,
        `Time = energy / power = ${show(energy, 0)} / 500 = ${show(energy / 500, 0)} s.`,
      ],
    }
  }

  const area = round(int(rng, 12, 28) / 10, 1)
  const uPoor = pick(rng, [2.8, 3.0, 3.2, 3.4])
  const uGood = pick(rng, [1.2, 1.4, 1.6])
  const inside = pick(rng, [18, 19, 20, 21])
  const outside = pick(rng, [-1, 0, 2, 5])
  const delta = inside - outside
  const savedPower = (uPoor - uGood) * area * delta

  return {
    statement: `A wall of area ${show(area, 1)} m^2 is improved from a U-value of ${show(uPoor, 1)} W m^-2 K^-1 to ${show(uGood, 1)} W m^-2 K^-1. The inside temperature is kept at ${inside} C while the outside temperature is ${outside} C.`,
    parts: [
      part('(a)', 'Find the rate of heat loss before the upgrade, in W, to one decimal place.', uPoor * area * delta, 'W', 1),
      part('(b)', 'Find the rate of heat loss after the upgrade, in W, to one decimal place.', uGood * area * delta, 'W', 1),
      part('(c)', 'Find the energy saved in one hour, in kJ, to one decimal place.', (savedPower * 3600) / 1000, 'kJ', 1),
    ],
    solution: [
      `Power loss = UA(delta theta). Before the upgrade: ${show(uPoor, 1)} x ${show(area, 1)} x ${delta} = ${show(uPoor * area * delta, 1)} W.`,
      `After the upgrade: ${show(uGood, 1)} x ${show(area, 1)} x ${delta} = ${show(uGood * area * delta, 1)} W.`,
      `Saved power = ${show(savedPower, 1)} W, so in one hour the energy saved is ${show((savedPower * 3600) / 1000, 1)} kJ.`,
    ],
  }
}

function waves(rng: Rng): ProblemBody {
  const roll = rng()

  if (roll < 0.34) {
    const f = int(rng, 20, 90) * 10
    const speed = pick(rng, [330, 340, 343])
    const sourceSpeed = pick(rng, [10, 15, 20, 25])
    const heard = (f * speed) / (speed - sourceSpeed)

    return {
      statement: `A sound wave of frequency ${f} Hz travels in air at ${speed} m/s. A source emitting this sound moves towards a stationary listener at ${sourceSpeed} m/s.`,
      parts: [
        part('(a)', 'Find the wavelength, in m, to three decimal places.', speed / f, 'm', 3),
        part('(b)', 'Find the period, in ms, to two decimal places.', 1000 / f, 'ms', 2),
        part('(c)', 'Find the frequency heard by the listener, in Hz, to one decimal place.', heard, 'Hz', 1),
      ],
      solution: [
        `lambda = v / f = ${speed} / ${f} = ${show(speed / f, 3)} m.`,
        `T = 1 / f = ${show(1000 / f, 2)} ms.`,
        `For a source moving towards the listener, f' = f c / (c - u) = ${f} x ${speed} / ${speed - sourceSpeed} = ${show(heard, 1)} Hz.`,
      ],
    }
  }

  if (roll < 0.67) {
    const length = int(rng, 4, 12) / 10
    const mass = int(rng, 1, 6) / 1000
    const tension = int(rng, 10, 60)
    const mu = mass / length
    const speed = Math.sqrt(tension / mu)
    const f1 = speed / (2 * length)

    return {
      statement: `A stretched string ${show(length, 1)} m long has a mass of ${show(mass * 1000, 0)} g and is under a tension of ${tension} N. It vibrates in its fundamental mode.`,
      parts: [
        part('(a)', 'Find the mass per unit length, in g/m, to two decimal places.', mu * 1000, 'g/m', 2),
        part('(b)', 'Find the speed of waves on the string, in m/s, to one decimal place.', speed, 'm/s', 1),
        part('(c)', 'Find the fundamental frequency, in Hz, to one decimal place.', f1, 'Hz', 1),
      ],
      solution: [
        `mu = m / l = ${show(mass * 1000, 0)} g / ${show(length, 1)} m = ${show(mu * 1000, 2)} g/m.`,
        `v = sqrt(T / mu) = sqrt(${tension} / ${show(mu, 5)}) = ${show(speed, 1)} m/s.`,
        `For the fundamental, lambda = 2l, so f = v / 2l = ${show(speed, 1)} / ${show(2 * length, 1)} = ${show(f1, 1)} Hz.`,
      ],
    }
  }

  const lambda = int(rng, 4, 9) * 100
  const lines = pick(rng, [100, 200, 300, 500])
  const spacing = 1000 / lines
  const order = int(rng, 1, 2)
  const sine = (order * lambda * 1e-3) / spacing

  return {
    statement: `Light of wavelength ${lambda} nm falls on a diffraction grating with ${lines} lines per mm.`,
    parts: [
      part('(a)', 'Find the grating spacing d, in micrometres, to two decimal places.', spacing, 'micrometres', 2),
      part('(b)', `Find sin(theta) for order n = ${order}, using n lambda = d sin(theta), to three decimal places.`, sine, '', 3),
    ],
    solution: [
      `d = 1 mm / ${lines} = ${show(spacing, 2)} micrometres.`,
      `sin(theta) = n lambda / d = ${order} x ${show(lambda / 1000, 1)} / ${show(spacing, 2)} = ${show(sine, 3)}.`,
    ],
  }
}

function light(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const n2 = pick(rng, [1.33, 1.50, 1.52, 1.62])
    const angle = int(rng, 20, 65)
    const sinR = Math.sin((angle * Math.PI) / 180) / n2
    const r = (Math.asin(sinR) * 180) / Math.PI
    const critical = (Math.asin(1 / n2) * 180) / Math.PI

    return {
      statement: `A ray of light in air hits a transparent material of refractive index ${show(n2, 2)} at an angle of incidence of ${angle} degrees.`,
      parts: [
        part('(a)', 'Find the angle of refraction, in degrees, to one decimal place.', r, 'degrees', 1),
        part('(b)', 'Find the critical angle for light going from this material into air, in degrees, to one decimal place.', critical, 'degrees', 1),
      ],
      solution: [
        `Snell's law gives sin r = sin ${angle} / ${show(n2, 2)} = ${show(sinR, 4)}, so r = ${show(r, 1)} degrees.`,
        `For the critical angle, sin C = 1 / n = 1 / ${show(n2, 2)}, so C = ${show(critical, 1)} degrees.`,
      ],
    }
  }

  const f = int(rng, 5, 20)
  const u = f + int(rng, 5, 30)
  const v = (u * f) / (u - f)
  const m = v / u

  return {
    statement: `An object is placed ${u} cm in front of a converging lens of focal length ${f} cm. Use 1/u + 1/v = 1/f with real distances taken as positive.`,
    parts: [
      part('(a)', 'Find the image distance, in cm, to one decimal place.', v, 'cm', 1),
      part('(b)', 'Find the magnification, to two decimal places.', m, '', 2),
      part('(c)', 'The object is 3.0 cm tall. Find the height of the image, in cm, to one decimal place.', 3 * m, 'cm', 1),
    ],
    solution: [
      `1 / v = 1 / ${f} - 1 / ${u}, so v = ${show(v, 1)} cm.`,
      `Magnification = v / u = ${show(v, 1)} / ${u} = ${show(m, 2)}.`,
      `Image height = 3.0 x ${show(m, 2)} = ${show(3 * m, 1)} cm.`,
    ],
  }
}

function electricFields(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const q1 = int(rng, 2, 9)
    const q2 = int(rng, 2, 9)
    const d = int(rng, 2, 9) / 10
    const force = (9e9 * q1 * q2 * 1e-18) / (d * d)

    return {
      statement: `Two point charges of +${q1} nC and +${q2} nC are ${show(d, 1)} m apart in a vacuum. Take k = 9 x 10^9 N m^2 C^-2.`,
      parts: [
        part('(a)', 'Find the force between them, in micronewtons, to one decimal place.', force * 1e6, 'micronewtons', 1),
        part('(b)', 'Is the force attractive or repulsive? Answer 1 for repulsive and 2 for attractive.', 1, '', 0),
      ],
      solution: [
        `F = kq1q2 / d^2 = 9 x 10^9 x ${q1} x 10^-9 x ${q2} x 10^-9 / ${show(d, 1)}^2 = ${show(force * 1e6, 1)} micronewtons.`,
        'Both charges are positive, so the force is repulsive (answer 1).',
      ],
    }
  }

  const q = int(rng, 2, 9)
  const r = int(rng, 2, 9) / 10
  const field = (9e9 * q * 1e-9) / (r * r)
  const pd = int(rng, 2, 12) * 50
  const charge = int(rng, 2, 9)
  const work = charge * 1e-6 * pd

  return {
    statement: `A point charge of +${q} nC is in a vacuum. Take k = 9 x 10^9 N m^2 C^-2.`,
    parts: [
      part('(a)', `Find the electric field strength ${show(r, 1)} m from the charge, in N/C, to the nearest whole number.`, field, 'N/C', 0),
      part('(b)', `Find the work done in moving a charge of +${charge} microcoulomb through a potential difference of ${pd} V, in mJ, to two decimal places.`, work * 1000, 'mJ', 2),
    ],
    solution: [
      `E = kq / r^2 = 9 x 10^9 x ${q} x 10^-9 / ${show(r, 1)}^2 = ${show(field, 0)} N/C.`,
      `W = qV = ${charge} x 10^-6 x ${pd} = ${show(work * 1000, 2)} mJ.`,
    ],
  }
}

function circuits(rng: Rng): ProblemBody {
  const roll = rng()

  if (roll < 0.4) {
    const r1 = int(rng, 2, 12) * 10
    const r2 = int(rng, 2, 12) * 10
    const r3 = int(rng, 2, 12) * 10
    const parallel = (r2 * r3) / (r2 + r3)
    const total = r1 + parallel
    const voltage = int(rng, 6, 24)
    const current = voltage / total

    return {
      statement: `A resistor of ${r1} ohm is in series with a parallel pair of ${r2} ohm and ${r3} ohm resistors, connected to a ${voltage} V battery with negligible internal resistance.`,
      parts: [
        part('(a)', 'Find the equivalent resistance of the parallel pair, in ohm, to one decimal place.', parallel, 'ohm', 1),
        part('(b)', 'Find the total resistance, in ohm, to one decimal place.', total, 'ohm', 1),
        part('(c)', 'Find the current drawn from the battery, in mA, to the nearest whole number.', current * 1000, 'mA', 0),
        part('(d)', 'Find the power dissipated in the whole circuit, in W, to three decimal places.', voltage * current, 'W', 3),
      ],
      solution: [
        `1 / R = 1 / ${r2} + 1 / ${r3}, so the parallel resistance is ${show(parallel, 1)} ohm.`,
        `Total resistance = ${r1} + ${show(parallel, 1)} = ${show(total, 1)} ohm.`,
        `I = V / R = ${voltage} / ${show(total, 1)} = ${show(current * 1000, 0)} mA.`,
        `P = VI = ${voltage} x ${show(current, 4)} = ${show(voltage * current, 3)} W.`,
      ],
    }
  }

  if (roll < 0.75) {
    const length = int(rng, 2, 10) / 2
    const diameter = pick(rng, [0.2, 0.3, 0.4, 0.5])
    const rho = pick(rng, [1.7e-8, 5.0e-7, 1.1e-6])
    const area = (Math.PI * (diameter * 1e-3) ** 2) / 4
    const resistance = (rho * length) / area

    return {
      statement: `A wire of length ${show(length, 1)} m and diameter ${show(diameter, 1)} mm is made of a metal of resistivity ${rho.toExponential(1).replace('e-', ' x 10^-')} ohm m.`,
      parts: [
        part('(a)', 'Find the cross-sectional area, in mm^2, to four decimal places.', area * 1e6, 'mm^2', 4),
        part('(b)', 'Find the resistance of the wire, in ohm, to two decimal places.', resistance, 'ohm', 2),
      ],
      solution: [
        `A = pi d^2 / 4 = pi x (${show(diameter, 1)} x 10^-3)^2 / 4 = ${show(area * 1e6, 4)} mm^2.`,
        `R = rho l / A = ${rho.toExponential(1)} x ${show(length, 1)} / ${area.toExponential(3)} = ${show(resistance, 2)} ohm.`,
      ],
    }
  }

  const peakVoltage = pick(rng, [170, 325, 340])
  const resistance = pick(rng, [40, 50, 80, 120])
  const vrms = peakVoltage / Math.sqrt(2)
  const irms = vrms / resistance
  const power = vrms * irms

  return {
    statement: `A pure resistor of resistance ${resistance} ohm is connected to an alternating supply with a peak voltage of ${peakVoltage} V.`,
    parts: [
      part('(a)', 'Find the rms voltage, in V, to one decimal place.', vrms, 'V', 1),
      part('(b)', 'Find the rms current, in A, to three decimal places.', irms, 'A', 3),
      part('(c)', 'Find the power dissipated, in W, to one decimal place.', power, 'W', 1),
    ],
    solution: [
      `V_rms = V_0 / sqrt(2) = ${peakVoltage} / sqrt(2) = ${show(vrms, 1)} V.`,
      `I_rms = V_rms / R = ${show(vrms, 1)} / ${resistance} = ${show(irms, 3)} A.`,
      `P = V_rms I_rms = ${show(vrms, 1)} x ${show(irms, 3)} = ${show(power, 1)} W.`,
    ],
  }
}

function magnetism(rng: Rng): ProblemBody {
  const roll = rng()

  if (roll < 0.34) {
    const b = int(rng, 2, 9) / 20
    const current = int(rng, 2, 12)
    const length = int(rng, 2, 9) / 10
    const force = b * current * length

    return {
      statement: `A straight wire carrying ${current} A is at right angles to a uniform magnetic field of ${show(b, 2)} T. ${show(length, 1)} m of the wire is inside the field.`,
      parts: [
        part('(a)', 'Find the force on the wire, in N, to three decimal places.', force, 'N', 3),
        part('(b)', 'Find the force on the same wire if the current is doubled, in N, to three decimal places.', 2 * force, 'N', 3),
      ],
      solution: [
        `F = BIl = ${show(b, 2)} x ${current} x ${show(length, 1)} = ${show(force, 3)} N.`,
        `The force is proportional to the current, so doubling the current gives ${show(2 * force, 3)} N.`,
      ],
    }
  }

  if (roll < 0.67) {
    const turns = int(rng, 200, 1200)
    const areaMm2 = int(rng, 80, 320)
    const deltaB = int(rng, 12, 45) / 100
    const deltaT = int(rng, 10, 40) / 1000
    const resistance = pick(rng, [2, 4, 5, 8])
    const area = areaMm2 * 1e-6
    const emf = (turns * area * deltaB) / deltaT
    const current = emf / resistance

    return {
      statement: `A coil of ${turns} turns and area ${areaMm2} mm^2 experiences a change in magnetic flux density of ${show(deltaB, 2)} T in ${show(deltaT, 3)} s. The coil has a resistance of ${resistance} ohm.`,
      parts: [
        part('(a)', 'Find the change in magnetic flux through one turn, in micro-weber, to two decimal places.', area * deltaB * 1e6, 'micro-weber', 2),
        part('(b)', 'Find the induced emf, in V, to three decimal places.', emf, 'V', 3),
        part('(c)', 'Find the induced current, in A, to three decimal places.', current, 'A', 3),
      ],
      solution: [
        `For one turn, Delta Phi = A Delta B = ${areaMm2} x 10^-6 x ${show(deltaB, 2)} = ${show(area * deltaB * 1e6, 2)} micro-weber.`,
        `Faraday's law gives E = N(Delta Phi / Delta t) = ${turns} x ${show(area * deltaB, 6)} / ${show(deltaT, 3)} = ${show(emf, 3)} V.`,
        `I = E / R = ${show(emf, 3)} / ${resistance} = ${show(current, 3)} A.`,
      ],
    }
  }

  const np = int(rng, 3, 12) * 100
  const ns = np * pick(rng, [10, 20, 25, 40])
  const vp = pick(rng, [220, 230, 240])
  const power = pick(rng, [30000, 48000, 60000, 72000])
  const lineResistance = pick(rng, [2, 4, 6, 8])
  const vs = (vp * ns) / np
  const lineCurrent = power / vs
  const lineLoss = lineCurrent * lineCurrent * lineResistance

  return {
    statement: `An ideal transformer has ${np} turns on the primary coil and ${ns} turns on the secondary coil. The primary voltage is ${vp} V. It transmits ${power} W through power lines of total resistance ${lineResistance} ohm.`,
    parts: [
      part('(a)', 'Find the secondary voltage, in V, to one decimal place.', vs, 'V', 1),
      part('(b)', 'Find the current in the transmission lines, in A, to three decimal places.', lineCurrent, 'A', 3),
      part('(c)', 'Find the power lost in the lines, in W, to one decimal place.', lineLoss, 'W', 1),
    ],
    solution: [
      `V_s / V_p = N_s / N_p, so V_s = ${vp} x ${ns} / ${np} = ${show(vs, 1)} V.`,
      `Current in the lines = P / V_s = ${power} / ${show(vs, 1)} = ${show(lineCurrent, 3)} A.`,
      `Transmission loss = I^2R = ${show(lineCurrent, 3)}^2 x ${lineResistance} = ${show(lineLoss, 1)} W.`,
    ],
  }
}

function electronics(rng: Rng): ProblemBody {
  if (rng() < 0.55) {
    const supply = pick(rng, [5, 6, 9, 12])
    const led = pick(rng, [1.8, 2.0, 2.2, 3.0])
    const current = pick(rng, [10, 15, 20])
    const resistor = (supply - led) / (current / 1000)
    const power = led * (current / 1000)

    return {
      statement: `A light emitting diode (LED) needs ${show(led, 1)} V across it and a current of ${current} mA. It is connected in series with a resistor to a ${supply} V supply.`,
      parts: [
        part('(a)', 'Find the voltage across the resistor, in V.', supply - led, 'V', 1),
        part('(b)', 'Find the resistance needed, in ohm, to the nearest whole number.', resistor, 'ohm', 0),
        part('(c)', 'Find the power dissipated in the LED, in mW, to the nearest whole number.', power * 1000, 'mW', 0),
      ],
      solution: [
        `The resistor takes the remaining voltage: ${supply} - ${show(led, 1)} = ${show(supply - led, 1)} V.`,
        `R = V / I = ${show(supply - led, 1)} / ${show(current / 1000, 3)} = ${show(resistor, 0)} ohm.`,
        `P = VI = ${show(led, 1)} x ${show(current / 1000, 3)} = ${show(power * 1000, 0)} mW.`,
      ],
    }
  }

  const supply = pick(rng, [6, 9, 12])
  const fixed = pick(rng, [1000, 1500, 2200, 3300])
  const sensor = pick(rng, [470, 820, 1500, 2200, 3300])
  const current = supply / (fixed + sensor)
  const sensorVoltage = current * sensor

  return {
    statement: `A sensor resistor of ${sensor} ohm is connected in series with a fixed resistor of ${fixed} ohm across a ${supply} V supply.`,
    parts: [
      part('(a)', 'Find the current in the circuit, in mA, to two decimal places.', current * 1000, 'mA', 2),
      part('(b)', 'Find the potential difference across the sensor, in V, to two decimal places.', sensorVoltage, 'V', 2),
      part('(c)', 'Find the potential difference across the fixed resistor, in V, to two decimal places.', supply - sensorVoltage, 'V', 2),
    ],
    solution: [
      `Total resistance = ${sensor} + ${fixed} = ${sensor + fixed} ohm, so I = V / R = ${supply} / ${sensor + fixed} = ${show(current * 1000, 2)} mA.`,
      `V_sensor = IR = ${show(current, 4)} x ${sensor} = ${show(sensorVoltage, 2)} V.`,
      `The fixed resistor takes the rest: ${supply} - ${show(sensorVoltage, 2)} = ${show(supply - sensorVoltage, 2)} V.`,
    ],
  }
}

function quantum(rng: Rng): ProblemBody {
  if (rng() < 0.55) {
    const lambda = int(rng, 22, 55) * 10
    const workFunction = pick(rng, [1.9, 2.2, 2.6, 3.0, 3.4])
    const photonEnergyJ = (planck * lightSpeed) / (lambda * 1e-9)
    const photonEnergyEV = photonEnergyJ / electronCharge
    const kmaxEV = Math.max(photonEnergyEV - workFunction, 0)

    return {
      statement: `Light of wavelength ${lambda} nm falls on a clean metal surface. Use h = 6.63 x 10^-34 J s, c = 3.0 x 10^8 m/s and 1 eV = 1.60 x 10^-19 J. The work function of the metal is ${show(workFunction, 1)} eV.`,
      parts: [
        part('(a)', 'Find the photon energy, in eV, to two decimal places.', photonEnergyEV, 'eV', 2),
        part('(b)', 'Find the maximum kinetic energy of an emitted electron, in eV, to two decimal places.', kmaxEV, 'eV', 2),
        part('(c)', 'Find the stopping potential, in V, to two decimal places.', kmaxEV, 'V', 2),
      ],
      solution: [
        `Photon energy = hc / lambda = 6.63 x 10^-34 x 3.0 x 10^8 / (${lambda} x 10^-9) = ${show(photonEnergyEV, 2)} eV.`,
        `Einstein's equation gives KE_max = hf - phi = ${show(photonEnergyEV, 2)} - ${show(workFunction, 1)} = ${show(kmaxEV, 2)} eV.`,
        `A stopping potential of ${show(kmaxEV, 2)} V would remove ${show(kmaxEV, 2)} eV of kinetic energy per electron.`,
      ],
    }
  }

  const voltageKV = pick(rng, [25, 40, 50, 60, 80])
  const maxEnergyKeV = voltageKV
  const maxEnergyJ = voltageKV * 1000 * electronCharge
  const minWavelengthPm = ((planck * lightSpeed) / maxEnergyJ) * 1e12
  const frequency = maxEnergyJ / planck

  return {
    statement: `An X-ray tube accelerates electrons through a potential difference of ${voltageKV} kV. Use h = 6.63 x 10^-34 J s, c = 3.0 x 10^8 m/s and e = 1.60 x 10^-19 C.`,
    parts: [
      part('(a)', 'Find the maximum photon energy, in keV, to one decimal place.', maxEnergyKeV, 'keV', 1),
      part('(b)', 'Find the minimum wavelength of the X-rays, in pm, to one decimal place.', minWavelengthPm, 'pm', 1),
      part('(c)', 'Find the frequency of the most energetic X-ray photon, in units of 10^18 Hz, to two decimal places.', frequency / 1e18, 'x 10^18 Hz', 2),
    ],
    solution: [
      `The most energetic photon can take all of the electron's energy, so E = eV = ${voltageKV} keV.`,
      `lambda_min = hc / E = 6.63 x 10^-34 x 3.0 x 10^8 / (${voltageKV} x 10^3 x 1.60 x 10^-19) = ${show(minWavelengthPm, 1)} pm.`,
      `f = E / h = ${show(maxEnergyJ, 3)} / 6.63 x 10^-34 = ${show(frequency / 1e18, 2)} x 10^18 Hz.`,
    ],
  }
}

function nuclear(rng: Rng): ProblemBody {
  if (rng() < 0.55) {
    const halfLife = pick(rng, [2, 5, 8, 12, 30])
    const halves = int(rng, 2, 5)
    const initialActivity = int(rng, 2, 9) * 100
    const remaining = initialActivity / 2 ** halves
    const decayConstant = Math.log(2) / (halfLife * 86400)
    const nuclei = remaining / decayConstant

    return {
      statement: `A radioactive source has a half-life of ${halfLife} days and an initial activity of ${initialActivity} Bq.`,
      parts: [
        part('(a)', `Find the activity after ${halfLife * halves} days, in Bq, to one decimal place.`, remaining, 'Bq', 1),
        part('(b)', 'How long does it take for the activity to fall to one eighth of the initial value, in days?', halfLife * 3, 'days', 0),
        part('(c)', 'Find the number of undecayed nuclei when the activity is the value from part (a), in units of 10^8, to two decimal places.', nuclei / 1e8, 'x 10^8', 2),
      ],
      solution: [
        `${halfLife * halves} days is ${halves} half-lives, so A = ${initialActivity} / 2^${halves} = ${show(remaining, 1)} Bq.`,
        `One eighth is 3 half-lives, so the time is 3 x ${halfLife} = ${halfLife * 3} days.`,
        `lambda = ln 2 / T_(1/2) = ${show(decayConstant, 9)} s^-1, so N = A / lambda = ${show(nuclei / 1e8, 2)} x 10^8 nuclei.`,
      ],
    }
  }

  const nucleons = pick(rng, [12, 16, 27, 56, 63, 238])
  const defect = int(rng, 20, 90) / 1000
  const energy = defect * 931.5

  return {
    statement: `A nucleus contains ${nucleons} nucleons and has a mass defect of ${show(defect, 3)} u. Use 1 u = 931.5 MeV/c^2.`,
    parts: [
      part('(a)', 'Find the total binding energy, in MeV, to one decimal place.', energy, 'MeV', 1),
      part('(b)', 'Find the binding energy per nucleon, in MeV, to two decimal places.', energy / nucleons, 'MeV', 2),
    ],
    solution: [
      `Total binding energy = mass defect x 931.5 = ${show(defect, 3)} x 931.5 = ${show(energy, 1)} MeV.`,
      `Binding energy per nucleon = ${show(energy, 1)} / ${nucleons} = ${show(energy / nucleons, 2)} MeV.`,
    ],
  }
}

function particles(rng: Rng): ProblemBody {
  const roll = rng()

  if (roll < 0.34) {
    const particles = [
      { name: 'proton', up: 2, down: 1 },
      { name: 'neutron', up: 1, down: 2 },
    ]
    const target = pick(rng, particles)
    const charge = target.up * (2 / 3) + target.down * (-1 / 3)

    return {
      statement: `A ${target.name} is modelled as ${target.up} up quark${target.up > 1 ? 's' : ''} and ${target.down} down quark${target.down > 1 ? 's' : ''}. Each up quark has charge +2/3 e and each down quark has charge -1/3 e.`,
      parts: [
        part('(a)', `Find the total charge of the ${target.name}, in units of e, as a whole number.`, charge, '', 0),
        part('(b)', 'Find the number of quarks in the particle.', target.up + target.down, '', 0),
      ],
      solution: [
        `Charge = ${target.up} x (+2/3) + ${target.down} x (-1/3) = ${show(charge, 0)} e.`,
        `${target.name[0].toUpperCase()}${target.name.slice(1)} contains ${target.up + target.down} quarks.`,
      ],
    }
  }

  if (roll < 0.67) {
    const totalEnergy = 2 * electronMass * lightSpeed * lightSpeed
    const photonEnergy = totalEnergy / 2
    const wavelengthPm = ((planck * lightSpeed) / photonEnergy) * 1e12

    return {
      statement: 'An electron and a positron annihilate while both are at rest. Use the electron mass 9.11 x 10^-31 kg, c = 3.0 x 10^8 m/s and h = 6.63 x 10^-34 J s.',
      parts: [
        part('(a)', 'Find the total energy released, in units of 10^-13 J, to two decimal places.', totalEnergy / 1e-13, 'x 10^-13 J', 2),
        part('(b)', 'If two photons are produced, find the energy of each photon, in units of 10^-14 J, to two decimal places.', photonEnergy / 1e-14, 'x 10^-14 J', 2),
        part('(c)', 'Find the wavelength of each photon, in pm, to one decimal place.', wavelengthPm, 'pm', 1),
      ],
      solution: [
        `Total energy = 2mc^2 = 2 x 9.11 x 10^-31 x (3.0 x 10^8)^2 = ${show(totalEnergy / 1e-13, 2)} x 10^-13 J.`,
        `If two photons share the energy equally, each has ${show(photonEnergy / 1e-14, 2)} x 10^-14 J.`,
        `lambda = hc / E = 6.63 x 10^-34 x 3.0 x 10^8 / ${show(photonEnergy, 3)} = ${show(wavelengthPm, 1)} pm.`,
      ],
    }
  }

  const energyMeV = int(rng, 20, 200) * 5
  const energyJ = energyMeV * 1.60e-13
  const massEquivalent = energyJ / (lightSpeed * lightSpeed)

  return {
    statement: `A particle accelerator gives a collision energy of ${energyMeV} MeV. Use 1 MeV = 1.60 x 10^-13 J and c = 3.0 x 10^8 m/s.`,
    parts: [
      part('(a)', 'Convert the collision energy to joules, in units of 10^-11 J, to two decimal places.', energyJ / 1e-11, 'x 10^-11 J', 2),
      part('(b)', 'Find the mass equivalent of this energy, in units of 10^-29 kg, to two decimal places.', massEquivalent / 1e-29, 'x 10^-29 kg', 2),
    ],
    solution: [
      `Energy in joules = ${energyMeV} x 1.60 x 10^-13 = ${show(energyJ / 1e-11, 2)} x 10^-11 J.`,
      `m = E / c^2 = ${show(energyJ, 3)} / (3.0 x 10^8)^2 = ${show(massEquivalent / 1e-29, 2)} x 10^-29 kg.`,
    ],
  }
}

function astronomy(rng: Rng): ProblemBody {
  if (rng() < 0.55) {
    const rest = pick(rng, [486.1, 589.0, 656.3])
    const shift = int(rng, 2, 40) / 10
    const away = rng() < 0.5
    const observed = away ? rest + shift : rest - shift
    const z = (observed - rest) / rest
    const speed = Math.abs(z) * 3.0e5

    return {
      statement: `A spectral line has a rest wavelength of ${show(rest, 1)} nm. In light from a gas cloud it is observed at ${show(observed, 1)} nm. Take c = 3.0 x 10^5 km/s.`,
      parts: [
        part('(a)', 'Find the wavelength shift, in nm, to one decimal place.', observed - rest, 'nm', 1),
        part('(b)', 'Find the speed of the gas cloud, in km/s, to the nearest whole number, using v = zc.', speed, 'km/s', 0),
        part('(c)', 'Answer 1 if the cloud is moving away and 2 if it is moving towards us.', away ? 1 : 2, '', 0),
      ],
      solution: [
        `The shift is ${show(observed, 1)} - ${show(rest, 1)} = ${show(observed - rest, 1)} nm.`,
        `z = Delta lambda / lambda = ${show(z, 4)}, so the speed is ${show(speed, 0)} km/s.`,
        away ? 'The wavelength is longer, so the cloud is moving away (answer 1).' : 'The wavelength is shorter, so the cloud is moving towards us (answer 2).',
      ],
    }
  }

  const transitions = [
    { upper: -1.28e-19, lower: -2.27e-19 },
    { upper: -1.28e-19, lower: -5.11e-19 },
    { upper: -1.28e-19, lower: -2.04e-18 },
    { upper: -2.27e-19, lower: -5.11e-19 },
    { upper: -2.27e-19, lower: -2.04e-18 },
    { upper: -5.11e-19, lower: -2.04e-18 },
  ]
  const transition = pick(rng, transitions)
  const { upper, lower } = transition
  const deltaE = upper - lower
  const wavelengthNm = ((planck * lightSpeed) / deltaE) * 1e9
  const frequency = deltaE / planck

  return {
    statement: `An electron in an atom drops from an energy level of ${upper.toExponential(2)} J to ${lower.toExponential(2)} J. Use h = 6.63 x 10^-34 J s and c = 3.0 x 10^8 m/s.`,
    parts: [
      part('(a)', 'Find the photon energy emitted, in units of 10^-19 J, to two decimal places.', deltaE / 1e-19, 'x 10^-19 J', 2),
      part('(b)', 'Find the wavelength of the emitted photon, in nm, to one decimal place.', wavelengthNm, 'nm', 1),
      part('(c)', 'Find the frequency of the emitted photon, in units of 10^14 Hz, to two decimal places.', frequency / 1e14, 'x 10^14 Hz', 2),
    ],
    solution: [
      `Photon energy = E_high - E_low = ${upper.toExponential(2)} - (${lower.toExponential(2)}) = ${show(deltaE / 1e-19, 2)} x 10^-19 J.`,
      `lambda = hc / E = 6.63 x 10^-34 x 3.0 x 10^8 / ${show(deltaE, 3)} = ${show(wavelengthNm, 1)} nm.`,
      `f = E / h = ${show(deltaE, 3)} / 6.63 x 10^-34 = ${show(frequency / 1e14, 2)} x 10^14 Hz.`,
    ],
  }
}

export const physicsGenerators: Record<string, ProblemGenerator> = {
  'ph-measurement': measurement,
  'ph-motion': motion,
  'ph-forces-momentum': forcesMomentum,
  'ph-energy': energy,
  'ph-circular-gravity': circularGravity,
  'ph-heat': heat,
  'ph-waves': waves,
  'ph-light': light,
  'ph-electric-fields': electricFields,
  'ph-circuits': circuits,
  'ph-magnetism': magnetism,
  'ph-electronics': electronics,
  'ph-quantum': quantum,
  'ph-nuclear': nuclear,
  'ph-particles': particles,
  'ph-astronomy': astronomy,
}

export function hasPhysicsProblems(topicId: string): boolean {
  return topicId in physicsGenerators
}

export function physicsProblemTopicIds(): string[] {
  return Object.keys(physicsGenerators)
}

export function generatePhysicsProblem(topicId: string, seed: string): PracticeProblem | undefined {
  const generator = physicsGenerators[topicId]
  if (!generator) return undefined
  const body = generator(createRng(`${topicId}:${seed}`))
  return { topicId, ...body, parts: body.parts.map((problemPart) => ({ ...problemPart, answer: problemPart.answer + 0 })) }
}
