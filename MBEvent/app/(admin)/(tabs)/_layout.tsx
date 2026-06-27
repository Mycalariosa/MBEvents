import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks/useTheme';

export default function AdminTabs() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard" size={size} color={color} /> }} />
      <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar-star" size={size} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="clipboard-list" size={size} color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-bar" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-cog" size={size} color={color} /> }} />
    </Tabs>
  );
}
