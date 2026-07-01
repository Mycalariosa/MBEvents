import { useState } from 'react';
import { Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, Input, Button, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/hooks/useAuth';
import { FONT_SIZES } from '@/src/constants';
import { otpSchema, type OTPFormData } from '@/src/utils/validation';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useTheme();
  const { verifyOTP, sendOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = async (data: OTPFormData) => {
    setLoading(true);
    const { error } = await verifyOTP(email, data.otp);
    setLoading(false);

    if (error) {
      Alert.alert('Invalid OTP', 'The code you entered is incorrect or has expired. Please try again.');
      return;
    }

    router.push({
      pathname: '/(auth)/forgot-password/reset-password' as never,
      params: { email, otp: data.otp } as never,
    });
  };

  const handleResend = async () => {
    setResending(true);
    const { error } = await sendOTP(email);
    setResending(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    Alert.alert('OTP Sent', `A new verification code has been sent to ${email}.`);
  };

  const handleBack = () => {
    router.replace('/(auth)/forgot-password' as never);
  };

  return (
    <ScreenContainer>
      <Header title="Verify OTP" />
      <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZES.sm, marginBottom: 16 }}>
        Enter the 6-digit OTP sent to {email}
      </Text>
      <Controller
        control={control}
        name="otp"
        render={({ field: { onChange, value } }) => (
          <Input
            label="OTP"
            value={value}
            onChangeText={onChange}
            error={errors.otp?.message}
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
          />
        )}
      />
      <Button title="Verify OTP" onPress={handleSubmit(onSubmit)} loading={loading} />
      <Button
        title="Resend OTP"
        onPress={handleResend}
        loading={resending}
        variant="outline"
        style={{ marginTop: 12 }}
      />
      <Button
        title="Back"
        onPress={handleBack}
        loading={false}
        variant="outline"
        style={{ marginTop: 12 }}
      />
    </ScreenContainer>
  );
}
