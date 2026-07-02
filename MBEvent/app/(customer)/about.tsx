import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Header title="About MBEvents" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>About MBEvents</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>MBEvents is an event planning and booking platform that helps customers reserve packages, pay transactions, and track bookings in one mobile app. The system is designed to streamline event planning workflows and connect customers with event services securely through a Supabase-backed backend.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>This application supports package selection, booking details, payment tracking, transaction history, and customer support features. MBEvents was built to help users manage their event requirements clearly and keep payments, confirmations, and support information easy to access.</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>If you need help, use Contact Support to reach Myca Lariosa directly by phone or email. MBEvents is continuously updated to improve customer booking experience and support real-world event management needs.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg },
  heading: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.md },
  paragraph: { fontSize: FONT_SIZES.md, lineHeight: 22, marginBottom: SPACING.md },
});
