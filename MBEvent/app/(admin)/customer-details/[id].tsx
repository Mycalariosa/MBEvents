import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, ScreenContainer } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { COLORS, FONT_SIZES, SPACING } from '@/src/constants';
import { formatCurrency, formatDate } from '@/src/utils/pricing';
import { supabase } from '@/src/lib/supabase';
import type { Booking, Profile } from '@/src/types/database';

type CustomerDetails = {
  profile: Profile;
  bookings: Booking[];
  bookingCount: number;
  completedCount: number;
  pendingCount: number;
  totalSpent: number;
};

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No customer was selected.');
      setLoading(false);
      return;
    }

    void loadCustomer(id);
  }, [id]);

  async function loadCustomer(customerId: string) {
    setLoading(true);
    setError(null);

    const [{ data: profileData, error: profileError }, { data: bookingsData, error: bookingsError }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, phone, created_at').eq('id', customerId).eq('role', 'customer').maybeSingle(),
      supabase.from('bookings').select('id, status, total, created_at, event_date, event_time, packages(name), event_types(name, slug)').eq('customer_id', customerId).order('created_at', { ascending: false }),
    ]);

    if (profileError || bookingsError) {
      setError('We could not load this customer right now.');
      setLoading(false);
      return;
    }

    const profile = profileData as Profile | null;
    const bookings = (bookingsData ?? []) as unknown as Booking[];

    if (!profile) {
      setError('This customer could not be found.');
      setLoading(false);
      return;
    }

    const completedCount = bookings.filter((booking) => ['confirmed', 'ongoing', 'completed'].includes(booking.status)).length;
    const pendingCount = bookings.filter((booking) => ['pending', 'approved', 'changes_requested'].includes(booking.status)).length;
    const totalSpent = bookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0);

    setCustomer({
      profile,
      bookings,
      bookingCount: bookings.length,
      completedCount,
      pendingCount,
      totalSpent,
    });
    setLoading(false);
  }

  function getInitials(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'C';
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  return (
    <ScreenContainer scroll={false}>
      <Header title="Customer Profile" />

      <View style={styles.content}>
        {error ? (
        <View style={[styles.errorCard, { backgroundColor: `${colors.error}14`, borderColor: colors.error }]}> 
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading customer profile...</Text>
        </View>
      ) : customer ? (
        <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.profileHero, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={[styles.heroAvatar, { backgroundColor: colors.primary }]}> 
              <Text style={styles.heroAvatarText}>{getInitials(customer.profile.full_name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.customerName, { color: colors.text }]}>{customer.profile.full_name}</Text>
              <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>{customer.profile.email}</Text>
              <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>{customer.profile.phone || 'No phone number on file'}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.statValue, { color: colors.text }]}>{customer.bookingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bookings</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.statValue, { color: colors.success }]}>{customer.completedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.statValue, { color: colors.warning }]}>{customer.pendingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(customer.totalSpent)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total spend</Text>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.blockTitle, { color: colors.text }]}>Booking activity</Text>
            {customer.bookings.length === 0 ? (
              <View style={[styles.emptyActivity, { backgroundColor: colors.surface }]}> 
                <MaterialCommunityIcons name="calendar-blank-outline" size={26} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>This customer has no bookings yet.</Text>
              </View>
            ) : (
              customer.bookings.map((booking) => (
                <View key={booking.id} style={[styles.bookingItem, { borderColor: colors.border }]}> 
                  <View style={styles.bookingTopRow}>
                    <Text style={[styles.bookingTitle, { color: colors.text }]}> 
                      {booking.packages?.name || booking.event_types?.name || 'Custom booking'}
                    </Text>
                    <Text style={[styles.bookingAmount, { color: colors.primary }]}> 
                      {formatCurrency(Number(booking.total || 0))}
                    </Text>
                  </View>
                  <Text style={[styles.bookingMeta, { color: colors.textSecondary }]}>Status: {booking.status}</Text>
                  <Text style={[styles.bookingMeta, { color: colors.textSecondary }]}>Created: {formatDate(booking.created_at)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  detailScroll: {
    flex: 1,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.lg,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  customerMeta: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    width: '48%',
    borderRadius: 14,
    padding: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
  },
  sectionBlock: {
    gap: SPACING.sm,
  },
  blockTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  emptyActivity: {
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bookingItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  bookingTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    flex: 1,
  },
  bookingAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  bookingMeta: {
    fontSize: FONT_SIZES.xs,
  },
});
