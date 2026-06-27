import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';

export default function AdminLayout() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) router.replace('/(auth)/login' as never);
    else if (profile?.role !== 'admin') router.replace('/(customer)/(tabs)/home' as never);
  }, [session, profile, loading]);

  if (loading || !session || profile?.role !== 'admin') return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="manage" />
      <Stack.Screen name="booking-detail/[id]" />
    </Stack>
  );
}
