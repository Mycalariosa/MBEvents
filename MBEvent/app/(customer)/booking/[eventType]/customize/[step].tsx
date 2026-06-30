import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Header, WizardProgressBar, Button, ServiceCard } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useWizardStore } from '@/src/stores';
import { supabase } from '@/src/lib/supabase';
import { SPACING } from '@/src/constants';
import type { ServiceItem } from '@/src/types/database';
import {
  fetchPackageInclusions,
  getActiveWizardSteps,
} from '@/src/utils/wizardSteps';

const TABLES_WITH_EVENT_TYPE_ID = new Set([
  'venues',
  'catering_options',
  'photographers',
  'videographers',
  'makeup_artists',
  'cakes',
  'decorations',
  'entertainment_options',
  'hosts',
]);

export default function CustomizeStepScreen() {
  const { eventType, step } = useLocalSearchParams<{ eventType: string; step: string }>();
  const stepIndex = parseInt(step ?? '0', 10);
  const { colors } = useTheme();
  const router = useRouter();
  const {
    selectedPackage,
    packageInclusions,
    setPackageInclusions,
    addSelection,
    selections,
  } = useWizardStore();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inclusionsLoaded, setInclusionsLoaded] = useState(false);

  const activeSteps = useMemo(
    () => getActiveWizardSteps(eventType ?? '', packageInclusions),
    [eventType, packageInclusions]
  );

  const currentStep = activeSteps[stepIndex];

  useEffect(() => {
    if (!selectedPackage?.id) return;
    if (packageInclusions.length > 0 && packageInclusions[0]?.package_id === selectedPackage.id) {
      setInclusionsLoaded(true);
      return;
    }

    fetchPackageInclusions(selectedPackage.id)
      .then((data) => {
        setPackageInclusions(data);
        setInclusionsLoaded(true);
      })
      .catch(() => setInclusionsLoaded(true));
  }, [selectedPackage?.id, packageInclusions, setPackageInclusions]);

  useEffect(() => {
    if (!inclusionsLoaded) return;
    if (stepIndex >= activeSteps.length) {
      router.replace('/(customer)/booking/review' as never);
    }
  }, [inclusionsLoaded, stepIndex, activeSteps.length, router]);

  useEffect(() => {
    if (currentStep?.key === 'review') return;
    const table = currentStep?.table;
    if (!table) return;

    const fetchItems = async () => {
      let query = supabase
        .from(table)
        .select('*')
        .eq('is_active', true);

      if (selectedPackage?.tier) {
        query = query.eq('package_tier', selectedPackage.tier);
      }

      if (eventType && TABLES_WITH_EVENT_TYPE_ID.has(table)) {
        const { data: eventTypeData } = await supabase
          .from('event_types')
          .select('id')
          .eq('slug', eventType)
          .single();
        if (eventTypeData) {
          query = query.eq('event_type_id', (eventTypeData as { id: string }).id);
        }
      }

      const { data } = await query;
      if (data) {
        setItems(
          data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            name: (d.name ?? d.theme_name ?? d.model ?? d.studio_name) as string,
            price: Number(d.price ?? d.rental_price ?? 0),
            package_tier: d.package_tier as ServiceItem['package_tier'],
            description: d.description as string,
            images: (d.images as string[]) ?? [],
            rating: d.rating as number,
          }))
        );
      }
    };

    fetchItems();

    const existing = selections.find((s) => s.serviceType === currentStep.key);
    if (existing) setSelectedId(existing.serviceItemId);
  }, [stepIndex, currentStep, eventType, selectedPackage?.tier, selections]);

  const handleSelect = (item: ServiceItem) => {
    if (!currentStep) return;
    setSelectedId(item.id);
    addSelection({
      serviceType: currentStep.key,
      serviceItemId: item.id,
      itemName: item.name,
      unitPrice: 0,
      quantity: 1,
      priceDelta: 0,
    });
  };

  const handleNext = () => {
    if (stepIndex >= activeSteps.length - 1) {
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

  if (!inclusionsLoaded || !currentStep) {
    return (
      <ScreenContainer>
        <Header title={`Customize ${eventType}`} />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: SPACING.xl }}>
          Loading...
        </Text>
      </ScreenContainer>
    );
  }

  if (currentStep.key === 'review') {
    router.replace('/(customer)/booking/review' as never);
    return null;
  }

  const isLastStep = stepIndex >= activeSteps.length - 2;

  return (
    <ScreenContainer scroll={false}>
      <Header title={`Customize ${eventType}`} />
      <WizardProgressBar
        currentStep={stepIndex}
        totalSteps={activeSteps.length}
        stepLabel={currentStep.label ?? ''}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: SPACING.xl }}>
            No options available
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <View
              style={[
                selectedId === item.id && {
                  borderWidth: 2,
                  borderColor: colors.primary,
                  borderRadius: 16,
                },
              ]}
            >
              <ServiceCard item={item} onPress={() => handleSelect(item)} showPrice={false} showTier />
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Button title="Back" variant="outline" onPress={handleBack} style={{ flex: 1 }} />
        <Button title={isLastStep ? 'Review' : 'Next'} onPress={handleNext} style={{ flex: 1 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md },
});
