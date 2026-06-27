import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, Input, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useGenericBookingStore } from '@/src/stores';
import { formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function GenericRequestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const store = useGenericBookingStore();

  return (
    <ScreenContainer>
      <Header title="Review Booking" />
      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.row, { color: colors.text }]}>{store.supplierName}</Text>
        <Text style={{ color: colors.textSecondary }}>{store.packageName} · {formatCurrency(store.packagePrice)}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: SPACING.sm }}>{store.eventDate} at {store.eventTime}</Text>
      </View>
      <Input label="Additional Requests" value={store.additionalRequests} onChangeText={store.setAdditionalRequests} multiline />
      <Button title="Proceed to Payment" onPress={() => router.push('/(customer)/booking/generic/payment' as never)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: { borderRadius: 12, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  row: { fontSize: FONT_SIZES.lg, fontWeight: '600' },
});
