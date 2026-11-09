import { PackageMinus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ItemSelectionBarProps {
  selectionCount: number;
  onCheckout: () => void;
  onRemove: () => void;
  onClear: () => void;
  isBusy?: boolean;
}

export function ItemSelectionBar({
  selectionCount,
  onCheckout,
  onRemove,
  onClear,
  isBusy,
}: ItemSelectionBarProps) {
  const { t: tx } = useTranslation('ui');
  if (selectionCount === 0) return null;
  return (
    <section
      aria-label={tx("bulk_actions_3268f9", { defaultValue: "Bulk actions" })}
      aria-live="polite"
      className="flat-heavy sticky bottom-2 mt-3 px-3 py-2.5 flex items-center gap-2 rounded-[var(--radius-md)]"
    >
      <button
        type="button"
        onClick={onClear}
        aria-label={tx("clear_selection_247fd6", { defaultValue: "Clear selection" })}
        className="shrink-0 inline-flex items-center justify-center h-8 w-8 -ml-1 rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <span className="text-[13px] font-medium text-[var(--text-primary)]">
        {selectionCount} {selectionCount === 1 ? tx("item_3a7d97", { defaultValue: "item" }) : tx("items_7316c8", { defaultValue: "items" })} {tx("selected_835f3b", { defaultValue: "selected" })} </span>
      <span className="flex-1" />
      <Button size="sm" variant="secondary" onClick={onCheckout} disabled={isBusy}>
        <PackageMinus className="h-4 w-4 mr-1" /> {tx("checkout_3ac8e9", { defaultValue: "Checkout" })} </Button>
      <Button size="sm" variant="destructive" onClick={onRemove} disabled={isBusy}>
        <Trash2 className="h-4 w-4 mr-1" /> {tx("remove_e96390", { defaultValue: "Remove" })} </Button>
    </section>
  );
}
