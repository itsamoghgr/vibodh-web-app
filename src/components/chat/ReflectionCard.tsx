'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';
import { Psychology as ReflectionIcon, TipsAndUpdates as ImprovementIcon } from '@mui/icons-material';
import { Reflection } from '@/types/chat';

interface ReflectionCardProps {
  reflection: Reflection;
}

export default function ReflectionCard({ reflection }: ReflectionCardProps) {
  const getConfidenceColor = () => {
    if (reflection.confidenceScore >= 0.8) return 'success';
    if (reflection.confidenceScore >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: 'background.default',
        borderLeft: 4,
        borderLeftColor: 'secondary.main',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReflectionIcon color="secondary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Agent Reflection
          </Typography>
        </Box>

        {/* Observation */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
            Observation
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {reflection.observation}
          </Typography>
        </Box>

        {/* Learning */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
            Learning
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {reflection.learning}
          </Typography>
        </Box>

        {/* Confidence */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Confidence
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {Math.round(reflection.confidenceScore * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={reflection.confidenceScore * 100}
            color={getConfidenceColor()}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Strategy adjustment indicator */}
        {reflection.shouldAdjustStrategy && (
          <Chip
            label="Strategy Adjustment Recommended"
            color="warning"
            size="small"
            sx={{ mb: 2 }}
          />
        )}

        {/* Suggested improvements */}
        {reflection.suggestedImprovements && reflection.suggestedImprovements.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <ImprovementIcon fontSize="small" color="primary" />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                Suggested Improvements
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {reflection.suggestedImprovements.map((improvement, index) => (
                <Typography key={index} variant="caption" component="li" color="text.secondary">
                  {improvement}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
