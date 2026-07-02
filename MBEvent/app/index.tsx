import { COLORS, FONT_SIZES } from '@/src/constants';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

const SPLASH_MIN_MS = 2500;
const PROFILE_WAIT_MS = 5000;
const logoSource = require('../assets/images/startup-logo.jpg');

export default function SplashScreen() {
  const router = useRouter();
  const { session, profile, loading, signOut } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const navigated = useRef(false);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const goToOnboarding = () => router.replace('/(onboarding)' as never);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    scale.value = withSequence(withTiming(1.1, { duration: 800 }), withTiming(1, { duration: 400 }));
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || !minTimeElapsed || navigated.current) return;

    if (!session) {
      navigated.current = true;
      goToOnboarding();
      return;
    }

    if (!profile) return;

    navigated.current = true;
    const timeout = setTimeout(() => {
      if (profile.role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard' as never);
      } else {
        router.replace('/(customer)/(tabs)/home' as never);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [loading, minTimeElapsed, session, profile, router]);

  // Session exists but profile never loads — clear stale auth and show onboarding
  useEffect(() => {
    if (loading || !session || profile || navigated.current) return;

    const timer = setTimeout(async () => {
      if (navigated.current || profile) return;
      navigated.current = true;
      await signOut();
      goToOnboarding();
    }, PROFILE_WAIT_MS);

    return () => clearTimeout(timer);
  }, [loading, session, profile, signOut, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
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
  logoImage: { width: 220, height: 220 },
  tagline: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.8)', marginTop: 24 },
});
