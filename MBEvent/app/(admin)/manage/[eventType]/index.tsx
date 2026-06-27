import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { ADMIN_MODULE_CONFIGS } from '@/src/constants/adminModules';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function ManageEventTypeScreen() {
  const { eventType } = useLocalSearchParams<{ eventType: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const modules = ADMIN_MODULE_CONFIGS[eventType ?? ''] ?? [];
  const title = eventType?.charAt(0).toUpperCase() + (eventType?.slice(1) ?? '');

  return (
    <ScreenContainer scroll={false}>
      <Header title={`Manage ${title}`} />
      <FlatList
        data={modules}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/(admin)/manage/${eventType}/${item.route}` as never)}
          >
            <MaterialCommunityIcons name="database" size={24} color={colors.primary} />
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  name: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '500' },
});
