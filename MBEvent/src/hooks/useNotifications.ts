import { supabase } from '@/src/lib/supabase';
import type { Notification } from '@/src/types/database';
import { useEffect, useState } from 'react';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

      const parsed = (data ?? []) as Notification[];
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

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore update failures so the screen remains usable.
    }
  };

  const markAllRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore update failures so the screen remains usable.
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllRead, refresh: fetchNotifications };
}

export function useBookingProgress(bookingId: string | undefined) {
  const [progress, setProgress] = useState<import('@/src/types/database').BookingProgress[]>([]);

  useEffect(() => {
    if (!bookingId) return;

    const fetchProgress = async () => {
      const { data } = await supabase
        .from('booking_progress')
        .select('*')
        .eq('booking_id', bookingId)
        .order('sort_order');
      if (data) setProgress(data);
    };

    fetchProgress();

    const channel = supabase
      .channel(`progress-${bookingId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'booking_progress', filter: `booking_id=eq.${bookingId}` },
        () => fetchProgress()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  return progress;
}
