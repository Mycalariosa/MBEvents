import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';
import type { BookingProgress } from '@/src/types/database';

interface ProgressTimelineProps {
  steps: BookingProgress[];
}

export function ProgressTimeline({ steps }: ProgressTimelineProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.step}>
          <View style={styles.iconCol}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: step.is_completed ? colors.success : colors.surface,
                  borderColor: step.is_completed ? colors.success : colors.border,
                },
              ]}
            >
              {step.is_completed && (
                <MaterialCommunityIcons name="check" size={14} color="#FFF" />
              )}
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: step.is_completed ? colors.success : colors.border },
                ]}
              />
            )}
          </View>
          <View style={styles.labelCol}>
            <Text
              style={[
                styles.label,
                { color: step.is_completed ? colors.text : colors.textSecondary },
              ]}
            >
              {step.step_label}
            </Text>
            {step.completed_at && (
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {new Date(step.completed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.md },
  step: { flexDirection: 'row', minHeight: 50 },
  iconCol: { alignItems: 'center', width: 30 },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, flex: 1, marginVertical: 2 },
  labelCol: { flex: 1, paddingLeft: SPACING.md, paddingBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  date: { fontSize: FONT_SIZES.xs, marginTop: 2 },
});
