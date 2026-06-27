import { supabase } from '@/src/lib/supabase';
import type { PaymentMethod } from '@/src/types/database';
import { generateReferenceNumber } from '@/src/utils/pricing';

export async function processPayment(params: {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
}) {
  const referenceNumber = generateReferenceNumber();

  const status = params.method === 'cash' ? 'pending' : 'paid';

  const { data, error } = await supabase
    .from('payments')
    .insert({
      booking_id: params.bookingId,
      amount: params.amount,
      method: params.method,
      status,
      reference_number: referenceNumber,
    })
    .select()
    .single();

  if (error) return { error: error.message, payment: null, referenceNumber: null };

  if (status === 'paid') {
    await supabase.from('bookings').update({ payment_ref: referenceNumber }).eq('id', params.bookingId);
  }

  return { error: null, payment: data, referenceNumber };
}

export async function getPaymentHistory(userId: string) {
  const { data } = await supabase
    .from('payments')
    .select('*, bookings(id, event_types(name), total)')
    .eq('bookings.customer_id', userId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function createPayMongoIntent(amount: number, method: PaymentMethod) {
  const publicKey = process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY;
  if (!publicKey) {
    return { error: null, clientKey: null, mock: true };
  }

  return { error: null, clientKey: publicKey, mock: false };
}
