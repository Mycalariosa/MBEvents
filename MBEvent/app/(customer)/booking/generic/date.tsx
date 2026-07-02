import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ScreenContainer, Header, Button } from '@/src/components';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useGenericBookingStore } from '@/src/stores';
import { SPACING, FONT_SIZES } from '@/src/constants';

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function GenericDateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { eventDate, setEventDate } = useGenericBookingStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const todayKey = formatDateKey(new Date());

  return (
    <ScreenContainer>
      <Header title="Choose Date" />
      <TouchableOpacity onPress={() => setShowCalendar(true)}>
        <View style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.dateInputLabel, { color: colors.textSecondary }]}>Event Date</Text>
          <Text style={[styles.dateInputValue, { color: colors.text }]}>{eventDate ?? 'Select a date'}</Text>
        </View>
      </TouchableOpacity>
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
                setEventDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={eventDate ? { [eventDate]: { selected: true } } : {}}
            />
            <View style={{ padding: SPACING.md }}>
              <Button title="Close" onPress={() => setShowCalendar(false)} />
            </View>
          </View>
        </View>
      </Modal>
      {eventDate ? (
        <View style={[styles.dateCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.dateLabel, { color: colors.text }]}>Selected Event Date</Text>
          <Text style={[styles.dateValue, { color: colors.primary }]}> 
            {new Date(`${eventDate}T00:00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      ) : null}
      <Button title="Choose Time" onPress={() => router.push('/(customer)/booking/generic/time' as never)} disabled={!eventDate} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateCard: { borderWidth: 1, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md },
  dateLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  dateValue: { fontSize: FONT_SIZES.md, fontWeight: '700', marginTop: SPACING.xs },
  dateInput: { borderWidth: 1, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md },
  dateInputLabel: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.xs },
  dateInputValue: { fontSize: FONT_SIZES.md, fontWeight: '600' },
});
