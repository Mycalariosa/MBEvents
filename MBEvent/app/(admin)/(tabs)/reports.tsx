import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenContainer, StatCard, Button } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { getReportData } from '@/src/services/notifications';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function AdminReportsScreen() {
  const { colors } = useTheme();
  const [report, setReport] = useState({
    totalBookings: 0,
    topVenue: null as { name: string; count: number } | null,
    topPhotographer: null as { name: string; count: number } | null,
    topPackage: null as { name: string; count: number } | null,
    bookings: [] as unknown[],
  });

  useEffect(() => {
    getReportData().then(setReport);
  }, []);

  const handleExport = (format: 'PDF' | 'Excel') => {
    Alert.alert('Export', `${format} export will be generated via Supabase Edge Function. Configure your Supabase project to enable this feature.`);
  };

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Reports</Text>

      <StatCard label="Total Reservations" value={report.totalBookings} />
      {report.topVenue && <StatCard label="Most Selected Venue" value={`${report.topVenue.name} (${report.topVenue.count})`} />}
      {report.topPhotographer && <StatCard label="Most Selected Photographer" value={`${report.topPhotographer.name} (${report.topPhotographer.count})`} />}
      {report.topPackage && <StatCard label="Most Popular Package" value={`${report.topPackage.name} (${report.topPackage.count})`} />}

      <View style={styles.exportRow}>
        <Button title="Export PDF" variant="outline" onPress={() => handleExport('PDF')} style={{ flex: 1 }} />
        <Button title="Export Excel" variant="outline" onPress={() => handleExport('Excel')} style={{ flex: 1 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginBottom: SPACING.lg },
  exportRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
});
