import {
  criticalPath,
  greedyCost,
  isConnected,
  minimumSpanningTree,
  optimalCost,
  shortestDistances,
  type Activity,
  type Edge,
  type LayeredNetwork,
} from './graphs'
import { circleNetwork, graphDiagram, layeredDiagram, niceScale } from './diagrams'
import { createRng, int, pick, round } from './rng'
import type { PracticeProblem, ProblemBody, ProblemGenerator, ProblemPart, Rng } from './types'

/*
 * Original practice problems for Applied Mathematics. They are written for this
 * app, not copied or adapted from any exam paper. Numbers are drawn at random
 * from a seed and every answer is computed in code, so the check is exact.
 * Take g = 9.8 m/s^2 unless a problem says otherwise.
 */

const G = 9.8

/** Prints a number without floating point noise. */
const show = (value: number, decimals = 4) => String(Number(value.toFixed(decimals)))

function part(label: string, prompt: string, value: number, unit: string, decimals: number): ProblemPart {
  return { label, prompt, answer: round(value, decimals), unit, decimals }
}

const rad = (degrees: number) => (degrees * Math.PI) / 180

function velocityTimeGraph(rng: Rng): ProblemBody {
  const v = int(rng, 6, 20)
  const t1 = int(rng, 3, 8)
  const t2 = int(rng, 4, 10)
  const t3 = int(rng, 2, 8)
  const total = t1 + t2 + t3
  const distance = (v * t1) / 2 + v * t2 + (v * t3) / 2
  const x = niceScale(total, 6)
  const y = niceScale(v, 5)
  return {
    statement: 'The velocity-time graph shows the motion of a particle in a straight line. Read the values from the graph.',
    diagram: graphDiagram({
      description: `Velocity-time graph. The velocity rises in a straight line from 0 to ${v} metres per second at ${t1} seconds, stays at ${v} metres per second until ${t1 + t2} seconds, then falls in a straight line to 0 at ${total} seconds.`,
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
    parts: [
      part('(a)', 'Find the acceleration in the first stage.', v / t1, 'm/s^2', 2),
      part('(b)', 'Find the total distance travelled (the area under the graph).', distance, 'm', 2),
      part('(c)', 'Find the average speed for the whole journey.', distance / total, 'm/s', 2),
    ],
    solution: [
      `Acceleration = gradient = ${v} / ${t1} = ${show(v / t1, 2)} m/s^2.`,
      `Distance = area: (1/2) x ${t1} x ${v} + ${t2} x ${v} + (1/2) x ${t3} x ${v} = ${show(distance, 2)} m.`,
      `Average speed = total distance / total time = ${show(distance, 2)} / ${total} = ${show(distance / total, 2)} m/s.`,
    ],
  }
}

function kinematics(rng: Rng): ProblemBody {
  const roll = rng()
  if (roll < 0.34) return velocityTimeGraph(rng)
  if (roll < 0.67) {
    const u = int(rng, 4, 12)
    const a = pick(rng, [0.5, 1, 1.5, 2, 2.5])
    const t = int(rng, 5, 12)
    const v = u + a * t
    const s = u * t + 0.5 * a * t * t
    return {
      statement: `A cyclist moving in a straight line at ${u} m/s accelerates uniformly at ${a} m/s^2 for ${t} seconds.`,
      parts: [
        part('(a)', `Find the speed at the end of the ${t} seconds.`, v, 'm/s', 2),
        part('(b)', 'Find the distance travelled in those seconds.', s, 'm', 2),
      ],
      solution: [`v = u + at = ${u} + ${a} x ${t} = ${show(v)} m/s.`, `s = ut + (1/2)at^2 = ${u} x ${t} + 0.5 x ${a} x ${t}^2 = ${show(s)} m.`],
    }
  }
  const v0 = int(rng, 10, 30)
  const a = pick(rng, [2, 2.5, 4, 5])
  const t = v0 / a
  const s = (v0 * v0) / (2 * a)
  return {
    statement: `A train travelling at ${v0} m/s brakes with a constant deceleration of ${a} m/s^2 until it stops.`,
    parts: [part('(a)', 'How long does it take to stop?', t, 's', 2), part('(b)', 'How far does it travel while braking?', s, 'm', 2)],
    solution: [`0 = ${v0} - ${a}t, so t = ${v0}/${a} = ${show(t)} s.`, `v^2 = u^2 + 2as: 0 = ${v0}^2 - 2 x ${a} x s, so s = ${show(s)} m.`],
  }
}

function calculusForMotion(rng: Rng): ProblemBody {
  const A = int(rng, 1, 3)
  const B = int(rng, 2, 6)
  const C = int(rng, 1, 10)
  const T = int(rng, 2, 4)
  const v = 3 * A * T * T - 2 * B * T + C
  const a = 6 * A * T - 2 * B
  return {
    statement: `A particle moves in a straight line. Its displacement from the origin after t seconds is s = ${A === 1 ? "" : A}t^3 - ${B}t^2 + ${C}t metres.`,
    parts: [part('(a)', `Find the velocity when t = ${T}.`, v, 'm/s', 0), part('(b)', `Find the acceleration when t = ${T}.`, a, 'm/s^2', 0)],
    solution: [
      `v = ds/dt = ${3 * A}t^2 - ${2 * B}t + ${C}; at t = ${T}, v = ${v} m/s.`,
      `a = dv/dt = ${6 * A}t - ${2 * B}; at t = ${T}, a = ${a} m/s^2.`,
    ],
  }
}

function networkTerms(rng: Rng): ProblemBody {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const n = int(rng, 5, 8)
    const edges: Edge[] = []
    for (let a = 0; a < n; a += 1) {
      for (let b = a + 1; b < n; b += 1) if (rng() < 0.45) edges.push({ a, b, weight: 1 })
    }
    if (!isConnected(n, edges)) continue
    const degrees = Array.from({ length: n }, (_, node) => edges.filter((edge) => edge.a === node || edge.b === node).length)
    return {
      statement: `A connected network has ${n} nodes. The degrees of the nodes are ${degrees.join(', ')}.`,
      parts: [
        part('(a)', 'How many edges does the network have?', edges.length, '', 0),
        part('(b)', 'How many edges does a spanning tree of this network have?', n - 1, '', 0),
        part('(c)', 'How many edges must be removed from the network to leave a spanning tree?', edges.length - (n - 1), '', 0),
      ],
      solution: [
        `The degrees add up to ${degrees.reduce((x, y) => x + y, 0)} and every edge is counted twice, so there are ${edges.length} edges.`,
        `A tree on ${n} nodes has ${n} - 1 = ${n - 1} edges.`,
        `${edges.length} - ${n - 1} = ${edges.length - (n - 1)} edges are removed.`,
      ],
    }
  }
  return networkTerms(createRng('fallback'))
}

function adjacencyMatrices(rng: Rng): ProblemBody {
  const n = 4
  const names = ['A', 'B', 'C', 'D']
  const m: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i !== j && rng() < 0.5 ? 1 : 0)))
  const square = m.map((row) => row.map((_, j) => row.reduce((sum, value, k) => sum + value * m[k][j], 0)))
  const i = int(rng, 0, n - 1)
  const j = int(rng, 0, n - 1)
  const total = square.flat().reduce((x, y) => x + y, 0)
  return {
    statement: `A directed network has nodes A, B, C and D. Its adjacency matrix M is given below, with a 1 meaning there is an arrow from the row node to the column node.\n${names
      .map((name, row) => `${name}: ${m[row].join(' ')}`)
      .join('\n')}`,
    parts: [
      part('(a)', `What is the entry in row ${names[i]}, column ${names[j]} of M squared?`, square[i][j], '', 0),
      part('(b)', 'What is the sum of all entries of M squared?', total, '', 0),
    ],
    solution: [
      `Row ${names[i]} of M times column ${names[j]} of M gives ${square[i][j]}: this is the number of routes of exactly 2 arrows from ${names[i]} to ${names[j]}.`,
      `Adding all entries of M squared gives ${total}, the number of routes of exactly 2 arrows in the whole network.`,
    ],
  }
}

