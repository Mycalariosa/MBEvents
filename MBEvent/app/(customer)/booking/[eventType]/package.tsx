import { Button, Header, PackageCard, ScreenContainer } from '@/src/components';
import { FONT_SIZES, SPACING } from '@/src/constants';
import { useTheme } from '@/src/hooks/useTheme';
import { supabase } from '@/src/lib/supabase';
import { useWizardStore } from '@/src/stores';
import type { Package } from '@/src/types/database';
import { fetchPackageInclusions, getInclusionLabels, getWeddingTierQualityNotes } from '@/src/utils/wizardSteps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const getUpgradeMessage = (pkg: Package) => {
  const tier = pkg.tier?.toLowerCase() ?? 'bronze';
  if (tier === 'bronze') {
    return 'Upgrade to Silver or Gold for videography, invitations, entertainment, and more premium services.';
  }
  if (tier === 'silver') {
    return 'Silver adds videography, invitations, and entertainment. Gold unlocks luxury transportation and top-tier options.';
  }
  return 'Gold delivers the fullest experience with premium coordination, bridal transport, and the strongest overall value.';
};

export default function PackageSelectionScreen() {
  const { eventType, packageId } = useLocalSearchParams<{ eventType: string; packageId?: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { setEventType, setPackage, setPackageInclusions } = useWizardStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selected, setSelected] = useState<Package | null>(null);
  const [inclusionLabels, setInclusionLabels] = useState<string[]>([]);

  const loadInclusions = useCallback(
    async (pkg: Package) => {
      try {
        const inclusions = await fetchPackageInclusions(pkg.id);
        setPackageInclusions(inclusions);
        setInclusionLabels(getInclusionLabels(eventType ?? '', inclusions));
      } catch {
        setInclusionLabels([]);
      }
    },
    [eventType, setPackageInclusions]
  );

  const handleSelectPackage = useCallback(
    (pkg: Package) => {
      setSelected(pkg);
      setPackage(pkg);
      loadInclusions(pkg);
    },
    [setPackage, loadInclusions]
  );

  useEffect(() => {
    if (eventType) setEventType(eventType);
    supabase
      .from('event_types')
      .select('id')
      .eq('slug', eventType)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('packages')
            .select('*')
            .eq('event_type_id', (data as { id: string }).id)
            .eq('is_active', true)
            .then(({ data: pkgs }) => {
              if (pkgs) {
                setPackages(pkgs as Package[]);
                if (packageId) {
                  const pkg = (pkgs as Package[]).find((p) => p.id === packageId);
                  if (pkg) handleSelectPackage(pkg);
                }
              }
            });
        }
      });
  }, [eventType, packageId, setEventType, handleSelectPackage]);

  const handleContinue = () => {
    if (!selected) return;
    setPackage(selected);
    router.push(`/(customer)/booking/${eventType}/customize/0` as never);
  };

  const highlights = selected
    ? [
        `Guest capacity up to ${selected.max_guests ?? 50}`,
        ...inclusionLabels,
        ...(eventType === 'wedding' ? getWeddingTierQualityNotes(selected.tier) : []),
      ]
    : [];

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
              onPress={() => handleSelectPackage(pkg)}
            />
            {isSelected && (
              <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.detailsTitle, { color: colors.text }]}>What's Included</Text>
                {highlights.map((item) => (
                  <View key={item} style={styles.bulletRow}>
                    <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                    <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
                <View style={[styles.upgradeBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.upgradeTitle, { color: colors.primary }]}>
                    Why the higher tier is better
                  </Text>
                  <Text style={[styles.upgradeText, { color: colors.textSecondary }]}>
                    {getUpgradeMessage(pkg)}
                  </Text>
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
