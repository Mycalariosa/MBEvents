import appLogo from '@/assets/images/startup-logo.jpg';
import { FONT_SIZES, SPACING } from '@/src/constants';
import { useTheme } from '@/src/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: { icon: keyof typeof MaterialCommunityIcons.glyphMap; onPress: () => void };
  showLogo?: boolean;
}

export function Header({ title, showBack = true, rightAction, showLogo = false }: HeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: colors.primaryDark, borderBottomColor: 'transparent' }]}> 
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.accent} />
          </TouchableOpacity>
        ) : showLogo ? (
          <Image source={appLogo} style={styles.logo} resizeMode="contain" />
        ) : (
          <View style={styles.sidePlaceholder} />
        )}
      </View>

      <View style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.accent }]} numberOfLines={1}>{title}</Text>
      </View>

      <View style={styles.rightContainer}>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.iconButton}>
            <MaterialCommunityIcons name={rightAction.icon} size={24} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sidePlaceholder} />
        )}
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  leftContainer: { width: 52, alignItems: 'center', justifyContent: 'center' },
  rightContainer: { width: 44, alignItems: 'center', justifyContent: 'center' },
  sidePlaceholder: { width: 48, height: 48 },
  titleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 48, height: 48, borderRadius: 12 },
  title: { flexShrink: 1, fontSize: FONT_SIZES.lg, fontWeight: '700', textAlign: 'center' },
});
