import { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, ServiceCard, EmptyState } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { getFavorites } from '@/src/services/notifications';

export default function FavoritesScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Array<{ id: string; service_type: string; service_item_id: string; item_name: string }>>([]);

  useEffect(() => {
    if (profile) getFavorites(profile.id).then(setFavorites);
  }, [profile]);

  return (
    <ScreenContainer scroll={false}>
      <Header title="Favorites" />
      {favorites.length === 0 ? (
        <EmptyState icon="heart-outline" title="No favorites yet" message="Save suppliers you love!" />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              item={{ id: item.service_item_id, name: item.item_name ?? 'Supplier', price: 0 }}
              onPress={() => router.push(`/(customer)/supplier/${item.service_item_id}?type=${item.service_type}` as never)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}
