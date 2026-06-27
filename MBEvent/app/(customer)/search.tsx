import { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, SearchBar, ServiceCard, EmptyState } from '@/src/components';
import { supabase } from '@/src/lib/supabase';
import type { ServiceItem } from '@/src/types/database';

const SEARCH_TABLES = ['venues', 'photographers', 'makeup_artists', 'catering_options', 'cakes'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(ServiceItem & { table: string })[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      const allResults: (ServiceItem & { table: string })[] = [];
      for (const table of SEARCH_TABLES) {
        const { data } = await supabase
          .from(table)
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(5);
        if (data) {
          allResults.push(
            ...data.map((d: Record<string, unknown>) => ({
              id: d.id as string,
              name: d.name as string,
              price: Number(d.price ?? 0),
              location: d.location as string,
              rating: d.rating as number,
              images: (d.images as string[]) ?? [],
              table,
            }))
          );
        }
      }
      setResults(allResults);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <ScreenContainer scroll={false}>
      <Header title="Search" />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search by supplier name..." />

      {results.length === 0 && query.length >= 2 ? (
        <EmptyState icon="magnify-close" title="No results" message="Try a different search term" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.table}-${item.id}`}
          renderItem={({ item }) => (
            <ServiceCard
              item={item}
              onPress={() => router.push(`/(customer)/supplier/${item.id}?type=${item.table}` as never)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}
