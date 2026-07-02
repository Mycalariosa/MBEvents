import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';

export default function CustomerLayout() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const timeout = setTimeout(() => {
      if (!session) {
        router.replace('/(auth)/login' as never);
      } else if (profile?.role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard' as never);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [session, profile, loading, router]);

  if (loading || !session || profile?.role !== 'customer') return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" />
      <Stack.Screen name="category/[slug]" />
      <Stack.Screen name="supplier/[id]" />
      <Stack.Screen name="supplier-list/[table]" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-and-conditions" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="about" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="history" />
      <Stack.Screen name="history/[id]" />
      <Stack.Screen name="booking-detail/[id]" />
      <Stack.Screen name="appointment-pass/[id]" />
      <Stack.Screen name="rate-booking/[id]" />
      <Stack.Screen name="booking" />
    </Stack>
  );
}
