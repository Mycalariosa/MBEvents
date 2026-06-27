import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, Input, Button, Header } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { forgotPasswordSchema } from '@/src/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    const { error } = await resetPassword(data.email);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    Alert.alert('OTP Sent', 'Check your email for the verification code.', [
      { text: 'OK', onPress: () => router.push({ pathname: '/(auth)/forgot-password/verify-otp' as never, params: { email: data.email } }) },
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Forgot Password" />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input label="Email Address" value={value} onChangeText={onChange} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" />
        )}
      />
      <Button title="Send OTP" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScreenContainer>
  );
}
