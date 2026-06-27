import { supabase } from '@/src/lib/supabase';
import type { Booking, PaymentMethod, WizardSelection } from '@/src/types/database';
import { calculatePricing, generateReferenceNumber } from '@/src/utils/pricing';
import { PLANNER_PROGRESS_STEPS } from '@/src/constants';
import type { Package } from '@/src/types/database';

export async function createEventBooking(params: {
  customerId: string;
  eventTypeId: string;
  pkg: Package;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  selections: WizardSelection[];
  additionalRequests: string;
  paymentMethod: PaymentMethod;
}) {
  const pricing = calculatePricing(params.pkg, params.selections);

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: params.customerId,
      event_type_id: params.eventTypeId,
      package_id: params.pkg.id,
      event_date: params.eventDate,
      event_time: params.eventTime,
      guest_count: params.guestCount,
      status: 'pending',
      subtotal: pricing.subtotal,
      service_fee: pricing.serviceFee,
      discount: pricing.discount,
      total: pricing.total,
      reservation_fee: pricing.reservationFee,
      remaining_balance: pricing.remainingBalance,
      payment_method: params.paymentMethod,
      additional_requests: params.additionalRequests,
    })
    .select()
    .single();

  if (error || !booking) return { error: error?.message ?? 'Failed to create booking', booking: null };

  const bookingData = booking as Booking;

  if (params.selections.length > 0) {
    await supabase.from('booking_selections').insert(
      params.selections.map((s) => ({
        booking_id: bookingData.id,
        service_type: s.serviceType,
        service_item_id: s.serviceItemId,
        item_name: s.itemName,
        unit_price: s.unitPrice,
        quantity: s.quantity,
        price_delta: s.priceDelta,
        metadata: s.metadata ?? {},
      }))
    );
  }

  await supabase.from('booking_progress').insert(
    PLANNER_PROGRESS_STEPS.map((step, i) => ({
      booking_id: bookingData.id,
      step_key: step.key,
      step_label: step.label,
      is_completed: step.key === 'confirmed',
      completed_at: step.key === 'confirmed' ? new Date().toISOString() : null,
      sort_order: i,
    }))
  );

  return { error: null, booking: bookingData };
}

export async function createGenericBooking(params: {
  customerId: string;
  eventTypeId: string;
  supplierId: string;
  supplierName: string;
  serviceType: string;
  packageName: string;
  packagePrice: number;
  eventDate: string;
  eventTime: string;
  additionalRequests: string;
  paymentMethod: PaymentMethod;
}) {
  const serviceFee = Math.round(params.packagePrice * 0.05);
  const total = params.packagePrice + serviceFee;
  const reservationFee = Math.round(total * 0.3);

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: params.customerId,
      event_type_id: params.eventTypeId,
      event_date: params.eventDate,
      event_time: params.eventTime,
      status: 'pending',
      subtotal: params.packagePrice,
      service_fee: serviceFee,
      total,
      reservation_fee: reservationFee,
      remaining_balance: total - reservationFee,
      payment_method: params.paymentMethod,
      additional_requests: params.additionalRequests,
    })
    .select()
    .single();

  if (error || !booking) return { error: error?.message ?? 'Failed', booking: null };

  await supabase.from('booking_selections').insert({
    booking_id: (booking as Booking).id,
    service_type: params.serviceType,
    service_item_id: params.supplierId,
    item_name: `${params.supplierName} - ${params.packageName}`,
    unit_price: params.packagePrice,
    quantity: 1,
    price_delta: 0,
  });

  return { error: null, booking: booking as Booking };
}

export async function getBookings(userId: string, role: 'customer' | 'admin', status?: string) {
  let query = supabase
    .from('bookings')
    .select('*, packages(name), event_types(name, slug), profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (role === 'customer') query = query.eq('customer_id', userId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  return { data: data ?? [], error };
}

export async function cancelBooking(bookingId: string) {
  return supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
}

export async function updateBookingStatus(bookingId: string, status: string, plannerId?: string) {
  const update: Record<string, unknown> = { status };
  if (plannerId) update.assigned_planner_id = plannerId;
  return supabase.from('bookings').update(update).eq('id', bookingId);
}

export async function updateProgressStep(stepId: string, completed: boolean) {
  return supabase
    .from('booking_progress')
    .update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', stepId);
}

export async function getBookingDetail(bookingId: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, packages(*), event_types(*), profiles(full_name, email, phone)')
    .eq('id', bookingId)
    .single();

  const { data: selections } = await supabase
    .from('booking_selections')
    .select('*')
    .eq('booking_id', bookingId);

  const { data: progress } = await supabase
    .from('booking_progress')
    .select('*')
    .eq('booking_id', bookingId)
    .order('sort_order');

  return { booking, selections: selections ?? [], progress: progress ?? [] };
}
