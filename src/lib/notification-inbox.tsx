import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAuth } from '@/lib/auth';
import { getUnreadNotificationCount } from '@/services/notifications';

type NotificationInboxContextValue = {
  unreadCount: number;
  isLoading: boolean;
  refresh: () => void;
};

const NotificationInboxContext = createContext<NotificationInboxContextValue | null>(null);

export function NotificationInboxProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!session) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Unread notification count failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const refresh = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCount();
  }, [fetchCount]);

  return (
    <NotificationInboxContext.Provider value={{ unreadCount, isLoading, refresh }}>
      {children}
    </NotificationInboxContext.Provider>
  );
}

export function useNotificationInbox() {
  const context = useContext(NotificationInboxContext);
  if (!context) {
    throw new Error('useNotificationInbox must be used within a NotificationInboxProvider');
  }
  return context;
}
