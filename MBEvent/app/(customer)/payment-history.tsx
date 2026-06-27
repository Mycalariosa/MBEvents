import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer, Header, EmptyState } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { getPaymentHistory } from '@/src/services/payment';
import { formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function PaymentHistoryScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (profile) getPaymentHistory(profile.id).then(setPayments);
  }, [profile]);

  return (
    <ScreenContainer scroll={false}>
      <Header title="Payment History" />
      {payments.length === 0 ? (
        <EmptyState icon="cash-remove" title="No payments yet" />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id as string}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.ref, { color: colors.text }]}>{item.reference_number as string}</Text>
              <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(Number(item.amount))}</Text>
              <Text style={[styles.method, { color: colors.textSecondary }]}>{item.method as string} · {item.status as string}</Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {new Date(item.created_at as string).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  ref: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  amount: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginTop: SPACING.xs },
  method: { fontSize: FONT_SIZES.sm, marginTop: 2, textTransform: 'capitalize' },
  date: { fontSize: FONT_SIZES.xs, marginTop: SPACING.xs },
});
