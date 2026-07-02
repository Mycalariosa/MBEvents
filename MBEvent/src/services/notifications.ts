import { supabase } from '@/src/lib/supabase';
import { presentLocalNotification } from '@/src/services/pushNotifications';

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  const response = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data ?? {},
  });

  void presentLocalNotification(params.title, params.body);

  return response;
}

export async function notifyBookingApproved(userId: string, bookingId: string) {
  return createNotification({
    userId,
    type: 'booking_approved',
    title: 'Reservation Approved',
    body: 'Your reservation has been approved. We will schedule your consultation appointment shortly.',
    data: { bookingId },
  });
}

export async function notifyConsultationScheduled(
  userId: string,
  bookingId: string,
  appointmentRef: string,
  date: string,
  time: string
) {
  return createNotification({
    userId,
    type: 'consultation_scheduled',
    title: 'Consultation Scheduled',
    body: `Your consultation appointment (${appointmentRef}) is set for ${date} at ${time}.`,
    data: { bookingId, appointmentRef },
  });
}

export async function notifyChangesRequested(userId: string, bookingId: string, notes: string) {
  return createNotification({
    userId,
    type: 'changes_requested',
    title: 'Changes Requested',
    body: notes || 'The admin has requested changes to your reservation.',
    data: { bookingId },
  });
}

export async function notifyReservationSubmitted(userId: string, bookingId: string) {
  return createNotification({
    userId,
    type: 'reservation_submitted',
    title: 'Reservation Submitted',
    body: 'Your reservation has been submitted and is pending review.',
    data: { bookingId },
  });
}

export async function notifyBookingRejected(userId: string, bookingId: string) {
  return createNotification({
    userId,
    type: 'booking_rejected',
    title: 'Booking Rejected',
    body: 'Unfortunately, your booking was not approved.',
    data: { bookingId },
  });
}

export async function notifyPaymentSuccess(userId: string, amount: number, ref: string) {
  const { data: existing, error: existingError } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'payment_success')
    .eq('data->>ref', ref)
    .maybeSingle();

  if (!existingError && existing) {
    return null;
  }

  return createNotification({
    userId,
    type: 'payment_success',
    title: 'Payment Successful',
    body: `Payment of ₱${amount.toLocaleString()} received. Ref: ${ref}`,
    data: { amount, ref },
  });
}

export async function notifyNewBooking(adminIds: string[], customerName: string) {
  const inserts = adminIds.map((userId) => ({
    user_id: userId,
    type: 'new_booking',
    title: 'New Reservation',
    body: `${customerName} submitted a new reservation request.`,
    data: {},
  }));
  return supabase.from('notifications').insert(inserts);
}

export async function toggleFavorite(userId: string, serviceType: string, serviceItemId: string, itemName: string) {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('service_type', serviceType)
    .eq('service_item_id', serviceItemId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', (existing as { id: string }).id);
    return false;
  }

  await supabase.from('favorites').insert({
    user_id: userId,
    service_type: serviceType,
    service_item_id: serviceItemId,
    item_name: itemName,
  });
  return true;
}

export async function getFavorites(userId: string) {
  const { data } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getDashboardStats() {
  const [customers, bookings, payments] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
    supabase.from('bookings').select('*, event_types(slug)'),
    supabase.from('payments').select('amount').eq('status', 'paid'),
  ]);

  const allBookings = (bookings.data ?? []) as Array<{ status: string; event_types?: { slug: string } }>;
  const bookedStatuses = new Set(['approved', 'confirmed', 'ongoing', 'completed']);
  const isBooked = (booking: { status: string }) => bookedStatuses.has(booking.status);

  const weddingCount = allBookings.filter((b) => b.event_types?.slug === 'wedding' && isBooked(b)).length;
  const birthdayCount = allBookings.filter((b) => b.event_types?.slug === 'birthday' && isBooked(b)).length;
  const pending = allBookings.filter((b) => b.status === 'pending').length;
  const approved = allBookings.filter((b) => b.status === 'approved').length;
  const confirmed = allBookings.filter((b) => b.status === 'confirmed').length;
  const revenue = ((payments.data ?? []) as Array<{ amount: number }>).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  return {
    totalCustomers: customers.count ?? 0,
    weddingBookings: weddingCount,
    birthdayBookings: birthdayCount,
    pendingReservations: pending,
    approvedReservations: approved,
    confirmedReservations: confirmed,
    monthlyRevenue: revenue,
    upcomingEvents: allBookings.filter((b) => b.status === 'confirmed' || b.status === 'ongoing').length,
  };
}

export async function getReportData() {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, event_types(name), packages(name)');

  const { data: selections } = await supabase.from('booking_selections').select('*');

  const venueCounts: Record<string, number> = {};
  const photoCounts: Record<string, number> = {};
  const packageCounts: Record<string, number> = {};

  (selections ?? []).forEach((s: { service_type: string; item_name: string }) => {
    if (s.service_type === 'venue') venueCounts[s.item_name] = (venueCounts[s.item_name] ?? 0) + 1;
    if (s.service_type === 'photography') photoCounts[s.item_name] = (photoCounts[s.item_name] ?? 0) + 1;
  });

  (bookings ?? []).forEach((b: { packages?: { name: string } }) => {
    const name = b.packages?.name ?? 'Custom';
    packageCounts[name] = (packageCounts[name] ?? 0) + 1;
  });

  const topVenue = Object.entries(venueCounts).sort((a, b) => b[1] - a[1])[0];
  const topPhoto = Object.entries(photoCounts).sort((a, b) => b[1] - a[1])[0];
  const topPackage = Object.entries(packageCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    totalBookings: bookings?.length ?? 0,
    topVenue: topVenue ? { name: topVenue[0], count: topVenue[1] } : null,
    topPhotographer: topPhoto ? { name: topPhoto[0], count: topPhoto[1] } : null,
    topPackage: topPackage ? { name: topPackage[0], count: topPackage[1] } : null,
    bookings: bookings ?? [],
  };
}
