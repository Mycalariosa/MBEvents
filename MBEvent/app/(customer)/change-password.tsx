import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, Header, Input, Button } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { resetPasswordSchema } from '@/src/utils/validation';

export default function ChangePasswordScreen() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: { password: string }) => {
    setLoading(true);
    const { error } = await updatePassword(data.password);
    setLoading(false);
    if (error) Alert.alert('Error', error);
    else {
      Alert.alert('Success', 'Password changed!', [{ text: 'OK', onPress: () => router.back() }]);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Change Password" />
      <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
        <Input label="New Password" value={value} onChangeText={onChange} error={errors.password?.message} isPassword />
      )} />
      <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
        <Input label="Confirm Password" value={value} onChangeText={onChange} error={errors.confirmPassword?.message} isPassword />
      )} />
      <Button title="Update Password" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScreenContainer>
  );
}
