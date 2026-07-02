import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { ScreenContainer, Header, ProgressTimeline, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { buildBookingQrPayload, getBookingDetail } from '@/src/services/booking';
import { getBookingReview } from '@/src/services/appointments';
import { useBookingProgress } from '@/src/hooks/useNotifications';
import { formatCurrency, formatDate, formatTime } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES, BOOKING_STATUSES, CONSULTATION_STATUSES } from '@/src/constants';
import type { Booking, BookingSelection, ConsultationAppointment } from '@/src/types/database';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const progress = useBookingProgress(id);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selections, setSelections] = useState<BookingSelection[]>([]);
  const [appointment, setAppointment] = useState<ConsultationAppointment | null>(null);
  const [hasReview, setHasReview] = useState(false);

  const load = async () => {
    if (!id) return;
    const data = await getBookingDetail(id);
    setBooking(data.booking as Booking | null);
    setSelections(data.selections as BookingSelection[]);
    setAppointment(data.appointment as ConsultationAppointment | null);
    const review = await getBookingReview(id);
    setHasReview(!!review);
  };

  useEffect(() => { load(); }, [id]);

  if (!booking) return null;

  const statusInfo = BOOKING_STATUSES.find((s) => s.id === booking.status);
  const consultStatus = appointment
    ? CONSULTATION_STATUSES.find((s) => s.id === appointment.consultation_status)
    : null;
  const b = booking as Booking & { packages?: { name: string }; event_types?: { name: string } };
  const expectedRemainingBalance = Math.max(0, Number(booking.total) - Number(booking.reservation_fee));
  const effectiveRemainingBalance = booking.payment_ref
    ? booking.status === 'completed'
      ? Number(booking.remaining_balance)
      : expectedRemainingBalance
    : Number(booking.remaining_balance);
  const displayRemainingBalance = effectiveRemainingBalance;

  const canPayReservation =
    booking.status === 'approved' &&
    appointment?.consultation_status === 'finished' &&
    !booking.payment_ref;
  const canPayRemainingBalance =
    booking.status === 'completed' &&
    Boolean(booking.payment_ref) &&
    effectiveRemainingBalance > 0;
  const showQr = booking.status === 'approved' && !!appointment;
  const canRate =
    booking.status === 'completed' &&
    !hasReview &&
    booking.payment_ref &&
    effectiveRemainingBalance <= 0;
  const showRateBlocked =
    booking.status === 'completed' &&
    !hasReview &&
    effectiveRemainingBalance > 0;
  const qrValue = buildBookingQrPayload(booking.id);

  return (
    <ScreenContainer>
      <Header title="Booking Details" />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.statusBadge, { backgroundColor: (statusInfo?.color ?? colors.primary) + '20' }]}>
          <Text style={{ color: statusInfo?.color, fontWeight: '600' }}>{statusInfo?.label}</Text>
        </View>
        <Text style={[styles.event, { color: colors.text }]}>{b.event_types?.name} · {b.packages?.name}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(booking.event_date)} · {formatTime(booking.event_time)}
        </Text>
        {booking.event_address && (
          <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZES.sm, marginTop: SPACING.xs }}>
            {booking.event_address}
          </Text>
        )}
        <Text style={[styles.total, { color: isDark ? '#FFF' : colors.primary }]}>{formatCurrency(Number(booking.total))}</Text>
        {booking.status === 'confirmed' && (
          <Text style={[styles.fee, { color: colors.textSecondary }]}>
            Reservation: {formatCurrency(Number(booking.reservation_fee))} · Balance: {formatCurrency(displayRemainingBalance)}
          </Text>
        )}
      </View>

      {booking.admin_change_notes && booking.status === 'changes_requested' && (
        <View style={[styles.alertBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
          <Text style={{ color: colors.warning, fontWeight: '600' }}>Changes Requested</Text>
          <Text style={{ color: colors.text, marginTop: SPACING.xs }}>{booking.admin_change_notes}</Text>
        </View>
      )}

      {showQr && (
        <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.qrTitle, { color: colors.text }]}>Booking QR</Text>
          <Text style={[styles.qrHint, { color: colors.textSecondary }]}>Show this single QR to the admin for verification.</Text>
          <View style={styles.qrContainer}>
            <QRCode value={qrValue} size={220} backgroundColor="#FFF" color={colors.primary} />
          </View>
        </View>
      )}

      {appointment && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Consultation Appointment</Text>
          <View style={[styles.consultCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <View style={styles.consultHeader}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: FONT_SIZES.md }}>{appointment.appointment_ref}</Text>
              {consultStatus && (
                <View style={[styles.statusBadge, { backgroundColor: consultStatus.color + '20' }]}> 
                  <Text style={{ color: consultStatus.color, fontWeight: '600' }}>{consultStatus.label}</Text>
                </View>
              )}
            </View>
            <View style={styles.consultRow}>
              <Text style={[styles.consultLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{formatDate(appointment.consultation_date)}</Text>
            </View>
            <View style={styles.consultRow}>
              <Text style={[styles.consultLabel, { color: colors.textSecondary }]}>Time</Text>
              <Text style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{formatTime(appointment.consultation_time)}</Text>
            </View>
            {appointment.branch_location && (
              <View style={styles.consultRow}>
                <Text style={[styles.consultLabel, { color: colors.textSecondary }]}>Location</Text>
                <Text style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{appointment.branch_location}</Text>
              </View>
            )}
            <Text style={{ color: colors.textSecondary, marginTop: SPACING.sm }}>
              Your consultation is scheduled and the booking QR above is ready for admin scanning.
            </Text>
          </View>
        </>
      )}

      {(booking.special_requests || booking.additional_requests) && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Requests</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
            {booking.special_requests || booking.additional_requests}
          </Text>
        </>
      )}

      {canPayReservation && (
        <Button
          title="Pay Reservation Fee"
          onPress={() => router.push(`/(customer)/booking/payment?bookingId=${id}` as never)}
        />
      )}

      {canPayRemainingBalance && (
        <Button
          title={`Pay Remaining Balance ${formatCurrency(effectiveRemainingBalance)}`}
          onPress={() => router.push(`/(customer)/booking/payment?bookingId=${id}` as never)}
        />
      )}

      {booking.payment_ref && effectiveRemainingBalance <= 0 && (
        <View style={[styles.alertBox, { backgroundColor: colors.success + '15', borderColor: colors.success }]}> 
          <Text style={{ color: colors.success, fontWeight: '600' }}>
            {booking.status === 'completed' ? 'Full Payment Received' : 'Reservation Fee Paid'}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: SPACING.xs }}>
            {booking.status === 'completed'
              ? 'Your booking is fully paid and confirmed. Thank you for completing payment.'
              : 'Your reservation fee has been received. No further payment is needed for this step.'}
          </Text>
        </View>
      )}

      {progress.length > 0 && booking.status === 'confirmed' && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Preparation</Text>
          <ProgressTimeline steps={progress} />
        </>
      )}

      {canRate && (
        <Button
          title="Rate Your Experience"
          onPress={() => router.push(`/(customer)/rate-booking/${id}` as never)}
        />
      )}
      {showRateBlocked && (
        <View style={[styles.alertBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}> 
          <Text style={{ color: colors.warning, fontWeight: '600' }}>Full Payment Required</Text>
          <Text style={{ color: colors.textSecondary, marginTop: SPACING.xs }}>
            Please settle the remaining balance before rating your experience.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 8, marginBottom: SPACING.sm },
  event: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  date: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  total: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginTop: SPACING.sm },
  fee: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  alertBox: { borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.md },
  consultCard: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  consultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  consultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  consultLabel: { width: 80, fontWeight: '600' },
  qrCard: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center' },
  qrTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.xs },
  qrHint: { fontSize: FONT_SIZES.sm, textAlign: 'center', marginBottom: SPACING.md },
  qrContainer: { alignItems: 'center', padding: SPACING.md, backgroundColor: '#FFF', borderRadius: 12 },
});
