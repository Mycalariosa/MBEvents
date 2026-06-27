import { FONT_SIZES, SPACING } from '@/src/constants';
import { useTheme } from '@/src/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: { icon: keyof typeof MaterialCommunityIcons.glyphMap; onPress: () => void };
}

export function Header({ title, showBack = true, rightAction }: HeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: colors.primaryDark, borderBottomColor: 'transparent' }]}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.accent} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
      <Text style={[styles.title, { color: '#FFF' }]} numberOfLines={1}>{title}</Text>
      {rightAction ? (
        <TouchableOpacity onPress={rightAction.onPress} style={styles.backBtn}>
          <MaterialCommunityIcons name={rightAction.icon} size={24} color={colors.accent} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'center' },
  title: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '700', textAlign: 'center' },
});
