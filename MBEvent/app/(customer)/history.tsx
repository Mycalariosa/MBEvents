import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, EmptyState } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { getPaymentHistory } from '@/src/services/payment';
import { formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';
import type { Payment, Booking } from '@/src/types/database';

export default function TransactionHistoryScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [payments, setPayments] = useState<(Payment & { bookings?: Booking & { event_types?: { name: string }; packages?: { name: string } } })[]>([]);

  useEffect(() => {
    if (!profile) return;
    getPaymentHistory(profile.id).then((data) => setPayments(data as any));
  }, [profile]);

  return (
    <ScreenContainer scroll={false}>
      <Header title="Transaction History" />

      {payments.length === 0 ? (
        <EmptyState icon="cash-multiple" title="No transaction history" message="You have no recorded transactions yet." />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const booking = item.bookings;
            const eventName = booking?.event_types?.name ?? 'Event';
            const packageName = booking?.packages?.name ?? 'Package';

            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(customer)/history/${item.id}` as never)}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(Number(item.amount))}</Text>
                  <Text style={[styles.status, { color: item.status === 'paid' ? colors.success ?? '#28a745' : colors.warning ?? '#f59e0b' }]}> 
                    {item.status?.toString() ?? 'pending'}
                  </Text>
                </View>
                <Text style={[styles.title, { color: colors.text }]}>{item.reference_number}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {eventName} · {packageName}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.method}</Text>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: SPACING.sm },
  card: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  amount: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
  status: { fontSize: FONT_SIZES.sm, fontWeight: '700', textTransform: 'capitalize' },
  title: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  subtitle: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  metaText: { fontSize: FONT_SIZES.xs },
});
