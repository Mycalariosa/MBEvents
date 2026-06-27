import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, Button, Input } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useWizardStore } from '@/src/stores';
import { calculatePricing, formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function ReviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { selectedPackage, selections, guestCount, additionalRequests, setAdditionalRequests, setEventDate, setEventTime, eventDate, eventTime } = useWizardStore();

  if (!selectedPackage) {
    router.back();
    return null;
  }

  const pricing = calculatePricing(selectedPackage, selections);

  return (
    <ScreenContainer>
      <Header title="Event Summary" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.packageName, { color: colors.text }]}>{selectedPackage.name}</Text>
        <Text style={[styles.guests, { color: colors.textSecondary }]}>{guestCount} Guests</Text>

        {selections.map((s) => (
          <View key={s.serviceType} style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{s.serviceType}</Text>
            <Text style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{s.itemName}</Text>
          </View>
        ))}

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
          <Text style={{ color: colors.text }}>{formatCurrency(pricing.subtotal)}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary }}>Service Fee</Text>
          <Text style={{ color: colors.text }}>{formatCurrency(pricing.serviceFee)}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total Package</Text>
          <Text style={[styles.total, { color: colors.primary }]}>{formatCurrency(pricing.total)}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary }}>Reservation Fee (30%)</Text>
          <Text style={{ color: colors.warning }}>{formatCurrency(pricing.reservationFee)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: colors.textSecondary }}>Remaining Balance</Text>
          <Text style={{ color: colors.text }}>{formatCurrency(pricing.remainingBalance)}</Text>
        </View>
      </View>

      <Input label="Event Date (YYYY-MM-DD)" value={eventDate ?? ''} onChangeText={setEventDate} placeholder="2026-12-25" />
      <Input label="Event Time (HH:MM)" value={eventTime ?? ''} onChangeText={setEventTime} placeholder="18:00" />
      <Input label="Additional Requests" value={additionalRequests} onChangeText={setAdditionalRequests} multiline placeholder="Any special requests..." />

      <Button title="Proceed to Payment" onPress={() => router.push('/(customer)/booking/payment' as never)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  packageName: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.xs },
  guests: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  label: { textTransform: 'capitalize' },
  totalLabel: { fontWeight: '700', fontSize: FONT_SIZES.md },
  total: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
});
