import { supabase } from '@/src/lib/supabase';
import type { ConsultationAppointment, ConsultationStatus } from '@/src/types/database';

export async function getAppointmentByBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('consultation_appointments')
    .select('*, profiles:planner_id(full_name)')
    .eq('booking_id', bookingId)
    .maybeSingle();
  return { appointment: data as ConsultationAppointment | null, error };
}

export async function getAppointmentByRef(ref: string) {
  const { data, error } = await supabase
    .from('consultation_appointments')
    .select('*, bookings(*, packages(name), event_types(name, slug))')
    .eq('appointment_ref', ref)
    .maybeSingle();
  return { appointment: data, error };
}

export async function scheduleConsultation(params: {
  bookingId: string;
  consultationDate: string;
  consultationTime: string;
  branchLocation?: string;
  plannerId?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('consultation_appointments')
    .insert({
      booking_id: params.bookingId,
      consultation_date: params.consultationDate,
      consultation_time: params.consultationTime,
      branch_location: params.branchLocation ?? null,
      planner_id: params.plannerId ?? null,
      notes: params.notes ?? null,
      consultation_status: 'waiting',
    })
    .select('*, profiles:planner_id(full_name)')
    .single();

  return { appointment: data as ConsultationAppointment | null, error: error?.message ?? null };
}

export async function updateConsultationStatus(
  appointmentId: string,
  status: ConsultationStatus
) {
  return supabase
    .from('consultation_appointments')
    .update({ consultation_status: status })
    .eq('id', appointmentId);
}

export async function submitBookingReview(params: {
  bookingId: string;
  customerId: string;
  rating: number;
  reviewText: string;
}) {
  return supabase.from('booking_reviews').insert({
    booking_id: params.bookingId,
    customer_id: params.customerId,
    rating: params.rating,
    review_text: params.reviewText,
  });
}

export async function getBookingReview(bookingId: string) {
  const { data } = await supabase
    .from('booking_reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();
  return data;
}
