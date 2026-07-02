import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, ScreenContainer } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { PROFILE_AVATARS_BUCKET, resolveStorageUrl } from '@/src/utils/storage';
import { SPACING, FONT_SIZES } from '@/src/constants';

const MENU_ITEMS = [
  { icon: 'account-edit' as const, label: 'Edit Profile', route: '/(customer)/edit-profile' },
  { icon: 'lock-reset' as const, label: 'Change Password', route: '/(customer)/change-password' },
  { icon: 'calendar-check' as const, label: 'Transaction History', route: '/(customer)/history' },
  { icon: 'heart' as const, label: 'Favorites', route: '/(customer)/favorites' },
  { icon: 'cash-multiple' as const, label: 'Payment History', route: '/(customer)/payment-history' },
  { icon: 'cog' as const, label: 'Settings', route: '/(customer)/settings' },
];

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const avatarUri = resolveStorageUrl(profile?.avatar_url, PROFILE_AVATARS_BUCKET, profile?.avatar_url);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const profileAccent = isDark ? colors.accent : '#213155';

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUri]);

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

      <View style={[styles.profileHeader, { backgroundColor: profileAccent + '15', borderColor: profileAccent }]}> 
        <View style={styles.profileTop}>
          {avatarUri && !avatarLoadFailed ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="none"
              onError={() => setAvatarLoadFailed(true)}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: profileAccent }]}>
              <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) ?? 'U'}</Text>
            </View>
          )}

          <View style={styles.headerText}>
            <Text style={[styles.name, { color: profileAccent }]}>{profile?.full_name}</Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile?.username}</Text>
            <Text style={[styles.titleText, { color: colors.textSecondary }]}>MBEvents Customer</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="email-outline" size={18} color={profileAccent} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{profile?.email}</Text>
          </View>
          {profile?.phone ? (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="phone-outline" size={18} color={profileAccent} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{profile.phone}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statusRow}>
          <View>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Member since</Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : 'N/A'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: profileAccent }]}>
            <Text style={styles.badgeText}>Verified Customer</Text>
          </View>
        </View>
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

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: isDark ? colors.accent : '#213155' }]}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={22} color={isDark ? colors.accent : '#213155'} />
        <Text style={[styles.logoutText, { color: isDark ? colors.accent : '#213155' }]}>Logout</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: { borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  avatarImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: '#FFF' },
  headerText: { flex: 1 },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
  username: { fontSize: FONT_SIZES.sm, marginTop: 4 },
  titleText: { fontSize: FONT_SIZES.sm, marginTop: 4 },
  detailsGrid: { width: '100%', marginBottom: SPACING.md },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  detailText: { fontSize: FONT_SIZES.sm },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1 },
  statusLabel: { fontSize: FONT_SIZES.sm },
  statusValue: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  badge: { paddingVertical: 6, paddingHorizontal: SPACING.md, borderRadius: 999 },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: FONT_SIZES.xs },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  menuLabel: { flex: 1, marginLeft: SPACING.md, fontSize: FONT_SIZES.md },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, padding: SPACING.md, marginTop: SPACING.xl, gap: SPACING.sm },
  logoutText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
});
