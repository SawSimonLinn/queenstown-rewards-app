import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notifications';
import type { AppNotification } from '@/types';

export type NotificationsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: AppNotification[] };

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({ status: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [markingReadIds, setMarkingReadIds] = useState<string[]>([]);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const isRefresh = mode === 'refresh';
    const message = "Couldn't load your notifications. Check your connection and try again.";

    if (isRefresh) {
      setRefreshError(null);
      setIsRefreshing(true);
    }

    try {
      const items = await getMyNotifications();
      setState({ status: 'success', items });
      setRefreshError(null);
    } catch (error) {
      console.error('Notifications failed to load:', error);
      if (isRefresh) {
        setRefreshError(message);
      } else {
        setState({ status: 'error', message });
      }
    } finally {
      if (isRefresh) setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  const retry = useCallback(async () => {
    setState({ status: 'loading' });
    await fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    if (state.status !== 'success') {
      await retry();
      return;
    }
    await fetchData('refresh');
  }, [fetchData, retry, state.status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const markRead = useCallback(
    async (id: string) => {
      setMarkingReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setState((prev) =>
        prev.status === 'success'
          ? {
              status: 'success',
              items: prev.items.map((item) =>
                item.id === id && !item.readAt
                  ? { ...item, readAt: new Date().toISOString() }
                  : item
              ),
            }
          : prev
      );
      try {
        await markNotificationRead(id);
      } catch (error) {
        console.error('Marking notification read failed:', error);
        fetchData();
      } finally {
        setMarkingReadIds((prev) => prev.filter((itemId) => itemId !== id));
      }
    },
    [fetchData]
  );

  const markAllRead = useCallback(async () => {
    if (isMarkingAllRead) return;
    setIsMarkingAllRead(true);
    setState((prev) =>
      prev.status === 'success'
        ? {
            status: 'success',
            items: prev.items.map((item) =>
              item.readAt ? item : { ...item, readAt: new Date().toISOString() }
            ),
          }
        : prev
    );
    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.error('Marking all notifications read failed:', error);
      fetchData();
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [fetchData, isMarkingAllRead]);

  return {
    state,
    retry,
    refresh,
    isRefreshing,
    refreshError,
    markRead,
    markAllRead,
    markingReadIds,
    isMarkingAllRead,
  };
}
