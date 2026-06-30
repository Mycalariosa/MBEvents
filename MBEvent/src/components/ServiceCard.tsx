import { FONT_SIZES, SPACING } from '@/src/constants';
import { useTheme } from '@/src/hooks/useTheme';
import type { ServiceItem } from '@/src/types/database';
import { formatCurrency } from '@/src/utils/pricing';
import { resolveStorageUrl, resolveStorageUrls } from '@/src/utils/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ServiceCardProps {
  item: ServiceItem;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  showPrice?: boolean;
  showTier?: boolean;
}

export function ServiceCard({ item, onPress, onFavorite, isFavorite, showPrice = false, showTier }: ServiceCardProps) {
  const { colors } = useTheme();
  const imageUrl = resolveStorageUrl(item.images?.[0]);
  const tierLabel = item.package_tier
    ? `${item.package_tier[0].toUpperCase()}${item.package_tier.slice(1)}`
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name="image" size={40} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          {onFavorite && (
            <TouchableOpacity onPress={onFavorite}>
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.accent : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        {item.rating ? (
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={14} color={colors.accent} />
            <Text style={[styles.rating, { color: colors.textSecondary }]}>{item.rating}</Text>
          </View>
        ) : null}
        {item.location && (
          <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.location}
          </Text>
        )}
        {showPrice ? (
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatCurrency(Number(item.price ?? item.metadata?.rental_price ?? 0))}
          </Text>
        ) : null}

        {showTier && tierLabel ? (
          <View style={[styles.tierBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '33' }]}>
            <Text style={[styles.tierBadgeText, { color: colors.primary }]}>{tierLabel}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const displayUrls = resolveStorageUrls(images);
  if (!displayUrls.length) return null;

  return (
    <FlatList
      data={displayUrls}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={{ width, height: 220 }} contentFit="cover" />
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, marginBottom: SPACING.md, overflow: 'hidden' },
  image: { width: '100%', height: 140 },
  imagePlaceholder: { width: '100%', height: 140, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: FONT_SIZES.md, fontWeight: '600', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: FONT_SIZES.sm },
  location: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  price: { fontSize: FONT_SIZES.md, fontWeight: '700', marginTop: SPACING.sm },
  tierBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginTop: SPACING.sm,
  },
  tierBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
