'use client'

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
} from '@mui/material'
import {
  Group,
  Work,
  Topic,
  Build,
  BugReport,
  Description,
} from '@mui/icons-material'

const entityIcons: Record<string, any> = {
  person: Group,
  project: Work,
  topic: Topic,
  tool: Build,
  issue: BugReport,
  document: Description,
}

const entityColors: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  person: 'success',
  project: 'warning',
  topic: 'info',
  tool: 'default',
  issue: 'error',
  document: 'default',
}

interface Entity {
  id: string
  name: string
  type: string
  metadata?: any
  created_at?: string
}

interface KGEntitiesTableProps {
  entities: Entity[]
  orgId: string
}

export default function KGEntitiesTable({ entities, orgId }: KGEntitiesTableProps) {
  if (!entities || entities.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No entities found. Entities will be extracted automatically as you sync documents.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map((entity) => {
            const EntityIcon = entityIcons[entity.type] || Description
            const color = entityColors[entity.type] || 'default'

            return (
              <TableRow key={entity.id} hover>
                <TableCell>
                  <Chip
                    icon={<EntityIcon />}
                    label={entity.type}
                    color={color}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {entity.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {entity.created_at ? new Date(entity.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
