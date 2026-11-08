import { SlidersHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Disclosure } from '@/components/ui/disclosure';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OptionGroup } from '@/components/ui/option-group';
import { Textarea } from '@/components/ui/textarea';
import { useTerminology } from '@/lib/terminology';
import { cn } from '@/lib/utils';
import type { ReorganizeBinsForm } from './useReorganizeBinsForm';

interface Props {
  form: ReorganizeBinsForm;
  itemCount: number;
}

interface OptionField {
  legend: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

export function ReorganizeBinsOptions({ form, itemCount }: Props) {
  const { t: tx } = useTranslation('ui');
  const t = useTerminology();

  const optionFields: OptionField[] = useMemo(
    () => [
      {
        legend: 'Change level',
        options: [
          { key: 'conservative', label: tx("light_a36ef8", { defaultValue: "Light" }) },
          { key: 'moderate', label: tx("moderate_ea8b09", { defaultValue: "Moderate" }) },
          { key: 'aggressive', label: tx("thorough_d49aad", { defaultValue: "Thorough" }) },
        ],
        value: form.strictness,
        onChange: (v) => form.setStrictness(v as ReorganizeBinsForm['strictness']),
        hint: `How much the AI can restructure your ${t.bins}`,
      },
      {
        legend: 'Grouping',
        options: [
          { key: 'broad', label: tx("broad_d7d5e0", { defaultValue: "Broad" }) },
          { key: 'medium', label: tx("medium_d40496", { defaultValue: "Medium" }) },
          { key: 'specific', label: tx("specific_bb57ed", { defaultValue: "Specific" }) },
        ],
        value: form.granularity,
        onChange: (v) => form.setGranularity(v as ReorganizeBinsForm['granularity']),
        hint: 'How narrowly items are categorized',
      },
      {
        legend: 'Unmatched items',
        options: [
          { key: 'best-fit', label: tx("best_match_86f686", { defaultValue: "Best match" }) },
          { key: 'multi-bin', label: tx("place_in_multiple_7e44d2", { defaultValue: "Place in multiple" }) },
          { key: 'misc-bin', label: tx("misc_bin_9c634f", { defaultValue: "Misc {{bin}}", bin: t.bin }) },
        ],
        value: form.ambiguousPolicy,
        onChange: (v) => form.setAmbiguousPolicy(v as ReorganizeBinsForm['ambiguousPolicy']),
        hint: "What happens to items that don't fit neatly",
      },
      {
        legend: 'Duplicate items',
        options: [
          { key: 'force-single', label: tx("one_bin_only_8c161d", { defaultValue: "One {{bin}} only", bin: t.bin }) },
          { key: 'allow', label: tx("allow_copies_94f728", { defaultValue: "Allow copies" }) },
        ],
        value: form.duplicates,
        onChange: (v) => form.setDuplicates(v as ReorganizeBinsForm['duplicates']),
      },
      {
        legend: 'Outlier items',
        options: [
          { key: 'force-closest', label: tx("nearest_match_1a5130", { defaultValue: "Nearest match" }) },
          { key: 'dedicated', label: tx("separate_bin_a9fe94", { defaultValue: "Separate {{bin}}", bin: t.bin }) },
        ],
        value: form.outliers,
        onChange: (v) => form.setOutliers(v as ReorganizeBinsForm['outliers']),
      },
    ],
    [form, t.bin, t.bins],
  );

  return (
    <Disclosure
      label={
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--text-tertiary)]" />
          <Label className="text-[15px] font-semibold text-[var(--text-primary)] pointer-events-none"> {tx("options_6bf5da", { defaultValue: "Options" })} </Label>
        </span>
      }
    >
      <div className="space-y-5">
        <div>
          <Label
            htmlFor="reorg-max-bins"
            className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2"
          > {tx("number_of_093ba2", { defaultValue: "Number of" })} {t.bins}
          </Label>
          <Input
            id="reorg-max-bins"
            type="number"
            min={1}
            value={form.maxBins}
            onChange={(e) => form.setMaxBins(e.target.value)}
            placeholder={tx("auto_c614ba", { defaultValue: "Auto" })}
            aria-describedby={form.maxBinsError ? 'reorg-max-bins-error' : undefined}
            aria-invalid={!!form.maxBinsError}
          />
          {form.maxBinsError && (
            <p
              id="reorg-max-bins-error"
              className="text-[12px] text-[var(--destructive)] mt-1"
              role="alert"
            >
              {form.maxBinsError}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="reorg-min-items"
            className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2"
          > {tx("items_per_bd91d0", { defaultValue: "Items per" })} {t.bin}
          </Label>
          <div className="flex gap-2">
            <Input
              id="reorg-min-items"
              type="number"
              min={1}
              value={form.minItemsPerBin}
              onChange={(e) => form.setMinItemsPerBin(e.target.value)}
              placeholder={tx("min_7eb0ce", { defaultValue: "Min" })}
              aria-invalid={!!form.rangeError}
            />
            <Input
              id="reorg-max-items"
              type="number"
              min={1}
              value={form.maxItemsPerBin}
              onChange={(e) => form.setMaxItemsPerBin(e.target.value)}
              placeholder={tx("max_a95e85", { defaultValue: "Max" })}
              aria-label={tx("max_items_per_bin_109b38", { defaultValue: "Max items per {{bin}}", bin: t.bin })}
              aria-invalid={!!form.rangeError}
            />
          </div>
          {form.rangeError && (
            <p className="text-[12px] text-[var(--destructive)] mt-1" role="alert">
              {form.rangeError}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="reorg-notes"
            className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2"
          > {tx("additional_instructions_6ad181", { defaultValue: "Additional instructions" })} </Label>
          <Textarea
            id="reorg-notes"
            value={form.userNotes}
            onChange={(e) => form.setUserNotes(e.target.value)}
            placeholder={tx("e_g_keep_kitchen_items_separate_from_garage_tools_ae8f16", { defaultValue: "e.g. Keep kitchen items separate from garage tools" })}
            rows={2}
          />
        </div>

        {optionFields.map((field) => (
          <fieldset key={field.legend} className="border-0 m-0 px-0 pt-0 pb-2">
            <legend
              className={cn(
                'text-[12px] text-[var(--text-secondary)] font-medium block p-0',
                !field.hint && 'mb-2',
              )}
            >
              {field.legend}
            </legend>
            {field.hint && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 mb-2">{field.hint}</p>
            )}
            <OptionGroup
              options={field.options}
              value={field.value}
              onChange={field.onChange}
              size="sm"
            />
          </fieldset>
        ))}

        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[12px] text-[var(--text-tertiary)]">
          {itemCount} {tx("item_3a7d97", { defaultValue: "item" })}{itemCount !== 1 ? 's' : ''} {tx("across_selected_eaf487", { defaultValue: "across selected" })} {t.bins}
        </div>
      </div>
    </Disclosure>
  );
}
