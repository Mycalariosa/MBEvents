import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Header, ImageGallery, Button, ServiceCard } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { supabase } from '@/src/lib/supabase';
import { toggleFavorite } from '@/src/services/notifications';
import { useGenericBookingStore } from '@/src/stores';
import { formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';
import type { ServiceItem } from '@/src/types/database';

export default function SupplierDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const setSupplier = useGenericBookingStore((s) => s.setSupplier);
  const [item, setItem] = useState<ServiceItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id || !type) return;
    supabase.from(type).select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        const d = data as Record<string, unknown>;
        setItem({
          id: d.id as string,
          name: (d.name ?? d.studio_name ?? d.theme_name) as string,
          price: Number(d.price ?? d.rental_price ?? 0),
          description: d.description as string,
          contact: d.contact as string,
          location: d.location as string,
          capacity: d.capacity as number,
          images: (d.images as string[]) ?? [],
          rating: d.rating as number,
        });
      }
    });
  }, [id, type]);

  const handleFavorite = async () => {
    if (!profile || !item) return;
    const added = await toggleFavorite(profile.id, type, item.id, item.name);
    setIsFavorite(added);
  };

  const handleBook = () => {
    if (!item) return;
    setSupplier(item.id, item.name, type);
    router.push('/(customer)/booking/generic/package' as never);
  };

  if (!item) return null;

  return (
    <ScreenContainer>
      <Header title={item.name} rightAction={{ icon: isFavorite ? 'heart' : 'heart-outline', onPress: handleFavorite }} />
      <ImageGallery images={item.images ?? []} />

      <View style={styles.info}>
        {item.rating ? <Text style={[styles.rating, { color: colors.text }]}>⭐ {item.rating}</Text> : null}
        {item.location && <Text style={[styles.location, { color: colors.textSecondary }]}>{item.location}</Text>}
        <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(Number(item.price))}</Text>
        {item.description && <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.description}</Text>}
        {item.capacity && <Text style={[styles.capacity, { color: colors.textSecondary }]}>Capacity: {item.capacity} guests</Text>}
      </View>

      <View style={styles.actions}>
        {item.contact && (
          <Button title="Contact" variant="outline" onPress={() => Linking.openURL(`tel:${item.contact}`)} />
        )}
        <Button title="Book Now" onPress={handleBook} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  info: { padding: SPACING.md },
  rating: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  location: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  price: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginTop: SPACING.sm },
  desc: { fontSize: FONT_SIZES.sm, lineHeight: 22, marginTop: SPACING.md },
  capacity: { fontSize: FONT_SIZES.sm, marginTop: SPACING.sm },
  actions: { padding: SPACING.md, gap: SPACING.sm },
});
