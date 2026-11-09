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
import { useBinTerm } from '@/lib/terminology';

interface BulkReturnOriginalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => Promise<void>;
}

export function BulkReturnOriginalDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
}: BulkReturnOriginalDialogProps) {
  const { t: tx } = useTranslation('ui');
  const binTerm = useBinTerm();
  const [loading, setLoading] = useState(false);
  async function handle() {
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
          <DialogTitle>{tx('checkouts_returnOriginalTitle', { count, term: binTerm(count) })}</DialogTitle>
          <DialogDescription> {tx("each_item_goes_back_to_where_it_was_checked_out_from_b0602b", { defaultValue: "Each item goes back to where it was checked out from." })} </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button onClick={handle} disabled={loading}>
            {loading ? tx('bulk_returning') : tx('bulk_return')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
