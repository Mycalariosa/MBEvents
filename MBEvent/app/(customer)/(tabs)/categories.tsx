import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, ScreenContainer } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { EVENT_CATEGORIES, SPACING, FONT_SIZES } from '@/src/constants';

export default function CategoriesScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <Header title="MBEvents" showBack={false} showLogo />
      <Text style={[styles.title, { color: colors.text }]}>Event Categories</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Choose an event type to browse suppliers and packages
      </Text>

      <FlatList
        data={EVENT_CATEGORIES}
        scrollEnabled={false}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/(customer)/category/${item.slug}` as never)}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={28}
                color={item.color}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                Browse suppliers & book packages
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  iconCircle: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, marginLeft: SPACING.md },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  cardDesc: { fontSize: FONT_SIZES.xs, marginTop: 2 },
});
