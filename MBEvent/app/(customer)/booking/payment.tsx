import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Header, Button } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookingDetail } from '@/src/services/booking';
import { processPayment } from '@/src/services/payment';
import { notifyPaymentSuccess } from '@/src/services/notifications';
import { formatCurrency } from '@/src/utils/pricing';
import { PAYMENT_METHODS, SPACING, FONT_SIZES } from '@/src/constants';
import type { Booking, PaymentMethod } from '@/src/types/database';

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>('gcash');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (bookingId) {
      getBookingDetail(bookingId).then(({ booking: b }) => setBooking(b as Booking | null));
    }
  }, [bookingId]);

  if (!booking || !profile) return null;

  const reservationFee = Number(booking.reservation_fee);
  const rawRemainingBalance = Number(booking.remaining_balance);
  const paidReservation = Boolean(booking.payment_ref);
  const expectedRemainingBalance = Math.max(0, Number(booking.total) - reservationFee);
  const remainingBalance = paidReservation
    ? booking.status === 'completed'
      ? rawRemainingBalance
      : expectedRemainingBalance
    : rawRemainingBalance;
  const isReservationPayment = !paidReservation;
  const isRemainingBalancePayment = paidReservation && booking.status === 'completed' && remainingBalance > 0;
  const paymentAmount = isReservationPayment ? reservationFee : remainingBalance;
  const screenTitle = isRemainingBalancePayment ? 'Outstanding Balance' : isReservationPayment ? 'Reservation Fee' : 'Remaining Balance Not Due';
  const paymentDescription = isRemainingBalancePayment
    ? 'Please complete your remaining balance to finalize your booking.'
    : isReservationPayment
    ? 'After your consultation, pay the reservation fee to confirm your booking.'
    : 'Your remaining balance is due only after the event is completed.';
  const buttonText = isRemainingBalancePayment
    ? `Pay Remaining Balance ${formatCurrency(paymentAmount)}`
    : isReservationPayment
    ? `Pay ${formatCurrency(paymentAmount)}`
    : 'Payment Not Available';
  const displayBalance = remainingBalance;
  const canPay = isReservationPayment || isRemainingBalancePayment;

  const handlePay = async () => {
    if (!canPay) {
      Alert.alert(
        'Payment Not Available',
        'Your reservation is already paid. Remaining balance is payable only after event completion.'
      );
      return;
    }

    if (paidReservation && remainingBalance <= 0) {
      Alert.alert('Nothing to Pay', 'Your booking is already fully settled.');
      return;
    }

    setLoading(true);

    const { referenceNumber, error: payError } = await processPayment({
      bookingId: booking.id,
      amount: paymentAmount,
      method,
    });

    setLoading(false);

    if (payError) {
      Alert.alert('Payment Error', payError);
      return;
    }

    const updatedBooking = {
      ...booking,
      payment_ref: booking.payment_ref ?? referenceNumber,
      remaining_balance: isRemainingBalancePayment ? 0 : remainingBalance,
      status: booking.payment_ref ? booking.status : 'confirmed' as const,
    };
    setBooking(updatedBooking);

    await notifyPaymentSuccess(profile.id, paymentAmount, referenceNumber ?? '');
    if (isRemainingBalancePayment) {
      Alert.alert(
        'Thank you for booking with us',
        'Your remaining balance is now settled. Would you like to rate your experience?',
        [
          { text: 'View Booking', onPress: () => router.replace(`/(customer)/booking-detail/${booking.id}` as never) },
          { text: 'Rate Experience', onPress: () => router.replace(`/(customer)/rate-booking/${booking.id}` as never) },
        ]
      );
    } else {
      Alert.alert(
        'Booking Confirmed',
        'Your reservation fee has been paid. Your booking is now confirmed!',
        [{ text: 'OK', onPress: () => router.replace(`/(customer)/booking-detail/${booking.id}` as never) }]
      );
    }
  };

  return (
    <ScreenContainer>
      <Header title={screenTitle} />
      <Text style={[styles.desc, { color: colors.textSecondary }]}> 
        {paymentDescription}
      </Text>
      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{screenTitle}</Text>
        <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(paymentAmount)}</Text>
        <Text style={[styles.total, { color: colors.textSecondary }]}>Total Package: {formatCurrency(Number(booking.total))}</Text>
        <Text style={[styles.balance, { color: colors.textSecondary }]}> 
          Remaining Balance: {formatCurrency(displayBalance)}        </Text>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
      {PAYMENT_METHODS.map((pm) => (
        <TouchableOpacity
          key={pm.id}
          style={[styles.methodCard, { backgroundColor: method === pm.id ? colors.primary + '15' : colors.card, borderColor: method === pm.id ? colors.primary : colors.border }]}
          onPress={() => setMethod(pm.id)}
        >
          <MaterialCommunityIcons name={pm.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={24} color={method === pm.id ? colors.primary : colors.textSecondary} />
          <Text style={[styles.methodName, { color: colors.text }]}>{pm.name}</Text>
          {method === pm.id && <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />}
        </TouchableOpacity>
      ))}

      <Button title={buttonText} onPress={handlePay} loading={loading} disabled={!canPay || loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.lg, lineHeight: 20 },
  summary: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center' },
  label: { fontSize: FONT_SIZES.sm },
  amount: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', marginTop: SPACING.sm },
  total: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  balance: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
  methodCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  methodName: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '500' },
});
