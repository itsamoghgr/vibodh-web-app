'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Alert } from '@mui/material';
import {
  TrendingUp as TrendIcon,
  BarChart as MetricIcon,
  Warning as AnomalyIcon,
  AutoAwesome as PredictionIcon,
  Description as SummaryIcon,
} from '@mui/icons-material';
import { Insight } from '@/types/chat';

interface InsightCardProps {
  insight: Insight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'trend':
        return <TrendIcon />;
      case 'metric':
        return <MetricIcon />;
      case 'anomaly':
        return <AnomalyIcon />;
      case 'prediction':
        return <PredictionIcon />;
      case 'summary':
        return <SummaryIcon />;
      default:
        return <MetricIcon />;
    }
  };

  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box sx={{ color: 'primary.main' }}>{getInsightIcon()}</Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {insight.title}
            </Typography>
          </Box>
          <Chip label={insight.priority} color={getPriorityColor()} size="small" />
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {insight.description}
        </Typography>

        {/* Data visualization placeholder */}
        {insight.data && insight.visualization && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              {insight.visualization === 'chart' && 'Chart visualization would appear here'}
              {insight.visualization === 'table' && 'Table would appear here'}
              {insight.visualization === 'card' && 'Metric card would appear here'}
            </Typography>
          </Box>
        )}

        {/* Suggested actions */}
        {insight.actionable && insight.suggestedActions && insight.suggestedActions.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Suggested Actions:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {insight.suggestedActions.map((action, index) => (
                <Typography key={index} variant="caption" component="li">
                  {action}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
