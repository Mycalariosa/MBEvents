import { Button, Header, PackageCard, ScreenContainer } from '@/src/components';
import { FONT_SIZES, SPACING } from '@/src/constants';
import { useTheme } from '@/src/hooks/useTheme';
import { supabase } from '@/src/lib/supabase';
import { useWizardStore } from '@/src/stores';
import type { Package } from '@/src/types/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const getPackageHighlights = (pkg: Package) => {
  const tier = pkg.tier?.toLowerCase() ?? 'bronze';
  const baseHighlights = [
    'Dedicated event planning support',
    `Guest capacity up to ${pkg.max_guests ?? 50}`,
    'Curated styling and coordination',
  ];

  if (tier === 'silver') {
    return [
      ...baseHighlights,
      'Enhanced décor and vendor coordination',
      'More flexibility for premium add-ons',
    ];
  }

  if (tier === 'gold') {
    return [
      ...baseHighlights,
      'Priority planning and premium supplier access',
      'Elevated presentation, coordination, and VIP touches',
    ];
  }

  return [
    ...baseHighlights,
    'A refined foundation for a beautifully organized celebration',
  ];
};

const getUpgradeMessage = (pkg: Package) => {
  const tier = pkg.tier?.toLowerCase() ?? 'bronze';
  if (tier === 'bronze') {
    return 'Upgrade to Silver or Gold for more guest flexibility, richer styling, and a more elevated planner experience.';
  }
  if (tier === 'silver') {
    return 'Silver gives you more flexibility and a stronger event experience, while Gold unlocks premium coordination and VIP-level presentation.';
  }
  return 'Gold delivers the fullest experience with premium coordination, elevated touches, and the strongest overall value for a high-impact celebration.';
};

export default function PackageSelectionScreen() {
  const { eventType, packageId } = useLocalSearchParams<{ eventType: string; packageId?: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { setEventType, setPackage, selectedPackage } = useWizardStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selected, setSelected] = useState<Package | null>(null);

  useEffect(() => {
    if (eventType) setEventType(eventType);
    supabase.from('event_types').select('id').eq('slug', eventType).single().then(({ data }) => {
      if (data) {
        supabase.from('packages').select('*').eq('event_type_id', (data as { id: string }).id).eq('is_active', true).then(({ data: pkgs }) => {
          if (pkgs) {
            setPackages(pkgs as Package[]);
            if (packageId) {
              const pkg = (pkgs as Package[]).find((p) => p.id === packageId);
              if (pkg) { setSelected(pkg); setPackage(pkg); }
            }
          }
        });
      }
    });
  }, [eventType]);

  const handleContinue = () => {
    if (!selected) return;
    setPackage(selected);
    router.push(`/(customer)/booking/${eventType}/customize/0` as never);
  };

  return (
    <ScreenContainer>
      <Header title="Choose Package" />
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select a package tier to start customizing your event
      </Text>
      {packages.map((pkg) => {
        const isSelected = selected?.id === pkg.id;
        return (
          <View key={pkg.id}>
            <PackageCard
              pkg={pkg}
              selected={isSelected}
              onPress={() => { setSelected(pkg); setPackage(pkg); }}
            />
            {isSelected && (
              <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                <Text style={[styles.detailsTitle, { color: colors.text }]}>What’s Included</Text>
                {getPackageHighlights(pkg).map((item) => (
                  <View key={item} style={styles.bulletRow}>
                    <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                    <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
                <View style={[styles.upgradeBox, { backgroundColor: colors.surface }]}> 
                  <Text style={[styles.upgradeTitle, { color: colors.primary }]}>Why the higher tier is better</Text>
                  <Text style={[styles.upgradeText, { color: colors.textSecondary }]}>{getUpgradeMessage(pkg)}</Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
      <Button title="Continue to Customize" onPress={handleContinue} disabled={!selected} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.lg },
  detailsCard: { borderRadius: 16, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.lg },
  detailsTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.xs },
  bullet: { fontSize: FONT_SIZES.lg, marginRight: SPACING.sm, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  upgradeBox: { borderRadius: 12, padding: SPACING.md, marginTop: SPACING.md },
  upgradeTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: SPACING.xs },
  upgradeText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
});
