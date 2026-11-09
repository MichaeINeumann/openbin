import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/api';
import { Events, notify } from '@/lib/eventBus';
import { useBinCountLabel } from '@/lib/terminology';

type ToastFn = (toast: { message: string; variant?: 'error' | 'success' }) => void;

export function useTagBulkActions(locationId: string | null, clearSelection: () => void, showToast: ToastFn) {
  const { t: tx } = useTranslation('ui');
  const binCount = useBinCountLabel();
  const [isBusy, setIsBusy] = useState(false);

  const notifyTagsChanged = useCallback(() => {
    notify(Events.BINS);
    notify(Events.TAG_COLORS);
  }, []);

  const bulkDelete = useCallback(
    async (tags: string[]) => {
      if (!locationId) return;
      setIsBusy(true);
      try {
        const { tagsDeleted, binsUpdated } = await apiFetch<{ tagsDeleted: number; binsUpdated: number; orphanedChildren: number }>(
          '/api/tags/bulk-delete',
          { method: 'POST', body: { locationId, tags } },
        );
        notifyTagsChanged();
        clearSelection();
        showToast({ message: tx('tags_bulkDeleted', { count: tagsDeleted, bins: binCount(binsUpdated) }) });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast, notifyTagsChanged, tx, binCount],
  );

  const bulkSetParent = useCallback(
    async (tags: string[], parentTag: string | null) => {
      if (!locationId) return;
      setIsBusy(true);
      try {
        const { tagsUpdated } = await apiFetch<{ tagsUpdated: number }>(
          '/api/tags/bulk-set-parent',
          { method: 'POST', body: { locationId, tags, parentTag } },
        );
        notifyTagsChanged();
        clearSelection();
        showToast({
          message: parentTag
            ? tx('tags_bulkParentSet', { count: tagsUpdated })
            : tx('tags_bulkParentCleared', { count: tagsUpdated }),
        });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast, notifyTagsChanged, tx],
  );

  const bulkSetColor = useCallback(
    async (tags: string[], color: string) => {
      if (!locationId) return;
      setIsBusy(true);
      try {
        const { tagsUpdated } = await apiFetch<{ tagsUpdated: number }>(
          '/api/tags/bulk-set-color',
          { method: 'POST', body: { locationId, tags, color } },
        );
        notifyTagsChanged();
        clearSelection();
        showToast({ message: tx('tags_bulkColorSet', { count: tagsUpdated }) });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast, notifyTagsChanged, tx],
  );

  const bulkMerge = useCallback(
    async (fromTags: string[], toTag: string) => {
      if (!locationId) return;
      setIsBusy(true);
      try {
        const { binsUpdated } = await apiFetch<{ tagsMerged: number; binsUpdated: number; childrenReassigned: number }>(
          '/api/tags/bulk-merge',
          { method: 'POST', body: { locationId, fromTags, toTag } },
        );
        notifyTagsChanged();
        clearSelection();
        showToast({ message: tx('tags_bulkMerged', { count: fromTags.length, toTag, bins: binCount(binsUpdated) }) });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast, notifyTagsChanged, tx, binCount],
  );

  return { bulkDelete, bulkSetParent, bulkSetColor, bulkMerge, isBusy };
}
