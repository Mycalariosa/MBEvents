import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, Button, Input } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { useWizardStore } from '@/src/stores';
import { createEventBooking } from '@/src/services/booking';
import { notifyNewBooking, notifyReservationSubmitted } from '@/src/services/notifications';
import { supabase } from '@/src/lib/supabase';
import { SPACING, FONT_SIZES } from '@/src/constants';

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EventDetailsScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const wizard = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const todayKey = formatDateKey(new Date());
  const selectedDateKey = wizard.eventDate ?? '';

  useEffect(() => {
    if (profile) {
      if (!wizard.customerName) wizard.setCustomerName(profile.full_name);
      if (!wizard.contactNumber && profile.phone) wizard.setContactNumber(profile.phone);
      if (!wizard.email) wizard.setEmail(profile.email);
    }
  }, [profile]);

  if (!wizard.selectedPackage || !profile) return null;

  const handleSubmit = async () => {
    if (!wizard.eventDate || !wizard.eventTime) {
      Alert.alert('Missing Info', 'Please enter event date and preferred time.');
      return;
    }
    if (!wizard.eventAddress.trim()) {
      Alert.alert('Missing Info', 'Please enter the event address.');
      return;
    }
    if (!wizard.customerName.trim() || !wizard.contactNumber.trim() || !wizard.email.trim()) {
      Alert.alert('Missing Info', 'Please fill in all personal information fields.');
      return;
    }

    setLoading(true);

    const { data: eventType } = await supabase
      .from('event_types')
      .select('id')
      .eq('slug', wizard.eventType)
      .single();

    if (!eventType) {
      setLoading(false);
      Alert.alert('Error', 'Event type not found');
      return;
    }

    const { booking, error } = await createEventBooking({
      customerId: profile.id,
      eventTypeId: (eventType as { id: string }).id,
      pkg: wizard.selectedPackage!,
      eventDate: wizard.eventDate,
      eventTime: wizard.eventTime,
      guestCount: wizard.guestCount,
      selections: wizard.selections,
      additionalRequests: wizard.additionalRequests,
      eventAddress: wizard.eventAddress,
      themeColor: wizard.themeColor,
      specialRequests: wizard.specialRequests,
    });

    setLoading(false);

    if (error || !booking) {
      Alert.alert('Error', error ?? 'Failed to submit booking');
      return;
    }

    await notifyReservationSubmitted(profile.id, booking.id);
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    if (admins) await notifyNewBooking(admins.map((a: { id: string }) => a.id), wizard.customerName || profile.full_name);

    wizard.reset();
    router.replace(`/(customer)/booking/confirmation/${booking.id}` as never);
  };

  return (
    <ScreenContainer>
      <Header title="Event Details" />

      <Text style={[styles.groupTitle, { color: colors.text }]}>Personal Information</Text>
      <Input label="Full Name" value={wizard.customerName} onChangeText={wizard.setCustomerName} placeholder="Your full name" />
      <Input label="Contact Number" value={wizard.contactNumber} onChangeText={wizard.setContactNumber} placeholder="09XX XXX XXXX" keyboardType="phone-pad" />
      <Input label="Email Address" value={wizard.email} onChangeText={wizard.setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />

      <Text style={[styles.groupTitle, { color: colors.text }]}>Event Information</Text>
      <TouchableOpacity onPress={() => setShowCalendar(true)}>
        <Input label="Event Date (tap to pick)" value={wizard.eventDate ?? ''} placeholder="Select a date" editable={false} />
      </TouchableOpacity>
      {wizard.eventDate ? (
        <View style={[styles.dateCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.dateLabel, { color: colors.text }]}>Selected Event Date</Text>
          <Text style={[styles.dateValue, { color: colors.primary }]}> 
            {new Date(`${wizard.eventDate}T00:00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      ) : null}
      <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ margin: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.card }}>
            <Calendar
              minDate={todayKey}
              current={todayKey}
              onDayPress={(day) => {
                if (day.dateString < todayKey) {
                  Alert.alert('Invalid Date', 'Please choose today or a future date for the event.');
                  return;
                }
                wizard.setEventDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={selectedDateKey ? { [selectedDateKey]: { selected: true } } : {}}
            />
            <View style={{ padding: SPACING.md }}>
              <Button title="Close" onPress={() => setShowCalendar(false)} />
            </View>
          </View>
        </View>
      </Modal>
      <Input label="Preferred Time (HH:MM)" value={wizard.eventTime ?? ''} onChangeText={wizard.setEventTime} placeholder="18:00" />
      <Input label="Event Address" value={wizard.eventAddress} onChangeText={wizard.setEventAddress} placeholder="Venue or event location" />
      <Input label="Number of Guests" value={String(wizard.guestCount)} onChangeText={(v) => wizard.setGuestCount(parseInt(v, 10) || 0)} keyboardType="number-pad" />
      <Input label="Theme Color" value={wizard.themeColor} onChangeText={wizard.setThemeColor} placeholder="e.g. Blush Pink & Gold" />
      <Input label="Special Requests" value={wizard.specialRequests} onChangeText={wizard.setSpecialRequests} multiline placeholder="Any special requests..." />
      <Input label="Additional Notes" value={wizard.additionalRequests} onChangeText={wizard.setAdditionalRequests} multiline placeholder="Anything else we should know..." />

      <Button title="Submit Booking" onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  groupTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md },
  dateCard: { borderWidth: 1, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md },
  dateLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  dateValue: { fontSize: FONT_SIZES.md, fontWeight: '700', marginTop: SPACING.xs },
});
