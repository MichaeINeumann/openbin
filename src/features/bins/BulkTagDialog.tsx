import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { BulkUpdateDialog } from '@/lib/bulk/BulkUpdateDialog';
import { useBinTerm } from '@/lib/terminology';
import { TagInput } from './TagInput';
import { notifyBinsChanged } from './useBins';

interface BulkTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binIds: string[];
  onDone: () => void;
  allTags: string[];
}

export function BulkTagDialog({ open, onOpenChange, binIds, onDone, allTags }: BulkTagDialogProps) {
  const { t: tx } = useTranslation('ui');
  const binTerm = useBinTerm();
  const [tags, setTags] = useState<string[]>([]);

  async function apply(ids: string[]) {
    if (tags.length === 0) return;
    await Promise.all(
      ids.map((id) =>
        apiFetch(`/api/bins/${id}/add-tags`, {
          method: 'PUT',
          body: { tags },
        }).catch(() =>
          apiFetch<{ tags: string[] }>(`/api/bins/${id}`).then((bin) => {
            const merged = [...new Set([...bin.tags, ...tags])];
            return apiFetch(`/api/bins/${id}`, {
              method: 'PUT',
              body: { tags: merged },
            });
          }),
        ),
      ),
    );
    setTags([]);
    notifyBinsChanged();
  }

  return (
    <BulkUpdateDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tx("add_tags_0b4440", { defaultValue: "Add Tags" })}
      description={tx('bins_bulkTagDescription', { count: binIds.length, term: binTerm(binIds.length) })}
      selectedIds={binIds}
      onApply={apply}
      onApplied={onDone}
      applyDisabled={tags.length === 0}
    >
      <div className="space-y-2">
        <Label>{tx("tags_848eed", { defaultValue: "Tags" })}</Label>
        <TagInput tags={tags} onChange={setTags} suggestions={allTags} />
      </div>
    </BulkUpdateDialog>
  );
}
