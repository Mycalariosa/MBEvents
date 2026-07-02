import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, ScreenContainer } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

const MENU_ITEMS = [
  { icon: 'account-edit' as const, label: 'Edit Profile', route: '/(customer)/edit-profile' },
  { icon: 'lock-reset' as const, label: 'Change Password', route: '/(customer)/change-password' },
  { icon: 'calendar-check' as const, label: 'Booking History', route: '/(customer)/(tabs)/bookings' },
  { icon: 'heart' as const, label: 'Favorites', route: '/(customer)/favorites' },
  { icon: 'cash-multiple' as const, label: 'Payment History', route: '/(customer)/payment-history' },
  { icon: 'cog' as const, label: 'Settings', route: '/(customer)/settings' },
];

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login' as never);
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="MBEvents" showBack={false} showLogo />
      <View style={[styles.profileHeader, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}> 
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) ?? 'U'}</Text>
        </View>
        <Text style={[styles.name, { color: colors.accent }]}>{profile?.full_name}</Text>
        <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile?.username}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{profile?.email}</Text>
        {profile?.phone && <Text style={[styles.phone, { color: colors.textSecondary }]}>{profile.phone}</Text>}
        <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
          Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : ''}
        </Text>
      </View>

      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => router.push(item.route as never)}
        >
          <MaterialCommunityIcons name={item.icon} size={22} color={isDark ? colors.accent : colors.primary} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={isDark ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error }]} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={22} color={isDark ? colors.accent : colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginTop: SPACING.md },
  username: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  email: { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs },
  phone: { fontSize: FONT_SIZES.sm },
  memberSince: { fontSize: FONT_SIZES.xs, marginTop: SPACING.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  menuLabel: { flex: 1, marginLeft: SPACING.md, fontSize: FONT_SIZES.md },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, padding: SPACING.md, marginTop: SPACING.xl, gap: SPACING.sm },
  logoutText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
});