function vectors2d(rng: Rng): ProblemBody {
  const a1 = int(rng, 2, 7)
  let a2 = int(rng, -6, 6)
  if (a2 === 0) a2 = 3
  const b1 = int(rng, -5, 6)
  const b2 = int(rng, -5, 6)
  const k = int(rng, 1, 3)
  const q = a1 * k
  const p = -a2 * k
  const dot = a1 * b1 + a2 * b2
  const sign = (value: number) => (value < 0 ? `- ${-value}` : `+ ${value}`)
  return {
    statement: `Let a = ${a1}i ${sign(a2)}j and b = ${b1}i ${sign(b2)}j, where i and j are perpendicular unit vectors. A third vector is c = pi + ${q}j.`,
    parts: [
      part('(a)', 'Find the dot product a . b.', dot, '', 0),
      part('(b)', 'Find the magnitude of a.', Math.hypot(a1, a2), '', 2),
      part('(c)', 'Find p so that c is perpendicular to a.', p, '', 0),
    ],
    solution: [
      `a . b = ${a1} x ${b1} + ${a2} x ${b2} = ${dot}.`,
      `|a| = sqrt(${a1}^2 + ${a2}^2) = ${show(Math.hypot(a1, a2), 2)}.`,
      `Perpendicular means a . c = 0: ${a1}p + ${a2} x ${q} = 0, so p = ${p}.`,
    ],
  }
}

