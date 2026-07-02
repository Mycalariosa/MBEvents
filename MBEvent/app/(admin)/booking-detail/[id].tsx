import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/hooks/useAuth';
import {
  getBookingDetail,
  updateBookingStatus,
  updateProgressStep,
} from '@/src/services/booking';
import { updateConsultationStatus } from '@/src/services/appointments';
import { formatCurrency, formatDate, formatTime } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES, BOOKING_STATUSES, CONSULTATION_STATUSES } from '@/src/constants';
import type { Booking, BookingProgress, BookingSelection, ConsultationAppointment, ConsultationStatus } from '@/src/types/database';

export default function AdminBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selections, setSelections] = useState<BookingSelection[]>([]);
  const [progress, setProgress] = useState<BookingProgress[]>([]);
  const [appointment, setAppointment] = useState<ConsultationAppointment | null>(null);

  const load = async () => {
    if (!id) return;
    const data = await getBookingDetail(id);
    setBooking(data.booking as Booking | null);
    setSelections(data.selections as BookingSelection[]);
    setProgress(data.progress as BookingProgress[]);
    setAppointment(data.appointment as ConsultationAppointment | null);
  };

  useEffect(() => { load(); }, [id]);

  const toggleStep = async (step: BookingProgress) => {
    await updateProgressStep(step.id, !step.is_completed);
    load();
  };

  const setConsultStatus = async (status: ConsultationStatus) => {
    if (!appointment) return;
    await updateConsultationStatus(appointment.id, status);
    load();
  };

  const markOngoing = async () => {
    if (!booking) return;
    await updateBookingStatus(booking.id, 'ongoing');
    load();
  };

  const markCompleted = async () => {
    if (!booking) return;
    await updateBookingStatus(booking.id, 'completed');
    Alert.alert('Success', 'Event marked as completed');
    load();
  };

  const assignPlanner = async () => {
    if (!booking || !profile) return;
    await updateBookingStatus(booking.id, booking.status, profile.id);
    Alert.alert('Success', 'Planner assigned');
    load();
  };

  if (!booking) return null;

  const statusInfo = BOOKING_STATUSES.find((s) => s.id === booking.status);
  const consultStatus = appointment
    ? CONSULTATION_STATUSES.find((s) => s.id === appointment.consultation_status)
    : null;
  const b = booking as Booking & {
    profiles?: { full_name: string; email: string; phone: string };
    event_types?: { name: string };
    packages?: { name: string };
  };

  return (
    <ScreenContainer>
      <Header title="Reservation Details" />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.customer, { color: colors.text }]}>{b.profiles?.full_name}</Text>
        <Text style={{ color: colors.textSecondary }}>{b.profiles?.email} · {b.profiles?.phone}</Text>
        <Text style={[styles.event, { color: colors.text }]}>{b.event_types?.name} · {b.packages?.name ?? 'Custom'}</Text>
        <Text style={{ color: colors.textSecondary }}>{formatDate(booking.event_date)} · {formatTime(booking.event_time)}</Text>
        {booking.event_address && <Text style={{ color: colors.textSecondary, marginTop: SPACING.xs }}>{booking.event_address}</Text>}
        {booking.guest_count && <Text style={{ color: colors.textSecondary }}>{booking.guest_count} guests · Theme: {booking.theme_color ?? 'N/A'}</Text>}
        <Text style={[styles.total, { color: colors.primary }]}>{formatCurrency(Number(booking.total))}</Text>
        <View style={[styles.badge, { backgroundColor: (statusInfo?.color ?? colors.primary) + '20' }]}>
          <Text style={{ color: statusInfo?.color, fontWeight: '600' }}>{statusInfo?.label}</Text>
        </View>
      </View>

      {selections.length > 0 && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Selected Choices</Text>
          {selections.map((s) => (
            <View key={s.id} style={[styles.selectionRow, { borderBottomColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, textTransform: 'capitalize', width: 120 }}>{s.service_type}</Text>
              <Text style={{ color: colors.text, flex: 1 }}>{s.item_name}</Text>
            </View>
          ))}
        </>
      )}

      {(booking.special_requests || booking.additional_requests) && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Special Requests</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>{booking.special_requests || booking.additional_requests}</Text>
        </>
      )}

      {appointment && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Consultation</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{appointment.appointment_ref}</Text>
            <Text style={{ color: colors.text, marginTop: SPACING.xs }}>
              {formatDate(appointment.consultation_date)} · {formatTime(appointment.consultation_time)}
            </Text>
            {consultStatus && (
              <View style={[styles.badge, { backgroundColor: consultStatus.color + '20', marginTop: SPACING.sm }]}>
                <Text style={{ color: consultStatus.color, fontWeight: '600' }}>{consultStatus.label}</Text>
              </View>
            )}
            <View style={styles.consultActions}>
              {(['waiting', 'in_consultation', 'finished'] as ConsultationStatus[]).map((s) => {
                const info = CONSULTATION_STATUSES.find((c) => c.id === s);
                const active = appointment.consultation_status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.consultBtn, { backgroundColor: active ? info?.color : colors.surface, borderColor: info?.color ?? colors.border }]}
                    onPress={() => setConsultStatus(s)}
                  >
                    <Text style={{ color: active ? '#FFF' : colors.text, fontSize: FONT_SIZES.xs, fontWeight: '600' }}>{info?.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>
      )}

      {booking.status === 'confirmed' && progress.length > 0 && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Event Preparation</Text>
          {progress.map((step) => (
            <TouchableOpacity key={step.id} onPress={() => toggleStep(step)} style={styles.stepRow}>
              <View style={[styles.checkbox, { backgroundColor: step.is_completed ? colors.success : colors.surface, borderColor: step.is_completed ? colors.success : colors.border }]}>
                {step.is_completed && <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={{ color: step.is_completed ? colors.text : colors.textSecondary, flex: 1 }}>{step.step_label}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={styles.actions}>
        {booking.status === 'approved' && !appointment && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.push({ pathname: '/(admin)/schedule-consultation/[id]' as never, params: { id: booking.id } } as never)}>
            <Text style={styles.btnText}>Schedule Consultation</Text>
          </TouchableOpacity>
        )}
        {booking.status === 'confirmed' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={assignPlanner}>
            <Text style={styles.btnText}>Assign Planner</Text>
          </TouchableOpacity>
        )}
        {booking.status === 'confirmed' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.warning }]} onPress={markOngoing}>
            <Text style={styles.btnText}>Mark Ongoing</Text>
          </TouchableOpacity>
        )}
        {(booking.status === 'ongoing' || booking.status === 'confirmed') && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={markCompleted}>
            <Text style={styles.btnText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  customer: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  event: { fontSize: FONT_SIZES.md, marginTop: SPACING.sm },
  total: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginTop: SPACING.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 8, marginTop: SPACING.sm },
  section: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.md },
  selectionRow: { flexDirection: 'row', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  consultActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  consultBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xl },
  btn: { flex: 1, minWidth: '45%', paddingVertical: SPACING.md, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '600' },
});
