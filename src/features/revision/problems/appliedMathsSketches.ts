import { graphDiagram, niceScale, sampleCurve } from './diagrams'
import { createRng, int, pick, round } from './rng'
import type { Rng, SketchBody, SketchGenerator, SketchTask } from './types'

/*
 * Drawing tasks. The learner sketches on paper, then opens a reference graph
 * drawn by the app and ticks the features a correct sketch shows. Nothing here
 * is copied from an exam paper.
 */

const G = 9.8
const rad = (degrees: number) => (degrees * Math.PI) / 180
const AXES = (x: string, y: string) => `Both axes are labelled: ${x} on the horizontal axis and ${y} on the vertical axis.`

function velocityTime(rng: Rng): SketchBody {
  const a = pick(rng, [1, 1.5, 2, 2.5, 3])
  const t1 = int(rng, 4, 8)
  const t2 = int(rng, 3, 8)
  const t3 = int(rng, 2, 6)
  const v = round(a * t1, 2)
  const total = t1 + t2 + t3
  const x = niceScale(total, 6)
  const y = niceScale(v, 5)
  return {
    prompt: `A particle starts from rest and accelerates uniformly at ${a} m/s^2 for ${t1} seconds. It then moves at constant speed for ${t2} seconds, and finally decelerates uniformly to rest in ${t3} seconds. Sketch the velocity-time graph and mark the key values.`,
    reference: graphDiagram({
      description: `Velocity-time graph. It rises in a straight line from 0 to ${v} metres per second at ${t1} seconds, stays level until ${t1 + t2} seconds, then falls in a straight line to 0 at ${total} seconds.`,
      xLabel: 'time (s)',
      yLabel: 'velocity (m/s)',
      xMax: x.max,
      yMax: y.max,
      xStep: x.step,
      yStep: y.step,
      lines: [{ points: [[0, 0], [t1, v], [t1 + t2, v], [total, 0]] }],
      marks: [
        { x: t1, y: v, label: `(${t1}, ${v})`, guides: true },
        { x: t1 + t2, y: v, label: `(${t1 + t2}, ${v})`, guides: true },
        { x: total, y: 0, label: `(${total}, 0)` },
      ],
    }),
    checklist: [
      AXES('time (s)', 'velocity (m/s)'),
      `The graph starts at the origin and rises in a straight line to ${v} m/s at t = ${t1} s.`,
      `It stays level at ${v} m/s until t = ${t1 + t2} s.`,
      `It falls in a straight line to 0 at t = ${total} s.`,
      'You can say what the gradient and the area under the graph mean (acceleration and distance).',
    ],
  }
}

function trajectory(rng: Rng): SketchBody {
  const u = int(rng, 15, 35)
  const angle = pick(rng, [30, 35, 40, 45, 50, 60])
  const range = (u * u * Math.sin(rad(2 * angle))) / G
  const height = (u * u * Math.sin(rad(angle)) ** 2) / (2 * G)
  const x = niceScale(range, 5)
  const y = niceScale(height * 1.1, 4)
  const path = (px: number) => px * Math.tan(rad(angle)) - (G * px * px) / (2 * u * u * Math.cos(rad(angle)) ** 2)
  const r = round(range, 1)
  const h = round(height, 1)
  return {
    prompt: `A ball is hit from level ground with speed ${u} m/s at ${angle} degrees above the horizontal. Ignore air resistance. Sketch the path of the ball (height against horizontal distance) and mark the greatest height and the range.`,
    reference: graphDiagram({
      description: `Path of the ball: a symmetrical arch from the origin, reaching a greatest height of about ${h} metres halfway along, and landing about ${r} metres from the start.`,
      xLabel: 'horizontal distance (m)',
      yLabel: 'height (m)',
      xMax: x.max,
      yMax: y.max,
      xStep: x.step,
      yStep: y.step,
      lines: [{ points: sampleCurve(path, 0, range) }],
      marks: [
        { x: range / 2, y: height, label: `(${round(range / 2, 1)}, ${h})`, guides: true },
        { x: range, y: 0, label: `(${r}, 0)` },
      ],
    }),
    checklist: [
      AXES('horizontal distance (m)', 'height (m)'),
      'The path starts at the origin and is a smooth arch, not a straight line.',
      `The highest point is about ${h} m, exactly halfway along the range.`,
      `The ball lands on the ground at about ${r} m, and the second half is a mirror image of the first.`,
    ],
  }
}

function exponentialGrowth(rng: Rng): SketchBody {
  const p0 = int(rng, 2, 8) * 100
  const k = pick(rng, [0.1, 0.15, 0.2, 0.25])
  const years = 10
  const p10 = p0 * Math.exp(k * years)
  const x = niceScale(years, 5)
  const y = niceScale(p10, 5)
  return {
    prompt: `The population P of a colony satisfies dP/dt = ${k}P, with P = ${p0} when t = 0 (t in years). Sketch P against t for 0 \u2264 t \u2264 ${years}, marking the starting value and the value at t = ${years}.`,
    reference: graphDiagram({
      description: `Exponential growth curve. It starts at ${p0} when t is 0 and rises ever more steeply to about ${Math.round(p10)} at t equal to ${years}.`,
      xLabel: 't (years)',
      yLabel: 'P',
      xMax: x.max,
      yMax: y.max,
      xStep: x.step,
      yStep: y.step,
      lines: [{ points: sampleCurve((t) => p0 * Math.exp(k * t), 0, years) }],
      marks: [
        { x: 0, y: p0, label: `(0, ${p0})` },
        { x: years, y: p10, label: `(${years}, ${Math.round(p10)})`, guides: true },
      ],
    }),
    checklist: [
      AXES('t (years)', 'P'),
      `The curve starts at (0, ${p0}), not at the origin.`,
      'It always rises, and it gets steeper as t increases (the gradient is proportional to P).',
      `It reaches about ${Math.round(p10)} at t = ${years} and never touches the t-axis.`,
    ],
  }
}

const generators: Record<string, SketchGenerator> = {
  'am-kinematics-1d': velocityTime,
  'am-projectiles': trajectory,
  'am-differential-modelling': exponentialGrowth,
}

export function hasSketch(topicId: string): boolean {
  return topicId in generators
}

export function sketchTopicIds(): string[] {
  return Object.keys(generators)
}

export function generateSketch(topicId: string, seed: string): SketchTask | undefined {
  const generator = generators[topicId]
  if (!generator) return undefined
  return { topicId, ...generator(createRng(`sketch:${topicId}:${seed}`)) }
}
