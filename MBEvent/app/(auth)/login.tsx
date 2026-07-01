import { Button, Input, ScreenContainer } from '@/src/components';
import { COLORS, FONT_SIZES, SPACING } from '@/src/constants';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/hooks/useTheme';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { loginSchema, type LoginFormData } from '@/src/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const REMEMBERED_USERS_KEY = 'rememberedUsers'; // JSON array of identifiers
const REMEMBERED_LAST_USER_KEY = 'rememberedUserLast';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberedUsers, setRememberedUsers] = useState<string[]>([]);
  const [rememberedLast, setRememberedLast] = useState<string>('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' }, // password must stay empty for "remember me"
  });

  const watchedIdentifier = watch('identifier');

  const restoreRememberMe = useCallback(async () => {
    try {
      const usersRaw = await SecureStore.getItemAsync(REMEMBERED_USERS_KEY);
      const lastRaw = await SecureStore.getItemAsync(REMEMBERED_LAST_USER_KEY);

      const parsed =
        usersRaw && usersRaw.trim().length > 0
          ? (JSON.parse(usersRaw) as unknown)
          : [];

      const normalized =
        Array.isArray(parsed)
          ? parsed
              .filter((x) => typeof x === 'string' && x.trim().length > 0)
              .map((x) => x.trim())
          : [];

      setRememberedUsers(normalized);
      setRememberedLast(typeof lastRaw === 'string' ? lastRaw : '');

      // Keep input empty. Only show suggestion rows when user starts typing.
      setRememberMe(normalized.length > 0);
      setValue('identifier', '');
      setValue('password', '');
    } catch {
      // ignore secure storage read errors
      setRememberMe(false);
      setRememberedUsers([]);
      setRememberedLast('');
      setValue('identifier', '');
      setValue('password', '');
    }
  }, [setValue]);

  useFocusEffect(
    useCallback(() => {
      restoreRememberMe();
    }, [restoreRememberMe])
  );

  const suggestionCandidates = useMemo(() => {
    if (!rememberMe) return [];

    const typed = (watchedIdentifier ?? '').trim().toLowerCase();
    if (typed.length === 0) return [];

    // Suggest identifiers that start with what user typed (prefix match), max 6.
    const unique = Array.from(new Set(rememberedUsers.map((u) => u.trim())));

    return unique
      .filter((id) => id.toLowerCase().startsWith(typed))
      .slice(0, 6);
  }, [rememberMe, rememberedUsers, watchedIdentifier]);

  const applySuggestion = useCallback(
    (id: string) => {
      setValue('identifier', id, { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const { error, profile } = await signIn(data.identifier, data.password);

      if (error) {
        Alert.alert('Login Failed', error);
        return;
      }

      if (!profile) {
        Alert.alert('Login Failed', 'Could not load your profile. Please try again.');
        return;
      }

      if (rememberMe) {
        const identifier = data.identifier.trim();

        try {
          const usersRaw = await SecureStore.getItemAsync(REMEMBERED_USERS_KEY);
          const parsed = usersRaw && usersRaw.trim().length > 0 ? JSON.parse(usersRaw) : [];
          const list = Array.isArray(parsed) ? (parsed as unknown[]) : [];

          const normalized = list
            .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
            .map((x) => x.trim());

          // Ensure "last used" gets bumped to the front (and dedupe).
          const deduped = Array.from(new Set([identifier, ...normalized.filter((x) => x !== identifier)]));

          await SecureStore.setItemAsync(REMEMBERED_USERS_KEY, JSON.stringify(deduped));
          await SecureStore.setItemAsync(REMEMBERED_LAST_USER_KEY, identifier);
          setRememberedUsers(deduped);
          setRememberedLast(identifier);
        } catch {
          // If storage update fails, don't block login success.
        }
      }

      if (profile.role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard' as never);
      } else {
        router.replace('/(customer)/(tabs)/home' as never);
      }
    } finally {
      setLoading(false);
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
          <View>
            <Input
              label="Username or Email"
              value={value}
              onChangeText={onChange}
              error={errors.identifier?.message}
              autoCapitalize="none"
            />

            {suggestionCandidates.length > 0 && (
              <View>
                {suggestionCandidates.map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.suggestionRow, { borderColor: colors.primary + '55' }]}
                    onPress={() => applySuggestion(id)}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: colors.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' }}>
                      {id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Password"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            isPassword
          />
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
  suggestionRow: {
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
