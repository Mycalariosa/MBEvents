import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES, BOOKING_STATUSES } from '@/src/constants';
import { formatCurrency, formatDate, formatTime } from '@/src/utils/pricing';
import type { Booking } from '@/src/types/database';

interface BookingCardProps {
  booking: Booking & { packages?: { name: string }; event_types?: { name: string } };
  showActions?: boolean;
  onCancel?: () => void;
}

export function BookingCard({ booking, showActions = true, onCancel }: BookingCardProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const statusInfo = BOOKING_STATUSES.find((s) => s.id === booking.status);
  const showBalance = booking.status === 'confirmed' || Boolean(booking.payment_ref);
  const expectedRemainingBalance = Math.max(0, Number(booking.total) - Number(booking.reservation_fee));
  const displayRemainingBalance = booking.payment_ref
    ? booking.status === 'completed'
      ? Number(booking.remaining_balance)
      : expectedRemainingBalance
    : Number(booking.remaining_balance);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/(customer)/booking-detail/${booking.id}` as never)}
    >
      <View style={styles.header}>
        <Text style={[styles.eventType, { color: colors.accent }]}> 
          {booking.event_types?.name ?? 'Event'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: (statusInfo?.color ?? colors.primary) + '20' }]}> 
          <Text style={[styles.statusText, { color: statusInfo?.color ?? colors.primary }]}> 
            {statusInfo?.label ?? booking.status}
          </Text>
        </View>
      </View>
      <Text style={[styles.package, { color: colors.textSecondary }]}> 
        {booking.packages?.name ?? 'Custom Package'}
      </Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}> 
        {formatDate(booking.event_date)} · {formatTime(booking.event_time)}
      </Text>
      <Text style={[styles.amount, { color: isDark ? '#FFF' : colors.primary }]}> 
        {formatCurrency(Number(booking.total))}
      </Text>
      {showBalance && (
        <Text style={[styles.balance, { color: colors.textSecondary }]}> 
          Remaining Balance: {formatCurrency(displayRemainingBalance)}
        </Text>
      )}
      <Text style={[styles.meta, { color: colors.textSecondary }]}> 
        Current Status: {statusInfo?.label ?? booking.status}
      </Text>
      {showActions && booking.status === 'pending' && onCancel && (
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.error }]} onPress={onCancel}>
          <Text style={{ color: colors.error, fontSize: FONT_SIZES.sm, fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventType: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  package: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  date: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  amount: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginTop: SPACING.sm, color: '#D4AF37' },
  balance: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  meta: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  cancelBtn: { marginTop: SPACING.sm, borderWidth: 1, borderRadius: 8, paddingVertical: SPACING.sm, alignItems: 'center' },
});
