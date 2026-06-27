import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={colors.textSecondary} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, minHeight: 200 },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '600', marginTop: SPACING.md, textAlign: 'center' },
  message: { fontSize: FONT_SIZES.sm, marginTop: SPACING.sm, textAlign: 'center', lineHeight: 20 },
});
