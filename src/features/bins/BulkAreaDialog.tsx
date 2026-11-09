import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaPicker } from '@/features/areas/AreaPicker';
import { useAuth } from '@/lib/auth';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import { useBinTerm } from '@/lib/terminology';
import { updateBin } from './useBins';

interface BulkAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binIds: string[];
  onDone: () => void;
}

export function BulkAreaDialog({ open, onOpenChange, binIds, onDone }: BulkAreaDialogProps) {
  const { t: tx } = useTranslation('ui');
  const binTerm = useBinTerm();
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
      description={tx('bins_bulkAreaDescription', { count: binIds.length, term: binTerm(binIds.length) })}
      selectedIds={binIds}
      onApply={apply}
      onApplied={onDone}
      loadingLabel={tx('bulk_moving')}
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
