import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { COLORS, SPACING, FONT_SIZES } from '@/src/constants';

export default function ConfirmationScreen() {
  const { id, ref } = useLocalSearchParams<{ id: string; ref: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
          <MaterialCommunityIcons name="check-circle" size={80} color={colors.success} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Booking Confirmed!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your reservation has been submitted successfully.
        </Text>
        {ref && (
          <View style={[styles.refBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.refLabel, { color: colors.textSecondary }]}>Reference Number</Text>
            <Text style={[styles.refNumber, { color: colors.primary }]}>{ref}</Text>
          </View>
        )}
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          You will receive a notification once your booking is approved by our team.
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
  refBox: { borderRadius: 12, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg, width: '100%' },
  refLabel: { fontSize: FONT_SIZES.sm },
  refNumber: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginTop: SPACING.xs },
  note: { fontSize: FONT_SIZES.sm, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20 },
});
