import { ExternalLink, Hash, PackageMinus, Pencil, Trash2, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionMenu, MenuDivider, MenuItem } from '@/components/ui/action-menu';

interface ItemActionMenuProps {
  onOpenBin: () => void;
  onCheckout?: () => void;
  onAdjustQuantity?: () => void;
  onRename?: () => void;
  onRemove?: () => void;
  onRestoreBin?: () => void;
  canWrite: boolean;
  isTrashed: boolean;
}

export function ItemActionMenu({
  onOpenBin, onCheckout, onAdjustQuantity, onRename, onRemove, onRestoreBin,
  canWrite, isTrashed,
}: ItemActionMenuProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <ActionMenu
      triggerAriaLabel="Item actions"
      triggerClassName="shrink-0 inline-flex items-center justify-center h-8 w-8 -mr-1 rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)] transition-colors"
      menuClassName="min-w-[180px]"
    >
      {isTrashed ? (
        <MenuItem icon={Undo2} label={tx("restore_open_c3e3a7", { defaultValue: "Restore & open" })} onClick={onRestoreBin ?? onOpenBin} />
      ) : (
        <>
          <MenuItem icon={ExternalLink} label={tx("open_bin_6387ef", { defaultValue: "Open bin" })} onClick={onOpenBin} />
          {canWrite && (
            <>
              <MenuDivider />
              <MenuItem icon={PackageMinus} label={tx("checkout_3ac8e9", { defaultValue: "Checkout" })} onClick={onCheckout} />
              <MenuItem icon={Hash} label={tx("adjust_quantity_645b76", { defaultValue: "Adjust quantity" })} onClick={onAdjustQuantity} />
              <MenuItem icon={Pencil} label={tx("rename_d3f4cb", { defaultValue: "Rename" })} onClick={onRename} />
              <MenuDivider />
              <MenuItem icon={Trash2} label={tx("remove_e96390", { defaultValue: "Remove" })} onClick={onRemove} destructive />
            </>
          )}
        </>
      )}
    </ActionMenu>
  );
}
