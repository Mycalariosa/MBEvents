import { supabase } from '@/src/lib/supabase';

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  return supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data ?? {},
  });
}

export async function notifyBookingApproved(userId: string, bookingId: string) {
  return createNotification({
    userId,
    type: 'booking_approved',
    title: 'Booking Approved',
    body: 'Your booking has been approved by our team.',
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
    body: `${customerName} submitted a new booking request.`,
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
  const weddingCount = allBookings.filter((b) => b.event_types?.slug === 'wedding').length;
  const birthdayCount = allBookings.filter((b) => b.event_types?.slug === 'birthday').length;
  const pending = allBookings.filter((b) => b.status === 'pending').length;
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
