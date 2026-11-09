import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Toast texts are pluralized by i18next, which the global mock cannot do.
vi.unmock('react-i18next');

const mockApiFetch = vi.fn();
const mockNotify = vi.fn();
vi.mock('@/lib/api', () => ({ apiFetch: (...a: unknown[]) => mockApiFetch(...a) }));
vi.mock('@/lib/eventBus', () => ({
  Events: { BINS: 'BINS', TAG_COLORS: 'TAG_COLORS' },
  notify: (...a: unknown[]) => mockNotify(...a),
}));
// Bin counts in these toasts go through the location's own terminology.
vi.mock('@/lib/auth', () => ({ useAuth: () => ({ activeLocationId: 'loc-1' }) }));
vi.mock('@/features/locations/useLocations', () => ({
  useLocationList: () => ({ locations: [{ id: 'loc-1', term_bin: '' }] }),
}));

import { renderHookWithI18n } from '@/test/i18nTestUtils';
import { useTagBulkActions } from '../useTagBulkActions';

describe('useTagBulkActions', () => {
  let clearSelection: () => void;
  type ToastArg = { message: string; variant?: 'error' | 'success' };
  let showToast: ReturnType<typeof vi.fn> & ((toast: ToastArg) => void);
  beforeEach(() => {
    vi.clearAllMocks();
    clearSelection = vi.fn();
    showToast = vi.fn() as ReturnType<typeof vi.fn> & ((toast: ToastArg) => void);
  });

  it('bulkDelete posts and toasts', async () => {
    mockApiFetch.mockResolvedValue({ tagsDeleted: 2, binsUpdated: 5, orphanedChildren: 1 });
    const { result } = renderHookWithI18n(() => useTagBulkActions('loc-1', clearSelection, showToast));
    await act(() => result.current.bulkDelete(['a', 'b']));
    expect(mockApiFetch).toHaveBeenCalledWith('/api/tags/bulk-delete', { method: 'POST', body: { locationId: 'loc-1', tags: ['a', 'b'] } });
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Deleted 2 tags from 5 bins' }));
    expect(mockNotify).toHaveBeenCalledWith('BINS');
    expect(mockNotify).toHaveBeenCalledWith('TAG_COLORS');
  });

  it('bulkSetParent toasts', async () => {
    mockApiFetch.mockResolvedValue({ tagsUpdated: 3 });
    const { result } = renderHookWithI18n(() => useTagBulkActions('loc-1', clearSelection, showToast));
    await act(() => result.current.bulkSetParent(['a', 'b', 'c'], 'group'));
    expect(mockApiFetch).toHaveBeenCalledWith('/api/tags/bulk-set-parent', { method: 'POST', body: { locationId: 'loc-1', tags: ['a', 'b', 'c'], parentTag: 'group' } });
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Set parent for 3 tags' }));
  });

  it('bulkSetColor toasts', async () => {
    mockApiFetch.mockResolvedValue({ tagsUpdated: 4 });
    const { result } = renderHookWithI18n(() => useTagBulkActions('loc-1', clearSelection, showToast));
    await act(() => result.current.bulkSetColor(['a', 'b', 'c', 'd'], '#ff0000'));
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Set color for 4 tags' }));
  });

  it('bulkMerge toasts', async () => {
    mockApiFetch.mockResolvedValue({ tagsMerged: 1, binsUpdated: 3, childrenReassigned: 2 });
    const { result } = renderHookWithI18n(() => useTagBulkActions('loc-1', clearSelection, showToast));
    await act(() => result.current.bulkMerge(['a', 'b'], 'unified'));
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Merged 2 tags into “unified” across 3 bins' }));
  });
});
