'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  Search as SearchIcon,
  AccountTree as GraphIcon,
  ViewList as EntitiesIcon,
  Link as RelationsIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import InteractiveGraph from './InteractiveGraph'
import NodeDetailsDrawer from './NodeDetailsDrawer'
import KGEntitiesTable from './KGEntitiesTable'
import KGEdgesTable from './KGEdgesTable'
import type { GraphData, Entity, Edge, ForceGraphData } from '@/lib/graphTransform'
import { buildGraph, searchNodes, filterGraphByType, ENTITY_TYPE_CONFIG } from '@/lib/graphTransform'

interface KnowledgeGraphVizProps {
  entities: Entity[]
  edges: Edge[]
  orgId: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kg-tabpanel-${index}`}
      aria-labelledby={`kg-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function KnowledgeGraphViz({
  entities,
  edges,
  orgId,
}: KnowledgeGraphVizProps) {
  const [currentTab, setCurrentTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Build graph data
  const graphData: GraphData = useMemo(
    () => ({
      entities,
      edges,
    }),
    [entities, edges]
  )

  // Build full graph for search and filtering
  const fullGraph = useMemo(() => {
    if (entities.length === 0) return null
    return buildGraph(graphData)
  }, [graphData, entities.length])

  // Get available entity types
  const availableTypes = useMemo(() => {
    const types = new Set<string>()
    entities.forEach(entity => types.add(entity.type))
    return Array.from(types).sort()
  }, [entities])

  // Filter entities based on search and type filters
  const filteredEntities = useMemo(() => {
    let filtered = entities

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(entity =>
        selectedTypes.includes(entity.type)
      )
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entity =>
        entity.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [entities, selectedTypes, searchQuery])

  // Filter edges based on filtered entities
  const filteredEdges = useMemo(() => {
    if (selectedTypes.length === 0 && !searchQuery.trim()) {
      return edges
    }

    const filteredEntityNames = new Set(
      filteredEntities.map(e => e.name.toLowerCase())
    )

    return edges.filter(
      edge =>
        filteredEntityNames.has(edge.source.name.toLowerCase()) &&
        filteredEntityNames.has(edge.target.name.toLowerCase())
    )
  }, [edges, filteredEntities, selectedTypes, searchQuery])

  // Get highlighted nodes from search
  const highlightedNodes = useMemo(() => {
    if (!searchQuery.trim() || !fullGraph) return []
    return searchNodes(fullGraph, searchQuery)
  }, [searchQuery, fullGraph])

  // Build filtered graph data (memoized to prevent recreating on every render)
  const filteredGraphData = useMemo(() => {
    return buildGraph({
      entities: filteredEntities,
      edges: filteredEdges,
    })
  }, [filteredEntities, filteredEdges])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedNodeId(nodeId)
    setDrawerOpen(true)
  }

  const handleNodeHover = (nodeId: string | null, nodeData: any) => {
    setHoveredNode(nodeId)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedNodeId(null)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedTypes([])
  }

  const hasActiveFilters = searchQuery.trim() !== '' || selectedTypes.length > 0

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search entities by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />

          {/* Type Filters */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <FilterIcon fontSize="small" />
              <Typography variant="body2" fontWeight="600">
                Filter by Type:
              </Typography>
              {hasActiveFilters && (
                <Chip
                  label="Clear All"
                  size="small"
                  onClick={handleClearFilters}
                  onDelete={handleClearFilters}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableTypes.map(type => {
                const config = ENTITY_TYPE_CONFIG[type.toLowerCase() as keyof typeof ENTITY_TYPE_CONFIG]
                const isSelected = selectedTypes.includes(type)

                return (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => handleTypeToggle(type)}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      textTransform: 'capitalize',
                      bgcolor: isSelected ? config?.color : undefined,
                      color: isSelected ? 'white' : undefined,
                      borderColor: config?.color,
                      '&:hover': {
                        bgcolor: isSelected ? config?.color : undefined,
                        opacity: 0.8,
                      },
                    }}
                  />
                )
              })}
            </Stack>
          </Box>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Showing {filteredEntities.length} of {entities.length} entities
                {filteredEdges.length !== edges.length && ` • ${filteredEdges.length} of ${edges.length} relationships`}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            icon={<GraphIcon />}
            label="Graph View"
            iconPosition="start"
          />
          <Tab
            icon={<EntitiesIcon />}
            label={`Entities (${filteredEntities.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<RelationsIcon />}
            label={`Relationships (${filteredEdges.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <InteractiveGraph
          data={filteredGraphData}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          highlightedNodes={highlightedNodes}
          height={700}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <KGEntitiesTable entities={filteredEntities} orgId={orgId} />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <KGEdgesTable edges={filteredEdges} />
      </TabPanel>

      {/* Node Details Drawer */}
      <NodeDetailsDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        nodeId={selectedNodeId}
        graph={fullGraph}
      />
    </Box>
  )
}
