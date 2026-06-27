import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Header, Button } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { useWizardStore } from '@/src/stores';
import { createEventBooking } from '@/src/services/booking';
import { processPayment } from '@/src/services/payment';
import { notifyPaymentSuccess, notifyNewBooking } from '@/src/services/notifications';
import { supabase } from '@/src/lib/supabase';
import { calculatePricing, formatCurrency } from '@/src/utils/pricing';
import { PAYMENT_METHODS, SPACING, FONT_SIZES } from '@/src/constants';
import type { PaymentMethod } from '@/src/types/database';

export default function PaymentScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const wizard = useWizardStore();
  const [method, setMethod] = useState<PaymentMethod>('gcash');
  const [loading, setLoading] = useState(false);

  if (!wizard.selectedPackage || !profile) return null;

  const pricing = calculatePricing(wizard.selectedPackage, wizard.selections);

  const handlePay = async () => {
    setLoading(true);

    const { data: eventType } = await supabase
      .from('event_types')
      .select('id')
      .eq('slug', wizard.eventType)
      .single();

    if (!eventType) {
      setLoading(false);
      Alert.alert('Error', 'Event type not found');
      return;
    }

    const { booking, error } = await createEventBooking({
      customerId: profile.id,
      eventTypeId: (eventType as { id: string }).id,
      pkg: wizard.selectedPackage!,
      eventDate: wizard.eventDate ?? new Date().toISOString().split('T')[0],
      eventTime: wizard.eventTime ?? '12:00',
      guestCount: wizard.guestCount,
      selections: wizard.selections,
      additionalRequests: wizard.additionalRequests,
      paymentMethod: method,
    });

    if (error || !booking) {
      setLoading(false);
      Alert.alert('Error', error ?? 'Failed to create booking');
      return;
    }

    const { referenceNumber, error: payError } = await processPayment({
      bookingId: booking.id,
      amount: pricing.reservationFee,
      method,
    });

    setLoading(false);

    if (payError) {
      Alert.alert('Payment Error', payError);
      return;
    }

    await notifyPaymentSuccess(profile.id, pricing.reservationFee, referenceNumber ?? '');
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    if (admins) await notifyNewBooking(admins.map((a: { id: string }) => a.id), profile.full_name);

    wizard.reset();
    router.replace(`/(customer)/booking/confirmation/${booking.id}?ref=${referenceNumber}` as never);
  };

  return (
    <ScreenContainer>
      <Header title="Payment" />
      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Reservation Fee</Text>
        <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(pricing.reservationFee)}</Text>
        <Text style={[styles.total, { color: colors.textSecondary }]}>Total: {formatCurrency(pricing.total)}</Text>
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

      <Button title={`Pay ${formatCurrency(pricing.reservationFee)}`} onPress={handlePay} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center' },
  label: { fontSize: FONT_SIZES.sm },
  amount: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', marginTop: SPACING.sm },
  total: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
  methodCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  methodName: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '500' },
});
