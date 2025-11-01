'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  RadioButtonUnchecked as PendingIcon,
} from '@mui/icons-material';
import { Task } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckIcon color="success" />;
      case 'in_progress':
        return <ScheduleIcon color="primary" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {task.name}
          </Typography>
          <Chip label={task.status.replace('_', ' ')} color={getStatusColor()} size="small" />
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description}
        </Typography>

        {/* Progress bar */}
        {task.status === 'in_progress' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {task.progress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={task.progress} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        )}

        {/* Substeps */}
        {task.substeps && task.substeps.length > 0 && (
          <List dense disablePadding>
            {task.substeps.map((substep, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>{getStatusIcon(substep.status)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {substep.name}
                    </Typography>
                  }
                  secondary={
                    substep.completedAt && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(substep.completedAt), { addSuffix: true })}
                      </Typography>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Timing info */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          {task.startedAt && (
            <Typography variant="caption" color="text.secondary">
              Started {formatDistanceToNow(new Date(task.startedAt), { addSuffix: true })}
            </Typography>
          )}
          {task.estimatedCompletionAt && task.status === 'in_progress' && (
            <Typography variant="caption" color="text.secondary">
              ETA: {formatDistanceToNow(new Date(task.estimatedCompletionAt))}
            </Typography>
          )}
        </Box>

        {/* Error message */}
        {task.error && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: 'error.50',
              border: 1,
              borderColor: 'error.main',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="error.main">
              {task.error}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
