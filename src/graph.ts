import type { GitCommit } from './types.js'

export interface GraphRow {
  lane: number
  color: number
  incoming: boolean
  through: { from: number; to: number; color: number }[]
  parents: { to: number; color: number }[]
}

/** Carry live parent lanes through topological rows, joining existing lanes at merges. */
export function layoutGraph(commits: GitCommit[]): { rows: GraphRow[]; lanes: number } {
  let live: string[] = [], maximum = 1, nextColor = 0
  const colors = new Map<string, number>()
  const color = (hash: string) => {
    if (!colors.has(hash)) colors.set(hash, nextColor++ % 6)
    return colors.get(hash)!
  }
  const rows = commits.map(commit => {
    const before = [...live], incoming = live.includes(commit.hash)
    if (!incoming) live.push(commit.hash)
    const lane = live.indexOf(commit.hash), ownColor = color(commit.hash)
    const next = live.filter(hash => hash !== commit.hash)
    let insertAt = lane
    for (const [index, parent] of commit.parents.entries()) {
      if (!colors.has(parent)) colors.set(parent, index === 0 ? ownColor : nextColor++ % 6)
      if (!next.includes(parent)) next.splice(insertAt++, 0, parent)
    }
    const row: GraphRow = {
      lane, color: ownColor, incoming,
      through: before.filter(hash => hash !== commit.hash).map(hash => ({ from: before.indexOf(hash), to: next.indexOf(hash), color: color(hash) })),
      parents: commit.parents.map(parent => ({ to: next.indexOf(parent), color: color(parent) })),
    }
    maximum = Math.max(maximum, live.length, next.length)
    live = next
    return row
  })
  return { rows, lanes: maximum }
}
