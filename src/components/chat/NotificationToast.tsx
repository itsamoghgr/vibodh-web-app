'use client';

import React, { useEffect } from 'react';
import { Box, Snackbar, Alert, AlertTitle, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications();

  // Auto-dismiss notifications with duration
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  return (
    <Box>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            top: `${80 + index * 80}px !important`, // Stack notifications
          }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
            sx={{ minWidth: 300, maxWidth: 400 }}
            action={
              notification.actionLabel && notification.onAction ? (
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => {
                    if (notification.onAction) notification.onAction();
                    removeNotification(notification.id);
                  }}
                >
                  {notification.actionLabel}
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => removeNotification(notification.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )
            }
          >
            <AlertTitle>{notification.title}</AlertTitle>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}
