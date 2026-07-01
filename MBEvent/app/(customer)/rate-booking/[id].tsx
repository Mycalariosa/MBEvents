import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Header, Button, Input } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { submitBookingReview } from '@/src/services/appointments';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function RateBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    if (!profile || !id) return;

    setLoading(true);
    const { error } = await submitBookingReview({
      bookingId: id,
      customerId: profile.id,
      rating,
      reviewText,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Thank You!', 'Your review has been submitted.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Rate Your Experience" />

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        How was your event with MBEvents?
      </Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <MaterialCommunityIcons
              name={star <= rating ? 'star' : 'star-outline'}
              size={44}
              color={star <= rating ? colors.warning : colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Your Review (optional)"
        value={reviewText}
        onChangeText={setReviewText}
        multiline
        placeholder="Share your experience..."
      />

      <Button title="Submit Review" onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: FONT_SIZES.md, textAlign: 'center', marginBottom: SPACING.lg },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
});
