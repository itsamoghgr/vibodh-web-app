/**
 * Entity types and their visual properties for graph rendering
 */
export const ENTITY_TYPE_CONFIG = {
  person: {
    color: '#4caf50', // green
    size: 20,
    label: 'Person',
  },
  project: {
    color: '#ff9800', // orange
    size: 16,
    label: 'Project',
  },
  topic: {
    color: '#2196f3', // blue
    size: 16,
    label: 'Topic',
  },
  tool: {
    color: '#9e9e9e', // gray
    size: 12,
    label: 'Tool',
  },
  issue: {
    color: '#f44336', // red
    size: 14,
    label: 'Issue',
  },
  document: {
    color: '#9c27b0', // purple
    size: 12,
    label: 'Document',
  },
  team: {
    color: '#00bcd4', // cyan
    size: 16,
    label: 'Team',
  },
  channel: {
    color: '#00bcd4', // cyan
    size: 14,
    label: 'Channel',
  },
  insight: {
    color: '#ffc107', // amber
    size: 14,
    label: 'Insight',
  },
  // Ads domain entity types (Phase 6.5)
  ad_campaign: {
    color: '#3b82f6', // blue-500
    size: 18,
    label: 'Ad Campaign',
  },
  ad_platform: {
    color: '#8b5cf6', // purple-500
    size: 16,
    label: 'Ad Platform',
  },
  optimization_action: {
    color: '#10b981', // green-500
    size: 14,
    label: 'Optimization',
  },
} as const

/**
 * Entity interface matching the KG API response
 */
export interface Entity {
  id: string
  name: string
  type: string
  metadata?: any
  created_at?: string
}

/**
 * Edge interface matching the KG API response
 */
export interface Edge {
  id: string
  relation: string
  confidence: number
  source: {
    name: string
    type: string
  }
  target: {
    name: string
    type: string
  }
  created_at?: string
}

/**
 * Raw data structure from API
 */
export interface GraphData {
  entities: Entity[]
  edges: Edge[]
}

/**
 * Node for react-force-graph
 */
export interface GraphNode {
  id: string
  name: string
  val: number // size for force graph
  color: string
  entityType: string
  metadata?: any
  created_at?: string
}

/**
 * Link for react-force-graph
 */
export interface GraphLink {
  source: string
  target: string
  label: string
  color: string
  width: number
  confidence: number
  relation: string
  created_at?: string
}

/**
 * Force graph data structure
 */
export interface ForceGraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

/**
 * Get visual config for an entity type
 */
function getEntityConfig(type: string) {
  const normalizedType = type.toLowerCase()
  return ENTITY_TYPE_CONFIG[normalizedType as keyof typeof ENTITY_TYPE_CONFIG] || {
    color: '#757575',
    size: 12,
    label: type,
  }
}

/**
 * Get edge color based on confidence score
 */
function getEdgeColor(confidence: number): string {
  if (confidence >= 0.8) return '#4caf50' // green - high confidence
  if (confidence >= 0.5) return '#ff9800' // orange - medium confidence
  return '#9e9e9e' // gray - low confidence
}

/**
 * Get edge width based on confidence score
 */
function getEdgeWidth(confidence: number): number {
  if (confidence >= 0.8) return 3
  if (confidence >= 0.5) return 2
  return 1
}

/**
 * Build force graph data from KG data
 *
 * @param data - Raw entity and edge data from the API
 * @returns Force graph data structure with nodes and links
 */
export function buildGraph(data: GraphData): ForceGraphData {
  // Create a map for quick entity lookup by name
  const entityNameMap = new Map<string, Entity>()
  data.entities.forEach(entity => {
    entityNameMap.set(entity.name.toLowerCase(), entity)
  })

  // Build nodes array
  const nodes: GraphNode[] = data.entities.map(entity => {
    const config = getEntityConfig(entity.type)

    return {
      id: entity.id,
      name: entity.name,
      val: config.size, // Used for node size in force graph
      color: config.color,
      entityType: entity.type,
      metadata: entity.metadata,
      created_at: entity.created_at,
    }
  })

  // Build links array
  const links: GraphLink[] = []

  data.edges.forEach(edge => {
    // Find source and target entity IDs by name
    const sourceEntity = entityNameMap.get(edge.source.name.toLowerCase())
    const targetEntity = entityNameMap.get(edge.target.name.toLowerCase())

    if (!sourceEntity || !targetEntity) {
      console.warn(
        `Skipping edge ${edge.id}: Could not find entities for "${edge.source.name}" -> "${edge.target.name}"`
      )
      return
    }

    links.push({
      source: sourceEntity.id,
      target: targetEntity.id,
      label: edge.relation,
      color: getEdgeColor(edge.confidence),
      width: getEdgeWidth(edge.confidence),
      confidence: edge.confidence,
      relation: edge.relation,
      created_at: edge.created_at,
    })
  })

  return { nodes, links }
}

/**
 * Filter graph data by entity type
 *
 * @param graphData - The original graph data
 * @param types - Entity types to include
 * @returns New graph data with only specified entity types
 */
export function filterGraphByType(graphData: ForceGraphData, types: string[]): ForceGraphData {
  const normalizedTypes = types.map(t => t.toLowerCase())

  // Filter nodes by type
  const filteredNodes = graphData.nodes.filter(node =>
    normalizedTypes.includes(node.entityType.toLowerCase())
  )

  // Create a set of filtered node IDs for quick lookup
  const nodeIds = new Set(filteredNodes.map(node => node.id))

  // Filter links where both source and target are in filtered nodes
  const filteredLinks = graphData.links.filter(link => {
    const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
    const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target
    return nodeIds.has(sourceId) && nodeIds.has(targetId)
  })

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  }
}

/**
 * Search nodes by name
 *
 * @param graphData - The graph data to search
 * @param query - Search query string
 * @returns Array of matching node IDs
 */
export function searchNodes(graphData: ForceGraphData, query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) return []

  return graphData.nodes
    .filter(node => node.name.toLowerCase().includes(normalizedQuery))
    .map(node => node.id)
}

/**
 * Get neighbors of a node (connected via links)
 *
 * @param graphData - The graph data
 * @param nodeId - The node to find neighbors for
 * @returns Array of neighbor node IDs
 */
export function getNodeNeighbors(graphData: ForceGraphData, nodeId: string): string[] {
  const neighbors = new Set<string>()

  graphData.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
    const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target

    if (sourceId === nodeId) {
      neighbors.add(targetId)
    }
    if (targetId === nodeId) {
      neighbors.add(sourceId)
    }
  })

  return Array.from(neighbors)
}

/**
 * Get statistics about the graph
 */
export function getGraphStats(graphData: ForceGraphData) {
  const typeCount: Record<string, number> = {}

  graphData.nodes.forEach(node => {
    const type = node.entityType || 'unknown'
    typeCount[type] = (typeCount[type] || 0) + 1
  })

  return {
    nodeCount: graphData.nodes.length,
    edgeCount: graphData.links.length,
    typeCount,
    avgDegree: graphData.nodes.length > 0 ? (graphData.links.length * 2) / graphData.nodes.length : 0,
  }
}
