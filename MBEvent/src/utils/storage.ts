import { supabase } from '@/src/lib/supabase';

export const SERVICE_IMAGES_BUCKET = 'service-images';
export const PROFILE_AVATARS_BUCKET = 'profile-avatars';

export function buildStoragePath(table: string, fileName: string): string {
  return `${table}/${fileName}`;
}

/** Normalize a stored value to a bucket-relative path (handles legacy full URLs). */
export function toStoragePath(pathOrUrl: string): string {
  const value = pathOrUrl.trim();
  if (!value) return value;

  for (const bucket of [SERVICE_IMAGES_BUCKET, PROFILE_AVATARS_BUCKET]) {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = value.indexOf(marker);
    if (markerIndex !== -1) {
      return decodeURIComponent(value.slice(markerIndex + marker.length));
    }
  }

  const normalized = value.replace(/^\/+/, '');
  for (const bucket of [SERVICE_IMAGES_BUCKET, PROFILE_AVATARS_BUCKET]) {
    const prefix = `${bucket}/`;
    if (normalized.startsWith(prefix)) {
      return normalized.slice(prefix.length);
    }
  }

  return normalized;
}

export function toStoragePaths(paths: string[] | null | undefined): string[] {
  if (!paths?.length) return [];
  return paths.map(toStoragePath).filter(Boolean);
}

/** Resolve a storage path or legacy URL to a displayable image URI. */
export function resolveStorageUrl(
  pathOrUrl: string | null | undefined,
  bucket = SERVICE_IMAGES_BUCKET,
  cacheKey?: string | number | null
): string | null {
  if (!pathOrUrl?.trim()) return null;

  const value = pathOrUrl.trim();
  if (/^https?:\/\//i.test(value)) return appendCacheKey(value, cacheKey);

  const path = toStoragePath(value);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return appendCacheKey(data.publicUrl, cacheKey);
}

type ImageUploadSource = string | {
  uri?: string;
  base64?: string;
  contentType?: string;
};

export async function uploadImage(
  bucket: string,
  source: ImageUploadSource,
  folder = 'uploads'
): Promise<{ path: string | null; error: string | null }> {
  try {
    let contentType = 'image/jpeg';
    let arrayBuffer: ArrayBuffer | null = null;

    if (typeof source === 'object') {
      if (source.base64) {
        contentType = normalizeContentType(source.contentType?.trim() || 'image/jpeg');
        const normalizedBase64 = source.base64.replace(/^data:.*;base64,/, '').trim();
        if (!normalizedBase64) {
          return { path: null, error: 'Selected image is empty' };
        }

        const bytes = base64ToUint8Array(normalizedBase64);
        arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      } else if (source.uri) {
        contentType = normalizeContentType(source.contentType?.trim() || contentTypeFromUri(source.uri));
        const response = await fetch(source.uri);
        if (!response.ok) {
          return { path: null, error: `Could not read image (${response.status})` };
        }
        arrayBuffer = await response.arrayBuffer();
      }
    } else {
      contentType = normalizeContentType(contentTypeFromUri(source));
      const response = await fetch(source);
      if (!response.ok) {
        return { path: null, error: `Could not read image (${response.status})` };
      }
      arrayBuffer = await response.arrayBuffer();
    }

    if (!arrayBuffer?.byteLength) {
      return { path: null, error: 'Selected image is empty' };
    }

    const fileName = `${Date.now()}.${extensionFromContentType(contentType)}`;
    const storagePath = buildStoragePath(folder, fileName);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, arrayBuffer, { contentType, upsert: false });

    if (!error && data?.path) {
      return { path: data.path, error: null };
    }

    return { path: null, error: error?.message ?? 'Upload failed' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return { path: null, error: message };
  }
}

export async function uploadServiceImage(
  table: string,
  source: ImageUploadSource
): Promise<{ path: string | null; error: string | null }> {
  return uploadImage(SERVICE_IMAGES_BUCKET, source, table);
}

export async function uploadAvatarImage(
  source: ImageUploadSource,
  userId?: string
): Promise<{ path: string | null; error: string | null }> {
  return uploadImage(PROFILE_AVATARS_BUCKET, source, userId ? `avatars/${userId}` : 'avatars');
}

export function resolveStorageUrls(paths: string[] | null | undefined, bucket = SERVICE_IMAGES_BUCKET): string[] {
  if (!paths?.length) return [];
  return paths
    .map((path) => resolveStorageUrl(path, bucket))
    .filter((url): url is string => !!url);
}

function contentTypeFromUri(uri: string): string {
  const lower = uri.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function normalizeContentType(contentType: string): string {
  const lower = contentType.toLowerCase();
  if (lower === 'image/jpg') return 'image/jpeg';
  return lower;
}

function extensionFromContentType(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/heic') return 'heic';
  if (contentType === 'image/heif') return 'heif';
  return 'jpg';
}

function appendCacheKey(url: string, cacheKey?: string | number | null): string {
  if (cacheKey === null || cacheKey === undefined || cacheKey === '') return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(String(cacheKey))}`;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
