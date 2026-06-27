import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Header, WizardProgressBar, Button, ServiceCard } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useWizardStore } from '@/src/stores';
import { supabase } from '@/src/lib/supabase';
import { WEDDING_WIZARD_STEPS, BIRTHDAY_WIZARD_STEPS, SPACING, FONT_SIZES } from '@/src/constants';
import { formatCurrency } from '@/src/utils/pricing';
import type { ServiceItem } from '@/src/types/database';

export default function CustomizeStepScreen() {
  const { eventType, step } = useLocalSearchParams<{ eventType: string; step: string }>();
  const stepIndex = parseInt(step ?? '0', 10);
  const { colors } = useTheme();
  const router = useRouter();
  const { selectedPackage, addSelection, selections } = useWizardStore();
  const steps = eventType === 'wedding' ? WEDDING_WIZARD_STEPS : BIRTHDAY_WIZARD_STEPS;
  const currentStep = steps[stepIndex];
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep?.key === 'review') return;
    if (!currentStep?.table) return;

    supabase.from(currentStep.table).select('*').eq('is_active', true).then(({ data }) => {
      if (data) {
        setItems(
          data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            name: (d.name ?? d.theme_name ?? d.model ?? d.studio_name) as string,
            price: Number(d.price ?? d.rental_price ?? 0),
            description: d.description as string,
            images: (d.images as string[]) ?? [],
            rating: d.rating as number,
          }))
        );
      }
    });

    const existing = selections.find((s) => s.serviceType === currentStep.key);
    if (existing) setSelectedId(existing.serviceItemId);
  }, [stepIndex, currentStep]);

  const handleSelect = (item: ServiceItem) => {
    setSelectedId(item.id);
    const basePrice = Number(selectedPackage?.price ?? 0);
    const priceDelta = Math.max(0, Number(item.price) - basePrice * 0.1);
    addSelection({
      serviceType: currentStep.key,
      serviceItemId: item.id,
      itemName: item.name,
      unitPrice: Number(item.price),
      quantity: 1,
      priceDelta,
    });
  };

  const handleNext = () => {
    if (stepIndex >= steps.length - 1) {
      router.push('/(customer)/booking/review' as never);
    } else {
      router.push(`/(customer)/booking/${eventType}/customize/${stepIndex + 1}` as never);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      router.push(`/(customer)/booking/${eventType}/customize/${stepIndex - 1}` as never);
    } else {
      router.back();
    }
  };

  if (currentStep?.key === 'review') {
    router.replace('/(customer)/booking/review' as never);
    return null;
  }

  return (
    <ScreenContainer scroll={false}>
      <Header title={`Customize ${eventType}`} />
      <WizardProgressBar currentStep={stepIndex} totalSteps={steps.length} stepLabel={currentStep?.label ?? ''} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: SPACING.xl }}>No options available</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <View style={[selectedId === item.id && { borderWidth: 2, borderColor: colors.primary, borderRadius: 16 }]}>
              <ServiceCard item={item} onPress={() => handleSelect(item)} />
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Button title="Back" variant="outline" onPress={handleBack} style={{ flex: 1 }} />
        <Button title={stepIndex >= steps.length - 2 ? 'Review' : 'Next'} onPress={handleNext} style={{ flex: 1 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md },
});
