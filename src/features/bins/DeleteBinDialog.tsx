import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTerminology } from '@/lib/terminology';

interface DeleteBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binName: string;
  onConfirm: () => void | Promise<void>;
}

export function DeleteBinDialog({ open, onOpenChange, binName, onConfirm }: DeleteBinDialogProps) {
  const { t: tx } = useTranslation('ui');
  const t = useTerminology();
  const [deleting, setDeleting] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!deleting) onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("delete_this_4d01db", { defaultValue: "Delete this" })} {t.bin}?</DialogTitle>
          <DialogDescription> {tx("this_will_delete_apos_029e92", { defaultValue: "This will delete '" })}{binName}{tx("apos_and_all_its_photos_you_can_undo_this_action_briefly_aft_10c08a", { defaultValue: "' and all its photos. You can undo this action briefly after deletion." })} </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={deleting}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? tx("deleting_c7ac55", { defaultValue: "Deleting…" }) : tx("delete_f6fdbe", { defaultValue: "Delete" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
