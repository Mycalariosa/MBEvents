import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Header title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>MBEvents is committed to protecting the privacy of our customers. We collect personal information to support booking, payment, and customer support interactions within the MBEvents platform.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>Information collected may include name, email, phone number, event details, booking and payment history, and customer support communications. This data is used to provide a seamless event booking experience and improve service quality.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>We do not share customer information with third parties except when required to complete bookings, process payments, or respond to legal requests. MBEvents uses secure Supabase services to store and manage your data.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg },
  heading: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.md },
  paragraph: { fontSize: FONT_SIZES.md, lineHeight: 22, marginBottom: SPACING.md },
});
