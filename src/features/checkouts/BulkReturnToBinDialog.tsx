import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BinPickerList } from '@/components/ui/bin-picker-list';
import { useBinList } from '@/features/bins/useBins';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import { useBinTerm } from '@/lib/terminology';
import type { ItemCheckoutWithContext } from '@/types';

interface BulkReturnToBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkouts: ItemCheckoutWithContext[];
  onApply: (checkoutIds: string[], targetBinId: string, targetBinName: string) => Promise<void>;
}

export function BulkReturnToBinDialog({
  open,
  onOpenChange,
  checkouts,
  onApply,
}: BulkReturnToBinDialogProps) {
  const { t: tx } = useTranslation('ui');
  const binTerm = useBinTerm();
  const [search, setSearch] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const { bins } = useBinList(undefined, 'name', undefined, !open);
  const targetName = bins.find((b) => b.id === targetId)?.name ?? '';
  const originBinCount = useMemo(
    () => new Set(checkouts.map((c) => c.origin_bin_id)).size,
    [checkouts],
  );

  const ids = checkouts.map((c) => c.id);

  return (
    <BulkUpdateDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setTargetId(null);
          setSearch('');
        }
        onOpenChange(v);
      }}
      title={tx('checkouts_bulkReturnTitle', { count: ids.length, term: binTerm(1) })}
      description={tx('checkouts_bulkReturnSpan', { count: originBinCount, term: binTerm(originBinCount) })}
      selectedIds={ids}
      onApply={async (checkoutIds) => {
        if (!targetId) return;
        await onApply(checkoutIds, targetId, targetName);
      }}
      applyDisabled={!targetId}
      applyLabel={tx('bulk_return')}
      loadingLabel={tx('bulk_returning')}
    >
      <BinPickerList
        selectedBinId={targetId}
        onSelect={setTargetId}
        search={search}
        onSearchChange={setSearch}
        paused={!open}
      />
    </BulkUpdateDialog>
  );
}
