import type { TFunction } from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return { ...actual, apiFetch: vi.fn() };
});
vi.mock('../compressImage', () => ({ compressImage: vi.fn(async (f: File) => f) }));
vi.mock('../usePhotos', () => ({ addPhoto: vi.fn() }));

const { addPhoto } = await import('../usePhotos');
const { describePhotoUploadError, summarizePhotoUploadFailures, uploadPhotosToBin } = await import('../photoUpload');

// Minimal stand-in for i18next: resolve defaultValue and interpolate {{vars}}.
const tx = ((_key: string, opts: Record<string, unknown> = {}) =>
  String(opts.defaultValue ?? _key).replace(/\{\{(\w+)\}\}/g, (_, k) => String(opts[k] ?? ''))) as unknown as TFunction<'ui'>;

const file = (name: string) => new File(['x'], name, { type: 'image/jpeg' });
const limitError = () => new ApiError(413, 'Maximum 20 photos per bin', 'BIN_PHOTO_LIMIT');

beforeEach(() => {
  vi.mocked(addPhoto).mockReset();
});

describe('describePhotoUploadError', () => {
  it('explains the per-bin limit including the configured maximum', () => {
    expect(describePhotoUploadError(limitError(), tx)).toBe(
      'Photo limit reached (max. 20 per bin). An admin can raise MAX_PHOTOS_PER_BIN.',
    );
  });

  it('explains oversized photos', () => {
    const err = new ApiError(413, 'Upload exceeds 5 MB limit', 'PAYLOAD_TOO_LARGE');
    expect(describePhotoUploadError(err, tx)).toContain('MAX_PHOTO_SIZE_MB');
  });

  it('explains unsupported formats', () => {
    const err = new ApiError(422, 'Only JPEG, PNG, WebP, and GIF images are allowed', 'VALIDATION_ERROR');
    expect(describePhotoUploadError(err, tx)).toBe('Unsupported image format. Allowed: JPEG, PNG, WebP, GIF.');
  });

  it('falls back to the server message for anything else', () => {
    expect(describePhotoUploadError(new ApiError(403, 'Viewers cannot upload photos', 'FORBIDDEN'), tx)).toBe(
      'Viewers cannot upload photos',
    );
  });
});

describe('summarizePhotoUploadFailures', () => {
  it('returns null when nothing failed', () => {
    expect(summarizePhotoUploadFailures([], tx)).toBeNull();
  });

  it('combines the count with the first reason', () => {
    const msg = summarizePhotoUploadFailures([{ file: file('a.jpg'), error: limitError() }, { file: file('b.jpg'), error: limitError() }], tx);
    expect(msg).toBe('2 photo(s) not uploaded: Photo limit reached (max. 20 per bin). An admin can raise MAX_PHOTOS_PER_BIN.');
  });
});

describe('uploadPhotosToBin', () => {
  it('uploads every file and returns their ids', async () => {
    vi.mocked(addPhoto).mockResolvedValueOnce('p1').mockResolvedValueOnce('p2');
    const result = await uploadPhotosToBin('bin-1', [file('a.jpg'), file('b.jpg')]);
    expect(result.uploadedIds.sort()).toEqual(['p1', 'p2']);
    expect(result.failures).toEqual([]);
  });

  it('stops sending once the per-bin limit is hit and reports the rest with that reason', async () => {
    vi.mocked(addPhoto)
      .mockResolvedValueOnce('p1')
      .mockRejectedValueOnce(limitError())
      .mockResolvedValue('should-not-happen');

    const files = ['a', 'b', 'c', 'd', 'e'].map((n) => file(`${n}.jpg`));
    const onSettled = vi.fn();
    const result = await uploadPhotosToBin('bin-1', files, { concurrency: 1, onSettled });

    expect(addPhoto).toHaveBeenCalledTimes(2);
    expect(result.uploadedIds).toEqual(['p1']);
    expect(result.failures).toHaveLength(4);
    for (const f of result.failures) expect((f.error as ApiError).code).toBe('BIN_PHOTO_LIMIT');
    expect(onSettled).toHaveBeenCalledTimes(5);
  });

  it('never runs more uploads at once than the concurrency allows', async () => {
    let inFlight = 0;
    let peak = 0;
    vi.mocked(addPhoto).mockImplementation(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return 'id';
    });
    await uploadPhotosToBin('bin-1', Array.from({ length: 6 }, (_, i) => file(`${i}.jpg`)), { concurrency: 2 });
    expect(peak).toBe(2);
  });
});
