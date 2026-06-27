import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, Input, Button } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';

export default function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile.id);
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else {
      await refreshProfile();
      router.back();
    }
  };

  return (
    <ScreenContainer>
      <Header title="Edit Profile" />
      <Input label="Full Name" value={fullName} onChangeText={setFullName} />
      <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Email" value={profile?.email ?? ''} editable={false} />
      <Input label="Username" value={profile?.username ?? ''} editable={false} />
      <Button title="Save Changes" onPress={handleSave} loading={loading} />
    </ScreenContainer>
  );
}
