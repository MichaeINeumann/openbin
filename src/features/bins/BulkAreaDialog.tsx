import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaPicker } from '@/features/areas/AreaPicker';
import { useAuth } from '@/lib/auth';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import { pluralizeBins } from './pluralizeBins';
import { updateBin } from './useBins';

interface BulkAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binIds: string[];
  onDone: () => void;
}

export function BulkAreaDialog({ open, onOpenChange, binIds, onDone }: BulkAreaDialogProps) {
  const { t: tx } = useTranslation('ui');
  const { activeLocationId } = useAuth();
  const [areaId, setAreaId] = useState<string | null>(null);

  async function apply(ids: string[]) {
    await Promise.all(ids.map((id) => updateBin(id, { areaId })));
    setAreaId(null);
  }

  return (
    <BulkUpdateDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tx("move_to_area_ecf499", { defaultValue: "Move to Area" })}
      description={tx("assign_value0_to_an_area_c528ad", { defaultValue: "Assign {{value0}} to an area.", value0: pluralizeBins(binIds.length) })}
      selectedIds={binIds}
      onApply={apply}
      onApplied={onDone}
      loadingLabel="Moving..."
    >
      <div className="space-y-2">
        <AreaPicker
          locationId={activeLocationId ?? undefined}
          value={areaId}
          onChange={setAreaId}
        />
      </div>
    </BulkUpdateDialog>
  );
}
