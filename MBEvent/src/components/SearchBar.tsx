import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilter?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...', onFilter }: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <MaterialCommunityIcons name="magnify" size={22} color={colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
      {onFilter && (
        <TouchableOpacity onPress={onFilter}>
          <MaterialCommunityIcons name="filter-variant" size={22} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  input: { flex: 1, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, fontSize: FONT_SIZES.md },
});
