import { supabase } from '@/src/lib/supabase';

export const SERVICE_IMAGES_BUCKET = 'service-images';

export function buildStoragePath(table: string, fileName: string): string {
  return `${table}/${fileName}`;
}

/** Normalize a stored value to a bucket-relative path (handles legacy full URLs). */
export function toStoragePath(pathOrUrl: string): string {
  const value = pathOrUrl.trim();
  if (!value) return value;

  const marker = `/storage/v1/object/public/${SERVICE_IMAGES_BUCKET}/`;
  const markerIndex = value.indexOf(marker);
  if (markerIndex !== -1) {
    return decodeURIComponent(value.slice(markerIndex + marker.length));
  }

  return value.replace(/^\/+/, '');
}

export function toStoragePaths(paths: string[] | null | undefined): string[] {
  if (!paths?.length) return [];
  return paths.map(toStoragePath).filter(Boolean);
}

/** Resolve a storage path or legacy URL to a displayable image URI. */
export function resolveStorageUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl?.trim()) return null;

  const value = pathOrUrl.trim();
  if (/^https?:\/\//i.test(value)) return value;

  const path = toStoragePath(value);
  const { data } = supabase.storage.from(SERVICE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function resolveStorageUrls(paths: string[] | null | undefined): string[] {
  if (!paths?.length) return [];
  return paths
    .map((path) => resolveStorageUrl(path))
    .filter((url): url is string => !!url);
}

function contentTypeFromUri(uri: string): string {
  const lower = uri.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function extensionFromContentType(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/heic') return 'heic';
  return 'jpg';
}

export async function uploadServiceImage(
  table: string,
  localUri: string
): Promise<{ path: string | null; error: string | null }> {
  try {
    const contentType = contentTypeFromUri(localUri);
    const fileName = `${Date.now()}.${extensionFromContentType(contentType)}`;
    const storagePath = buildStoragePath(table, fileName);

    const response = await fetch(localUri);
    if (!response.ok) {
      return { path: null, error: `Could not read image (${response.status})` };
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      return { path: null, error: 'Selected image is empty' };
    }

    const { data, error } = await supabase.storage
      .from(SERVICE_IMAGES_BUCKET)
      .upload(storagePath, arrayBuffer, { contentType, upsert: false });

    if (error) return { path: null, error: error.message };
    return { path: data.path, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return { path: null, error: message };
  }
}
