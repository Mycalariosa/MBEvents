import { supabase } from '@/src/lib/supabase';
import type { Notification as AppNotification } from '@/src/types/database';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/src/stores';

export function useNotifications(userId: string | undefined) {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const updateNotification = useNotificationStore((state) => state.updateNotification);
  const markAllReadLocal = useNotificationStore((state) => state.markAllReadLocal);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsed = (data ?? []) as AppNotification[];
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n) => !n.is_read).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (id: string) => {
    if (!userId || !id) return;

    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;

      updateNotification(id, { is_read: true } as Partial<AppNotification>);
    } catch {
      // Ignore update failures so the screen remains usable.
    }
  };

  const markAllRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      if (error) throw error;

      markAllReadLocal();
    } catch {
      // Ignore update failures so the screen remains usable.
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllRead, refresh: fetchNotifications };
}

export function useBookingProgress(bookingId: string | undefined) {
  const [progress, setProgress] = useState<import('@/src/types/database').BookingProgress[]>([]);

  useEffect(() => {
    if (!bookingId) {
      setProgress([]);
      return;
    }

    let isActive = true;

    const fetchProgress = async () => {
      try {
        const { data } = await supabase
          .from('booking_progress')
          .select('*')
          .eq('booking_id', bookingId)
          .order('sort_order');

        if (isActive && data) {
          setProgress(data);
        }
      } catch {
        if (isActive) {
          setProgress([]);
        }
      }
    };

    void fetchProgress();
    const intervalId = setInterval(() => {
      void fetchProgress();
    }, 15000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [bookingId]);

  return progress;
}
