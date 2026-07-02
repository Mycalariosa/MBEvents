import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Header, Button, Input } from '@/src/components';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookingDetail } from '@/src/services/booking';
import { scheduleConsultation } from '@/src/services/appointments';
import { notifyConsultationScheduled, notifyBookingApproved } from '@/src/services/notifications';
import { updateBookingStatus } from '@/src/services/booking';
import { formatDate } from '@/src/utils/pricing';
import { BRANCH_LOCATIONS, SPACING, FONT_SIZES } from '@/src/constants';
import type { Booking } from '@/src/types/database';

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ScheduleConsultationScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [branchLocation, setBranchLocation] = useState(BRANCH_LOCATIONS[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const minConsultationDate = formatDateInput(new Date());
  const bookingId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  useEffect(() => {
    if (!bookingId) {
      setErrorMsg('Reservation not found');
      setBooking(null);
      setIsLoadingBooking(false);
      return;
    }

    const loadBooking = async () => {
      setIsLoadingBooking(true);
      setErrorMsg(null);

      try {
        const { booking: b, appointment, error } = await getBookingDetail(bookingId);

        if (error) {
          setErrorMsg(error.message ?? 'Failed to load reservation');
          setBooking(null);
        } else if (!b) {
          setErrorMsg('Reservation not found');
          setBooking(null);
        } else {
          setBooking(b as Booking);
          if (appointment) {
            Alert.alert('Already Scheduled', 'This reservation already has a consultation appointment.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          }
        }
      } catch (err) {
        setErrorMsg(err?.message ?? 'Failed to load reservation');
        setBooking(null);
      } finally {
        setIsLoadingBooking(false);
      }
    };

    loadBooking();
  }, [bookingId, router]);

  const handleConfirm = async () => {
    if (!id || !booking || !consultationDate || !consultationTime) {
      Alert.alert('Missing Info', 'Please enter consultation date and time.');
      return;
    }

    if (consultationDate < minConsultationDate) {
      Alert.alert('Invalid Date', 'Please choose today or a future date for the consultation.');
      return;
    }

    setLoading(true);
    const { appointment, error } = await scheduleConsultation({
      bookingId: id,
      consultationDate,
      consultationTime,
      branchLocation,
      plannerId: profile?.id,
      notes,
    });
    setLoading(false);

    if (error || !appointment) {
      Alert.alert('Error', error ?? 'Failed to schedule consultation');
      return;
    }

    // mark booking as approved and notify customer
    await updateBookingStatus(booking.id, 'approved');
    await notifyBookingApproved(booking.customer_id, booking.id);

    await notifyConsultationScheduled(
      booking.customer_id,
      booking.id,
      appointment.appointment_ref,
      formatDate(consultationDate),
      consultationTime
    );

    Alert.alert(
      'Appointment Confirmed',
      `Appointment ${appointment.appointment_ref} has been created. The customer will receive their appointment pass.`,
      [{ text: 'OK', onPress: () => router.replace({ pathname: '/(admin)/booking-detail/[id]' as never, params: { id: bookingId } } as never) }]
    );
  };

  if (isLoadingBooking) {
    return (
      <ScreenContainer>
        <Header title="Schedule Consultation" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (errorMsg || !booking) {
    return (
      <ScreenContainer>
        <Header title="Schedule Consultation" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg }}>
          <Text style={{ color: colors.error, fontSize: FONT_SIZES.lg, fontWeight: '600', textAlign: 'center' }}>
            {errorMsg ?? 'Reservation not found'}
          </Text>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary, marginTop: SPACING.lg }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const b = booking as Booking & { profiles?: { full_name: string }; packages?: { name: string }; event_types?: { name: string } };

  return (
    <ScreenContainer>
      <Header title="Schedule Consultation" />

      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.customer, { color: colors.text }]}>{b.profiles?.full_name}</Text>
        <Text style={{ color: colors.textSecondary }}>{b.event_types?.name} · {b.packages?.name}</Text>
      </View>

      <TouchableOpacity onPress={() => setShowCalendar(true)}>
        <Input label="Consultation Date (tap to pick)" value={consultationDate} placeholder="Select a date" editable={false} />
      </TouchableOpacity>
      <Input label="Consultation Time (HH:MM)" value={consultationTime} onChangeText={setConsultationTime} placeholder="14:00" />

      <Text style={[styles.label, { color: colors.text }]}>Branch / Office Location</Text>
      {BRANCH_LOCATIONS.map((loc) => (
        <TouchableOpacity
          key={loc}
          style={[styles.locCard, { backgroundColor: branchLocation === loc ? colors.primary + '15' : colors.card, borderColor: branchLocation === loc ? colors.primary : colors.border }]}
          onPress={() => { setBranchLocation(loc); setCustomLocation(''); }}
        >
          <Text style={{ color: colors.text, fontSize: FONT_SIZES.sm }}>{loc}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.locCard, { backgroundColor: branchLocation === 'Other' ? colors.primary + '15' : colors.card, borderColor: branchLocation === 'Other' ? colors.primary : colors.border }]}
        onPress={() => setBranchLocation('Other')}
      >
        <Text style={{ color: colors.text, fontSize: FONT_SIZES.sm }}>Other / Custom Location</Text>
      </TouchableOpacity>
      {branchLocation === 'Other' && (
        <Input label="Custom Meet-up Location" value={customLocation} onChangeText={(t) => { setCustomLocation(t); setBranchLocation(t); }} placeholder="Enter address or details" />
      )}

      <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ margin: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.card }}>
            <Calendar
              minDate={minConsultationDate}
              onDayPress={(day) => {
                if (day.dateString < minConsultationDate) {
                  Alert.alert('Invalid Date', 'Please choose today or a future date for the consultation.');
                  return;
                }
                setConsultationDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={consultationDate ? { [consultationDate]: { selected: true } } : {}}
            />
            <View style={{ padding: SPACING.md }}>
              <Button title="Close" onPress={() => setShowCalendar(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Input label="Notes for Customer (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Any notes for the customer..." />

      {profile && (
        <Text style={[styles.planner, { color: colors.textSecondary }]}>
          Planner: {profile.full_name}
        </Text>
      )}

      <Button title="Confirm Appointment" onPress={handleConfirm} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: { borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.lg },
  customer: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', marginBottom: SPACING.sm },
  locCard: { borderRadius: 10, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  planner: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.lg, marginTop: SPACING.sm },
  btn: { borderRadius: 10, padding: SPACING.md, alignItems: 'center' },
});
