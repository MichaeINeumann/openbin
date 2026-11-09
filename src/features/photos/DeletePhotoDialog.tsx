import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeletePhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeletePhotoDialog({ open, onOpenChange, onConfirm }: DeletePhotoDialogProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("delete_photo_8006a1", { defaultValue: "Delete photo?" })}</DialogTitle>
          <DialogDescription> {tx("this_photo_will_be_permanently_deleted_this_action_cannot_be_f86f1e", { defaultValue: "This photo will be permanently deleted. This action cannot be undone." })} </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="bg-[var(--destructive)] hover:bg-[var(--destructive-hover)] text-[var(--text-on-accent)]"
          > {tx("delete_f6fdbe", { defaultValue: "Delete" })} </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
