'use client'

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Stack,
} from '@mui/material'
import {
  Work,
  Group,
  TrendingUp,
  Warning,
  Info,
} from '@mui/icons-material'

interface Insight {
  id: string
  category: string
  title: string
  summary: string
  recommendations: string
  confidence: number
  created_at: string
}

interface InsightCardsProps {
  insights: Insight[]
}

const categoryConfig: Record<string, { icon: any; color: 'success' | 'info' | 'warning' | 'error' | 'default'; label: string }> = {
  project: {
    icon: Work,
    color: 'success',
    label: 'Project'
  },
  team: {
    icon: Group,
    color: 'info',
    label: 'Team'
  },
  trend: {
    icon: TrendingUp,
    color: 'warning',
    label: 'Trend'
  },
  risk: {
    icon: Warning,
    color: 'error',
    label: 'Risk'
  },
  general: {
    icon: Info,
    color: 'default',
    label: 'General'
  }
}

export default function InsightCards({ insights }: InsightCardsProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No insights generated yet. Click "Generate Insights" to analyze recent activity.
        </Typography>
      </Card>
    )
  }

  return (
    <Stack spacing={3}>
      {insights.map((insight) => {
        const config = categoryConfig[insight.category] || categoryConfig.general
        const Icon = config.icon
        const confidencePercent = Math.round((insight.confidence || 0) * 100)

        return (
          <Card key={insight.id} sx={{ position: 'relative', overflow: 'visible' }}>
            <CardContent>
              {/* Category Chip */}
              <Box sx={{ mb: 2 }}>
                <Chip
                  icon={<Icon />}
                  label={config.label}
                  color={config.color}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>

              {/* Title */}
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {insight.title}
              </Typography>

              {/* Summary */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {insight.summary}
              </Typography>

              {/* Recommendations */}
              {insight.recommendations && (
                <Box
                  sx={{
                    bgcolor: 'action.hover',
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      mb: 0.5,
                      display: 'block',
                    }}
                  >
                    Recommendations
                  </Typography>
                  <Typography variant="body2">{insight.recommendations}</Typography>
                </Box>
              )}

              {/* Confidence Bar */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Confidence
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {confidencePercent}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={confidencePercent}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      bgcolor:
                        confidencePercent >= 80
                          ? 'success.main'
                          : confidencePercent >= 60
                          ? 'warning.main'
                          : 'error.main',
                    },
                  }}
                />
              </Box>

              {/* Created Date */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5 }}
              >
                {new Date(insight.created_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        )
      })}
    </Stack>
  )
}
