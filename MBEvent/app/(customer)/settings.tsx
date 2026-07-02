import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useThemeStore } from '@/src/stores';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const router = useRouter();

  const settingsItems = [
    { label: 'Dark Mode', toggle: true, value: isDark, onToggle: toggleTheme },
    { label: 'Light Mode', toggle: true, value: !isDark, onToggle: () => toggleTheme() },
    { label: 'Notification Settings', action: () => router.push('/(customer)/notification-settings' as never) },
    { label: 'Privacy Policy', action: () => router.push('/(customer)/privacy-policy' as never) },
    { label: 'Terms and Conditions', action: () => router.push('/(customer)/terms-and-conditions' as never) },
    { label: 'Help Center', action: () => router.push('/(customer)/help-center' as never) },
    { label: 'Contact Support', action: () => router.push('/(customer)/contact-support' as never) },
    { label: 'About MBEvents', action: () => router.push('/(customer)/about' as never) },
  ];

  return (
    <ScreenContainer>
      <Header title="Settings" />
      {settingsItems.map((item) => (
        <View key={item.label} style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
          {item.toggle ? (
            <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ true: colors.primary }} />
          ) : (
            <TouchableOpacity onPress={item.action}>
              <Text style={{ color: colors.primary }}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Text style={[styles.version, { color: colors.textSecondary }]}>MBEvents v1.0.0</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  label: { fontSize: FONT_SIZES.md },
  version: { textAlign: 'center', marginTop: SPACING.xl, fontSize: FONT_SIZES.sm },
});
