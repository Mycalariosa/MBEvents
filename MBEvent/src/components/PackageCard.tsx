import { FONT_SIZES, SPACING } from '@/src/constants';
import { useTheme } from '@/src/hooks/useTheme';
import type { Package } from '@/src/types/database';
import { formatCurrency } from '@/src/utils/pricing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PackageCardProps {
  pkg: Package;
  onPress: () => void;
  selected?: boolean;
}

export function PackageCard({ pkg, onPress, selected }: PackageCardProps) {
  const { colors } = useTheme();
  const tierColor = (tier: string) => {
    if (!tier) return colors.primary;
    const t = tier.toLowerCase();
    if (t === 'gold') return colors.accent;
    if (t === 'silver') return '#9aa0a9';
    if (t === 'bronze') return '#8b6c4a';
    return colors.primary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.tierBadge, { backgroundColor: tierColor(pkg.tier) }]}>
        <Text style={styles.tierText}>{pkg.tier.toUpperCase()}</Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{pkg.name}</Text>
      <Text style={[styles.price, { color: colors.accent }]}>{formatCurrency(Number(pkg.price))}</Text>
      <View style={styles.guestRow}>
        <MaterialCommunityIcons name="account-group" size={16} color={colors.textSecondary} />
        <Text style={[styles.guests, { color: colors.textSecondary }]}>{pkg.max_guests} Guests</Text>
      </View>
      {pkg.description && (
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
          {pkg.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md },
  tierBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 6, marginBottom: SPACING.sm },
  tierText: { color: '#FFF', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  name: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.xs },
  price: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.sm },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.sm },
  guests: { fontSize: FONT_SIZES.sm },
  desc: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
});
