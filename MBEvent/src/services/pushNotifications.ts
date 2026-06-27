import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) {
    return null;
  }

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const existing = (await Notifications.getPermissionsAsync()) as {
    granted?: boolean;
    status?: string;
  };
  const isGranted = existing.granted ?? existing.status === 'granted';

  if (!isGranted) {
    const requested = (await Notifications.requestPermissionsAsync()) as {
      granted?: boolean;
      status?: string;
    };
    if (!(requested.granted ?? requested.status === 'granted')) return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
