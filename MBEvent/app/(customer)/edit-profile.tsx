import { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScreenContainer, Header, Input, Button } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import { PROFILE_AVATARS_BUCKET, uploadAvatarImage, resolveStorageUrl } from '@/src/utils/storage';

export default function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarMimeType, setAvatarMimeType] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAvatarPath(profile?.avatar_url ?? null);
    setAvatarUri(resolveStorageUrl(profile?.avatar_url, PROFILE_AVATARS_BUCKET, profile?.avatar_url) ?? null);
    setAvatarLoadFailed(false);
  }, [profile]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUri]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
      preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (result.canceled || !result.assets?.length) return;
    const selected = result.assets[0];
    if (selected.uri) {
      setAvatarUri(selected.uri);
      setAvatarPath(selected.uri);
      setAvatarBase64(selected.base64 ?? null);
      setAvatarMimeType(selected.mimeType ?? (selected.base64 ? 'image/jpeg' : null));
      setAvatarLoadFailed(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);

    let updatedAvatarPath = profile.avatar_url ?? null;
    if (avatarPath && avatarPath !== profile.avatar_url) {
      const { path, error } = await uploadAvatarImage({
        uri: avatarPath,
        base64: avatarBase64 ?? undefined,
        contentType: avatarMimeType ?? undefined,
      }, profile.id);
      if (error) {
        setLoading(false);
        Alert.alert('Upload failed', error);
        return;
      }
      updatedAvatarPath = path;
      setAvatarPath(path);
      setAvatarUri(resolveStorageUrl(path, PROFILE_AVATARS_BUCKET, path));
    }

    const { data: savedProfile, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, avatar_url: updatedAvatarPath })
      .eq('id', profile.id)
      .select('avatar_url')
      .single();

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else if (updatedAvatarPath && !savedProfile?.avatar_url) {
      Alert.alert('Profile photo not saved', 'The image uploaded, but your profile row did not save the photo path.');
    } else {
      await refreshProfile();
      router.back();
    }
  };

  return (
    <ScreenContainer>
      <Header title="Edit Profile" />
      <View style={styles.avatarContainer}>
        {avatarUri && !avatarLoadFailed ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatarImage}
            contentFit="cover"
            cachePolicy="none"
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>{fullName?.charAt(0).toUpperCase() ?? 'U'}</Text>
          </View>
        )}
        <TouchableOpacity onPress={handlePickImage} style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>Change photo</Text>
        </TouchableOpacity>
      </View>
      <Input label="Full Name" value={fullName} onChangeText={setFullName} />
      <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Email" value={profile?.email ?? ''} editable={false} />
      <Input label="Username" value={profile?.username ?? ''} editable={false} />
      <Button title="Save Changes" onPress={handleSave} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatarImage: { width: 110, height: 110, borderRadius: 55, marginBottom: 14, backgroundColor: '#E5E7EB' },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarPlaceholderText: { color: '#FFF', fontSize: 36, fontWeight: '700' },
  changePhotoButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: '#213155' },
  changePhotoText: { color: '#FFF', fontWeight: '700' },
});
