import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
// Camera functionality temporarily disabled due to SDK mismatch
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { getAppointmentByRef } from '@/src/services/appointments';
import { getBookingDetail, parseBookingQrPayload } from '@/src/services/booking';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function ScanAppointmentScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [manualRef, setManualRef] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const openBooking = async (ref: string) => {
    const trimmed = ref.trim();
    const bookingIdFromQr = parseBookingQrPayload(trimmed);

    if (bookingIdFromQr) {
      try {
        const { booking } = await getBookingDetail(bookingIdFromQr);
        if (!booking) {
          Alert.alert('Not Found', 'No booking found with this QR code.');
          setScanned(false);
          return;
        }

        router.replace(`/(admin)/booking-detail/${bookingIdFromQr}` as never);
        return;
      } catch {
        Alert.alert('Not Found', 'No booking found with this QR code.');
        setScanned(false);
        return;
      }
    }

    const lookup = trimmed.toUpperCase();
    if (!lookup.startsWith('APT-')) {
      Alert.alert('Invalid Code', 'Scan a booking QR or enter an appointment ID that starts with APT-.');
      setScanned(false);
      return;
    }

    const { appointment, error } = await getAppointmentByRef(lookup);
    if (error || !appointment) {
      Alert.alert('Not Found', 'No appointment found with this ID.');
      setScanned(false);
      return;
    }

    const bookingId = (appointment as { booking_id: string }).booking_id;
    router.replace(`/(admin)/booking-detail/${bookingId}` as never);
  };

  const handleBarcode = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    openBooking(data);
  };

  // Camera permission flow disabled — fall back to manual lookup

  return (
    <ScreenContainer scroll={false}>
      <Header title="Scan Booking QR" />

      {scanning ? (
        <View style={styles.cameraWrap}>
          <View style={styles.camera} />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Point camera at the customer's appointment QR code
          </Text>
        </View>
      ) : null}

      <View style={[styles.manual, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.manualTitle, { color: colors.text }]}>Or enter Appointment ID</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="APT-000421"
          placeholderTextColor={colors.textSecondary}
          value={manualRef}
          onChangeText={setManualRef}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => openBooking(manualRef)}
        >
          <Text style={styles.btnText}>Look Up</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  cameraWrap: { flex: 1, marginBottom: SPACING.lg },
  camera: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  hint: { textAlign: 'center', marginTop: SPACING.md, fontSize: FONT_SIZES.sm },
  manual: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg },
  manualTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', marginBottom: SPACING.sm },
  input: { borderWidth: 1, borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.md, fontSize: FONT_SIZES.md },
  btn: { paddingVertical: SPACING.md, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '600' },
});
