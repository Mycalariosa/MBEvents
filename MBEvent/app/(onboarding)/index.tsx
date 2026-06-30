import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/src/components';
import { ONBOARDING_PAGES, COLORS, SPACING, FONT_SIZES } from '@/src/constants';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const goToLogin = async () => {
    router.replace('/(auth)/login' as never);
  };

  const goToPage = (page: number) => {
    flatListRef.current?.scrollToOffset({ offset: page * width, animated: true });
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      goToPage(currentPage + 1);
    } else {
      goToLogin();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={goToLogin}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={(e) => {
          setCurrentPage(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={64}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {ONBOARDING_PAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentPage && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={currentPage === ONBOARDING_PAGES.length - 1 ? 'Get Started' : 'Next'}
          onPress={nextPage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  skipBtn: { position: 'absolute', top: 60, right: SPACING.lg, zIndex: 10 },
  skipText: { fontSize: FONT_SIZES.md, color: COLORS.gray500, fontWeight: '600' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.gray900, textAlign: 'center', marginBottom: SPACING.md },
  description: { fontSize: FONT_SIZES.md, color: COLORS.gray500, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: SPACING.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gray300 },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
});
