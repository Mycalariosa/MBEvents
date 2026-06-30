import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { ScreenContainer } from './ScreenContainer';
import { Header } from './Header';
import { Input } from './Input';
import { Button } from './Button';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';
import { uploadServiceImage, toStoragePaths, resolveStorageUrl } from '@/src/utils/storage';

interface FieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  type?: 'text' | 'numeric' | 'multiline' | 'tier';
}

interface AdminServiceFormProps {
  table: string;
  title: string;
  route: string;
  id?: string;
  eventTypeSlug?: string;
  fields: FieldConfig[];
  nameField?: string;
  priceField?: string;
}

const TABLES_WITH_EVENT_TYPE_ID = new Set([
  'venues',
  'catering_options',
  'photographers',
  'videographers',
  'makeup_artists',
  'cakes',
  'decorations',
  'entertainment_options',
  'hosts',
]);

const TIER_OPTIONS: Array<'bronze' | 'silver' | 'gold'> = ['bronze', 'silver', 'gold'];

export function AdminServiceForm({
  table,
  title,
  id,
  eventTypeSlug,
  fields,
  nameField = 'name',
}: AdminServiceFormProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const isEdit = !!id;
  const hasTierField = useMemo(() => fields.some((f) => f.key === 'package_tier'), [fields]);
  const nameLabel = fields.find((f) => f.key === nameField)?.label ?? 'Name';

  const [form, setForm] = useState<Record<string, string>>(() =>
    hasTierField ? { package_tier: 'bronze' } : ({} as Record<string, string>)
  );
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventTypeId, setEventTypeId] = useState<string | null>(null);

  useEffect(() => {
    if (eventTypeSlug && TABLES_WITH_EVENT_TYPE_ID.has(table)) {
      supabase
        .from('event_types')
        .select('id')
        .eq('slug', eventTypeSlug)
        .single()
        .then(({ data }) => {
          if (data) setEventTypeId((data as { id: string }).id);
        });
    }

    if (id) {
      supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            const d = data as Record<string, unknown>;
            const formData: Record<string, string> = {};
            fields.forEach((f) => {
              formData[f.key] = String(d[f.key] ?? '');
            });
            if (hasTierField && !formData.package_tier) {
              formData.package_tier = 'bronze';
            }
            setForm(formData);
            setImages(toStoragePaths(d.images as string[]));
          }
        });
    }
  }, [id, eventTypeSlug, table, fields, hasTierField]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (result.canceled || !result.assets.length) return;

    setLoading(true);
    const uploaded: string[] = [];
    const failures: string[] = [];

    for (const asset of result.assets) {
      const { path, error } = await uploadServiceImage(table, asset.uri);
      if (path) uploaded.push(path);
      else failures.push(error ?? 'Unknown error');
    }

    setLoading(false);

    if (uploaded.length) {
      setImages((prev) => [...prev, ...uploaded]);
    }
    if (failures.length) {
      Alert.alert(
        uploaded.length ? 'Some uploads failed' : 'Upload failed',
        failures[0] ?? 'Could not upload image to storage.'
      );
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = {
      images,
      is_active: true,
    };

    const nameValue = form[nameField]?.trim() ?? '';
    payload[nameField] = nameValue;

    if (table === 'photographers' && nameField === 'studio_name') {
      payload.name = form.name?.trim() || nameValue;
      payload.studio_name = nameValue;
    }

    if (hasTierField) {
      payload.package_tier = form.package_tier ?? 'bronze';
    }

    fields.forEach((field) => {
      if (field.type === 'tier' || field.key === 'package_tier') return;
      if (field.key === nameField) return;

      const raw = form[field.key];
      if (raw === undefined || raw.trim() === '') return;

      if (field.keyboardType === 'numeric') {
        payload[field.key] = parseInt(raw, 10) || 0;
      } else {
        payload[field.key] = raw.trim();
      }
    });

    if (eventTypeId) payload.event_type_id = eventTypeId;

    return payload;
  };

  const handleSave = async () => {
    const nameValue = form[nameField]?.trim();
    if (!nameValue) {
      Alert.alert('Error', `${nameLabel} is required`);
      return;
    }

    if (hasTierField) {
      const tier = form.package_tier ?? 'bronze';
      if (!TIER_OPTIONS.includes(tier as (typeof TIER_OPTIONS)[number])) {
        Alert.alert('Error', 'Select a package tier (Bronze, Silver, or Gold)');
        return;
      }
    }

    if (eventTypeSlug && TABLES_WITH_EVENT_TYPE_ID.has(table) && !eventTypeId) {
      Alert.alert('Please wait', 'Event type is still loading. Try again in a moment.');
      return;
    }

    setLoading(true);
    const payload = buildPayload();

    let error;
    if (isEdit) {
      ({ error } = await supabase.from(table).update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from(table).insert(payload));
    }

    setLoading(false);
    if (error) {
      const message = error.message ?? 'Save failed';
      if (/package_tier/i.test(message) && /column/i.test(message)) {
        Alert.alert(
          'Database update needed',
          'Run migration 006_package_tier_on_choices.sql in the Supabase SQL Editor, then try again.'
        );
        return;
      }
      Alert.alert('Error', message);
    } else {
      router.back();
    }
  };

  return (
    <ScreenContainer scroll={false} padded={false}>
      <Header title={isEdit ? `Edit ${title}` : `Add ${title}`} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        {fields.map((field) => (
          <View key={field.key}>
            {field.type === 'tier' || field.key === 'package_tier' ? (
              <>
                <Text style={[styles.tierLabel, { color: colors.text }]}>{field.label}</Text>
                <View style={styles.tierRow}>
                  {TIER_OPTIONS.map((tier) => {
                    const isSelected = (form.package_tier ?? 'bronze') === tier;
                    return (
                      <TouchableOpacity
                        key={tier}
                        onPress={() => updateField('package_tier', tier)}
                        style={[
                          styles.tierBtn,
                          { borderColor: colors.border },
                          isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
                        ]}
                      >
                        <Text style={{ color: isSelected ? colors.primary : colors.text }}>
                          {tier[0].toUpperCase() + tier.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <Input
                label={field.label}
                value={form[field.key] ?? ''}
                onChangeText={(v) => updateField(field.key, v)}
                placeholder={field.placeholder ?? field.label}
                keyboardType={field.keyboardType ?? 'default'}
                multiline={field.multiline}
              />
            )}
          </View>
        ))}

        <Text style={[styles.imageLabel, { color: colors.text }]}>
          Photos ({images.length})
        </Text>
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
            {images.map((path, index) => {
              const uri = resolveStorageUrl(path);
              if (!uri) return null;
              return (
                <View key={`${path}-${index}`} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: colors.error }]}
                    onPress={() => removeImage(index)}
                  >
                    <MaterialCommunityIcons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
        <Button title="Add Photos" variant="outline" onPress={pickImage} disabled={loading} />
        <View style={{ height: SPACING.lg }} />
        <Button title={isEdit ? 'Update' : 'Create'} onPress={handleSave} loading={loading} />
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { flex: 1 },
  formContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  imageLabel: { fontSize: FONT_SIZES.sm, fontWeight: '500', marginBottom: SPACING.sm, marginTop: SPACING.sm },
  imageRow: { marginBottom: SPACING.sm },
  imageWrap: { marginRight: SPACING.sm, position: 'relative' },
  thumbnail: { width: 88, height: 88, borderRadius: 10 },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: SPACING.sm, marginBottom: SPACING.xs },
  tierRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tierBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
