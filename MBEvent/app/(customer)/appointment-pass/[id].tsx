import { View, Text, StyleSheet, Share, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookingDetail } from '@/src/services/booking';
import { formatDate, formatTime } from '@/src/utils/pricing';
import { SPACING, FONT_SIZES, CONSULTATION_STATUSES } from '@/src/constants';
import { useEffect, useState } from 'react';
import type { Booking, ConsultationAppointment } from '@/src/types/database';

export default function AppointmentPassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [appointment, setAppointment] = useState<ConsultationAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setError('No booking ID provided');
          setLoading(false);
          return;
        }
        const { booking: b, appointment: a } = await getBookingDetail(id);
        setBooking(b as Booking | null);
        setAppointment(a as ConsultationAppointment | null);
        if (!b || !a) {
          setError('Appointment details not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Appointment Pass" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !booking || !appointment) {
    return (
      <ScreenContainer>
        <Header title="Appointment Pass" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error, marginTop: SPACING.md }]}>
            {error || 'Appointment not found'}
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.primary, marginTop: SPACING.lg }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const b = booking as Booking & {
    packages?: { name: string };
    event_types?: { name: string };
    profiles?: { full_name: string };
  };
  const statusInfo = CONSULTATION_STATUSES.find((s) => s.id === appointment.consultation_status);

  // Create QR code content with consultation details
  const qrContent = `APPT:${appointment.appointment_ref}|DATE:${appointment.consultation_date}|TIME:${appointment.consultation_time}|LOC:${appointment.branch_location || 'TBD'}`;

  const handleShare = async () => {
    await Share.share({
      message: `MBEvents Appointment Pass\nID: ${appointment.appointment_ref}\nDate: ${formatDate(appointment.consultation_date)}\nTime: ${formatTime(appointment.consultation_time)}\nLocation: ${appointment.branch_location}`,
    });
  };

  return (
    <ScreenContainer>
      <Header title="Appointment Pass" rightAction={{ icon: 'share', onPress: handleShare }} />

      <View style={[styles.pass, { backgroundColor: colors.primary }]}>
        <Text style={styles.brand}>MBEvents</Text>
        <Text style={styles.passTitle}>Appointment Pass</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.refLabel, { color: colors.textSecondary }]}>Appointment ID</Text>
        <Text style={[styles.ref, { color: colors.primary }]}>{appointment.appointment_ref}</Text>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Customer</Text>
          <Text style={{ color: colors.text }}>{b.profiles?.full_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Event</Text>
          <Text style={{ color: colors.text }}>{b.event_types?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Package</Text>
          <Text style={{ color: colors.text }}>{b.packages?.name}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.consultTitle, { color: colors.text }]}>Consultation</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
          <Text style={{ color: colors.text, marginLeft: SPACING.sm }}>{formatDate(appointment.consultation_date)}</Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.text, marginLeft: SPACING.sm }}>{formatTime(appointment.consultation_time)}</Text>
        </View>
        {appointment.branch_location && (
          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: SPACING.sm, flex: 1 }}>{appointment.branch_location}</Text>
          </View>
        )}
        {appointment.profiles?.full_name && (
          <View style={styles.row}>
            <MaterialCommunityIcons name="account-tie" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: SPACING.sm }}>Planner: {appointment.profiles.full_name}</Text>
          </View>
        )}

        <View style={[styles.statusBadge, { backgroundColor: (statusInfo?.color ?? colors.warning) + '20' }]}>
          <Text style={{ color: statusInfo?.color, fontWeight: '600' }}>{statusInfo?.label ?? 'Scheduled'}</Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode value={qrContent} size={180} backgroundColor="#FFF" color={colors.primary} />
        </View>
        <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
          Present this QR code at reception on your appointment day.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pass: { borderRadius: 16, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  brand: { color: '#FFF', fontSize: FONT_SIZES.sm, opacity: 0.8, letterSpacing: 2 },
  passTitle: { color: '#FFF', fontSize: FONT_SIZES.xl, fontWeight: '800', marginTop: SPACING.xs },
  card: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg },
  refLabel: { fontSize: FONT_SIZES.sm },
  ref: { fontSize: FONT_SIZES.xl, fontWeight: '800', marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  label: { width: 80, textTransform: 'capitalize' },
  divider: { height: 1, marginVertical: SPACING.md },
  consultTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.sm },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 8, marginTop: SPACING.sm },
  qrContainer: { alignItems: 'center', marginTop: SPACING.lg, padding: SPACING.md, backgroundColor: '#FFF', borderRadius: 12 },
  qrHint: { fontSize: FONT_SIZES.sm, textAlign: 'center', marginTop: SPACING.md, lineHeight: 20 },
  errorText: { fontSize: FONT_SIZES.lg, fontWeight: '600', textAlign: 'center' },
  backBtn: { borderRadius: 10, padding: SPACING.md, alignItems: 'center', minWidth: 120 },
});
