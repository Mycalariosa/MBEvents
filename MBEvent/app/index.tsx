import { COLORS, FONT_SIZES } from '@/src/constants';
import { useAuth } from '@/src/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    scale.value = withSequence(withTiming(1.1, { duration: 800 }), withTiming(1, { duration: 400 }));
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  useEffect(() => {
    if (loading) return;

    const navigate = async () => {
      if (session && profile) {
        if (profile.role === 'admin') {
          router.replace('/(admin)/(tabs)/dashboard' as never);
        } else {
          router.replace('/(customer)/(tabs)/home' as never);
        }
        return;
      }

      await new Promise((r) => setTimeout(r, 2500));

      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding) {
        router.replace('/(auth)/login' as never);
      } else {
        router.replace('/(onboarding)' as never);
      }
    };

    navigate();
  }, [loading, session, profile]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Text style={styles.logo}>MB</Text>
        <Text style={styles.logoSub}>Events</Text>
      </Animated.View>
      <Text style={styles.tagline}>Plan. Book. Celebrate.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: { alignItems: 'center' },
  logo: { fontSize: 72, fontWeight: '800', color: COLORS.white },
  logoSub: { fontSize: FONT_SIZES.xxxl, fontWeight: '300', color: COLORS.white, letterSpacing: 8, marginTop: -8 },
  tagline: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.8)', marginTop: 24 },
});
