'use client';

import { useCallback } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { Notification, UseNotificationsReturn } from '@/types/chat';

export function useNotifications(): UseNotificationsReturn {
  const { notifications, addNotification: addNotif, removeNotification, clearAllNotifications } =
    useChatContext();

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>) => {
      addNotif(notification);
    },
    [addNotif]
  );

  const clearAll = useCallback(() => {
    clearAllNotifications();
  }, [clearAllNotifications]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}
