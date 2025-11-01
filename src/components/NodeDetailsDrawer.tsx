'use client'

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material'
import {
  Close as CloseIcon,
  Group,
  Work,
  Topic,
  Build,
  BugReport,
  Description,
  CalendarToday,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material'
import { ENTITY_TYPE_CONFIG } from '@/lib/graphTransform'
import type { ForceGraphData } from '@/lib/graphTransform'

interface NodeDetailsDrawerProps {
  open: boolean
  onClose: () => void
  nodeId: string | null
  graph: ForceGraphData | null
}

const entityIcons: Record<string, any> = {
  person: Group,
  project: Work,
  topic: Topic,
  tool: Build,
  issue: BugReport,
  document: Description,
  team: Group,
  channel: Group,
  insight: Topic,
}

function getEntityIcon(type: string) {
  const normalizedType = type.toLowerCase()
  return entityIcons[normalizedType] || Description
}

function getEntityColor(type: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
  const normalizedType = type.toLowerCase()
  const colorMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    person: 'success',
    project: 'warning',
    topic: 'info',
    tool: 'default',
    issue: 'error',
    document: 'default',
    team: 'info',
    channel: 'info',
    insight: 'warning',
  }
  return colorMap[normalizedType] || 'default'
}

export default function NodeDetailsDrawer({
  open,
  onClose,
  nodeId,
  graph,
}: NodeDetailsDrawerProps) {
  // Find node in graph data
  const node = graph?.nodes.find(n => n.id === nodeId)

  if (!open || !nodeId || !graph || !node) {
    return (
      <Drawer
        anchor="right"
        open={false}
        onClose={onClose}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      />
    )
  }

  // Get node attributes
  const nodeData = node
  const EntityIcon = getEntityIcon(nodeData.entityType)
  const entityColor = getEntityColor(nodeData.entityType)

  // Get incoming and outgoing edges
  const outgoingEdges: Array<{ targetId: string; targetName: string; relation: string; confidence: number }> = []
  const incomingEdges: Array<{ sourceId: string; sourceName: string; relation: string; confidence: number }> = []

  // Find outgoing edges (where this node is the source)
  graph.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
    const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target

    if (sourceId === nodeId) {
      const targetNode = graph.nodes.find(n => n.id === targetId)
      if (targetNode) {
        outgoingEdges.push({
          targetId: targetNode.id,
          targetName: targetNode.name,
          relation: link.relation,
          confidence: link.confidence,
        })
      }
    }
  })

  // Find incoming edges (where this node is the target)
  graph.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
    const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target

    if (targetId === nodeId) {
      const sourceNode = graph.nodes.find(n => n.id === sourceId)
      if (sourceNode) {
        incomingEdges.push({
          sourceId: sourceNode.id,
          sourceName: sourceNode.name,
          relation: link.relation,
          confidence: link.confidence,
        })
      }
    }
  })

  // Calculate total connections
  const totalConnections = outgoingEdges.length + incomingEdges.length

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          p: 3,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EntityIcon sx={{ fontSize: 28, color: (ENTITY_TYPE_CONFIG as any)[nodeData.entityType.toLowerCase()]?.color || '#757575' }} />
            <Typography variant="h6" component="h2" fontWeight="bold">
              {nodeData.name || 'Unknown Entity'}
            </Typography>
          </Box>
          <Chip
            label={nodeData.entityType}
            color={entityColor}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Stats */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
        <Stack direction="row" spacing={3} justifyContent="space-around">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              {totalConnections}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Connections
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {outgoingEdges.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Outgoing
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              {incomingEdges.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Incoming
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Metadata */}
      {nodeData.created_at && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 14 }} />
            Created: {new Date(nodeData.created_at).toLocaleDateString()}
          </Typography>
        </Box>
      )}

      {nodeData.metadata && Object.keys(nodeData.metadata).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Metadata
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
              {JSON.stringify(nodeData.metadata, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}

      {/* Outgoing Relationships */}
      {outgoingEdges.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ArrowForward sx={{ fontSize: 16 }} />
            Outgoing Relationships ({outgoingEdges.length})
          </Typography>
          <List dense>
            {outgoingEdges.map((edge, index) => (
              <ListItem
                key={`out-${index}`}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="500">
                      {edge.targetName}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={edge.relation}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip
                        label={`${Math.round(edge.confidence * 100)}%`}
                        size="small"
                        color={edge.confidence >= 0.8 ? 'success' : edge.confidence >= 0.5 ? 'warning' : 'default'}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Incoming Relationships */}
      {incomingEdges.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ArrowBack sx={{ fontSize: 16 }} />
            Incoming Relationships ({incomingEdges.length})
          </Typography>
          <List dense>
            {incomingEdges.map((edge, index) => (
              <ListItem
                key={`in-${index}`}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="500">
                      {edge.sourceName}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={edge.relation}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip
                        label={`${Math.round(edge.confidence * 100)}%`}
                        size="small"
                        color={edge.confidence >= 0.8 ? 'success' : edge.confidence >= 0.5 ? 'warning' : 'default'}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* No relationships */}
      {totalConnections === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
          <Typography variant="body2" color="text.secondary">
            This entity has no relationships yet.
          </Typography>
        </Paper>
      )}
    </Drawer>
  )
}
