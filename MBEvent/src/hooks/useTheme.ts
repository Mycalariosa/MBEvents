import { COLORS } from '@/src/constants';
import { useThemeStore } from '@/src/stores';

export function useTheme() {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setDark = useThemeStore((s) => s.setDark);

  const colors = {
    background: isDark ? COLORS.gray900 : COLORS.white,
    surface: isDark ? COLORS.gray800 : COLORS.gray50,
    card: isDark ? COLORS.gray800 : COLORS.white,
    text: isDark ? COLORS.white : COLORS.gray900,
    textSecondary: isDark ? COLORS.gray400 : COLORS.gray500,
    border: isDark ? COLORS.gray700 : COLORS.gray200,
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    accent: COLORS.accent,
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
  };

  return { isDark, toggleTheme, setDark, colors };
}
