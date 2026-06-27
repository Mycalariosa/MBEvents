import { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Header, ServiceCard, EmptyState } from '@/src/components';
import { supabase } from '@/src/lib/supabase';
import type { ServiceItem } from '@/src/types/database';

export default function SupplierListScreen() {
  const { table, slug, name } = useLocalSearchParams<{ table: string; slug: string; name: string }>();
  const router = useRouter();
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    if (!table) return;
    const fetchItems = async () => {
      let query = supabase.from(table).select('*').eq('is_active', true);
      if (slug) {
        const { data: et } = await supabase.from('event_types').select('id').eq('slug', slug).single();
        if (et) query = query.eq('event_type_id', (et as { id: string }).id);
      }
      const { data } = await query;
      if (data) {
        setItems(
          data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            name: (d.name ?? d.studio_name ?? d.theme_name) as string,
            price: Number(d.price ?? d.rental_price ?? 0),
            location: d.location as string,
            rating: d.rating as number,
            images: (d.images as string[]) ?? [],
          }))
        );
      }
    };
    fetchItems();
  }, [table, slug]);

  return (
    <ScreenContainer scroll={false}>
      <Header title={name ?? 'Suppliers'} />
      {items.length === 0 ? (
        <EmptyState icon="store-off" title="No suppliers found" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              item={item}
              onPress={() => router.push(`/(customer)/supplier/${item.id}?type=${table}` as never)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}
