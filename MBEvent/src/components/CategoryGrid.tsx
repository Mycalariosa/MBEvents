import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES, EVENT_CATEGORIES } from '@/src/constants';

export function CategoryGrid() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <FlatList
      data={EVENT_CATEGORIES}
      numColumns={4}
      scrollEnabled={false}
      keyExtractor={(item) => item.slug}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push(`/(customer)/category/${item.slug}` as never)}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
            <MaterialCommunityIcons
              name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={24}
              color={item.color}
            />
          </View>
          <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: 'space-between', marginBottom: SPACING.md },
  item: { width: '23%', alignItems: 'center' },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  label: { fontSize: FONT_SIZES.xs, textAlign: 'center', fontWeight: '500' },
});
