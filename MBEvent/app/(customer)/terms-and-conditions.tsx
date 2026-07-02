import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function TermsAndConditionsScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Header title="Terms and Conditions" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>Terms and Conditions</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>By using MBEvents, you agree to our booking and payment processes as implemented in the platform. All customers must provide accurate event details and follow the booking confirmation workflow inside the mobile app.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>Transactions made through MBEvents are subject to the payment methods supported by the system. Reservation fees, booking totals, and refund policies are managed by the MBEvents backend and may be updated as needed.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>MBEvents is not responsible for event cancellations, vendor disputes, or external supplier arrangements beyond the customer-facing workflow provided inside the app. Customers are responsible for reviewing their booking details and reaching out to support for assistance.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg },
  heading: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.md },
  paragraph: { fontSize: FONT_SIZES.md, lineHeight: 22, marginBottom: SPACING.md },
});
