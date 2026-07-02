import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAdminViewStore } from '@/src/stores';
import { useIsFocused } from '@react-navigation/native';
import { ScreenContainer, EmptyState } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookings, updateBookingStatus, requestBookingChanges } from '@/src/services/booking';
import { notifyBookingApproved, notifyBookingRejected, notifyChangesRequested } from '@/src/services/notifications';
import { formatCurrency, formatDate } from '@/src/utils/pricing';
import { BOOKING_STATUSES, SPACING, FONT_SIZES } from '@/src/constants';
import type { Booking } from '@/src/types/database';

export default function AdminBookingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string | undefined>();
  const [changeModal, setChangeModal] = useState<{ id: string; customerId: string } | null>(null);
  const [changeNotes, setChangeNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const queryStatus = typeof searchParams?.status === 'string' ? searchParams.status : undefined;
  const queryEventType = typeof searchParams?.eventType === 'string' ? searchParams.eventType : undefined;

  const load = async () => {
    setLoading(true);
    const customerId = useAdminViewStore.getState().bookingCustomerId;
    const { data, error } = await getBookings('', 'admin', filter ?? queryStatus, queryEventType, customerId);
    if (error) {
      setError(error.message ?? 'Failed to load reservations');
      setBookings([]);
      setLoading(false);
      return;
    }

    const activeStatus = filter ?? queryStatus;
    const filteredBookings = (data ?? []).filter((booking) => !activeStatus || booking.status === activeStatus);

    setError(null);
    setBookings(filteredBookings as Booking[]);
    setLoading(false);
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    const storeFilter = useAdminViewStore.getState().bookingFilter;
    const storeCustomerId = useAdminViewStore.getState().bookingCustomerId;
    if (storeFilter && !filter) {
      setFilter(storeFilter);
      // clear after consuming
      useAdminViewStore.getState().setBookingFilter(undefined);
    }
    if (storeCustomerId) {
      // clear after consuming
      useAdminViewStore.getState().setBookingCustomerId(undefined);
    }
    load();
  }, [filter, queryStatus, queryEventType, isFocused]);

  const handleApprove = (booking: Booking) => {
    Alert.alert('Approve Reservation', 'Open scheduler to schedule consultation for this reservation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Scheduler',
        onPress: () => {
          router.push({ pathname: '/(admin)/schedule-consultation/[id]' as never, params: { id: booking.id } } as never);
        },
      },
    ]);
  };

  const handleReject = (booking: Booking) => {
    Alert.alert('Reject Reservation', 'Are you sure you want to reject this reservation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await updateBookingStatus(booking.id, 'cancelled');
          await notifyBookingRejected(booking.customer_id, booking.id);
          load();
        },
      },
    ]);
  };

  const handleRequestChanges = async () => {
    if (!changeModal || !changeNotes.trim()) return;
    await requestBookingChanges(changeModal.id, changeNotes);
    await notifyChangesRequested(changeModal.customerId, changeModal.id, changeNotes);
    setChangeModal(null);
    setChangeNotes('');
    load();
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>Reservations</Text>
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(admin)/scan-appointment' as never)}
        >
          <Text style={styles.scanText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={[{ id: 'all', label: 'All' }, ...BOOKING_STATUSES]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 40, marginBottom: SPACING.md }}
        renderItem={({ item }) => {
          const activeStatus = filter ?? queryStatus;
          const selected = (item.id === 'all' && !activeStatus) || activeStatus === item.id;
          return (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.surface }]}
              onPress={() => setFilter(item.id === 'all' ? undefined : item.id)}
            >
              <Text style={{ color: selected ? '#FFF' : colors.text, fontSize: FONT_SIZES.sm, fontWeight: '600' }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {error ? (
        <EmptyState icon="alert-circle" title="Reservation load failed" message={error} />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <EmptyState icon="clipboard-text-off" title="No reservations" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const b = item as Booking & { profiles?: { full_name: string }; event_types?: { name: string }; packages?: { name: string } };
            const statusInfo = BOOKING_STATUSES.find((s) => s.id === b.status);
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(admin)/booking-detail/${b.id}` as never)}
              >
                <View style={styles.header}>
                  <Text style={[styles.customer, { color: colors.text }]}>{b.profiles?.full_name ?? 'Customer'}</Text>
                  <View style={[styles.badge, { backgroundColor: (statusInfo?.color ?? colors.primary) + '20' }]}>
                    <Text style={{ color: statusInfo?.color, fontSize: FONT_SIZES.xs, fontWeight: '600' }}>{statusInfo?.label}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZES.sm }}>
                  {b.event_types?.name} · {b.packages?.name ?? 'Custom'} · {formatDate(b.event_date)}
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '700', marginTop: SPACING.sm }}>{formatCurrency(Number(b.total))}</Text>
                {b.status === 'pending' && (
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => handleApprove(b)}>
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning }]} onPress={() => setChangeModal({ id: b.id, customerId: b.customer_id })}>
                      <Text style={styles.actionText}>Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={() => handleReject(b)}>
                      <Text style={styles.actionText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {b.status === 'approved' && (
                  <TouchableOpacity
                    style={[styles.scheduleBtn, { borderColor: colors.primary }]}
                    onPress={() => router.push({ pathname: '/(admin)/schedule-consultation/[id]' as never, params: { id: b.id } } as never)}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: FONT_SIZES.sm }}>Schedule Consultation</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal visible={!!changeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Request Changes</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Describe what the customer should update..."
              placeholderTextColor={colors.textSecondary}
              value={changeNotes}
              onChangeText={setChangeNotes}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setChangeModal(null)} style={styles.modalBtn}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRequestChanges} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700' },
  scanBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 8 },
  scanText: { color: '#FFF', fontWeight: '600', fontSize: FONT_SIZES.sm },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, marginRight: SPACING.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 8 },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#FFF', fontWeight: '600', fontSize: FONT_SIZES.sm },
  scheduleBtn: { marginTop: SPACING.sm, paddingVertical: SPACING.sm, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.lg },
  modal: { borderRadius: 16, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: SPACING.md, minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md, marginTop: SPACING.md },
  modalBtn: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
