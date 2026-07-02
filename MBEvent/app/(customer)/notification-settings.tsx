import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Header title="Notification Settings" />
      <View style={styles.body}>
        <Text style={[styles.header, { color: colors.text }]}>Notification Settings</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Manage your notification preferences and stay up to date with booking updates, reminders, and support alerts from MBEvents.
        </Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>This is a placeholder page so users can access notification options in the current app flow.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { padding: SPACING.lg },
  header: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.md },
  text: { fontSize: FONT_SIZES.md, lineHeight: 22 },
  note: { marginTop: SPACING.lg, fontSize: FONT_SIZES.sm },
});
