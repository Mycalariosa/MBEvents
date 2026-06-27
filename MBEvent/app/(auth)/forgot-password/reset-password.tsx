import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, Input, Button, Header } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { resetPasswordSchema } from '@/src/utils/validation';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: { password: string }) => {
    setLoading(true);
    const { error } = await updatePassword(data.password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    Alert.alert('Success', 'Password updated successfully!', [
      { text: 'Login', onPress: () => router.replace('/(auth)/login' as never) },
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="New Password" />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input label="New Password" value={value} onChangeText={onChange} error={errors.password?.message} isPassword />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <Input label="Confirm Password" value={value} onChangeText={onChange} error={errors.confirmPassword?.message} isPassword />
        )}
      />
      <Button title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScreenContainer>
  );
}
