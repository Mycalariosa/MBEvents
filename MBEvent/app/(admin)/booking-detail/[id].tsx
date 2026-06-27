import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Header, ProgressTimeline } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/hooks/useAuth';
import { getBookingDetail, updateBookingStatus } from '@/src/services/booking';
import { updateProgressStep } from '@/src/services/booking';
import { formatCurrency, formatDate } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES, BOOKING_STATUSES } from '@/src/constants';
import type { Booking, BookingProgress, BookingSelection } from '@/src/types/database';

export default function AdminBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selections, setSelections] = useState<BookingSelection[]>([]);
  const [progress, setProgress] = useState<BookingProgress[]>([]);

  const load = async () => {
    if (!id) return;
    const data = await getBookingDetail(id);
    setBooking(data.booking as Booking | null);
    setSelections(data.selections as BookingSelection[]);
    setProgress(data.progress as BookingProgress[]);
  };

  useEffect(() => { load(); }, [id]);

  const toggleStep = async (step: BookingProgress) => {
    await updateProgressStep(step.id, !step.is_completed);
    load();
  };

  const assignPlanner = async () => {
    if (!booking || !profile) return;
    await updateBookingStatus(booking.id, 'confirmed', profile.id);
    Alert.alert('Success', 'Planner assigned and booking confirmed');
    load();
  };

  const markCompleted = async () => {
    if (!booking) return;
    await updateBookingStatus(booking.id, 'completed');
    Alert.alert('Success', 'Booking marked as completed');
    load();
  };

  if (!booking) return null;

  const statusInfo = BOOKING_STATUSES.find((s) => s.id === booking.status);
  const b = booking as Booking & { profiles?: { full_name: string; email: string }; event_types?: { name: string }; packages?: { name: string } };

  return (
    <ScreenContainer>
      <Header title="Booking Details" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.customer, { color: colors.text }]}>{b.profiles?.full_name}</Text>
        <Text style={{ color: colors.textSecondary }}>{b.profiles?.email}</Text>
        <Text style={[styles.event, { color: colors.text }]}>{b.event_types?.name} · {b.packages?.name ?? 'Custom'}</Text>
        <Text style={{ color: colors.textSecondary }}>{formatDate(booking.event_date)}</Text>
        <Text style={[styles.total, { color: colors.primary }]}>{formatCurrency(Number(booking.total))}</Text>
        <View style={[styles.badge, { backgroundColor: (statusInfo?.color ?? colors.primary) + '20' }]}>
          <Text style={{ color: statusInfo?.color, fontWeight: '600' }}>{statusInfo?.label}</Text>
        </View>
      </View>

      {selections.length > 0 && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Selections</Text>
          {selections.map((s) => (
            <Text key={s.id} style={{ color: colors.textSecondary, marginBottom: 4 }}>{s.item_name}</Text>
          ))}
        </>
      )}

      <Text style={[styles.section, { color: colors.text }]}>Planner Progress</Text>
      {progress.map((step) => (
        <TouchableOpacity key={step.id} onPress={() => toggleStep(step)} style={styles.stepRow}>
          <View style={[styles.checkbox, { backgroundColor: step.is_completed ? colors.success : colors.surface, borderColor: step.is_completed ? colors.success : colors.border }]}>
            {step.is_completed && <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>}
          </View>
          <Text style={{ color: step.is_completed ? colors.text : colors.textSecondary, flex: 1 }}>{step.step_label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={assignPlanner}>
          <Text style={styles.btnText}>Assign Planner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={markCompleted}>
          <Text style={styles.btnText}>Mark Completed</Text>
        </TouchableOpacity>
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
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
  btn: { flex: 1, paddingVertical: SPACING.md, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '600' },
});
