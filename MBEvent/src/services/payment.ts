import { supabase } from '@/src/lib/supabase';
import type { PaymentMethod } from '@/src/types/database';
import { generateReferenceNumber } from '@/src/utils/pricing';

export async function processPayment(params: {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
}) {
  const referenceNumber = generateReferenceNumber();

  const { data: bookingState, error: bookingLookupError } = await supabase
    .from('bookings')
    .select('id, status, total, reservation_fee, payment_ref, remaining_balance')
    .eq('id', params.bookingId)
    .maybeSingle();

  if (bookingLookupError) return { error: bookingLookupError.message, payment: null, referenceNumber: null };
  if (!bookingState) return { error: 'Booking not found.', payment: null, referenceNumber: null };
  if ((bookingState as { status?: string }).status === 'cancelled') {
    return { error: 'This booking has been cancelled and cannot receive a payment.', payment: null, referenceNumber: null };
  }

  const reservationFee = Number((bookingState as { reservation_fee?: number | null }).reservation_fee ?? 0);
  const actualRemainingBalance = Number((bookingState as { remaining_balance?: number | null }).remaining_balance ?? 0);
  const bookingStatus = (bookingState as { status?: string }).status;
  const hasPaidReservation = Boolean((bookingState as { payment_ref?: string | null }).payment_ref);
  const outstandingBalance = hasPaidReservation ? Math.max(0, actualRemainingBalance) : reservationFee;
  const isReservationPayment = !hasPaidReservation;
  const isRemainingBalancePayment = hasPaidReservation && outstandingBalance > 0;

  if (isReservationPayment) {
    if (bookingStatus !== 'approved') {
      return { error: 'Reservation payment is only allowed after booking approval.', payment: null, referenceNumber: null };
    }
  } else {
    if (outstandingBalance <= 0) {
      return { error: 'This booking has already been fully paid.', payment: null, referenceNumber: null };
    }
    if (bookingStatus !== 'completed') {
      return { error: 'Remaining balance may only be paid after the event is completed.', payment: null, referenceNumber: null };
    }
  }

  const expectedAmount = outstandingBalance;
  if (params.amount !== expectedAmount) {
    return {
      error: isReservationPayment
        ? 'Payment amount must match this booking reservation fee.'
        : 'Payment amount must match the outstanding balance.',
      payment: null,
      referenceNumber: null,
    };
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      booking_id: params.bookingId,
      amount: params.amount,
      method: params.method,
      status: 'pending',
      reference_number: referenceNumber,
    })
    .select()
    .single();

  if (error) return { error: error.message, payment: null, referenceNumber: null };

  const { applyBookingPayment, applyBookingRemainingBalancePayment } = await import('@/src/services/booking');
  const bookingError = isReservationPayment
    ? await applyBookingPayment(params.bookingId, params.amount, referenceNumber)
    : await applyBookingRemainingBalancePayment(params.bookingId, params.amount, referenceNumber);

  if (bookingError?.error) {
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', data.id);
    return { error: bookingError.error, payment: data, referenceNumber };
  }

  await supabase
    .from('payments')
    .update({ status: 'paid' })
    .eq('id', data.id);

  return { error: null, payment: data, referenceNumber };
}

export async function getPaymentHistory(userId: string) {
  const { data } = await supabase
    .from('payments')
    .select('*, bookings(*, event_types(name), packages(name))')
    .eq('bookings.customer_id', userId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function getPaymentWithBooking(paymentId: string) {
  const { data } = await supabase
    .from('payments')
    .select('*, bookings(*, event_types(name), packages(name))')
    .eq('id', paymentId)
    .maybeSingle();

  return data ?? null;
}

export async function createPayMongoIntent(amount: number, method: PaymentMethod) {
  const publicKey = process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY;
  if (!publicKey) {
    return { error: null, clientKey: null, mock: true };
  }

  return { error: null, clientKey: publicKey, mock: false };
}
