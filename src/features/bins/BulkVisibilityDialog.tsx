import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import type { BinVisibility } from '@/types';
import { pluralizeBins } from './pluralizeBins';
import { updateBin } from './useBins';
import { VisibilityPicker } from './VisibilityPicker';

interface BulkVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binIds: string[];
  onDone: () => void;
}

export function BulkVisibilityDialog({ open, onOpenChange, binIds, onDone }: BulkVisibilityDialogProps) {
  const { t: tx } = useTranslation('ui');
  const [visibility, setVisibility] = useState<BinVisibility>('location');

  async function apply(ids: string[]) {
    await Promise.all(ids.map((id) => updateBin(id, { visibility })));
    setVisibility('location');
  }

  return (
    <BulkUpdateDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tx("change_visibility_00fe42", { defaultValue: "Change Visibility" })}
      description={tx("set_visibility_for_value0_non_owned_bins_set_to_private_will_5a98cb", { defaultValue: "Set visibility for {{value0}}. Non-owned bins set to private will be skipped by the server.", value0: pluralizeBins(binIds.length) })}
      selectedIds={binIds}
      onApply={apply}
      onApplied={onDone}
    >
      <div className="space-y-2">
        <VisibilityPicker value={visibility} onChange={setVisibility} />
      </div>
    </BulkUpdateDialog>
  );
}
