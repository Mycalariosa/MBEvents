import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/src/lib/supabase';
import { ScreenContainer } from './ScreenContainer';
import { Header } from './Header';
import { Input } from './Input';
import { Button } from './Button';
import { useTheme } from '@/src/hooks/useTheme';
import { SPACING, FONT_SIZES } from '@/src/constants';
import { uploadServiceImage, toStoragePaths } from '@/src/utils/storage';

interface FieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
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

export function AdminServiceForm({
  table,
  title,
  route,
  id,
  eventTypeSlug,
  fields,
  nameField = 'name',
  priceField = 'price',
}: AdminServiceFormProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const isEdit = !!id;
  const [form, setForm] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventTypeId, setEventTypeId] = useState<string | null>(null);

  useEffect(() => {
    if (eventTypeSlug) {
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
            setForm(formData);
            setImages(toStoragePaths(d.images as string[]));
          }
        });
    }
  }, [id]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const { path, error } = await uploadServiceImage(table, result.assets[0].uri);
    if (path) {
      setImages((prev) => [...prev, path]);
    } else {
      Alert.alert('Upload failed', error ?? 'Could not upload image to storage.');
    }
  };

  const handleSave = async () => {
    if (!form[nameField]?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    const payload: Record<string, unknown> = {
      ...form,
      [priceField]: parseFloat(form[priceField] || '0'),
      images,
      is_active: true,
    };

    if (eventTypeId) payload.event_type_id = eventTypeId;

    fields.forEach((f) => {
      if (f.keyboardType === 'numeric' && f.key !== priceField) {
        payload[f.key] = parseInt(form[f.key] || '0', 10);
      }
    });

    let error;
    if (isEdit) {
      ({ error } = await supabase.from(table).update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from(table).insert(payload));
    }

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.back();
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <Header title={isEdit ? `Edit ${title}` : `Add ${title}`} />
      <ScrollView style={styles.form}>
        {fields.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            value={form[field.key] ?? ''}
            onChangeText={(v) => updateField(field.key, v)}
            placeholder={field.placeholder ?? field.label}
            keyboardType={field.keyboardType ?? 'default'}
            multiline={field.multiline}
          />
        ))}
        <Text style={[styles.imageLabel, { color: colors.text }]}>
          Images ({images.length})
        </Text>
        <Button title="Upload Image" variant="outline" onPress={pickImage} />
        <View style={{ height: SPACING.lg }} />
        <Button title={isEdit ? 'Update' : 'Create'} onPress={handleSave} loading={loading} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { flex: 1, padding: SPACING.md },
  imageLabel: { fontSize: FONT_SIZES.sm, fontWeight: '500', marginBottom: SPACING.sm, marginTop: SPACING.sm },
});
