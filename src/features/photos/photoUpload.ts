import type { TFunction } from 'i18next';
import { ApiError } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { compressImage } from './compressImage';
import { addPhoto } from './usePhotos';

export interface PhotoUploadFailure {
  file: File;
  error: unknown;
}

export interface PhotoUploadResult {
  uploadedIds: string[];
  failures: PhotoUploadFailure[];
}

function isBinLimitError(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'BIN_PHOTO_LIMIT';
}

function firstNumber(text: string): string | null {
  const m = text.match(/\d+/);
  return m ? m[0] : null;
}

/**
 * Turn a photo upload error into a sentence the user can act on.
 * Server messages carry dynamic limits ("Maximum 20 photos per bin"), so they
 * are mapped by error code instead of exact-text localisation.
 */
export function describePhotoUploadError(err: unknown, tx: TFunction<'ui'>): string {
  if (err instanceof ApiError) {
    if (err.code === 'BIN_PHOTO_LIMIT') {
      const max = firstNumber(err.message);
      return max
        ? tx('photos_errorBinLimit', { max, defaultValue: 'Photo limit reached (max. {{max}} per bin). An admin can raise MAX_PHOTOS_PER_BIN.' })
        : tx('photos_errorBinLimitNoMax', { defaultValue: 'Photo limit for this bin reached. An admin can raise MAX_PHOTOS_PER_BIN.' });
    }
    if (err.code === 'PAYLOAD_TOO_LARGE' || err.status === 413 || /too large/i.test(err.message)) {
      return tx('photos_errorTooLarge', { defaultValue: 'Photo is too large. An admin can raise MAX_PHOTO_SIZE_MB.' });
    }
    if (/^Only JPEG/.test(err.message) || /does not match an allowed image type/.test(err.message)) {
      return tx('photos_errorUnsupportedType', { defaultValue: 'Unsupported image format. Allowed: JPEG, PNG, WebP, GIF.' });
    }
  }
  return getErrorMessage(err, tx('upload_failed_ad0d06', { defaultValue: 'Upload failed' }));
}

/** One toast line for a batch: count + the first failure's reason. */
export function summarizePhotoUploadFailures(failures: PhotoUploadFailure[], tx: TFunction<'ui'>): string | null {
  if (failures.length === 0) return null;
  return tx('photos_uploadFailedWithReason', {
    count: failures.length,
    reason: describePhotoUploadError(failures[0].error, tx),
    defaultValue: '{{count}} photo(s) not uploaded: {{reason}}',
  });
}

async function toUploadFile(file: File): Promise<File> {
  const compressed = await compressImage(file);
  return compressed instanceof File
    ? compressed
    : new File([compressed], file.name, { type: compressed.type || file.type || 'image/jpeg' });
}

/**
 * Compress and upload photos with bounded concurrency. Once the server reports
 * the per-bin limit, the remaining files are not sent at all — they would only
 * fail the same way — and are reported with that same reason.
 */
export async function uploadPhotosToBin(
  binId: string,
  files: File[],
  options: { concurrency?: number; onSettled?: () => void } = {},
): Promise<PhotoUploadResult> {
  const { concurrency = 2, onSettled } = options;
  const uploadedIds: string[] = [];
  const failures: PhotoUploadFailure[] = [];
  const queue = [...files];
  let limitError: unknown = null;

  const worker = async () => {
    let file = queue.shift();
    while (file) {
      if (limitError) {
        failures.push({ file, error: limitError });
      } else {
        try {
          uploadedIds.push(await addPhoto(binId, await toUploadFile(file), { silent: true }));
        } catch (err) {
          if (isBinLimitError(err)) limitError = err;
          failures.push({ file, error: err });
        }
      }
      onSettled?.();
      file = queue.shift();
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, files.length)) }, worker));
  return { uploadedIds, failures };
}
