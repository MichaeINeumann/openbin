import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/api';
import { Events, notify } from '@/lib/eventBus';

type ToastFn = (toast: { message: string; variant?: 'error' | 'success' }) => void;

export function useCheckoutBulkActions(
  locationId: string | null,
  clearSelection: () => void,
  showToast: ToastFn,
) {
  const { t: tx } = useTranslation('ui');
  const [isBusy, setIsBusy] = useState(false);

  const call = useCallback(
    async (
      checkoutIds: string[],
      targetBinId: string | undefined,
      targetName: string | undefined,
    ) => {
      if (!locationId) return;
      setIsBusy(true);
      try {
        const body: Record<string, unknown> = { checkoutIds };
        if (targetBinId) body.targetBinId = targetBinId;
        const { returned, errors } = await apiFetch<{
          returned: number;
          errors: Array<{ id: string; reason: string }>;
        }>(`/api/locations/${encodeURIComponent(locationId)}/checkouts/bulk-return`, {
          method: 'POST',
          body,
        });
        notify(Events.CHECKOUTS);
        notify(Events.BINS);
        clearSelection();
        // Separate keys instead of an optional " to X" fragment, so each
        // language can place the target wherever its grammar needs it.
        const main = targetName
          ? tx('checkouts_bulkReturnedTo', { count: returned, binName: targetName })
          : tx('checkouts_bulkReturned', { count: returned });
        const message = errors.length > 0
          ? `${main}. ${tx('bulk_failedCount', { count: errors.length })}.`
          : main;
        showToast({ message });
      } finally {
        setIsBusy(false);
      }
    },
    [locationId, clearSelection, showToast, tx],
  );

  const bulkReturn = useCallback(
    (checkoutIds: string[]) => call(checkoutIds, undefined, undefined),
    [call],
  );
  const bulkReturnToBin = useCallback(
    (checkoutIds: string[], targetBinId: string, targetBinName: string) =>
      call(checkoutIds, targetBinId, targetBinName),
    [call],
  );

  return { bulkReturn, bulkReturnToBin, isBusy };
}
