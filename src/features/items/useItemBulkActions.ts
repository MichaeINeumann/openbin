import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/api';
import { Events, notify } from '@/lib/eventBus';
import { pluralize } from '@/lib/utils';

type ToastFn = (toast: {
  message: string;
  variant?: 'error' | 'success';
  action?: { label: string; onClick: () => void };
}) => void;

export type QuantityOp = 'set' | 'clear' | 'inc' | 'dec';

export function useItemBulkActions(clearSelection: () => void, showToast: ToastFn) {
  const { t: tx } = useTranslation('ui');
  const [isBusy, setIsBusy] = useState(false);

  const bulkDelete = useCallback(async (ids: string[]) => {
    setIsBusy(true);
    try {
      const { deleted } = await apiFetch<{ deleted: number }>('/api/items/bulk-delete', {
        method: 'POST',
        body: { ids },
      });
      notify(Events.BINS);
      clearSelection();
      showToast({
        message: tx("deleted_value0_8dc93c", { defaultValue: "Deleted {{value0}}", value0: pluralize(deleted, 'item') }),
        action: {
          label: tx("undo_39fc72", { defaultValue: "Undo" }),
          onClick: async () => {
            await apiFetch('/api/items/bulk-restore', { method: 'POST', body: { ids } });
            notify(Events.BINS);
          },
        },
      });
    } finally {
      setIsBusy(false);
    }
  }, [clearSelection, showToast, tx]);

  const bulkCheckout = useCallback(async (ids: string[]) => {
    setIsBusy(true);
    try {
      const { checkedOut, errors } = await apiFetch<{ checkedOut: number; errors: Array<{ id: string; reason: string }> }>(
        '/api/items/bulk-checkout',
        { method: 'POST', body: { ids } },
      );
      notify(Events.BINS);
      notify(Events.CHECKOUTS);
      clearSelection();
      const main = `Checked out ${pluralize(checkedOut, 'item')}`;
      const tail = errors.length > 0 ? `. ${pluralize(errors.length, 'failed', 'failed')}.` : '';
      showToast({ message: `${main}${tail}` });
    } finally {
      setIsBusy(false);
    }
  }, [clearSelection, showToast]);

  const bulkMove = useCallback(async (ids: string[], targetBinId: string, targetBinName: string) => {
    setIsBusy(true);
    try {
      const { moved } = await apiFetch<{ moved: number }>('/api/items/bulk-move', {
        method: 'POST',
        body: { ids, targetBinId },
      });
      notify(Events.BINS);
      clearSelection();
      showToast({ message: tx("moved_value0_to_targetbinname_cf2674", { defaultValue: "Moved {{value0}} to {{targetBinName}}", value0: pluralize(moved, 'item'), targetBinName: targetBinName }) });
    } finally {
      setIsBusy(false);
    }
  }, [clearSelection, showToast, tx]);

  const bulkQuantity = useCallback(async (ids: string[], op: QuantityOp, value?: number) => {
    setIsBusy(true);
    try {
      const body: Record<string, unknown> = { ids, op };
      if (op !== 'clear') body.value = value;
      const { updated, removed } = await apiFetch<{ updated: number; removed: number }>(
        '/api/items/bulk-quantity',
        { method: 'POST', body },
      );
      notify(Events.BINS);
      clearSelection();
      const main = `Updated ${pluralize(updated, 'item')}`;
      const tail = removed > 0 ? `. ${removed} removed.` : '';
      showToast({ message: `${main}${tail}` });
    } finally {
      setIsBusy(false);
    }
  }, [clearSelection, showToast]);

  return { bulkDelete, bulkCheckout, bulkMove, bulkQuantity, isBusy };
}
