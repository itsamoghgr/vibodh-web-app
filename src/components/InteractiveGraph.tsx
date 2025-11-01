'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { Box, Paper, CircularProgress, Typography, useTheme } from '@mui/material'
import dynamic from 'next/dynamic'
import type { ForceGraphData, GraphNode } from '@/lib/graphTransform'
import { getNodeNeighbors } from '@/lib/graphTransform'

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  ),
})

interface InteractiveGraphProps {
  data: ForceGraphData
  onNodeClick?: (nodeId: string, nodeData: GraphNode) => void
  onNodeHover?: (nodeId: string | null, nodeData: GraphNode | null) => void
  highlightedNodes?: string[]
  width?: string | number
  height?: string | number
}

export default function InteractiveGraph({
  data,
  onNodeClick,
  onNodeHover,
  highlightedNodes = [],
  width = '100%',
  height = 600,
}: InteractiveGraphProps) {
  const theme = useTheme()
  const fgRef = useRef<any>(null)

  // Use refs to avoid re-renders when highlighting changes
  const highlightNodesRef = useRef(new Set<string>())
  const highlightLinksRef = useRef(new Set())
  const dataRef = useRef(data)
  const hoveredNodeRef = useRef<string | null>(null)
  const highlightedNodesRef = useRef(highlightedNodes)
  const onNodeHoverRef = useRef(onNodeHover)

  // Update refs when props change
  useEffect(() => {
    dataRef.current = data
    highlightedNodesRef.current = highlightedNodes
    onNodeHoverRef.current = onNodeHover
  }, [data, highlightedNodes, onNodeHover])

  // Handle hover highlighting without causing re-renders
  const handleNodeHoverInternal = useCallback((node: any) => {
    const nodeId = node?.id || null
    hoveredNodeRef.current = nodeId

    const nodesToHighlight = new Set<string>()
    const linksToHighlight = new Set()

    // Add explicitly highlighted nodes
    highlightedNodesRef.current.forEach(id => nodesToHighlight.add(id))

    // Add hovered node and its neighbors
    if (nodeId) {
      nodesToHighlight.add(nodeId)
      const neighbors = getNodeNeighbors(dataRef.current, nodeId)
      neighbors.forEach(neighbor => nodesToHighlight.add(neighbor))

      // Highlight connected links
      dataRef.current.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target

        if (sourceId === nodeId || targetId === nodeId) {
          linksToHighlight.add(link as any)
        }
      })
    }

    highlightNodesRef.current = nodesToHighlight
    highlightLinksRef.current = linksToHighlight

    if (onNodeHoverRef.current) {
      onNodeHoverRef.current(nodeId, node as GraphNode || null)
    }
  }, [])

  // Handle node click
  const handleNodeClick = useCallback(
    (node: any) => {
      if (onNodeClick) {
        onNodeClick(node.id, node as GraphNode)
      }
    },
    [onNodeClick]
  )

  // Node canvas object rendering
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.name
      const fontSize = 12 / globalScale
      const nodeSize = Math.sqrt(node.val || 10) * 2

      // Determine if node should be highlighted
      const isHighlighted = highlightNodesRef.current.size === 0 || highlightNodesRef.current.has(node.id)
      const opacity = isHighlighted ? 1 : 0.3

      // Draw node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false)
      ctx.fillStyle = node.color
      ctx.globalAlpha = opacity
      ctx.fill()
      ctx.globalAlpha = 1

      // Draw label
      if (isHighlighted) {
        ctx.font = `${fontSize}px Sans-Serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = theme.palette.text.primary
        ctx.fillText(label, node.x, node.y + nodeSize + fontSize)
      }
    },
    [theme.palette.text.primary]
  )

  // Link canvas object rendering
  const paintLink = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHighlighted = highlightLinksRef.current.size === 0 || highlightLinksRef.current.has(link)
      const opacity = isHighlighted ? 0.6 : 0.2

      ctx.globalAlpha = opacity
    },
    []
  )

  // Show empty state
  if (!data || data.nodes.length === 0) {
    return (
      <Paper
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No entities to display. Start syncing documents to build your knowledge graph.
        </Typography>
      </Paper>
    )
  }

  // Render the graph
  return (
    <Paper
      sx={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa',
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        backgroundColor={theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa'}
        // Node styling
        nodeLabel="name"
        nodeColor={node => (node as GraphNode).color}
        nodeVal={node => (node as GraphNode).val}
        nodeCanvasObject={paintNode}
        // Link styling
        linkLabel={link => (link as any).relation || ''}
        linkColor={link => (link as any).color || '#ccc'}
        linkWidth={link => (link as any).width || 1}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={paintLink}
        // Interactions
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHoverInternal}
        onBackgroundClick={() => handleNodeHoverInternal(null)}
        // Performance
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
          minWidth: 200,
          opacity: 0.95,
        }}
      >
        <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
          Controls
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Scroll to zoom
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Drag to pan
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Click node for details
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Hover to highlight connections
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Drag nodes to reposition
        </Typography>
      </Box>
    </Paper>
  )
}
