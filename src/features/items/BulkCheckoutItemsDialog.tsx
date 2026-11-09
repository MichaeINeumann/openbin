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

interface BulkCheckoutItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => Promise<void>;
}

export function BulkCheckoutItemsDialog({ open, onOpenChange, count, onConfirm }: BulkCheckoutItemsDialogProps) {
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
          <DialogTitle>{tx('items_bulkCheckoutTitle', { count })}</DialogTitle>
          <DialogDescription>{tx("already_checked_out_items_will_be_skipped_099b27", { defaultValue: "Already-checked-out items will be skipped." })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>{tx("cancel_77dfd2", { defaultValue: "Cancel" })}</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? tx("checking_out_7747e1", { defaultValue: "Checking out…" }) : tx("check_out_e9f38d", { defaultValue: "Check out" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
