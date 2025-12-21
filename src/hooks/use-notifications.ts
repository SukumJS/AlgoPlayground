'use client';

import { useCallback } from 'react';
import { useUIStore, notify } from '@/stores';

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const { notifications, removeNotification, clearNotifications } = useUIStore();

  const showSuccess = useCallback((title: string, message?: string) => {
    return notify.success(title, message);
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    return notify.error(title, message);
  }, []);

  const showWarning = useCallback((title: string, message?: string) => {
    return notify.warning(title, message);
  }, []);

  const showInfo = useCallback((title: string, message?: string) => {
    return notify.info(title, message);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  const dismissAll = useCallback(() => {
    clearNotifications();
  }, [clearNotifications]);

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    dismissAll,
    hasNotifications: notifications.length > 0,
    count: notifications.length,
  };
}
