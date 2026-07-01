import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Header, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useWizardStore } from '@/src/stores';
import { formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function ReviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { selectedPackage, selections, eventType } = useWizardStore();

  if (!selectedPackage) {
    router.back();
    return null;
  }

  const packagePrice = Number(selectedPackage.price);

  return (
    <ScreenContainer>
      <Header title="Review Booking" />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Package</Text>
        <Text style={[styles.packageName, { color: colors.text }]}>{selectedPackage.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(packagePrice)}</Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          All customizations below are included in your package price.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Selected Inclusions</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {selections.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>No selections yet</Text>
        ) : (
          selections.map((s) => (
            <View key={s.serviceType} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{s.serviceType}</Text>
              <Text style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{s.itemName}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={[styles.editBtn, { borderColor: colors.border }]}
        onPress={() => router.push(`/(customer)/booking/${eventType}/customize/0` as never)}
      >
        <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '600' }}>Edit Selections</Text>
      </TouchableOpacity>

      <Button title="Continue to Event Details" onPress={() => router.push('/(customer)/booking/event-details' as never)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  sectionLabel: { fontSize: FONT_SIZES.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  packageName: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginTop: SPACING.xs },
  price: { fontSize: FONT_SIZES.xxl, fontWeight: '800', marginTop: SPACING.sm },
  note: { fontSize: FONT_SIZES.sm, marginTop: SPACING.sm, lineHeight: 20 },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  label: { textTransform: 'capitalize' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
});
