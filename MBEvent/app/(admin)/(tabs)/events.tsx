import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

const EVENT_TYPES = [
  { slug: 'wedding', name: 'Wedding', icon: 'heart' as const, color: '#FF6B9D', desc: 'Manage wedding packages, venues, dresses, and more' },
  { slug: 'birthday', name: 'Birthday', icon: 'cake-variant' as const, color: '#FFB347', desc: 'Manage birthday themes, mascots, games, and more' },
];

export default function AdminEventsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Event Management</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select an event type to manage services</Text>

      {EVENT_TYPES.map((et) => (
        <TouchableOpacity
          key={et.slug}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push(`/(admin)/manage/${et.slug}` as never)}
        >
          <View style={[styles.iconCircle, { backgroundColor: et.color + '20' }]}>
            <MaterialCommunityIcons name={et.icon} size={32} color={et.color} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{et.name}</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{et.desc}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.lg },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.md },
  iconCircle: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: SPACING.md },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  cardDesc: { fontSize: FONT_SIZES.sm, marginTop: 2 },
});
