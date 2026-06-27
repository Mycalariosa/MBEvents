import { useState } from 'react';
import { Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Input, Button, Header } from '@/src/components';
import { useTheme } from '@/src/hooks/useTheme';
import { FONT_SIZES } from '@/src/constants';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useTheme();
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }
    router.push({ pathname: '/(auth)/forgot-password/reset-password' as never, params: { email } });
  };

  return (
    <ScreenContainer>
      <Header title="Verify OTP" />
      <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZES.sm, marginBottom: 16 }}>
        Enter the 6-digit code sent to {email}
      </Text>
      <Input label="OTP Code" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
      <Button title="Verify OTP" onPress={handleVerify} />
    </ScreenContainer>
  );
}