function projectiles(rng: Rng): ProblemBody {
  const u = int(rng, 15, 40)
  const angle = pick(rng, [25, 30, 35, 40, 45, 50, 55, 60])
  const t = (2 * u * Math.sin(rad(angle))) / G
  const h = (u * u * Math.sin(rad(angle)) ** 2) / (2 * G)
  const range = (u * u * Math.sin(rad(2 * angle))) / G
  return {
    statement: `A ball is hit from level ground with speed ${u} m/s at ${angle} degrees above the horizontal. Ignore air resistance and take g = 9.8 m/s^2.`,
    parts: [
      part('(a)', 'Find the time of flight.', t, 's', 2),
      part('(b)', 'Find the greatest height reached.', h, 'm', 2),
      part('(c)', 'Find the horizontal range.', range, 'm', 2),
    ],
    solution: [
      `Vertical: 0 = ${u} sin(${angle}) t - 4.9t^2, so t = 2 x ${u} x sin(${angle})/9.8 = ${show(t, 2)} s.`,
      `Greatest height: (${u} sin(${angle}))^2 / (2 x 9.8) = ${show(h, 2)} m.`,
      `Range: ${u} cos(${angle}) x ${show(t, 2)} = ${show(range, 2)} m.`,
    ],
  }
}

function spanningTrees(rng: Rng): ProblemBody {
  const names = ['A', 'B', 'C', 'D', 'E', 'F']
  const edges: Edge[] = []
  for (let a = 0; a < 6; a += 1) for (let b = a + 1; b < 6; b += 1) edges.push({ a, b, weight: int(rng, 5, 25) })
  const { total, chosen } = minimumSpanningTree(6, edges)
  const heaviest = Math.max(...chosen.map((edge) => edge.weight))
  return {
    diagram: circleNetwork(names, edges),
    solutionDiagram: circleNetwork(names, chosen, chosen),
    statement: `Six villages A to F are to be joined by cables. The cost of linking each pair is given below.\n${edges
      .map((edge) => `${names[edge.a]}-${names[edge.b]}: ${edge.weight}`)
      .join(', ')}`,
    parts: [
      part('(a)', 'What is the least total cost to connect all six villages (minimum spanning tree)?', total, '', 0),
      part('(b)', 'What is the cost of the most expensive link used in that tree?', heaviest, '', 0),
    ],
    solution: [
      `Kruskal's algorithm: sort the links by cost and add each one that does not make a cycle, until there are 5 edges.`,
      `Edges chosen: ${chosen.map((edge) => `${names[edge.a]}-${names[edge.b]} (${edge.weight})`).join(', ')}. Total ${total}.`,
      `The most expensive chosen edge costs ${heaviest}.`,
    ],
  }
}

function forcesNewton(rng: Rng): ProblemBody {
  const m = int(rng, 50, 90)
  const a = pick(rng, [0.5, 0.8, 1, 1.2, 1.5])
  const up = m * (G + a)
  const down = m * (G - a)
  return {
    statement: `A person of mass ${m} kg stands on the floor of a lift. Take g = 9.8 m/s^2.`,
    parts: [
      part('(a)', `Find the reaction of the floor when the lift accelerates upwards at ${a} m/s^2.`, up, 'N', 1),
      part('(b)', `Find the reaction of the floor when the lift accelerates downwards at ${a} m/s^2.`, down, 'N', 1),
    ],
    solution: [`Upwards: R - ${m}g = ${m} x ${a}, so R = ${m} x (9.8 + ${a}) = ${show(up, 1)} N.`, `Downwards: ${m}g - R = ${m} x ${a}, so R = ${m} x (9.8 - ${a}) = ${show(down, 1)} N.`],
  }
}

function planesFriction(rng: Rng): ProblemBody {
  const m = int(rng, 2, 8)
  const theta = pick(rng, [20, 25, 30, 35, 40])
  const mu = round(Math.tan(rad(theta)) * pick(rng, [0.3, 0.5, 0.7]), 2)
  const R = m * G * Math.cos(rad(theta))
  const F = mu * R
  const a = G * (Math.sin(rad(theta)) - mu * Math.cos(rad(theta)))
  return {
    statement: `A block of mass ${m} kg slides down a rough plane inclined at ${theta} degrees to the horizontal. The coefficient of friction is ${mu}. Take g = 9.8 m/s^2.`,
    parts: [
      part('(a)', 'Find the normal reaction.', R, 'N', 2),
      part('(b)', 'Find the friction force.', F, 'N', 2),
      part('(c)', 'Find the acceleration of the block down the plane.', a, 'm/s^2', 2),
    ],
    solution: [
      `Perpendicular to the plane: R = ${m}g cos(${theta}) = ${show(R, 2)} N.`,
      `F = mu R = ${mu} x ${show(R, 2)} = ${show(F, 2)} N.`,
      `Down the plane: ${m}g sin(${theta}) - F = ${m}a, so a = ${show(a, 2)} m/s^2.`,
    ],
  }
}

