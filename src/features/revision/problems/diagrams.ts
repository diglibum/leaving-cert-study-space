import type { Edge, LayeredNetwork } from './graphs'
import type { GraphDiagram, NetworkDiagram } from './types'

export const DIAGRAM_WIDTH = 340
export const DIAGRAM_HEIGHT = 240

/** Rounds a maximum up to a tidy axis length with about `ticks` steps of 1, 2 or 5 times a power of ten. */
export function niceScale(max: number, ticks = 5): { max: number; step: number } {
  const raw = Math.max(max, 1e-9) / ticks
  const power = 10 ** Math.floor(Math.log10(raw))
  const factor = raw / power
  const step = (factor <= 1 ? 1 : factor <= 2 ? 2 : factor <= 5 ? 5 : 10) * power
  return { max: Math.ceil(max / step - 1e-9) * step, step }
}

/** Nodes spread round a circle, with one labelled link per edge. */
export function circleNetwork(names: readonly string[], edges: readonly Edge[], chosen: readonly Edge[] = []): NetworkDiagram {
  const cx = DIAGRAM_WIDTH / 2
  const cy = DIAGRAM_HEIGHT / 2
  const radius = 86
  const picked = new Set(chosen.map((edge) => `${edge.a}-${edge.b}`))
  return {
    kind: 'network',
    description: `Network with nodes ${names.join(', ')}. Links and their values: ${edges
      .map((edge) => `${names[edge.a]} to ${names[edge.b]} ${edge.weight}`)
      .join(', ')}.${chosen.length > 0 ? ' The chosen links are highlighted.' : ''}`,
    nodes: names.map((id, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / names.length
      return { id, x: cx + radius * 1.45 * Math.cos(angle), y: cy + radius * Math.sin(angle) }
    }),
    edges: edges.map((edge) => ({
      from: names[edge.a],
      to: names[edge.b],
      label: String(edge.weight),
      highlight: picked.has(`${edge.a}-${edge.b}`),
    })),
  }
}

/** Nodes in columns, left to right, for staged journeys. */
export function layeredDiagram(network: LayeredNetwork, path: readonly string[] = []): NetworkDiagram {
  const columns = network.layers.length
  const nodes = network.layers.flatMap((layer, column) =>
    layer.map((id, row) => ({
      id,
      x: 36 + (column * (DIAGRAM_WIDTH - 72)) / Math.max(1, columns - 1),
      y: ((row + 1) * DIAGRAM_HEIGHT) / (layer.length + 1),
    })),
  )
  const onPath = new Set(path.slice(1).map((id, index) => `${path[index]}>${id}`))
  return {
    kind: 'network',
    description: `Staged network from ${network.layers[0][0]} to ${network.layers[columns - 1][0]}. Legs and their costs: ${Object.entries(network.cost)
      .map(([key, value]) => `${key.replace('>', ' to ')} ${value}`)
      .join(', ')}.${path.length > 0 ? ` The best route is highlighted: ${path.join(' to ')}.` : ''}`,
    nodes,
    edges: Object.entries(network.cost).map(([key, value]) => {
      const [from, to] = key.split('>')
      return { from, to, label: String(value), highlight: onPath.has(key) }
    }),
  }
}

export function graphDiagram(input: Omit<GraphDiagram, 'kind'>): GraphDiagram {
  return { kind: 'graph', ...input }
}

/** Evenly spaced samples of a curve, for drawing smooth lines. */
export function sampleCurve(f: (x: number) => number, from: number, to: number, count = 40): [number, number][] {
  return Array.from({ length: count + 1 }, (_, i) => {
    const x = from + ((to - from) * i) / count
    return [Number(x.toFixed(4)), Number(f(x).toFixed(4))]
  })
}
