import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, Button } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useGenericBookingStore } from '@/src/stores';
import { createGenericBooking } from '@/src/services/booking';
import { processPayment } from '@/src/services/payment';
import { supabase } from '@/src/lib/supabase';
import { formatCurrency } from '@/src/utils/pricing';

export default function GenericPaymentScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const store = useGenericBookingStore();
  const [loading, setLoading] = useState(false);
  const serviceFee = Math.round(store.packagePrice * 0.05);
  const total = store.packagePrice + serviceFee;
  const reservationFee = Math.round(total * 0.3);

  const handlePay = async () => {
    if (!profile || !store.supplierId) return;
    setLoading(true);

    const { data: eventType } = await supabase.from('event_types').select('id').eq('slug', 'wedding').single();

    const { booking, error } = await createGenericBooking({
      customerId: profile.id,
      eventTypeId: (eventType as { id: string } | null)?.id ?? '',
      supplierId: store.supplierId,
      supplierName: store.supplierName ?? '',
      serviceType: store.serviceType ?? '',
      packageName: store.packageName ?? '',
      packagePrice: store.packagePrice,
      eventDate: store.eventDate ?? '',
      eventTime: store.eventTime ?? '',
      additionalRequests: store.additionalRequests,
      paymentMethod: 'gcash',
    });

    if (error || !booking) {
      setLoading(false);
      Alert.alert('Error', error ?? 'Failed');
      return;
    }

    const { referenceNumber } = await processPayment({ bookingId: booking.id, amount: reservationFee, method: 'gcash' });
    store.reset();
    setLoading(false);
    router.replace(`/(customer)/booking/confirmation/${booking.id}?ref=${referenceNumber}` as never);
  };

  return (
    <ScreenContainer>
      <Header title="Payment" />
      <Button title={`Pay ${formatCurrency(reservationFee)}`} onPress={handlePay} loading={loading} />
    </ScreenContainer>
  );
}
