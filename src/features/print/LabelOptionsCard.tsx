import { AlignCenter, AlignLeft, ChevronDown, Columns2, Hash, Palette, QrCode, Rows2, Smile, Tag, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OptionGroup } from '@/components/ui/option-group';
import { useTerminology } from '@/lib/terminology';
import { cn } from '@/lib/utils';
import { CopiesStepper } from './CopiesStepper';
import type { LabelDirection, LabelOptions } from './usePrintSettings';

const FONT_SCALE_PRESETS = [
  { label: 'Compact', value: 0.75 },
  { label: 'Normal', value: 1 },
  { label: 'Large', value: 1.25 },
  { label: 'X-Large', value: 1.5 },
];

interface LabelOptionsCardProps {
  labelOptions: LabelOptions;
  onUpdateOption: <K extends keyof LabelOptions>(key: K, value: LabelOptions[K]) => void;
  copies: number;
  onUpdateCopies: (copies: number) => void;
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
}

export function LabelOptionsCard({ labelOptions, onUpdateOption, copies, onUpdateCopies, expanded, onExpandedChange }: LabelOptionsCardProps) {
  const { t: tx } = useTranslation('ui');
  const fontLabels = [tx('fontCompact', { defaultValue: 'Compact' }), tx('fontNormal', { defaultValue: 'Normal' }), tx('fontLarge', { defaultValue: 'Large' }), tx('fontExtraLarge', { defaultValue: 'X-Large' })];
  const t = useTerminology();

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
            <Tag className="h-4 w-4 text-[var(--text-tertiary)]" />
            <Label className="text-[15px] font-semibold text-[var(--text-primary)] pointer-events-none">{tx("label_options_011416", { defaultValue: "Label Options" })}</Label>
          </div>
          <ChevronDown className={cn(
            'h-5 w-5 text-[var(--text-tertiary)] transition-transform duration-200',
            expanded && 'rotate-180'
          )} />
        </button>

        {expanded && (
          <div className="mt-3 space-y-4">
            <div className="px-1">
              <span className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2">{tx("font_size_b456f4", { defaultValue: "Font Size" })}</span>
              <OptionGroup
                options={FONT_SCALE_PRESETS.map((p, index) => ({ key: String(p.value), label: fontLabels[index] }))}
                value={String(labelOptions.fontScale)}
                onChange={(v) => onUpdateOption('fontScale', Number(v))}
                size="sm"
              />
            </div>

            <div className="px-1">
              <span className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2">{tx("text_alignment_0d69c7", { defaultValue: "Text Alignment" })}</span>
              <OptionGroup
                options={[
                  { key: 'left' as const, label: tx("left_8ae1c3", { defaultValue: "Left" }), icon: AlignLeft },
                  { key: 'center' as const, label: tx("center_a23911", { defaultValue: "Center" }), icon: AlignCenter },
                ]}
                value={labelOptions.textAlign}
                onChange={(v) => onUpdateOption('textAlign', v)}
                size="sm"
              />
            </div>

            <div className="px-1">
              <span className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2">{tx("label_direction_67bad5", { defaultValue: "Label Direction" })}</span>
              <OptionGroup
                options={[
                  { key: 'auto' as const, label: tx("auto_c614ba", { defaultValue: "Auto" }) },
                  { key: 'horizontal' as const, label: tx("horizontal_4f57a1", { defaultValue: "Horizontal" }), icon: Columns2 },
                  { key: 'vertical' as const, label: tx("vertical_4b937c", { defaultValue: "Vertical" }), icon: Rows2 },
                ]}
                value={labelOptions.labelDirection ?? 'auto'}
                onChange={(v) => onUpdateOption('labelDirection', v as LabelDirection)}
                size="sm"
              />
            </div>

            <div className="space-y-1 px-1">
              <span className="text-[12px] text-[var(--text-secondary)] font-medium block mb-1">{tx("visible_elements_8ba064", { defaultValue: "Visible Elements" })}</span>
              {([
                { key: 'showQrCode' as const, label: tx("qr_code_447421", { defaultValue: "QR Code" }), icon: QrCode },
                { key: 'showBinName' as const, label: tx("bin_name_a85bc9", { defaultValue: "{{Bin}} Name", Bin: t.Bin }), icon: Type },
                { key: 'showIcon' as const, label: tx("bin_icon_f47205", { defaultValue: "{{Bin}} Icon", Bin: t.Bin }), icon: Smile },
                { key: 'showBinCode' as const, label: tx("bin_code_ea502c", { defaultValue: "{{Bin}} Code", Bin: t.Bin }), icon: Hash },
                { key: 'showColorSwatch' as const, label: tx("color_background_0df4b9", { defaultValue: "Color Background" }), icon: Palette },
              ] as const).map(({ key, label, icon: Icon }) => (
                <label key={key} htmlFor={`label-opt-${key}`} className="flex items-center gap-3 px-2 py-1.5 cursor-pointer rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] transition-colors">
                  <Checkbox
                    id={`label-opt-${key}`}
                    checked={labelOptions[key]}
                    onCheckedChange={(checked) => onUpdateOption(key, !!checked)}
                  />
                  <Icon className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <span className="text-[15px] text-[var(--text-primary)]">{label}</span>
                </label>
              ))}
            </div>

            <CopiesStepper label={tx("copies_per_label_acc31f", { defaultValue: "Copies per label" })} value={copies} onChange={onUpdateCopies} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
