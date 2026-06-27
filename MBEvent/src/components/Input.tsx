import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword, style, ...props }: InputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={[styles.inputWrapper, { borderColor: error ? colors.error : colors.border, backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '500', marginBottom: SPACING.xs },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
  },
  input: { flex: 1, paddingVertical: SPACING.md, fontSize: FONT_SIZES.md },
  error: { fontSize: FONT_SIZES.xs, marginTop: SPACING.xs },
});
