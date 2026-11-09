import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BulkDeleteItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => Promise<void>;
}

export function BulkDeleteItemsDialog({ open, onOpenChange, count, onConfirm }: BulkDeleteItemsDialogProps) {
  const { t: tx } = useTranslation('ui');
  const [loading, setLoading] = useState(false);
  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx('items_bulkDeleteTitle', { count })}</DialogTitle>
          <DialogDescription>{tx("you_can_undo_this_immediately_after_f4fb95", { defaultValue: "You can undo this immediately after." })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>{tx("cancel_77dfd2", { defaultValue: "Cancel" })}</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? tx("deleting_c7ac55", { defaultValue: "Deleting…" }) : tx("delete_f6fdbe", { defaultValue: "Delete" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
