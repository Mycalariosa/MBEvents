import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer, BookingCard, EmptyState } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { getBookings, cancelBooking } from '@/src/services/booking';
import { BOOKING_STATUSES, SPACING, FONT_SIZES } from '@/src/constants';
import type { Booking } from '@/src/types/database';
import { Alert } from 'react-native';

export default function BookingsScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string | undefined>();

  const loadBookings = async () => {
    if (!profile) return;
    const { data } = await getBookings(profile.id, 'customer', filter);
    setBookings(data as Booking[]);
  };

  useEffect(() => {
    loadBookings();
  }, [profile, filter]);

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await cancelBooking(id);
          loadBookings();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>My Bookings</Text>

      <FlatList
        horizontal
        data={[{ id: 'all', label: 'All' }, ...BOOKING_STATUSES]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: (filter === item.id || (!filter && item.id === 'all')) ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setFilter(item.id === 'all' ? undefined : item.id)}
          >
            <Text
              style={{
                color: (filter === item.id || (!filter && item.id === 'all')) ? '#FFF' : colors.text,
                fontSize: FONT_SIZES.sm,
                fontWeight: '600',
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {bookings.length === 0 ? (
        <EmptyState icon="calendar-blank" title="No bookings yet" message="Start planning your perfect event!" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item as Booking & { packages?: { name: string }; event_types?: { name: string } }}
              onCancel={() => handleCancel(item.id)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', marginBottom: SPACING.md },
  filters: { marginBottom: SPACING.md, maxHeight: 40 },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, borderWidth: 1, marginRight: SPACING.sm },
});
