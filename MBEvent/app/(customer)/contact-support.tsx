import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { ScreenContainer, Header, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function ContactSupportScreen() {
  const { colors } = useTheme();
  const phone = '09999221439';
  const email = 'mycalariosa12@gmail.com';

  return (
    <ScreenContainer>
      <Header title="Contact Support" />
      <View style={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>Contact Support</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>Reach out to Myca Lariosa for any support related to MBEvents. You can call or send an email with your booking or transaction questions.</Text>
        <View style={styles.infoBox}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Support Representative</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>Myca Lariosa</Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)}>
            <Text style={[styles.link, { color: colors.primary }]}>{phone}</Text>
          </TouchableOpacity>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
            <Text style={[styles.link, { color: colors.primary }]}>{email}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg },
  heading: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.md },
  paragraph: { fontSize: FONT_SIZES.md, lineHeight: 22, marginBottom: SPACING.lg },
  infoBox: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, borderColor: '#CCC' },
  infoLabel: { fontSize: FONT_SIZES.xs, textTransform: 'uppercase', marginTop: SPACING.sm },
  infoValue: { fontSize: FONT_SIZES.md, fontWeight: '700', marginTop: SPACING.xs },
  link: { fontSize: FONT_SIZES.md, fontWeight: '700', marginTop: SPACING.xs },
});
