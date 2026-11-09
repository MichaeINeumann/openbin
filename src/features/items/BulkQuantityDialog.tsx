import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioOption } from '@/components/ui/radio-option';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import type { QuantityOp } from './useItemBulkActions';

// Labels and hints are looked up per render rather than baked into a module
// constant, so they follow the selected language.
const OPTIONS: Array<{ value: QuantityOp; needsValue: boolean }> = [
  { value: 'set', needsValue: true },
  { value: 'inc', needsValue: true },
  { value: 'dec', needsValue: true },
  { value: 'clear', needsValue: false },
];

interface BulkQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onApply: (ids: string[], op: QuantityOp, value?: number) => Promise<void>;
}

export function BulkQuantityDialog({ open, onOpenChange, selectedIds, onApply }: BulkQuantityDialogProps) {
  const { t: tx } = useTranslation('ui');
  const [op, setOp] = useState<QuantityOp>('set');
  const [value, setValue] = useState('1');
  const needsValue = OPTIONS.find((o) => o.value === op)?.needsValue ?? true;
  const numValue = Number.parseInt(value, 10);
  const valueValid = !needsValue || (Number.isFinite(numValue) && numValue >= 0);

  return (
    <BulkUpdateDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) { setOp('set'); setValue('1'); }
        onOpenChange(v);
      }}
      title={tx('items_bulkQuantityTitle', { count: selectedIds.length })}
      description={tx(`items_quantityHint_${op}`)}
      selectedIds={selectedIds}
      onApply={async (ids) => onApply(ids, op, needsValue ? numValue : undefined)}
      applyDisabled={!valueValid}
      applyLabel={tx('bulk_apply')}
      loadingLabel={tx('bulk_applying')}
    >
      <div className="flex flex-col gap-2">
        {OPTIONS.map((o) => (
          <RadioOption
            key={o.value}
            selected={op === o.value}
            onClick={() => setOp(o.value)}
            label={tx(`items_quantityOp_${o.value}`)}
          />
        ))}
      </div>

      {needsValue && (
        <div className="flex flex-col gap-1.5 mt-3 animate-fade-in">
          <Label htmlFor="bulk-qty-input">
            {op === 'set' ? tx("new_quantity_e046b0", { defaultValue: "New quantity" }) : tx("amount_43dc85", { defaultValue: "Amount" })}
          </Label>
          <Input
            id="bulk-qty-input"
            type="number"
            min={0}
            step={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      )}
    </BulkUpdateDialog>
  );
}
