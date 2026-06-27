import { ScreenContainer, Header, Input, Button } from '@/src/components';
import { useRouter } from 'expo-router';
import { useGenericBookingStore } from '@/src/stores';

export default function GenericTimeScreen() {
  const router = useRouter();
  const { eventTime, setEventTime } = useGenericBookingStore();

  return (
    <ScreenContainer>
      <Header title="Choose Time" />
      <Input label="Event Time (HH:MM)" value={eventTime ?? ''} onChangeText={setEventTime} placeholder="14:00" />
      <Button title="Additional Requests" onPress={() => router.push('/(customer)/booking/generic/requests' as never)} disabled={!eventTime} />
    </ScreenContainer>
  );
}
