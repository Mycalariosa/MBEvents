import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { COLORS, FONT_SIZES, SPACING } from '@/src/constants';
import { supabase } from '@/src/lib/supabase';

type CustomerSummary = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at: string;
};

export default function CustomerManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (!error) {
      setCustomers((data ?? []) as CustomerSummary[]);
    }
    setLoading(false);
  }

  const emptyState = useMemo(() => {
    if (loading) {
      return 'Loading customers...';
    }
    return 'No customers found yet.';
  }, [loading]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(admin)/(tabs)/dashboard' as never);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <Header title="Customer Management" showBack={true} />

      <View style={styles.content}>
        <View style={[styles.headerCard, { backgroundColor: colors.primary + '15' }]}> 
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
            <MaterialCommunityIcons name="account-multiple" size={28} color="#FFF" />
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>View all registered customers</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={[styles.summaryIcon, { backgroundColor: colors.primary }]}> 
            <MaterialCommunityIcons name="account-group" size={22} color="#fff" />
          </View>
          <View style={styles.summaryText}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Registered Customers</Text>
            <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>{customers.length} total accounts</Text>
          </View>
        </View>

        {customers.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <MaterialCommunityIcons name="account-group-outline" size={28} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyState}</Text>
          </View>
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.customerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(admin)/customer-details/${item.id}` as never)}
              >
                <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{item.full_name?.trim()?.charAt(0)?.toUpperCase() ?? 'C'}</Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={[styles.customerName, { color: colors.text }]}>{item.full_name}</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>{item.email}</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Joined {new Date(item.created_at).toLocaleDateString('en-PH')}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'left',
    lineHeight: 20,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  listContent: {
    gap: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatarSmall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  customerMeta: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
});
