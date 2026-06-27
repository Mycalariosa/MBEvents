import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, EmptyState } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookings, updateBookingStatus } from '@/src/services/booking';
import { notifyBookingApproved, notifyBookingRejected } from '@/src/services/notifications';
import { formatCurrency, formatDate } from '@/src/utils/pricing';
import { BOOKING_STATUSES, SPACING, FONT_SIZES } from '@/src/constants';
import type { Booking } from '@/src/types/database';

export default function AdminBookingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string | undefined>();

  const load = async () => {
    const { data } = await getBookings('', 'admin', filter);
    setBookings(data as Booking[]);
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = (booking: Booking, action: 'approve' | 'reject' | 'complete') => {
    const statusMap = { approve: 'confirmed', reject: 'cancelled', complete: 'completed' };
    Alert.alert('Confirm', `Are you sure you want to ${action} this booking?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await updateBookingStatus(booking.id, statusMap[action]);
          if (action === 'approve') await notifyBookingApproved(booking.customer_id, booking.id);
          if (action === 'reject') await notifyBookingRejected(booking.customer_id, booking.id);
          load();
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll={false}>
      <Text style={[styles.title, { color: colors.text }]}>Customer Bookings</Text>

      <FlatList
        horizontal
        data={[{ id: 'all', label: 'All' }, ...BOOKING_STATUSES]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 40, marginBottom: SPACING.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: (!filter && item.id === 'all') || filter === item.id ? colors.primary : colors.surface }]}
            onPress={() => setFilter(item.id === 'all' ? undefined : item.id)}
          >
            <Text style={{ color: (!filter && item.id === 'all') || filter === item.id ? '#FFF' : colors.text, fontSize: FONT_SIZES.sm, fontWeight: '600' }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {bookings.length === 0 ? (
        <EmptyState icon="clipboard-text-off" title="No bookings" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const b = item as Booking & { profiles?: { full_name: string }; event_types?: { name: string }; packages?: { name: string } };
            const statusInfo = BOOKING_STATUSES.find((s) => s.id === b.status);
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(admin)/booking-detail/${b.id}` as never)}
              >
                <View style={styles.header}>
                  <Text style={[styles.customer, { color: colors.text }]}>{b.profiles?.full_name ?? 'Customer'}</Text>
                  <View style={[styles.badge, { backgroundColor: (statusInfo?.color ?? colors.primary) + '20' }]}>
                    <Text style={{ color: statusInfo?.color, fontSize: FONT_SIZES.xs, fontWeight: '600' }}>{statusInfo?.label}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZES.sm }}>
                  {b.event_types?.name} · {b.packages?.name ?? 'Custom'} · {formatDate(b.event_date)}
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '700', marginTop: SPACING.sm }}>{formatCurrency(Number(b.total))}</Text>
                {b.status === 'pending' && (
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => handleAction(b, 'approve')}>
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={() => handleAction(b, 'reject')}>
                      <Text style={styles.actionText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginBottom: SPACING.md },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, marginRight: SPACING.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 8 },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#FFF', fontWeight: '600', fontSize: FONT_SIZES.sm },
});
