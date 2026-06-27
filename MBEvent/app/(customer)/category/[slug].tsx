import { Button, Header, PackageCard, ScreenContainer } from '@/src/components';
import { FONT_SIZES, SPACING } from '@/src/constants';
import { useTheme } from '@/src/hooks/useTheme';
import { supabase } from '@/src/lib/supabase';
import type { Package } from '@/src/types/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [eventTypeId, setEventTypeId] = useState<string | null>(null);
  const categoryName = slug?.charAt(0).toUpperCase() + (slug?.slice(1) ?? '');

  useEffect(() => {
    if (!slug) return;
    supabase.from('event_types').select('id').eq('slug', slug).single().then(({ data }) => {
      if (data) {
        const id = (data as { id: string }).id;
        setEventTypeId(id);
        supabase.from('packages').select('*').eq('event_type_id', id).eq('is_active', true).then(({ data: pkgs }) => {
          if (pkgs) setPackages(pkgs as Package[]);
        });
      }
    });
  }, [slug]);

  return (
    <ScreenContainer>
      <Header title={categoryName} />

      {(slug === 'wedding' || slug === 'birthday') && packages.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a Package</Text>
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onPress={() => router.push(`/(customer)/booking/${slug}/package?packageId=${pkg.id}` as never)}
            />
          ))}
        </>
      )}

      {(slug === 'wedding' || slug === 'birthday') && (
        <Button
          title={`Customize ${categoryName} Event`}
          onPress={() => router.push(`/(customer)/booking/${slug}/package` as never)}
          style={{ marginTop: SPACING.lg }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.md },
  subCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  subName: { fontSize: FONT_SIZES.md, fontWeight: '500' },
});
