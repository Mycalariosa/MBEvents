import { ScreenContainer, Header, Input, Button } from '@/src/components';
import { useRouter } from 'expo-router';
import { useGenericBookingStore } from '@/src/stores';

export default function GenericDateScreen() {
  const router = useRouter();
  const { eventDate, setEventDate } = useGenericBookingStore();

  return (
    <ScreenContainer>
      <Header title="Choose Date" />
      <Input label="Event Date (YYYY-MM-DD)" value={eventDate ?? ''} onChangeText={setEventDate} placeholder="2026-12-25" />
      <Button title="Choose Time" onPress={() => router.push('/(customer)/booking/generic/time' as never)} disabled={!eventDate} />
    </ScreenContainer>
  );
}
