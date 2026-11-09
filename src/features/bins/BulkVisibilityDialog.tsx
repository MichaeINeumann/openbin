import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import { useBinTerm } from '@/lib/terminology';
import type { BinVisibility } from '@/types';
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
  const binTerm = useBinTerm();
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
      description={tx('bins_bulkVisibilityDescription', { count: binIds.length, term: binTerm(binIds.length) })}
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
