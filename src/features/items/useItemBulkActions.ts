import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/api';
import { Events, notify } from '@/lib/eventBus';

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
        message: tx('items_bulkDeleted', { count: deleted }),
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
      // Two independent sentences rather than one interpolated phrase: i18next
      // can only pluralize on a single `count`, and the tail carries its own.
      const main = tx('items_bulkCheckedOut', { count: checkedOut });
      const message = errors.length > 0
        ? `${main}. ${tx('bulk_failedCount', { count: errors.length })}.`
        : main;
      showToast({ message });
    } finally {
      setIsBusy(false);
    }
  }, [clearSelection, showToast, tx]);

  const bulkMove = useCallback(async (ids: string[], targetBinId: string, targetBinName: string) => {
    setIsBusy(true);
    try {
      const { moved } = await apiFetch<{ moved: number }>('/api/items/bulk-move', {
        method: 'POST',
        body: { ids, targetBinId },
      });
      notify(Events.BINS);
      clearSelection();
      showToast({ message: tx('items_bulkMoved', { count: moved, binName: targetBinName }) });
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
      const main = tx('items_bulkUpdated', { count: updated });
      const message = removed > 0
        ? `${main}. ${tx('items_bulkQuantityCleared', { count: removed })}.`
        : main;
      showToast({ message });
    } finally {
      setIsBusy(false);
    }
  }, [clearSelection, showToast, tx]);

  return { bulkDelete, bulkCheckout, bulkMove, bulkQuantity, isBusy };
}
