import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LocationSelectList } from '@/features/locations/LocationSelectList';
import { useTerminology } from '@/lib/terminology';
import type { Location } from '@/types';

interface MoveBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binName: string;
  locations: Location[];
  onConfirm: (locationId: string) => void;
}

export function MoveBinDialog({ open, onOpenChange, binName, locations, onConfirm }: MoveBinDialogProps) {
  const { t: tx } = useTranslation('ui');
  const t = useTerminology();
  const [targetId, setTargetId] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) setTargetId(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("move_to_another_c7eaf0", { defaultValue: "Move to another" })} {t.location}</DialogTitle>
          <DialogDescription> {tx("select_a_e103f7", { defaultValue: "Select a" })} {t.location} {tx("to_move_the_apos_a1c53d", { defaultValue: "to move the '" })}{binName}&apos; {t.bin}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <LocationSelectList
            locations={locations}
            value={targetId}
            onChange={setTargetId}
            emptyMessage={tx("no_other_locations_available_a30f27", { defaultValue: "No other {{locations}} available", locations: t.locations })}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button
            onClick={() => { if (targetId) onConfirm(targetId); }}
            disabled={!targetId}
          > {tx("move_76cdb9", { defaultValue: "Move" })} </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