function connectedMasses(rng: Rng): ProblemBody {
  if (rng() < 0.5) {
    const m1 = int(rng, 3, 9)
    const m2 = int(rng, 1, m1 - 1)
    const a = ((m1 - m2) * G) / (m1 + m2)
    const T = (2 * m1 * m2 * G) / (m1 + m2)
    return {
      statement: `Particles of mass ${m1} kg and ${m2} kg are joined by a light inextensible string over a smooth fixed pulley and released from rest. Take g = 9.8 m/s^2.`,
      parts: [part('(a)', 'Find the acceleration of the particles.', a, 'm/s^2', 2), part('(b)', 'Find the tension in the string.', T, 'N', 2)],
      solution: [`${m1}g - T = ${m1}a and T - ${m2}g = ${m2}a. Adding: a = (${m1} - ${m2})g/(${m1} + ${m2}) = ${show(a, 2)} m/s^2.`, `T = ${m2}(g + a) = ${show(T, 2)} N.`],
    }
  }
  const m1 = int(rng, 2, 8)
  const m2 = int(rng, 1, 6)
  const a = (m2 * G) / (m1 + m2)
  const T = (m1 * m2 * G) / (m1 + m2)
  return {
    statement: `A particle of mass ${m1} kg lies on a smooth horizontal table. It is joined by a light inextensible string over a smooth pulley at the edge of the table to a particle of mass ${m2} kg hanging freely. The system is released from rest. Take g = 9.8 m/s^2.`,
    parts: [part('(a)', 'Find the acceleration.', a, 'm/s^2', 2), part('(b)', 'Find the tension in the string.', T, 'N', 2)],
    solution: [`Table: T = ${m1}a. Hanging: ${m2}g - T = ${m2}a. So a = ${m2}g/(${m1} + ${m2}) = ${show(a, 2)} m/s^2.`, `T = ${m1} x ${show(a, 2)} = ${show(T, 2)} N.`],
  }
}

function layeredNetwork(rng: Rng): LayeredNetwork {
  const layers = [['S'], ['A', 'B'], ['C', 'D'], ['T']]
  const cost: Record<string, number> = {}
  for (let layer = 0; layer < layers.length - 1; layer += 1) {
    for (const from of layers[layer]) for (const to of layers[layer + 1]) cost[`${from}>${to}`] = int(rng, 1, 9)
  }
  return { layers, cost }
}

const describeNetwork = (network: LayeredNetwork) =>
  Object.entries(network.cost)
    .map(([key, value]) => `${key.replace('>', ' to ')}: ${value}`)
    .join(', ')

function dynamicProgramming(rng: Rng): ProblemBody {
  const network = layeredNetwork(rng)
  const best = optimalCost(network)
  return {
    diagram: layeredDiagram(network),
    solutionDiagram: layeredDiagram(network, best.path),
    statement: `A journey from S to T has three stages. The cost of each leg is shown. Use dynamic programming, working backwards from T.\n${describeNetwork(network)}`,
    parts: [
      part('(a)', 'What is the minimum cost from A to T?', best.costToGo.A, '', 0),
      part('(b)', 'What is the minimum total cost from S to T?', best.total, '', 0),
    ],
    solution: [
      `Stage 3: cost to T from C is ${best.costToGo.C} and from D is ${best.costToGo.D}.`,
      `Stage 2: from A the best is ${best.costToGo.A}; from B the best is ${best.costToGo.B}.`,
      `Stage 1: the best from S is ${best.total}, along ${best.path.join(' - ')}.`,
    ],
  }
}

function greedyVersusDp(rng: Rng): ProblemBody {
  let network = layeredNetwork(rng)
  for (let attempt = 0; attempt < 60 && greedyCost(network) === optimalCost(network).total; attempt += 1) network = layeredNetwork(rng)
  const best = optimalCost(network)
  const greedy = greedyCost(network)
  return {
    diagram: layeredDiagram(network),
    solutionDiagram: layeredDiagram(network, best.path),
    statement: `A journey from S to T has three stages. The cost of each leg is shown.\n${describeNetwork(network)}\nA greedy method always takes the cheapest leg available from the current node.`,
    parts: [
      part('(a)', 'What total cost does the greedy method give from S to T?', greedy, '', 0),
      part('(b)', 'What is the true minimum cost found by dynamic programming?', best.total, '', 0),
      part('(c)', 'By how much is the greedy route more expensive?', greedy - best.total, '', 0),
    ],
    solution: [
      `Greedy: take the cheapest leg at each node. Total ${greedy}.`,
      `Dynamic programming works backwards and finds ${best.total}, along ${best.path.join(' - ')}.`,
      greedy === best.total ? 'Here both methods happen to agree.' : `The difference is ${greedy - best.total}: choosing cheaply now can force expensive legs later.`,
    ],
  }
}

