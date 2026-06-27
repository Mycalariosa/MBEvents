import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
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

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>

      <View style={styles.statsGrid}>
        <StatCard label="Total Customers" value={stats.totalCustomers} />
        <StatCard label="Weddings Booked" value={stats.weddingBookings} color="#FF6B9D" />
        <StatCard label="Birthdays Booked" value={stats.birthdayBookings} color="#FFB347" />
        <StatCard label="Pending" value={stats.pendingReservations} color="#F59E0B" />
        <StatCard label="Confirmed" value={stats.confirmedReservations} color="#22C55E" />
        <StatCard label="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} />
        <StatCard label="Upcoming Events" value={stats.upcomingEvents} color="#6B4EFF" />
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
  chartTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.md },
  chart: { borderRadius: 16 },
});
