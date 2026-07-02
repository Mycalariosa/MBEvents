import { supabase } from '@/src/lib/supabase';
import type { Booking, PaymentMethod, WizardSelection } from '@/src/types/database';
import { calculatePricing } from '@/src/utils/pricing';
import { PLANNER_PROGRESS_STEPS } from '@/src/constants';
import type { Package } from '@/src/types/database';

export function buildBookingQrPayload(bookingId: string) {
  return `MBEVENT-BOOKING:${bookingId}`;
}

export function parseBookingQrPayload(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('MBEVENT-BOOKING:')) {
    return trimmed.replace('MBEVENT-BOOKING:', '').trim();
  }

  if (trimmed.startsWith('BOOKING:')) {
    return trimmed.replace('BOOKING:', '').trim();
  }

  if (trimmed.startsWith('BK:')) {
    return trimmed.replace('BK:', '').trim();
  }

  if (trimmed.startsWith('APT-')) {
    return null;
  }

  return trimmed;
}

export async function createEventBooking(params: {
  customerId: string;
  eventTypeId: string;
  pkg: Package;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  selections: WizardSelection[];
  additionalRequests: string;
  eventAddress?: string;
  themeColor?: string;
  specialRequests?: string;
  paymentMethod?: PaymentMethod | null;
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
      event_address: params.eventAddress ?? null,
      theme_color: params.themeColor ?? null,
      special_requests: params.specialRequests ?? null,
      status: 'pending',
      subtotal: pricing.subtotal,
      service_fee: pricing.serviceFee,
      discount: pricing.discount,
      total: pricing.total,
      reservation_fee: pricing.reservationFee,
      remaining_balance: pricing.remainingBalance,
      payment_method: params.paymentMethod ?? null,
      additional_requests: params.additionalRequests,
    })
    .select()
    .single();

  if (error || !booking) return { error: error?.message ?? 'Failed to create booking', booking: null };

  const bookingData = booking as Booking;

  await seedBookingProgress(bookingData.id);

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

  return { error: null, booking: bookingData };
}

export async function seedBookingProgress(bookingId: string) {
  await supabase.from('booking_progress').insert(
    PLANNER_PROGRESS_STEPS.map((step, i) => ({
      booking_id: bookingId,
      step_key: step.key,
      step_label: step.label,
      is_completed: false,
      completed_at: null,
      sort_order: i,
    }))
  );
}

export async function confirmBookingAfterPayment(bookingId: string, plannerId?: string) {
  const update: Record<string, unknown> = { status: 'confirmed' };
  if (plannerId) update.assigned_planner_id = plannerId;

  const { error } = await supabase.from('bookings').update(update).eq('id', bookingId);
  if (error) return { error: error.message };

  const { data: existing } = await supabase
    .from('booking_progress')
    .select('id')
    .eq('booking_id', bookingId)
    .limit(1);

  if (!existing?.length) {
    await seedBookingProgress(bookingId);
    const { data: firstStep } = await supabase
      .from('booking_progress')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('step_key', 'confirmed')
      .single();
    if (firstStep) {
      await supabase
        .from('booking_progress')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', (firstStep as { id: string }).id);
    }
  }

  return { error: null };
}

export async function requestBookingChanges(bookingId: string, notes: string) {
  return supabase
    .from('bookings')
    .update({ status: 'changes_requested', admin_change_notes: notes })
    .eq('id', bookingId);
}

export async function updateBookingSelections(
  bookingId: string,
  selections: WizardSelection[]
) {
  await supabase.from('booking_selections').delete().eq('booking_id', bookingId);
  if (selections.length > 0) {
    await supabase.from('booking_selections').insert(
      selections.map((s) => ({
        booking_id: bookingId,
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
}

export async function updateBookingEventDetails(
  bookingId: string,
  details: {
    event_date?: string;
    event_time?: string;
    guest_count?: number;
    event_address?: string;
    theme_color?: string;
    special_requests?: string;
    additional_requests?: string;
  }
) {
  return supabase.from('bookings').update(details).eq('id', bookingId);
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

  const bookingData = booking as Booking;
  await seedBookingProgress(bookingData.id);

  await supabase.from('booking_selections').insert({
    booking_id: bookingData.id,
    service_type: params.serviceType,
    service_item_id: params.supplierId,
    item_name: `${params.supplierName} - ${params.packageName}`,
    unit_price: params.packagePrice,
    quantity: 1,
    price_delta: 0,
  });

  return { error: null, booking: bookingData };
}

export async function getBookings(userId: string, role: 'customer' | 'admin', status?: string, eventType?: string, customerId?: string) {
  let query = supabase
    .from('bookings')
    .select('*, packages(name), event_types(name, slug)')
    .order('created_at', { ascending: false });

  if (role === 'customer') query = query.eq('customer_id', userId);
  if (customerId) query = query.eq('customer_id', customerId);
  if (status) query = query.eq('status', status);
  if (eventType) query = query.eq('event_types.slug', eventType);

  const { data, error } = await query;
  if (error) return { data: [], error };

  const bookingRows = (data ?? []) as Array<Record<string, unknown>>;
  if (bookingRows.length === 0) return { data: [], error: null };

  const customerIds = Array.from(new Set(bookingRows.map((booking) => booking.customer_id).filter(Boolean))) as string[];
  const { data: profilesData } = await supabase.from('profiles').select('id, full_name, email').in('id', customerIds);

  const profilesMap = new Map((profilesData ?? []).map((profile) => [profile.id, profile]));

  const bookingsWithProfiles = bookingRows.map((booking) => ({
    ...booking,
    profiles: profilesMap.get(booking.customer_id as string) ?? null,
  }));

  return { data: bookingsWithProfiles as Booking[], error: null };
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
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, packages(*), event_types(*)')
    .eq('id', bookingId)
    .maybeSingle();

  let bookingWithProfile = booking as (Booking & { profiles?: { full_name: string; email: string; phone: string } }) | null;

  if (bookingWithProfile?.customer_id) {
    const { data: customerProfile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', bookingWithProfile.customer_id)
      .maybeSingle();

    bookingWithProfile = {
      ...(bookingWithProfile ?? {}),
      profiles: customerProfile ?? null,
    };
  }

  const { data: selections, error: selectionsError } = await supabase
    .from('booking_selections')
    .select('*')
    .eq('booking_id', bookingId);

  const { data: progress, error: progressError } = await supabase
    .from('booking_progress')
    .select('*')
    .eq('booking_id', bookingId)
    .order('sort_order');

  const { data: appointment, error: appointmentError } = await supabase
    .from('consultation_appointments')
    .select('*, profiles:planner_id(full_name)')
    .eq('booking_id', bookingId)
    .maybeSingle();

  return {
    booking: bookingWithProfile ?? null,
    selections: selections ?? [],
    progress: progress ?? [],
    appointment: appointment ?? null,
    error: bookingError ?? selectionsError ?? progressError ?? appointmentError ?? null,
  };
}

