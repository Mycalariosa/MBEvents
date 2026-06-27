import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Button } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function AdminProfileScreen() {
  const { profile, signOut } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login' as never); } },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, { backgroundColor: colors.primary + '15' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="shield-account" size={40} color="#FFF" />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{profile?.full_name}</Text>
        <Text style={[styles.role, { color: colors.primary }]}>Administrator</Text>
        <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZES.sm }}>{profile?.email}</Text>
      </View>

      <Button title="Logout" variant="danger" onPress={handleLogout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginTop: SPACING.md },
  role: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: SPACING.xs, marginBottom: SPACING.sm },
});
