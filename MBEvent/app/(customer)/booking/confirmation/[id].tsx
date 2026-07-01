import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
          <MaterialCommunityIcons name="clock-outline" size={80} color={colors.warning} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Reservation Submitted</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your reservation has been successfully submitted.
        </Text>
        <View style={[styles.statusBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
          <Text style={{ color: colors.text, fontWeight: '600' }}>Pending Review</Text>
        </View>
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Our event planner will review your request and schedule a consultation appointment. You will receive a notification once your appointment is confirmed.
        </Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          No appointment pass or QR code is generated yet.
        </Text>
        <Button title="View Booking" onPress={() => router.replace(`/(customer)/booking-detail/${id}` as never)} />
        <Button title="Back to Home" variant="outline" onPress={() => router.replace('/(customer)/(tabs)/home' as never)} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '800', marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.md, textAlign: 'center', marginBottom: SPACING.lg },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.lg },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  note: { fontSize: FONT_SIZES.sm, textAlign: 'center', marginBottom: SPACING.md, lineHeight: 20 },
});
