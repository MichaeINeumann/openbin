import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationSelectList } from '@/features/locations/LocationSelectList';
import { useLocationList } from '@/features/locations/useLocations';
import { useAuth } from '@/lib/auth';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import { useBinTerm } from '@/lib/terminology';
import { moveBin } from './useBins';

interface BulkLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binIds: string[];
  onDone: () => void;
}

export function BulkLocationDialog({ open, onOpenChange, binIds, onDone }: BulkLocationDialogProps) {
  const { t: tx } = useTranslation('ui');
  const binTerm = useBinTerm();
  const { activeLocationId } = useAuth();
  const { locations } = useLocationList();
  const otherLocations = locations.filter((l) => l.id !== activeLocationId);
  const [targetId, setTargetId] = useState<string | null>(null);

  async function apply(ids: string[]) {
    if (!targetId) return;
    await Promise.all(ids.map((id) => moveBin(id, targetId)));
    setTargetId(null);
  }

  return (
    <BulkUpdateDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tx("move_to_location_418b89", { defaultValue: "Move to Location" })}
      description={tx('bins_bulkLocationDescription', { count: binIds.length, term: binTerm(binIds.length) })}
      selectedIds={binIds}
      onApply={apply}
      onApplied={onDone}
      applyDisabled={!targetId}
      applyLabel={tx('bulk_move')}
      loadingLabel={tx('bulk_moving')}
    >
      <LocationSelectList
        locations={otherLocations}
        value={targetId}
        onChange={setTargetId}
        emptyMessage={tx("no_other_locations_available_cdd3d5", { defaultValue: "No other locations available." })}
      />
    </BulkUpdateDialog>
  );
}