function dijkstra(rng: Rng): ProblemBody {
  const names = ['A', 'B', 'C', 'D', 'E', 'F']
  const edges: Edge[] = []
  const key = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`
  const used = new Set<string>()
  for (let node = 1; node < 6; node += 1) {
    const other = int(rng, 0, node - 1)
    edges.push({ a: other, b: node, weight: int(rng, 2, 15) })
    used.add(key(other, node))
  }
  for (let extra = 0; extra < 4; extra += 1) {
    const a = int(rng, 0, 5)
    const b = int(rng, 0, 5)
    if (a !== b && !used.has(key(a, b))) {
      edges.push({ a, b, weight: int(rng, 2, 15) })
      used.add(key(a, b))
    }
  }
  const dist = shortestDistances(6, edges, 0)
  return {
    diagram: circleNetwork(names, edges),
    statement: `The network below shows roads and their lengths in km.\n${edges.map((edge) => `${names[edge.a]}-${names[edge.b]}: ${edge.weight}`).join(', ')}`,
    parts: [
      part('(a)', 'Use Dijkstra\u2019s algorithm to find the shortest distance from A to F.', dist[5], 'km', 0),
      part('(b)', 'Find the shortest distance from A to E.', dist[4], 'km', 0),
    ],
    solution: [
      `Label A with 0 and keep making the node with the smallest temporary label permanent, updating its neighbours.`,
      `Final distances from A: ${names.map((name, index) => `${name} = ${dist[index]}`).join(', ')}.`,
    ],
  }
}

function momentumImpulse(rng: Rng): ProblemBody {
  const m = pick(rng, [0.2, 0.4, 0.5, 0.6])
  const u = int(rng, 8, 20)
  const v = int(rng, 3, u - 2)
  const t = pick(rng, [0.01, 0.02, 0.05])
  const impulse = m * (u + v)
  return {
    statement: `A ball of mass ${m} kg hits a wall at right angles with speed ${u} m/s and rebounds along the same line with speed ${v} m/s. The contact lasts ${t} s.`,
    parts: [
      part('(a)', 'Find the magnitude of the impulse the wall gives the ball.', impulse, 'N s', 2),
      part('(b)', 'Find the average force of the wall on the ball.', impulse / t, 'N', 1),
      part('(c)', 'Find the coefficient of restitution between the ball and the wall.', v / u, '', 2),
    ],
    solution: [
      `Take the rebound direction as positive: impulse = ${m}(${v} - (-${u})) = ${show(impulse, 2)} N s.`,
      `Average force = impulse / time = ${show(impulse, 2)} / ${t} = ${show(impulse / t, 1)} N.`,
      `e = speed of separation / speed of approach = ${v}/${u} = ${show(v / u, 2)}.`,
    ],
  }
}

function collisions(rng: Rng): ProblemBody {
  const m1 = int(rng, 2, 6)
  const m2 = int(rng, 1, 5)
  const u1 = int(rng, 4, 12)
  const e = pick(rng, [0.4, 0.5, 0.6, 0.8])
  const v1 = ((m1 - e * m2) * u1) / (m1 + m2)
  const v2 = (m1 * (1 + e) * u1) / (m1 + m2)
  const lost = 0.5 * m1 * u1 * u1 - 0.5 * m1 * v1 * v1 - 0.5 * m2 * v2 * v2
  return {
    statement: `A smooth sphere of mass ${m1} kg moving at ${u1} m/s collides directly with a smooth sphere of mass ${m2} kg at rest. The coefficient of restitution is ${e}.`,
    parts: [
      part('(a)', 'Find the velocity of the first sphere after the collision (in its original direction).', v1, 'm/s', 2),
      part('(b)', 'Find the velocity of the second sphere after the collision.', v2, 'm/s', 2),
      part('(c)', 'Find the kinetic energy lost.', lost, 'J', 2),
    ],
    solution: [
      `Momentum: ${m1}(${u1}) = ${m1}v1 + ${m2}v2. Restitution: v2 - v1 = ${e} x ${u1}.`,
      `Solving gives v1 = ${show(v1, 2)} m/s and v2 = ${show(v2, 2)} m/s.`,
      `Energy lost = 0.5 x ${m1} x ${u1}^2 - 0.5 x ${m1} x v1^2 - 0.5 x ${m2} x v2^2 = ${show(lost, 2)} J.`,
    ],
  }
}

const scheduleActivities: readonly Activity[] = [
  { name: 'A', duration: 0, after: [] },
  { name: 'B', duration: 0, after: ['A'] },
  { name: 'C', duration: 0, after: ['A'] },
  { name: 'D', duration: 0, after: ['B'] },
  { name: 'E', duration: 0, after: ['B', 'C'] },
  { name: 'F', duration: 0, after: ['D', 'E'] },
  { name: 'G', duration: 0, after: ['C'] },
]

function projectScheduling(rng: Rng): ProblemBody {
  const activities = scheduleActivities.map((activity) => ({ ...activity, duration: int(rng, 2, 9) }))
  const schedule = criticalPath(activities)
  const slack = activities.filter((activity) => schedule.float[activity.name] > 0)
  const target = slack.length > 0 ? pick(rng, slack) : pick(rng, activities)
  return {
    statement: `A project has the activities below. Durations are in days.\n${activities
      .map((activity) => `${activity.name}: ${activity.duration} days, after ${activity.after.length > 0 ? activity.after.join(' and ') : 'nothing'}`)
      .join('\n')}`,
    parts: [
      part('(a)', 'What is the shortest time in which the project can be completed?', schedule.duration, 'days', 0),
      part('(b)', `What is the total float of activity ${target.name}?`, schedule.float[target.name], 'days', 0),
    ],
    solution: [
      `Forward pass gives earliest start times: ${activities.map((activity) => `${activity.name} ${schedule.earliestStart[activity.name]}`).join(', ')}.`,
      `The longest path sets the project time: ${schedule.duration} days.`,
      `Total float of ${target.name} = latest start - earliest start = ${schedule.latestStart[target.name]} - ${schedule.earliestStart[target.name]} = ${schedule.float[target.name]} days.`,
    ],
  }
}

function resistiveForces(rng: Rng): ProblemBody {
  const m = int(rng, 2, 6)
  const u = int(rng, 10, 30)
  const k = pick(rng, [0.2, 0.25, 0.4, 0.5])
  const t = int(rng, 2, 6)
  return {
    statement: `A particle of mass ${m} kg moves in a straight line against a resistance of magnitude ${m}kv newtons, where v m/s is its speed and k = ${k} per second. Its initial speed is ${u} m/s. No other horizontal force acts.`,
    parts: [
      part('(a)', `Find the speed after ${t} seconds.`, u * Math.exp(-k * t), 'm/s', 2),
      part('(b)', 'Find the total distance travelled before it comes to rest.', u / k, 'm', 2),
      part('(c)', 'Find the time taken for the speed to fall to half its initial value.', Math.log(2) / k, 's', 2),
    ],
    solution: [
      `${m}dv/dt = -${m}kv, so dv/dt = -${k}v. Separating: v = ${u}e^(-${k}t); at t = ${t}, v = ${show(u * Math.exp(-k * t), 2)} m/s.`,
      `Use a = v dv/dx = -${k}v, so dv/dx = -${k} and v = ${u} - ${k}x. It stops when x = ${u}/${k} = ${show(u / k, 2)} m.`,
      `Half speed: e^(-${k}t) = 1/2, so t = ln 2 / ${k} = ${show(Math.log(2) / k, 2)} s.`,
    ],
  }
}

function workEnergy(rng: Rng): ProblemBody {
  const l = pick(rng, [0.5, 0.8, 1, 1.2])
  const lambda = int(rng, 20, 80)
  const x = pick(rng, [0.1, 0.2, 0.3, 0.4])
  const m = pick(rng, [0.5, 1, 2])
  const tension = (lambda * x) / l
  const energy = (lambda * x * x) / (2 * l)
  const speed = Math.sqrt((2 * energy) / m)
  return {
    statement: `An elastic string has natural length ${l} m and modulus of elasticity ${lambda} N. One end is fixed to a point on a smooth horizontal table and the other end to a particle of mass ${m} kg. The particle is pulled ${x} m beyond the natural length and released.`,
    parts: [
      part('(a)', 'Find the tension in the string at the start.', tension, 'N', 2),
      part('(b)', 'Find the elastic potential energy stored at the start.', energy, 'J', 2),
      part('(c)', 'Find the speed of the particle when the string becomes slack.', speed, 'm/s', 2),
    ],
    solution: [
      `T = lambda x / l = ${lambda} x ${x} / ${l} = ${show(tension, 2)} N.`,
      `Energy = lambda x^2 / (2l) = ${lambda} x ${x}^2 / (2 x ${l}) = ${show(energy, 2)} J.`,
      `All of it becomes kinetic energy: 0.5 x ${m} x v^2 = ${show(energy, 2)}, so v = ${show(speed, 2)} m/s.`,
    ],
  }
}

function circularMotion(rng: Rng): ProblemBody {
  const m = pick(rng, [0.5, 1, 1.5, 2])
  const r = pick(rng, [0.4, 0.5, 0.8, 1.2, 1.5])
  const v = int(rng, 2, 8)
  return {
    statement: `A particle of mass ${m} kg is attached to a light string of length ${r} m and moves in a horizontal circle on a smooth table at a constant speed of ${v} m/s. The other end of the string is fixed at the centre of the circle.`,
    parts: [
      part('(a)', 'Find the angular velocity.', v / r, 'rad/s', 2),
      part('(b)', 'Find the tension in the string.', (m * v * v) / r, 'N', 2),
      part('(c)', 'Find the time for one complete revolution.', (2 * Math.PI * r) / v, 's', 2),
    ],
    solution: [
      `omega = v/r = ${v}/${r} = ${show(v / r, 2)} rad/s.`,
      `T = m v^2 / r = ${m} x ${v}^2 / ${r} = ${show((m * v * v) / r, 2)} N.`,
      `Period = 2 pi r / v = ${show((2 * Math.PI * r) / v, 2)} s.`,
    ],
  }
}

const dimensionQuantities = [
  { name: 'pressure (force per unit area)', exponents: [1, -1, -2] },
  { name: 'power (work done per unit time)', exponents: [1, 2, -3] },
  { name: 'momentum (mass times velocity)', exponents: [1, 1, -1] },
  { name: 'kinetic energy (half mass times speed squared)', exponents: [1, 2, -2] },
  { name: 'density (mass per unit volume)', exponents: [1, -3, 0] },
  { name: 'spring constant (force per unit extension)', exponents: [1, 0, -2] },
]

function dimensionalAnalysis(rng: Rng): ProblemBody {
  const quantity = pick(rng, dimensionQuantities)
  const [M, L, T] = quantity.exponents
  return {
    statement: `Write the dimensions of ${quantity.name} in the form M^a L^b T^c, where M is mass, L is length and T is time.`,
    parts: [part('(a)', 'Find a, the power of M.', M, '', 0), part('(b)', 'Find b, the power of L.', L, '', 0), part('(c)', 'Find c, the power of T.', T, '', 0)],
    solution: [`The dimensions of ${quantity.name} are M^${M} L^${L} T^${T}.`, 'Build them from [force] = M L T^-2, [velocity] = L T^-1, [area] = L^2 and [volume] = L^3.'],
  }
}

function recurrence(rng: Rng): ProblemBody {
  const a = pick(rng, [2, 3, -1, 4])
  const b = int(rng, -5, 8)
  const u0 = int(rng, 1, 6)
  const coefficient = a === -1 ? '-' : String(a)
  const terms = [u0]
  for (let n = 0; n < 5; n += 1) terms.push(a * terms[n] + b)
  return {
    statement: `A sequence satisfies U(n+1) = ${coefficient}U(n) ${b < 0 ? `- ${-b}` : `+ ${b}`}, for n = 0, 1, 2, ..., with U(0) = ${u0}.`,
    parts: [part('(a)', 'Find U(3).', terms[3], '', 0), part('(b)', 'Find U(5).', terms[5], '', 0)],
    solution: [`The terms are ${terms.join(', ')}.`, `Each term comes from the one before it, starting from U(0) = ${u0}.`],
  }
}

function differenceModelling(rng: Rng): ProblemBody {
  const rate = pick(rng, [5, 8, 10, 12])
  const u0 = int(rng, 20, 50) * 100
  const removed = int(rng, 2, 8) * 50
  const factor = 1 + rate / 100
  const terms = [u0]
  for (let n = 0; n < 3; n += 1) terms.push(factor * terms[n] - removed)
  return {
    statement: `A fish population grows by ${rate}% each year. At the end of every year ${removed} fish are removed. At the start there are ${u0} fish. Let U(n) be the number of fish after n years, once the removal for that year has been made.`,
    parts: [
      part('(a)', 'Find U(3). (Model it as U(n+1) = r U(n) - c and work year by year.)', terms[3], '', 1),
      part('(b)', 'Find the number of fish at which the population neither grows nor shrinks.', removed / (rate / 100), '', 1),
    ],
    solution: [
      `Model: U(n+1) = ${show(factor)}U(n) - ${removed}, U(0) = ${u0}.`,
      `U(1) = ${show(terms[1], 2)}, U(2) = ${show(terms[2], 2)}, U(3) = ${show(terms[3], 2)}.`,
      `Equilibrium: U = ${show(factor)}U - ${removed}, so U = ${removed} / ${show(rate / 100)} = ${show(removed / (rate / 100), 1)}.`,
    ],
  }
}

function differenceSolving(rng: Rng): ProblemBody {
  const pairs: [number, number][] = [[3, 2], [4, 1], [2, -1], [3, -1], [2, 1], [4, 3], [5, 2]]
  const [r1, r2] = pick(rng, pairs)
  const A = int(rng, 1, 5)
  let B = int(rng, -3, 4)
  if (B === 0) B = 2
  const u0 = A + B
  const u1 = A * r1 + B * r2
  const p = r1 + r2
  const q = -r1 * r2
  const terms = [u0, u1]
  for (let n = 2; n <= 5; n += 1) terms.push(p * terms[n - 1] + q * terms[n - 2])
  return {
    statement: `A sequence satisfies U(n+2) = ${p}U(n+1) ${q < 0 ? `- ${-q}` : `+ ${q}`}U(n), with U(0) = ${u0} and U(1) = ${u1}. Its solution has the form U(n) = A x r1^n + B x r2^n, where r1 > r2 are the roots of the characteristic equation.`,
    parts: [part('(a)', 'Find r1.', r1, '', 0), part('(b)', 'Find A.', A, '', 0), part('(c)', 'Find U(5).', terms[5], '', 0)],
    solution: [
      `Characteristic equation: r^2 - ${p}r + ${r1 * r2} = 0, with roots ${r1} and ${r2}.`,
      `A + B = ${u0} and ${r1}A + ${r2}B = ${u1}, so A = ${A} and B = ${B}.`,
      `U(5) = ${A} x ${r1}^5 + ${B} x ${r2}^5 = ${terms[5]}.`,
    ],
  }
}

function differentialModelling(rng: Rng): ProblemBody {
  const p0 = int(rng, 2, 10) * 500
  const years = pick(rng, [2, 3, 4])
  const p1 = Math.round(p0 * pick(rng, [1.2, 1.3, 1.5, 1.6]))
  const k = Math.log(p1 / p0) / years
  return {
    statement: `The population of a town grows at a rate proportional to its size, dP/dt = kP, where t is in years. At t = 0 the population is ${p0}, and after ${years} years it is ${p1}.`,
    parts: [
      part('(a)', 'Find k, to 4 decimal places.', k, 'per year', 4),
      part('(b)', 'Find the population after 10 years, to the nearest whole number.', p0 * Math.exp(10 * k), '', 0),
      part('(c)', 'Find the time for the population to double.', Math.log(2) / k, 'years', 2),
    ],
    solution: [
      `Separating variables: P = ${p0}e^(kt). At t = ${years}: ${p1} = ${p0}e^(${years}k), so k = ln(${p1}/${p0}) / ${years} = ${show(k, 4)}.`,
      `P(10) = ${p0}e^(10k) = ${show(p0 * Math.exp(10 * k), 0)}.`,
      `Doubling: e^(kt) = 2, so t = ln 2 / k = ${show(Math.log(2) / k, 2)} years.`,
    ],
  }
}

function differentialSolving(rng: Rng): ProblemBody {
  const a = int(rng, 6, 20)
  const b = pick(rng, [0.5, 1, 2])
  const v0 = int(rng, 0, 4)
  const t = pick(rng, [1, 2, 3])
  const limit = a / b
  const exact = limit + (v0 - limit) * Math.exp(-b * t)
  const h = 0.5
  const euler = v0 + h * (a - b * v0)
  return {
    statement: `The speed v m/s of a falling object after t seconds satisfies dv/dt = ${a} - ${b}v, with v = ${v0} when t = 0.`,
    parts: [
      part('(a)', 'Find the value that v approaches as t becomes very large.', limit, 'm/s', 2),
      part('(b)', `Solve the equation and find v when t = ${t}.`, exact, 'm/s', 2),
      part('(c)', `Use one step of Euler's method with step size ${h} to estimate v when t = ${h}.`, euler, 'm/s', 2),
    ],
    solution: [
      `As t grows dv/dt tends to 0, so v tends to ${a}/${b} = ${show(limit, 2)}.`,
      `Separating variables: v = ${show(limit, 2)} + (${v0} - ${show(limit, 2)})e^(-${b}t). At t = ${t}, v = ${show(exact, 2)}.`,
      `Euler: v(${h}) ~ ${v0} + ${h} x (${a} - ${b} x ${v0}) = ${show(euler, 2)}.`,
    ],
  }
}

