import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { newItemsOnly, useQuickAdd } from '../useQuickAdd';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return { ...actual, apiFetch: vi.fn() };
});
vi.mock('@/lib/auth', () => ({ useAuth: vi.fn(() => ({ activeLocationId: 'loc-1', token: 'test' })) }));
const showToast = vi.fn();
vi.mock('@/components/ui/toast', () => ({ useToast: vi.fn(() => ({ showToast })) }));
vi.mock('../useBins', () => ({ addItemsToBin: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/features/ai/useTextStructuring', () => ({
  useTextStructuring: vi.fn(() => ({
    structuredItems: null,
    isStructuring: false,
    error: null,
    structure: vi.fn(),
    clearStructured: vi.fn(),
  })),
}));

const storedStream = vi.fn();
const fileStream = vi.fn();
vi.mock('@/features/ai/useAiStream', () => ({
  useAiStream: vi.fn((endpoint: string) => ({
    stream: endpoint === '/api/ai/analyze/stream' ? storedStream : fileStream,
    isStreaming: false,
    error: null,
    cancel: vi.fn(),
    clear: vi.fn(),
  })),
}));
vi.mock('@/features/photos/photoUpload', () => ({
  uploadPhotosToBin: vi.fn(),
  describePhotoUploadError: vi.fn(() => 'limit reached'),
}));
vi.mock('@/features/photos/usePhotos', () => ({ notifyPhotosChanged: vi.fn() }));
vi.mock('@/features/photos/aiPhotoFormData', () => ({
  compressPhotosForAi: vi.fn(async (files: File[]) => files),
  buildAiPhotoFormData: vi.fn(() => 'form-data'),
}));

const { addItemsToBin } = await import('../useBins');
const { uploadPhotosToBin } = await import('@/features/photos/photoUpload');

function setup(existingItems: string[] = ['Schrauben M3']) {
  return renderHook(() =>
    useQuickAdd({
      binId: 'bin-1',
      binName: 'Elektronik',
      existingItems,
      activeLocationId: 'loc-1',
      aiConfigured: true,
      onNavigateAiSetup: vi.fn(),
    }),
  );
}

const photoFile = () => new File(['x'], 'tuete.jpg', { type: 'image/jpeg' });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('newItemsOnly', () => {
  it('drops items the bin already has (case-insensitive) and duplicates', () => {
    expect(
      newItemsOnly(
        [{ name: 'schrauben m3' }, { name: 'Dioden', quantity: 4 }, { name: ' dioden ' }, { name: '' }],
        ['Schrauben M3'],
      ),
    ).toEqual([{ name: 'Dioden', quantity: 4 }]);
  });
});

describe('useQuickAdd single-photo detection', () => {
  it('uploads the photo, analyses only that photo and previews just the new items', async () => {
    vi.mocked(uploadPhotosToBin).mockResolvedValue({ uploadedIds: ['photo-9'], failures: [] });
    storedStream.mockResolvedValue({
      name: 'Bauteile',
      items: [{ name: 'Schrauben M3' }, { name: 'Schottky-Dioden', quantity: 4 }],
    });
    const { result } = setup();

    await act(() => result.current.handlePhotoFile(photoFile()));

    expect(uploadPhotosToBin).toHaveBeenCalledWith('bin-1', [expect.any(File)]);
    expect(storedStream).toHaveBeenCalledWith({ photoIds: ['photo-9'] });
    expect(result.current.state).toBe('preview');
    expect(result.current.isPhotoPreview).toBe(true);
    expect(result.current.structuredItems).toEqual([{ name: 'Schottky-Dioden', quantity: 4 }]);

    await act(() => result.current.handleConfirmAdd());
    expect(addItemsToBin).toHaveBeenCalledWith('bin-1', [{ name: 'Schottky-Dioden', quantity: 4 }]);
    expect(result.current.state).toBe('input');
  });

  it('analyses an already stored photo from the gallery', async () => {
    storedStream.mockResolvedValue({ name: 'x', items: [{ name: 'Widerstand' }] });
    const { result } = setup([]);

    await act(() => result.current.analyzePhotos(['photo-1']));

    expect(storedStream).toHaveBeenCalledWith({ photoIds: ['photo-1'] });
    expect(result.current.structuredItems).toEqual([{ name: 'Widerstand' }]);
  });

  it('still detects items when the photo limit blocks storing the photo', async () => {
    vi.mocked(uploadPhotosToBin).mockResolvedValue({
      uploadedIds: [],
      failures: [{ file: photoFile(), error: new ApiError(413, 'Maximum 1 photos per bin', 'BIN_PHOTO_LIMIT') }],
    });
    fileStream.mockResolvedValue({ name: 'x', items: [{ name: 'Kondensator' }] });
    const { result } = setup([]);

    await act(() => result.current.handlePhotoFile(photoFile()));

    expect(storedStream).not.toHaveBeenCalled();
    expect(fileStream).toHaveBeenCalledWith('form-data');
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'warning' }));
    expect(result.current.structuredItems).toEqual([{ name: 'Kondensator' }]);
  });

  it('reports other upload errors and returns to input', async () => {
    vi.mocked(uploadPhotosToBin).mockResolvedValue({
      uploadedIds: [],
      failures: [{ file: photoFile(), error: new ApiError(422, 'Only JPEG, PNG, WebP, and GIF images are allowed', 'VALIDATION_ERROR') }],
    });
    const { result } = setup([]);

    await act(() => result.current.handlePhotoFile(photoFile()));

    expect(fileStream).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
    expect(result.current.state).toBe('input');
  });

  it('tells the user when the photo shows nothing new', async () => {
    storedStream.mockResolvedValue({ name: 'x', items: [{ name: 'schrauben m3' }] });
    const { result } = setup();

    await act(() => result.current.analyzePhotos(['photo-1']));

    expect(showToast).toHaveBeenCalledWith({ message: 'No new items found in this photo' });
    expect(result.current.state).toBe('input');
  });
});
