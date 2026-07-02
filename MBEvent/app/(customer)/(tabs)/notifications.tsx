import { EmptyState, Header, ScreenContainer } from '@/src/components';
import { FONT_SIZES, SPACING } from '@/src/constants';
import { useAuth } from '@/src/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useTheme } from '@/src/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const { notifications, markAsRead, markAllRead } = useNotifications(profile?.id);

  const getIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      booking_approved: 'check-circle',
      booking_rejected: 'close-circle',
      payment_success: 'cash-check',
      new_booking: 'calendar-plus',
    };
    return icons[type] ?? 'bell';
  };

  return (
    <ScreenContainer scroll={false}>
      <Header title="MBEvents" showBack={false} showLogo />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        {notifications.some((n) => !n.is_read) && (
          <TouchableOpacity onPress={() => void markAllRead()}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <EmptyState icon="bell-off" title="No notifications" message="You're all caught up!" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.notifCard,
                {
                  backgroundColor: item.is_read ? colors.card : colors.primary + '10',
                  borderColor: colors.accent,
                  borderLeftWidth: 4,
                },
              ]}
              onPress={() => void markAsRead(item.id)}
            >
              <MaterialCommunityIcons
                name={getIcon(item.type)}
                size={24}
                color={isDark ? colors.accent : colors.primary}
              />
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{item.body}</Text>
                <Text style={[styles.notifDate, { color: colors.textSecondary }]}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700' },
  notifCard: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  notifContent: { flex: 1, marginLeft: SPACING.md },
  notifTitle: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  notifBody: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  notifDate: { fontSize: FONT_SIZES.xs, marginTop: SPACING.xs },
});
