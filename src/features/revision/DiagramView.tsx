import { DIAGRAM_HEIGHT, DIAGRAM_WIDTH } from './problems/diagrams'
import type { Diagram, GraphDiagram, NetworkDiagram } from './problems/types'

const MARGIN = { left: 52, right: 24, top: 18, bottom: 42 }

/** Puts each edge label where it is furthest from the nodes and from labels already placed. */
function placeLabels(diagram: NetworkDiagram): { x: number; y: number }[] {
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]))
  const taken: { x: number; y: number }[] = diagram.nodes.map((node) => ({ x: node.x, y: node.y }))
  return diagram.edges.map((edge) => {
    const from = byId.get(edge.from)
    const to = byId.get(edge.to)
    if (!from || !to) return { x: 0, y: 0 }
    let best = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
    let bestScore = -1
    for (let t = 0.2; t <= 0.8001; t += 0.05) {
      const point = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
      const score = Math.min(...taken.map((other) => Math.hypot(other.x - point.x, other.y - point.y)))
      if (score > bestScore) {
        bestScore = score
        best = point
      }
    }
    taken.push(best)
    return best
  })
}

function Network({ diagram }: { diagram: NetworkDiagram }) {
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]))
  const labels = placeLabels(diagram)
  return (
    <>
      {diagram.edges.map((edge, index) => {
        const from = byId.get(edge.from)
        const to = byId.get(edge.to)
        if (!from || !to) return null
        return (
          <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={edge.highlight ? 'diagram-edge diagram-edge-on' : 'diagram-edge'} />
        )
      })}
      {diagram.edges.map((edge, index) => (
        <text key={index} x={labels[index].x} y={labels[index].y} className="diagram-weight" textAnchor="middle" dominantBaseline="central">
          {edge.label}
        </text>
      ))}
      {diagram.nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={14} className="diagram-node" />
          <text x={node.x} y={node.y} className="diagram-node-label" textAnchor="middle" dominantBaseline="central">
            {node.id}
          </text>
        </g>
      ))}
    </>
  )
}

function Graph({ diagram }: { diagram: GraphDiagram }) {
  const width = DIAGRAM_WIDTH - MARGIN.left - MARGIN.right
  const height = DIAGRAM_HEIGHT - MARGIN.top - MARGIN.bottom
  const sx = (x: number) => MARGIN.left + (x / diagram.xMax) * width
  const sy = (y: number) => MARGIN.top + height - (y / diagram.yMax) * height
  const ticks = (max: number, step: number) => Array.from({ length: Math.floor(max / step + 1e-9) + 1 }, (_, i) => Number((i * step).toFixed(6)))
  return (
    <>
      {ticks(diagram.xMax, diagram.xStep).map((x) => (
        <g key={`x${x}`}>
          <line x1={sx(x)} y1={sy(0)} x2={sx(x)} y2={sy(diagram.yMax)} className="diagram-grid" />
          <text x={sx(x)} y={sy(0) + 14} textAnchor="middle" className="diagram-tick">
            {x}
          </text>
        </g>
      ))}
      {ticks(diagram.yMax, diagram.yStep).map((y) => (
        <g key={`y${y}`}>
          <line x1={sx(0)} y1={sy(y)} x2={sx(diagram.xMax)} y2={sy(y)} className="diagram-grid" />
          <text x={sx(0) - 6} y={sy(y)} textAnchor="end" dominantBaseline="central" className="diagram-tick">
            {y}
          </text>
        </g>
      ))}
      <line x1={sx(0)} y1={sy(0)} x2={sx(diagram.xMax)} y2={sy(0)} className="diagram-axis" />
      <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(diagram.yMax)} className="diagram-axis" />
      <text x={sx(diagram.xMax / 2)} y={DIAGRAM_HEIGHT - 6} textAnchor="middle" className="diagram-axis-label">
        {diagram.xLabel}
      </text>
      <text transform={`translate(12 ${sy(diagram.yMax / 2)}) rotate(-90)`} textAnchor="middle" className="diagram-axis-label">
        {diagram.yLabel}
      </text>
      {diagram.lines.map((line, index) => (
        <polyline key={index} points={line.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} className="diagram-line" />
      ))}
      {diagram.marks?.map((mark, index) => (
        <g key={index}>
          {mark.guides && (
            <>
              <line x1={sx(mark.x)} y1={sy(mark.y)} x2={sx(mark.x)} y2={sy(0)} className="diagram-guide" />
              <line x1={sx(mark.x)} y1={sy(mark.y)} x2={sx(0)} y2={sy(mark.y)} className="diagram-guide" />
            </>
          )}
          <circle cx={sx(mark.x)} cy={sy(mark.y)} r={3.5} className="diagram-mark" />
          <text
            x={sx(mark.x) + (mark.x > diagram.xMax * 0.8 ? 4 : mark.x < diagram.xMax * 0.1 ? -4 : 0)}
            y={sy(mark.y) - 8}
            textAnchor={mark.x > diagram.xMax * 0.8 ? 'end' : mark.x < diagram.xMax * 0.1 ? 'start' : 'middle'}
            className="diagram-mark-label"
          >
            {mark.label}
          </text>
        </g>
      ))}
    </>
  )
}

/** An SVG picture with a text alternative; the same data is also given in words. */
export function DiagramView({ diagram }: { diagram: Diagram }) {
  return (
    <svg
      className="diagram"
      viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
      role="img"
      aria-label={diagram.description}
      preserveAspectRatio="xMidYMid meet"
    >
      {diagram.kind === 'network' ? <Network diagram={diagram} /> : <Graph diagram={diagram} />}
    </svg>
  )
}
