import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/api';
import { Events, notify } from '@/lib/eventBus';
import { pluralize } from '@/lib/utils';

type ToastFn = (toast: { message: string; variant?: 'error' | 'success' }) => void;

export function useTagBulkActions(locationId: string | null, clearSelection: () => void, showToast: ToastFn) {
  const { t: tx } = useTranslation('ui');
  const [isBusy, setIsBusy] = useState(false);

  function notifyTagsChanged() {
    notify(Events.BINS);
    notify(Events.TAG_COLORS);
  }

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
        showToast({ message: tx("deleted_value0_from_value1_5fec83", { defaultValue: "Deleted {{value0}} from {{value1}}", value0: pluralize(tagsDeleted, 'tag'), value1: pluralize(binsUpdated, 'bin') }) });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast],
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
        const verb = parentTag ? 'Set parent' : 'Cleared parent';
        showToast({ message: tx("verb_for_value1_a8b7ff", { defaultValue: "{{verb}} for {{value1}}", verb: verb, value1: pluralize(tagsUpdated, 'tag') }) });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast],
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
        showToast({ message: tx("set_color_for_value0_e0e7a2", { defaultValue: "Set color for {{value0}}", value0: pluralize(tagsUpdated, 'tag') }) });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast],
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
        showToast({ message: tx("merged_value0_into_totag_across_value2_e5070d", { defaultValue: "Merged {{value0}} into \"{{toTag}}\" across {{value2}}", value0: pluralize(fromTags.length, 'tag'), toTag: toTag, value2: pluralize(binsUpdated, 'bin') }) });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast],
  );

  return { bulkDelete, bulkSetParent, bulkSetColor, bulkMerge, isBusy };
}
