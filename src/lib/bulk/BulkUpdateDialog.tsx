import { type ReactNode, useState } from 'react';
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

export interface BulkUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  selectedIds: string[];
  onApply: (ids: string[]) => Promise<void>;
  onApplied?: () => void;
  applyDisabled?: boolean;
  applyLabel?: string;
  loadingLabel?: string;
  children: ReactNode;
}

export function BulkUpdateDialog({
  open,
  onOpenChange,
  title,
  description,
  selectedIds,
  onApply,
  onApplied,
  applyDisabled = false,
  applyLabel,
  loadingLabel,
  children,
}: BulkUpdateDialogProps) {
  // Defaults are resolved here rather than in the parameter list so they follow
  // the selected language instead of being frozen at English.
  const { t: tx } = useTranslation('ui');
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    try {
      await onApply(selectedIds);
      onOpenChange(false);
      onApplied?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tx('bulk_cancel')}
          </Button>
          <Button onClick={handleApply} disabled={loading || applyDisabled}>
            {loading ? (loadingLabel ?? tx('bulk_applying')) : (applyLabel ?? tx('bulk_apply'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
