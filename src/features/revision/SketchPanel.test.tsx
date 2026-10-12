import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DiagramView } from './DiagramView'
import { ProblemPanel } from './ProblemPanel'
import { generateSketch } from './problems/appliedMathsSketches'
import { SketchPanel } from './SketchPanel'

const topicId = 'am-kinematics-1d'

describe('SketchPanel', () => {
  it('hides the reference until asked, then lets the learner tick features', async () => {
    const user = userEvent.setup()
    const task = generateSketch(topicId, 'seed:0')
    if (!task) throw new Error('missing')
    render(<SketchPanel topicId={topicId} seed="seed" />)
    expect(screen.getByText(task.prompt)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show reference graph' }))
    expect(screen.getByRole('img')).toHaveAccessibleName(task.reference.description)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(task.checklist.length)
    await user.click(boxes[0])
    await user.click(boxes[1])
    expect(screen.getByRole('status')).toHaveTextContent(`2 of ${task.checklist.length} features match.`)
    for (const box of boxes.slice(2)) await user.click(box)
    expect(screen.getByRole('status')).toHaveTextContent('Well done.')
  })

  it('shows a different task and clears the ticks on New sketch task', async () => {
    const user = userEvent.setup()
    const first = generateSketch(topicId, 'seed:0')
    render(<SketchPanel topicId={topicId} seed="seed" />)
    await user.click(screen.getByRole('button', { name: 'Show reference graph' }))
    await user.click(screen.getAllByRole('checkbox')[0])
    await user.click(screen.getByRole('button', { name: 'New sketch task' }))
    expect(screen.queryByText(first?.prompt ?? '')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('copies a prompt that asks for a photo comparison', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    render(<SketchPanel topicId={topicId} seed="seed" />)
    await user.click(screen.getByRole('button', { name: 'Show reference graph' }))
    await user.click(screen.getByRole('button', { name: /Copy prompt for an AI check of my sketch/ }))
    expect(writeText.mock.calls[0][0]).toContain('A correct sketch shows:')
    expect(writeText.mock.calls[0][0]).toContain('attach a photo')
  })

  it('renders nothing for a topic without sketches', () => {
    const { container } = render(<SketchPanel topicId="am-dijkstra" seed="x" />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('diagrams in the problem panel', () => {
  it('shows the network picture with a text alternative, and the highlighted solution', async () => {
    const user = userEvent.setup()
    render(<ProblemPanel topicId="am-spanning-trees" seed="seed" />)
    const picture = screen.getByRole('img')
    expect(picture).toHaveAccessibleName(/^Network with nodes A, B, C, D, E, F\./)
    expect(within(picture as unknown as HTMLElement).getAllByText('A').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Show worked solution' }))
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('draws a graph with axis labels', () => {
    const task = generateSketch(topicId, 'x')
    if (!task) throw new Error('missing')
    const { container } = render(<DiagramView diagram={task.reference} />)
    expect(container.querySelector('polyline')).not.toBeNull()
    expect(screen.getByText('time (s)')).toBeInTheDocument()
    expect(screen.getByText('velocity (m/s)')).toBeInTheDocument()
  })
})