const generators: Record<string, ProblemGenerator> = {
  'am-kinematics-1d': kinematics,
  'am-calculus-for-motion': calculusForMotion,
  'am-network-terms': networkTerms,
  'am-adjacency-matrices': adjacencyMatrices,
  'am-vectors-2d': vectors2d,
  'am-projectiles': projectiles,
  'am-spanning-trees': spanningTrees,
  'am-forces-newton': forcesNewton,
  'am-planes-friction': planesFriction,
  'am-connected-masses': connectedMasses,
  'am-dynamic-programming': dynamicProgramming,
  'am-dijkstra': dijkstra,
  'am-momentum-impulse': momentumImpulse,
  'am-collisions': collisions,
  'am-project-scheduling': projectScheduling,
  'am-resistive-forces': resistiveForces,
  'am-work-energy': workEnergy,
  'am-circular-motion': circularMotion,
  'am-dimensional-analysis': dimensionalAnalysis,
  'am-greedy-vs-dp': greedyVersusDp,
  'am-recurrence': recurrence,
  'am-difference-modelling': differenceModelling,
  'am-difference-solving': differenceSolving,
  'am-differential-modelling': differentialModelling,
  'am-differential-solving': differentialSolving,
}

export function hasProblems(topicId: string): boolean {
  return topicId in generators
}

export function problemTopicIds(): string[] {
  return Object.keys(generators)
}

/** The same topic and seed always give the same problem. */
export function generateProblem(topicId: string, seed: string): PracticeProblem | undefined {
  const generator = generators[topicId]
  if (!generator) return undefined
  return { topicId, ...generator(createRng(`${topicId}:${seed}`)) }
}
