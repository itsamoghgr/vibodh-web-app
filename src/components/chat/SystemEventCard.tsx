'use client';

import React from 'react';
import { Box, Alert, Typography, Button } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { SystemEvent } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface SystemEventCardProps {
  event: SystemEvent;
}

export default function SystemEventCard({ event }: SystemEventCardProps) {
  return (
    <Alert
      severity={event.severity}
      icon={
        event.severity === 'success' ? (
          <SuccessIcon />
        ) : event.severity === 'info' ? (
          <InfoIcon />
        ) : event.severity === 'warning' ? (
          <WarningIcon />
        ) : (
          <ErrorIcon />
        )
      }
      action={
        event.actionable && event.actionUrl && event.actionLabel ? (
          <Button color="inherit" size="small" href={event.actionUrl}>
            {event.actionLabel}
          </Button>
        ) : null
      }
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {event.title}
      </Typography>
      <Typography variant="body2">{event.description}</Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
      </Typography>
    </Alert>
  );
}
