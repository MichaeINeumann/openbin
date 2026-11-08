import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BinSizes } from './photoGridTypes';

interface AddMoreTileProps {
  sizes: BinSizes;
  onClick: () => void;
}

export function AddMoreTile({ sizes, onClick }: AddMoreTileProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={tx("add_more_photos_c063aa", { defaultValue: "Add more photos" })}
        className="flex flex-col items-center justify-center gap-1 rounded-[6px] border-2 border-dashed border-[var(--border-flat)] text-[var(--text-tertiary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-input)] hover:text-[var(--accent)]"
        style={{ width: sizes.binSize, height: sizes.binSize }}
      >
        <Plus className="h-5 w-5" />
        <span className="text-[11px] leading-tight">{tx("add_61cc55", { defaultValue: "Add" })}</span>
      </button>
    </div>
  );
}
