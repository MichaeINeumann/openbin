import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Disclosure } from '@/components/ui/disclosure';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OptionGroup } from '@/components/ui/option-group';
import { Textarea } from '@/components/ui/textarea';
import { useTerminology } from '@/lib/terminology';
import type { ReorganizeTagsForm } from './useReorganizeTagsForm';

interface Props {
  form: ReorganizeTagsForm;
}

const changeLevelHints: Record<string, string> = {
  additive: "Add or remove tags on bins — don't touch the vocabulary",
  moderate: 'Also rename and merge duplicates, propose parents',
  full: 'Aggressive restructuring — merge broadly and trim mis-tags',
};

export function ReorganizeTagsOptions({ form }: Props) {
  const { t: tx } = useTranslation('ui');
  const t = useTerminology();

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
        <fieldset className="border-0 m-0 px-0 pt-0 pb-2">
          <legend className="text-[12px] text-[var(--text-secondary)] font-medium block p-0"> {tx("change_level_a04fde", { defaultValue: "Change level" })} </legend>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 mb-2">
            {changeLevelHints[form.changeLevel]}
          </p>
          <OptionGroup
            options={[
              { key: 'additive', label: tx("additive_2aa983", { defaultValue: "Additive" }) },
              { key: 'moderate', label: tx("moderate_ea8b09", { defaultValue: "Moderate" }) },
              { key: 'full', label: tx("full_10b28a", { defaultValue: "Full" }) },
            ]}
            value={form.changeLevel}
            onChange={(v) => form.setChangeLevel(v as ReorganizeTagsForm['changeLevel'])}
            size="sm"
          />
        </fieldset>

        <fieldset className="border-0 m-0 px-0 pt-0 pb-2">
          <legend className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2 p-0"> {tx("tag_granularity_e1691e", { defaultValue: "Tag granularity" })} </legend>
          <OptionGroup
            options={[
              { key: 'broad', label: tx("broad_d7d5e0", { defaultValue: "Broad" }) },
              { key: 'medium', label: tx("medium_d40496", { defaultValue: "Medium" }) },
              { key: 'specific', label: tx("specific_bb57ed", { defaultValue: "Specific" }) },
            ]}
            value={form.granularity}
            onChange={(v) => form.setGranularity(v as ReorganizeTagsForm['granularity'])}
            size="sm"
          />
        </fieldset>

        <div>
          <Label
            htmlFor="tag-max"
            className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2"
          > {tx("max_tags_per_0ab8d6", { defaultValue: "Max tags per" })} {t.bin}
          </Label>
          <Input
            id="tag-max"
            type="number"
            min={1}
            max={10}
            value={form.maxTagsPerBin}
            onChange={(e) => form.setMaxTagsPerBin(e.target.value)}
            placeholder={tx("auto_c614ba", { defaultValue: "Auto" })}
          />
        </div>

        <div>
          <Label
            htmlFor="tag-notes"
            className="text-[12px] text-[var(--text-secondary)] font-medium block mb-2"
          > {tx("additional_instructions_6ad181", { defaultValue: "Additional instructions" })} </Label>
          <Textarea
            id="tag-notes"
            value={form.userNotes}
            onChange={(e) => form.setUserNotes(e.target.value)}
            placeholder={tx("e_g_emphasize_kitchen_categories_ceee4b", { defaultValue: "e.g. emphasize kitchen categories" })}
            rows={2}
          />
        </div>
      </div>
    </Disclosure>
  );
}
