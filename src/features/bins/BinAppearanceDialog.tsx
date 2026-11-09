import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Bin, Photo } from '@/types';
import { BinDetailAppearanceTab } from './BinDetailAppearanceTab';
import type { useAutoSaveBin } from './useAutoSaveBin';

interface BinAppearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bin: Bin;
  autoSave: ReturnType<typeof useAutoSaveBin>;
  photos: Photo[];
}

export function BinAppearanceDialog({ open, onOpenChange, bin, autoSave, photos }: BinAppearanceDialogProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tx("customize_appearance_a70650", { defaultValue: "Customize appearance" })}</DialogTitle>
          <DialogDescription> {tx("changes_save_automatically_b3fdb8", { defaultValue: "Changes save automatically." })} </DialogDescription>
        </DialogHeader>
        <BinDetailAppearanceTab bin={bin} autoSave={autoSave} photos={photos} />
      </DialogContent>
    </Dialog>
  );
}
