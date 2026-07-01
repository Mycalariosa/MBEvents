import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { useAdminViewStore } from '@/src/stores';
import { ScreenContainer, StatCard } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { getDashboardStats } from '@/src/services/notifications';
import { formatCurrency } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES } from '@/src/constants';

const screenWidth = Dimensions.get('window').width - 32;

export default function AdminDashboard() {
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    weddingBookings: 0,
    birthdayBookings: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    monthlyRevenue: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const chartData = {
    labels: ['Wedding', 'Birthday'],
    datasets: [{ data: [stats.weddingBookings || 1, stats.birthdayBookings || 1] }],
  };

  const router = useRouter();

  const navigateToBookings = (params: { status?: string; eventType?: string }) => {
    const { status } = params;
    useAdminViewStore.getState().setBookingFilter(status);
    const query = new URLSearchParams();
    if (params.eventType) query.set('eventType', params.eventType);
    router.push(`/(admin)/(tabs)/bookings${query.toString() ? `?${query.toString()}` : ''}` as never);
  };

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>

      <View style={styles.statsGrid}>
        <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/customers' as never)} style={styles.cardWrapper}>
          <StatCard label="Total Customers" value={stats.totalCustomers} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToBookings({ eventType: 'wedding' })} style={styles.cardWrapper}>
          <StatCard label="Weddings Booked" value={stats.weddingBookings} color="#FF6B9D" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToBookings({ eventType: 'birthday' })} style={styles.cardWrapper}>
          <StatCard label="Birthdays Booked" value={stats.birthdayBookings} color="#FFB347" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToBookings({ status: 'pending' })} style={styles.cardWrapper}>
          <StatCard label="Pending" value={stats.pendingReservations} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToBookings({ status: 'confirmed' })} style={styles.cardWrapper}>
          <StatCard label="Confirmed" value={stats.confirmedReservations} color="#22C55E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/reports' as never)} style={styles.cardWrapper}>
          <StatCard label="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/reports' as never)} style={styles.cardWrapper}>
          <StatCard label="Upcoming Events" value={stats.upcomingEvents} color="#6B4EFF" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.chartTitle, { color: colors.text }]}>Bookings Overview</Text>
      <BarChart
        data={chartData}
        width={screenWidth}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(107, 78, 255, ${opacity})`,
          labelColor: () => colors.textSecondary,
        }}
        style={styles.chart}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginBottom: SPACING.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'space-between' },
  cardWrapper: { flexBasis: '48%', marginBottom: SPACING.sm },
  chartTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.md },
  chart: { borderRadius: 16 },
});
