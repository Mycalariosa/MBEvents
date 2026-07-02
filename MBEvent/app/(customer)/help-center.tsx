import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function HelpCenterScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Header title="Help Center" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>Help Center</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>Need help using MBEvents? This page connects you to the most common support topics and explains how to manage bookings, payments, and customer details.</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Questions</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>- How do I view my booking details? Use the transaction and booking history screens in your profile.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>- How do I pay for my reservation? Use the payment workflow included in your booking details page.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>- How do I contact support? Tap Contact Support on the settings screen to get the support phone number and email.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg },
  heading: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  paragraph: { fontSize: FONT_SIZES.md, lineHeight: 22, marginBottom: SPACING.md },
});
