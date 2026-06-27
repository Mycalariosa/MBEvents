import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.value, { color: color ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.md,
    flex: 1,
    minWidth: '45%',
    marginBottom: SPACING.sm,
  },
  value: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
  label: { fontSize: FONT_SIZES.xs, marginTop: SPACING.xs },
});
