export interface Edge {
  a: number
  b: number
  weight: number
}

/** Kruskal's algorithm on an undirected network with nodes 0 to n-1. */
export function minimumSpanningTree(n: number, edges: readonly Edge[]): { total: number; chosen: Edge[] } {
  const parent = Array.from({ length: n }, (_, index) => index)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const chosen: Edge[] = []
  for (const edge of [...edges].sort((x, y) => x.weight - y.weight || x.a - y.a || x.b - y.b)) {
    const rootA = find(edge.a)
    const rootB = find(edge.b)
    if (rootA !== rootB) {
      parent[rootA] = rootB
      chosen.push(edge)
    }
  }
  return { total: chosen.reduce((sum, edge) => sum + edge.weight, 0), chosen }
}

/** Dijkstra's algorithm on an undirected network; unreachable nodes get Infinity. */
export function shortestDistances(n: number, edges: readonly Edge[], source: number): number[] {
  const dist = Array.from({ length: n }, () => Infinity)
  const done = Array.from({ length: n }, () => false)
  dist[source] = 0
  for (let step = 0; step < n; step += 1) {
    let current = -1
    for (let node = 0; node < n; node += 1) {
      if (!done[node] && (current === -1 || dist[node] < dist[current])) current = node
    }
    if (current === -1 || dist[current] === Infinity) break
    done[current] = true
    for (const edge of edges) {
      const other = edge.a === current ? edge.b : edge.b === current ? edge.a : -1
      if (other !== -1 && dist[current] + edge.weight < dist[other]) dist[other] = dist[current] + edge.weight
    }
  }
  return dist
}

export function isConnected(n: number, edges: readonly Edge[]): boolean {
  return shortestDistances(n, edges, 0).every((value) => Number.isFinite(value))
}

export interface LayeredNetwork {
  layers: string[][]
  /** Cost of the edge "from>to". */
  cost: Record<string, number>
}

/** Cheapest total cost from the first to the last layer, found backwards (Bellman's principle). */
export function optimalCost(network: LayeredNetwork): { total: number; costToGo: Record<string, number>; path: string[] } {
  const costToGo: Record<string, number> = {}
  const next: Record<string, string> = {}
  const last = network.layers[network.layers.length - 1]
  for (const node of last) costToGo[node] = 0
  for (let layer = network.layers.length - 2; layer >= 0; layer -= 1) {
    for (const from of network.layers[layer]) {
      let best = Infinity
      for (const to of network.layers[layer + 1]) {
        const value = network.cost[`${from}>${to}`] + costToGo[to]
        if (value < best) {
          best = value
          next[from] = to
        }
      }
      costToGo[from] = best
    }
  }
  const path = [network.layers[0][0]]
  while (next[path[path.length - 1]] !== undefined) path.push(next[path[path.length - 1]])
  return { total: costToGo[network.layers[0][0]], costToGo, path }
}

/** Total cost when the cheapest next edge is taken at every stage. */
export function greedyCost(network: LayeredNetwork): number {
  let current = network.layers[0][0]
  let total = 0
  for (let layer = 1; layer < network.layers.length; layer += 1) {
    let best = Infinity
    let chosen = ''
    for (const to of network.layers[layer]) {
      const value = network.cost[`${current}>${to}`]
      if (value < best) {
        best = value
        chosen = to
      }
    }
    total += best
    current = chosen
  }
  return total
}

export interface Activity {
  name: string
  duration: number
  after: string[]
}

export interface Schedule {
  duration: number
  earliestStart: Record<string, number>
  latestStart: Record<string, number>
  float: Record<string, number>
}

/** Critical path analysis. Activities must be listed so that predecessors come first. */
export function criticalPath(activities: readonly Activity[]): Schedule {
  const earliestStart: Record<string, number> = {}
  const earliestFinish: Record<string, number> = {}
  for (const activity of activities) {
    earliestStart[activity.name] = Math.max(0, ...activity.after.map((name) => earliestFinish[name]))
    earliestFinish[activity.name] = earliestStart[activity.name] + activity.duration
  }
  const duration = Math.max(...Object.values(earliestFinish))
  const latestFinish: Record<string, number> = {}
  const latestStart: Record<string, number> = {}
  for (const activity of [...activities].reverse()) {
    const followers = activities.filter((other) => other.after.includes(activity.name))
    latestFinish[activity.name] = followers.length > 0 ? Math.min(...followers.map((other) => latestStart[other.name])) : duration
    latestStart[activity.name] = latestFinish[activity.name] - activity.duration
  }
  const float: Record<string, number> = {}
  for (const activity of activities) float[activity.name] = latestStart[activity.name] - earliestStart[activity.name]
  return { duration, earliestStart, latestStart, float }
}
