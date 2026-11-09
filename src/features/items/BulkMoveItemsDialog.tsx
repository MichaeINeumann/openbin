import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BinPickerList } from '@/components/ui/bin-picker-list';
import { useBinList } from '@/features/bins/useBins';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';

interface BulkMoveItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onApply: (ids: string[], targetBinId: string, targetBinName: string) => Promise<void>;
}

export function BulkMoveItemsDialog({ open, onOpenChange, selectedIds, onApply }: BulkMoveItemsDialogProps) {
  const { t: tx } = useTranslation('ui');
  const [search, setSearch] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const { bins } = useBinList(undefined, 'name', undefined, !open);
  const targetName = bins.find((b) => b.id === targetId)?.name ?? '';

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
      title={tx('items_bulkMoveTitle', { count: selectedIds.length })}
      description={tx("select_a_bin_to_move_the_items_into_9e4842", { defaultValue: "Select a bin to move the items into." })}
      selectedIds={selectedIds}
      onApply={async (ids) => {
        if (!targetId) return;
        await onApply(ids, targetId, targetName);
      }}
      applyDisabled={!targetId}
      applyLabel={tx('bulk_move')}
      loadingLabel={tx('bulk_moving')}
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
