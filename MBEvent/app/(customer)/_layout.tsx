import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';

export default function CustomerLayout() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/(auth)/login' as never);
    } else if (profile?.role === 'admin') {
      router.replace('/(admin)/(tabs)/dashboard' as never);
    }
  }, [session, profile, loading]);

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
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="booking-detail/[id]" />
      <Stack.Screen name="appointment-pass/[id]" />
      <Stack.Screen name="rate-booking/[id]" />
      <Stack.Screen name="booking" />
    </Stack>
  );
}
