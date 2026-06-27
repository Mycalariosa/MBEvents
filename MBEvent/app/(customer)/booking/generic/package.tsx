import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, Input, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useGenericBookingStore } from '@/src/stores';
import { formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function GenericPackageScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { supplierName, setPackageInfo, packageName, packagePrice } = useGenericBookingStore();

  return (
    <ScreenContainer>
      <Header title="Choose Package" />
      <Text style={[styles.supplier, { color: colors.text }]}>{supplierName}</Text>
      <Input label="Package Name" value={packageName ?? ''} onChangeText={(v) => setPackageInfo(v, packagePrice)} placeholder="Basic Package" />
      <Input label="Price" value={packagePrice ? String(packagePrice) : ''} onChangeText={(v) => setPackageInfo(packageName ?? 'Package', parseFloat(v) || 0)} keyboardType="numeric" />
      {packagePrice > 0 && <Text style={[styles.preview, { color: colors.primary }]}>{formatCurrency(packagePrice)}</Text>}
      <Button title="Choose Date" onPress={() => router.push('/(customer)/booking/generic/date' as never)} disabled={!packageName || packagePrice <= 0} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  supplier: { fontSize: FONT_SIZES.lg, fontWeight: '600', marginBottom: SPACING.lg },
  preview: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.lg, textAlign: 'center' },
});
