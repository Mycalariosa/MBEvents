import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING } from '@/src/constants';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, padded = true, style }: ScreenContainerProps) {
  const { colors } = useTheme();
  const content = (
    <View style={[padded && styles.padded, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  padded: { padding: SPACING.md },
});
