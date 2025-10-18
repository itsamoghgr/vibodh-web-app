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
  Box,
} from '@mui/material'
import { ArrowForward } from '@mui/icons-material'

interface Edge {
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
  created_at: string
}

interface KGEdgesTableProps {
  edges: Edge[]
}

export default function KGEdgesTable({ edges }: KGEdgesTableProps) {
  if (!edges || edges.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No relationships found yet. Relationships will be extracted automatically as you sync documents.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell>Relationship</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Confidence</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {edges.map((edge) => (
            <TableRow key={edge.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {edge.source?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {edge.source?.type}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={edge.relation}
                  size="small"
                  icon={<ArrowForward />}
                  sx={{ textTransform: 'lowercase' }}
                />
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {edge.target?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {edge.target?.type}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={`${Math.round((edge.confidence || 0) * 100)}%`}
                  size="small"
                  color={edge.confidence >= 0.8 ? 'success' : edge.confidence >= 0.5 ? 'warning' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(edge.created_at).toLocaleDateString()}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
