import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/src/hooks/useAuth';
import { useThemeStore } from '@/src/stores';

const queryClient = new QueryClient();

export default function RootLayout() {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
