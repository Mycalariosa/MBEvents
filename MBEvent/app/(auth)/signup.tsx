import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, Input, Button, Header } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { signupSchema, type SignupFormData } from '@/src/utils/validation';
import { SPACING, FONT_SIZES } from '@/src/constants';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      username: data.username,
      phone: data.phone,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error);
      return;
    }

    Alert.alert('Success', 'Account created! Please check your email to verify, then login.', [
      { text: 'OK', onPress: () => router.replace('/(auth)/login' as never) },
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Create Account" />
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Simple registration to get started</Text>

      {(['fullName', 'username', 'email', 'phone'] as const).map((field) => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({ field: { onChange, value } }) => (
            <Input
              label={field === 'fullName' ? 'Full Name' : field === 'phone' ? 'Mobile Number' : field.charAt(0).toUpperCase() + field.slice(1)}
              value={value}
              onChangeText={onChange}
              error={errors[field]?.message}
              autoCapitalize={field === 'email' || field === 'username' ? 'none' : 'words'}
              keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
            />
          )}
        />
      ))}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input label="Password" value={value} onChangeText={onChange} error={errors.password?.message} isPassword />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <Input label="Confirm Password" value={value} onChangeText={onChange} error={errors.confirmPassword?.message} isPassword />
        )}
      />

      <Button title="Sign Up" onPress={handleSubmit(onSubmit)} loading={loading} />

      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
        <Link href={'/(auth)/login' as never} asChild>
          <TouchableOpacity>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
});
