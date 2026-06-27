import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Header, ProgressTimeline } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookingDetail } from '@/src/services/booking';
import { useBookingProgress } from '@/src/hooks/useNotifications';
import { formatCurrency, formatDate, formatTime } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES, BOOKING_STATUSES } from '@/src/constants';
import type { Booking, BookingSelection } from '@/src/types/database';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const progress = useBookingProgress(id);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selections, setSelections] = useState<BookingSelection[]>([]);

  useEffect(() => {
    if (id) getBookingDetail(id).then(({ booking: b, selections: s }) => {
      if (b) setBooking(b as Booking);
      setSelections(s as BookingSelection[]);
    });
  }, [id]);

  if (!booking) return null;

  const statusInfo = BOOKING_STATUSES.find((s) => s.id === booking.status);

  return (
    <ScreenContainer>
      <Header title="Booking Details" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.statusBadge, { backgroundColor: (statusInfo?.color ?? colors.primary) + '20' }]}>
          <Text style={{ color: statusInfo?.color, fontWeight: '600' }}>{statusInfo?.label}</Text>
        </View>
        <Text style={[styles.date, { color: colors.text }]}>{formatDate(booking.event_date)} · {formatTime(booking.event_time)}</Text>
        <Text style={[styles.total, { color: colors.primary }]}>{formatCurrency(Number(booking.total))}</Text>
        <Text style={[styles.fee, { color: colors.textSecondary }]}>
          Reservation: {formatCurrency(Number(booking.reservation_fee))} · Balance: {formatCurrency(Number(booking.remaining_balance))}
        </Text>
      </View>

      {selections.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Selections</Text>
          {selections.map((s) => (
            <View key={s.id} style={[styles.selectionRow, { borderBottomColor: colors.border }]}>
              <Text style={{ color: colors.text, flex: 1 }}>{s.item_name}</Text>
              <Text style={{ color: colors.textSecondary }}>{formatCurrency(Number(s.unit_price))}</Text>
            </View>
          ))}
        </>
      )}

      {progress.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Planner Progress</Text>
          <ProgressTimeline steps={progress} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 8, marginBottom: SPACING.sm },
  date: { fontSize: FONT_SIZES.md },
  total: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginTop: SPACING.sm },
  fee: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.md },
  selectionRow: { flexDirection: 'row', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
});
