'use client'

import { Paper, Box, Typography } from '@mui/material'
import {
  Lightbulb,
  Work,
  Group,
  TrendingUp,
  Warning,
  Assessment,
} from '@mui/icons-material'

interface InsightStats {
  total_insights: number
  project_insights: number
  team_insights: number
  trend_insights: number
  risk_insights: number
  general_insights: number
  avg_confidence: number
  last_generated: string | null
}

interface InsightStatsCardsProps {
  stats: InsightStats
}

export default function InsightStatsCards({ stats }: InsightStatsCardsProps) {
  const avgConfidencePercent = Math.round((stats.avg_confidence || 0) * 100)

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Lightbulb sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4">{stats.total_insights || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Insights
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Work sx={{ fontSize: 40, color: 'success.main' }} />
            <Box>
              <Typography variant="h4">{stats.project_insights || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Group sx={{ fontSize: 40, color: 'info.main' }} />
            <Box>
              <Typography variant="h4">{stats.team_insights || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Teams
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning sx={{ fontSize: 40, color: 'error.main' }} />
            <Box>
              <Typography variant="h4">{stats.risk_insights || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Risks
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />
            <Box>
              <Typography variant="h4">{stats.trend_insights || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Trends
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment sx={{ fontSize: 40, color: 'secondary.main' }} />
            <Box>
              <Typography variant="h4">{avgConfidencePercent}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Confidence
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
