import {
  CheckSquare,
  ChevronDown,
  Edit3,
  Hash,
  LayoutList,
  ListOrdered,
  type LucideIcon,
  MapPin,
  Palette,
  PlusSquare,
  QrCode,
  Rows,
  StickyNote,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTerminology } from '@/lib/terminology';
import { cn } from '@/lib/utils';
import { CopiesStepper } from './CopiesStepper';
import type { ItemListOptions } from './usePrintSettings';

interface ItemListOptionsCardProps {
  options: ItemListOptions;
  onUpdate: <K extends keyof ItemListOptions>(key: K, value: ItemListOptions[K]) => void;
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
}

export function ItemListOptionsCard({ options, onUpdate, expanded, onExpandedChange }: ItemListOptionsCardProps) {
  const { t: tx } = useTranslation('ui');
  const t = useTerminology();

  // `as const` narrows each `key` to its literal type so onUpdate's generic K
  // resolves per-row and type inference works without casts.
  const headerRows = [
    { key: 'showQrCode', label: tx("qr_code_abba02", { defaultValue: "QR code" }), icon: QrCode },
    { key: 'showIcon', label: tx("icon_color_d6c27b", { defaultValue: "Icon & color" }), icon: Palette },
    { key: 'showAreaPath', label: tx("area_path_4656d1", { defaultValue: "Area path" }), icon: MapPin },
    { key: 'showBinCode', label: tx("bin_code_cd47b4", { defaultValue: "{{Bin}} code", Bin: t.Bin }), icon: Hash },
    { key: 'showItemCount', label: tx("item_count_e261b2", { defaultValue: "Item count" }), icon: ListOrdered },
  ] as const;

  const contentRows = [
    { key: 'showCheckboxes', label: tx("checkboxes_2c523b", { defaultValue: "Checkboxes" }), icon: CheckSquare },
    { key: 'showQuantity', label: tx("quantity_44f6af", { defaultValue: "Quantity" }), icon: Hash },
    { key: 'showNotesColumn', label: tx("write_in_notes_column_4f9fd4", { defaultValue: "Write-in notes column" }), icon: Edit3 },
    { key: 'showBinNotes', label: tx("bin_notes_d7efaa", { defaultValue: "{{Bin}} notes", Bin: t.Bin }), icon: StickyNote },
  ] as const;

  const layoutRows = [
    { key: 'zebraStripes', label: tx("alternating_row_shading_aa77bd", { defaultValue: "Alternating row shading" }), icon: Rows },
  ] as const;

  const renderRow = <K extends 'showQrCode' | 'showIcon' | 'showAreaPath' | 'showBinCode' | 'showItemCount' | 'showCheckboxes' | 'showQuantity' | 'showNotesColumn' | 'showBinNotes' | 'zebraStripes'>({
    key,
    label,
    icon: Icon,
  }: { key: K; label: string; icon: LucideIcon }) => (
    <label
      key={key}
      htmlFor={`item-opt-${key}`}
      className="flex items-center gap-3 px-2 py-1.5 cursor-pointer rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] transition-colors"
    >
      <Checkbox
        id={`item-opt-${key}`}
        checked={options[key]}
        onCheckedChange={(checked) => onUpdate(key, !!checked)}
      />
      <Icon className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
      <span className="text-[15px] text-[var(--text-primary)]">{label}</span>
    </label>
  );

  return (
    <Card>
      <CardContent>
        <button
          type="button"
          className="row-spread w-full"
          aria-expanded={expanded}
          onClick={() => onExpandedChange(!expanded)}
        >
          <div className="row">
            <LayoutList className="h-4 w-4 text-[var(--text-tertiary)]" />
            <Label className="text-[15px] font-semibold text-[var(--text-primary)] pointer-events-none">{tx("list_options_18d36f", { defaultValue: "List Options" })}</Label>
          </div>
          <ChevronDown className={cn(
            'h-5 w-5 text-[var(--text-tertiary)] transition-transform duration-200',
            expanded && 'rotate-180',
          )} />
        </button>

        {expanded && (
          <div className="mt-3 space-y-4">
            <Subsection title={tx("header_31341c", { defaultValue: "Header" })}>{headerRows.map(renderRow)}</Subsection>
            <Subsection title={tx("content_4f9be0", { defaultValue: "Content" })}>{contentRows.map(renderRow)}</Subsection>
            <Subsection title="Layout">{layoutRows.map(renderRow)}</Subsection>

            <CopiesStepper
              label={tx("blank_rows_at_end_ae3cda", { defaultValue: "Blank rows at end" })}
              icon={PlusSquare}
              value={options.blankRowCount}
              onChange={(v) => onUpdate('blankRowCount', Math.max(0, Math.min(20, v)))}
              min={0}
              max={20}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-1">
      <span className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2">{title}</span>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
