import { supabase } from '@/src/lib/supabase';
import type { ServiceItem } from '@/src/types/database';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Header } from './Header';
import { ScreenContainer } from './ScreenContainer';
import { ServiceCard } from './ServiceCard';

interface AdminServiceListProps {
  table: string;
  title: string;
  eventTypeSlug?: string;
  route: string;
}

export function AdminServiceList({ table, title, eventTypeSlug, route }: AdminServiceListProps) {
  const router = useRouter();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Some catalog tables don't have `event_type_id` (e.g. birthday_themes, wedding dresses).
  // We only filter by event_type_id for the tables that actually include it.
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

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from(table).select('*').order('created_at', { ascending: false });

    if (eventTypeSlug && TABLES_WITH_EVENT_TYPE_ID.has(table)) {
      const { data: eventType } = await supabase
        .from('event_types')
        .select('id')
        .eq('slug', eventTypeSlug)
        .single();
      if (eventType) {
        query = query.eq('event_type_id', (eventType as { id: string }).id);
      }
    }

    const { data } = await query;
    if (data) {
      setItems(
        data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          name: (d.name ?? d.theme_name ?? d.model ?? d.studio_name ?? 'Unnamed') as string,
          price: Number(d.price ?? d.rental_price ?? 0),
          package_tier: d.package_tier as ServiceItem['package_tier'],
          description: d.description as string,
          contact: d.contact as string,
          location: d.location as string,
          capacity: d.capacity as number,
          images: (d.images as string[]) ?? [],
          rating: d.rating as number,
          is_active: d.is_active as boolean,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [table, eventTypeSlug]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from(table).delete().eq('id', id);
          fetchItems();
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll={false}>
      <Header
        title={title}
        rightAction={{
          icon: 'plus',
          onPress: () => router.push(`/(admin)/manage/${route}/new` as never), // route includes eventType/module
        }}
      />
      {items.length === 0 && !loading ? (
        <EmptyState icon="package-variant" title="No items yet" message="Tap + to add your first item." />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <ServiceCard
                item={item}
                onPress={() => router.push(`/(admin)/manage/${route}/${item.id}` as never)}
                showPrice={false}
                showTier
              />
              <Button title="Delete" variant="danger" size="sm" onPress={() => handleDelete(item.id)} />
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
