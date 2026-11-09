import { useTranslation } from 'react-i18next';
import { relativeTime } from '@/lib/utils';
import type { BinItem, ItemCheckout } from '@/types';

interface ItemListCheckoutSublineProps {
  item: BinItem;
  checkout: ItemCheckout;
}

export function ItemListCheckoutSubline({ item, checkout }: ItemListCheckoutSublineProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  return (
    <span className="flex-1 min-w-0 text-[15px] leading-relaxed">
      <span className="block text-[var(--text-tertiary)] line-through opacity-60">{item.name}</span>
      <span className="block text-[12px] text-[var(--text-tertiary)] opacity-70 mt-0.5"> {tx("out_middot_f9b5e1", { defaultValue: "Out ·" })} {checkout.checked_out_by_name} &middot; {relativeTime(checkout.checked_out_at, uiLanguage)}
      </span>
    </span>
  );
}
