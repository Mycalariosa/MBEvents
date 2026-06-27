import { BookingCard, CategoryGrid, ScreenContainer, SearchBar } from '@/src/components';
import { FONT_SIZES, SPACING } from '@/src/constants';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookings } from '@/src/services/booking';
import type { Booking } from '@/src/types/database';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const planningOptions = [
  {
    slug: 'wedding',
    title: 'Plan Your Dream Wedding',
    description: 'Signature celebrations with elegant packages designed for every style and budget.',
    tiers: [
      { label: 'Bronze', price: '₱180,000+' },
      { label: 'Silver', price: '₱350,000+' },
      { label: 'Gold', price: '₱1,000,000+' },
    ],
  },
  {
    slug: 'birthday',
    title: 'Plan Your Dream Birthday',
    description: 'From intimate gatherings to vibrant parties, every detail is beautifully curated.',
    tiers: [
      { label: 'Bronze', price: '₱80,000+' },
      { label: 'Silver', price: '₱180,000+' },
      { label: 'Gold', price: '₱500,000+' },
    ],
  },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (profile) {
      getBookings(profile.id, 'customer').then(({ data }) => setRecentBookings((data ?? []).slice(0, 2) as Booking[]));
    }
  }, [profile]);

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: colors.text }]}>{profile?.full_name ?? 'Guest'}</Text>
        </View>
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search suppliers, categories..."
        onFilter={() => router.push('/(customer)/search' as never)}
      />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
      <CategoryGrid />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Start Your Celebration</Text>
      <View style={styles.planningGrid}>
        {planningOptions.map((option) => (
          <TouchableOpacity
            key={option.slug}
            style={[styles.planningCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/(customer)/category/${option.slug}` as never)}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>{option.title}</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{option.description}</Text>
            <View style={styles.tierRow}>
              {option.tiers.map((tier) => (
                <View
                  key={tier.label}
                  style={[
                    styles.tierBadge,
                    {
                      backgroundColor: tier.label === 'Gold' ? colors.primary : colors.surface,
                      borderColor: tier.label === 'Gold' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.tierLabel, { color: tier.label === 'Gold' ? '#FFF' : colors.text }]}>{tier.label}</Text>
                  <Text style={[styles.tierPrice, { color: tier.label === 'Gold' ? '#FFF' : colors.primary }]}>{tier.price}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {recentBookings.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Bookings</Text>
          {recentBookings.map((b) => (
            <BookingCard key={b.id} booking={b as Booking & { packages?: { name: string }; event_types?: { name: string } }} showActions={false} />
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: { marginBottom: SPACING.md },
  greeting: { fontSize: FONT_SIZES.sm },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.md },
  planningGrid: { gap: SPACING.md },
  planningCard: { borderRadius: 20, borderWidth: 1, padding: SPACING.lg },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  cardDesc: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs, lineHeight: 20 },
  tierRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  tierBadge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, minWidth: 92, alignItems: 'center' },
  tierLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  tierPrice: { fontSize: FONT_SIZES.xs, marginTop: 2 },
});
