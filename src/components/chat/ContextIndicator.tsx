'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Typography,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Info as InfoIcon,
  Description as DocumentIcon,
  Speed as SpeedIcon,
  Psychology as ConfidenceIcon,
} from '@mui/icons-material';
import { ContextIndicatorProps } from '@/types/chat';

export default function ContextIndicator({
  agentIntelligence,
  contextItems,
  onClick,
}: ContextIndicatorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (onClick) onClick();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      >
        <InfoIcon fontSize="small" />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            maxWidth: 320,
            p: 2,
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Agent Intelligence
        </Typography>

        {/* Modules Used */}
        {agentIntelligence.modulesUsed && agentIntelligence.modulesUsed.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Modules Used
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {agentIntelligence.modulesUsed.map((module) => (
                <Chip key={module} label={module} size="small" sx={{ height: 20, fontSize: 10 }} />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Confidence Score */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ConfidenceIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Confidence
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {Math.round(agentIntelligence.confidenceScore * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={agentIntelligence.confidenceScore * 100}
            color={getConfidenceColor(agentIntelligence.confidenceScore)}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Response Time */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SpeedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Response Time:
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {formatResponseTime(agentIntelligence.responseTimeMs)}
            </Typography>
          </Box>
        </Box>

        {/* Sources Count */}
        {(agentIntelligence.sourcesCount !== undefined || contextItems) && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DocumentIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Sources:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {agentIntelligence.sourcesCount || contextItems?.length || 0}
              </Typography>
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
}
