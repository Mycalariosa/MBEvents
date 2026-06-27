import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export function WizardProgressBar({ currentStep, totalSteps, stepLabel }: WizardProgressBarProps) {
  const { colors } = useTheme();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.stepLabel, { color: colors.text }]}>{stepLabel}</Text>
        <Text style={[styles.stepCount, { color: colors.textSecondary }]}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  stepLabel: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  stepCount: { fontSize: FONT_SIZES.sm },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
