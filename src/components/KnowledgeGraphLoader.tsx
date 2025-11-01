'use client'

import { useState, useEffect } from 'react'
import { Box, LinearProgress, Typography, Alert } from '@mui/material'
import KnowledgeGraphViz from './KnowledgeGraphViz'
import type { Entity, Edge } from '@/lib/graphTransform'

interface KnowledgeGraphLoaderProps {
  initialEntities: Entity[]
  initialEdges: Edge[]
  orgId: string
  totalEntities: number
  totalEdges: number
  apiUrl: string
}

export default function KnowledgeGraphLoader({
  initialEntities,
  initialEdges,
  orgId,
  totalEntities,
  totalEdges,
  apiUrl,
}: KnowledgeGraphLoaderProps) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('API URL:', apiUrl)

        // Load all entities if we don't have them all yet
        const allEntities = [...initialEntities]
        if (allEntities.length < totalEntities) {
          let offset = initialEntities.length
          while (offset < totalEntities) {
            const url = `${apiUrl}/api/v1/kg/entities/${orgId}?limit=100&offset=${offset}`
            console.log('Fetching entities:', url)

            const response = await fetch(url)
            if (!response.ok) {
              const errorText = await response.text()
              console.error('Failed to fetch entities:', response.status, errorText)
              throw new Error(`Failed to fetch entities: ${response.status}`)
            }

            const data = await response.json()
            console.log('Received entities:', data.entities?.length, 'at offset', offset)

            if (data.entities && data.entities.length > 0) {
              allEntities.push(...data.entities)
              offset += data.entities.length
              setEntities([...allEntities])
              setLoadingProgress((allEntities.length / totalEntities) * 50) // First 50% for entities
            } else {
              break
            }
          }
        }

        // Load all edges if we don't have them all yet
        const allEdges = [...initialEdges]
        if (allEdges.length < totalEdges) {
          let offset = initialEdges.length
          while (offset < totalEdges) {
            const url = `${apiUrl}/api/v1/kg/edges/${orgId}?limit=100&offset=${offset}`
            console.log('Fetching edges:', url)

            const response = await fetch(url)
            if (!response.ok) {
              const errorText = await response.text()
              console.error('Failed to fetch edges:', response.status, errorText)
              throw new Error(`Failed to fetch edges: ${response.status}`)
            }

            const data = await response.json()
            console.log('Received edges:', data.edges?.length, 'at offset', offset)

            if (data.edges && data.edges.length > 0) {
              allEdges.push(...data.edges)
              offset += data.edges.length
              setEdges([...allEdges])
              setLoadingProgress(50 + (allEdges.length / totalEdges) * 50) // Second 50% for edges
            } else {
              break
            }
          }
        }

        setLoadingProgress(100)
        console.log('Loading complete:', allEntities.length, 'entities,', allEdges.length, 'edges')
      } catch (err) {
        console.error('Error loading graph data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    // Only load if we have incomplete data
    if (initialEntities.length < totalEntities || initialEdges.length < totalEdges) {
      loadAllData()
    }
  }, [orgId, totalEntities, totalEdges, apiUrl, initialEntities.length, initialEdges.length])

  return (
    <Box>
      {loading && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={loadingProgress}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {Math.round(loadingProgress)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Loading complete knowledge graph data... ({entities.length}/{totalEntities} entities, {edges.length}/{totalEdges} relationships)
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}. Showing {entities.length} of {totalEntities} entities and {edges.length} of {totalEdges} relationships.
        </Alert>
      )}

      <KnowledgeGraphViz
        entities={entities}
        edges={edges}
        orgId={orgId}
      />
    </Box>
  )
}
