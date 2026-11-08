import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import { TagColorPicker } from './TagColorPicker';

interface BulkSetColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTagNames: string[];
  onApply: (tags: string[], color: string) => Promise<void>;
}

export function BulkSetColorDialog({ open, onOpenChange, selectedTagNames, onApply }: BulkSetColorDialogProps) {
  const { t: tx } = useTranslation('ui');
  const [color, setColor] = useState<string>('');

  return (
    <BulkUpdateDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setColor('');
        onOpenChange(v);
      }}
      title={`Set color for ${selectedTagNames.length} tag${selectedTagNames.length === 1 ? '' : 's'}`}
      description={tx("pick_a_color_to_apply_to_every_selected_tag_4e38d6", { defaultValue: "Pick a color to apply to every selected tag." })}
      selectedIds={selectedTagNames}
      onApply={(tags) => onApply(tags, color)}
      applyDisabled={!color}
      applyLabel="Apply color"
      loadingLabel="Applying…"
    >
      <TagColorPicker
        currentColor={color}
        onColorChange={setColor}
        tagName={`${selectedTagNames.length} tags`}
        inline
      />
    </BulkUpdateDialog>
  );
}
