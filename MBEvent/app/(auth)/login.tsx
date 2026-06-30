import { Button, Input, ScreenContainer } from '@/src/components';
import { COLORS, FONT_SIZES, SPACING } from '@/src/constants';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { loginSchema, type LoginFormData } from '@/src/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const { error, profile } = await signIn(data.identifier, data.password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error);
      return;
    }

    if (!profile) {
      Alert.alert('Login Failed', 'Could not load your profile. Please try again.');
      return;
    }

    if (rememberMe) {
      await SecureStore.setItemAsync('rememberedUser', data.identifier);
    }

    if (profile.role === 'admin') {
      router.replace('/(admin)/(tabs)/dashboard' as never);
    } else {
      router.replace('/(customer)/(tabs)/home' as never);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.primary }]}>MBEvents</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome back!</Text>
      </View>

      {!isSupabaseConfigured && (
        <View style={[styles.configBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
          <Text style={[styles.configBannerText, { color: colors.text }]}>
            Supabase is not configured. Copy .env.example to .env, add your project URL and anon key, then restart Expo.
          </Text>
        </View>
      )}

      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, value } }) => (
          <Input label="Username or Email" value={value} onChangeText={onChange} error={errors.identifier?.message} autoCapitalize="none" />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input label="Password" value={value} onChangeText={onChange} error={errors.password?.message} isPassword />
        )}
      />

      <View style={styles.row}>
        <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
          <View style={[styles.checkbox, rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            {rememberMe && <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>}
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: FONT_SIZES.sm }}>Remember Me</Text>
        </TouchableOpacity>
        <Link href={'/(auth)/forgot-password' as never} asChild>
          <TouchableOpacity>
            <Text style={{ color: colors.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' }}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Button title="Login" onPress={handleSubmit(onSubmit)} loading={loading} />

      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary }}>Don&apos;t have an account? </Text>
        <Link href={'/(auth)/signup' as never} asChild>
          <TouchableOpacity>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Register</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.xxl },
  logo: { fontSize: FONT_SIZES.xxxl, fontWeight: '800' },
  subtitle: { fontSize: FONT_SIZES.md, marginTop: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  configBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  configBannerText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
});
