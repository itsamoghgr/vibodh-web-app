'use client'

import { Grid, Paper, Box, Typography } from '@mui/material'
import {
  AccountTree,
  Group,
  Work,
  Topic,
  Build,
  BugReport,
} from '@mui/icons-material'

interface KGStats {
  total_entities: number
  total_edges: number
  people_count: number
  projects_count: number
  topics_count: number
  tools_count: number
  issues_count: number
}

interface KGStatsCardsProps {
  stats: KGStats
}

export default function KGStatsCards({ stats }: KGStatsCardsProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountTree sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4">{stats.total_entities || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Entities
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Group sx={{ fontSize: 40, color: 'success.main' }} />
            <Box>
              <Typography variant="h4">{stats.people_count || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                People
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Work sx={{ fontSize: 40, color: 'warning.main' }} />
            <Box>
              <Typography variant="h4">{stats.projects_count || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Topic sx={{ fontSize: 40, color: 'info.main' }} />
            <Box>
              <Typography variant="h4">{stats.total_edges || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Relationships
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
}
