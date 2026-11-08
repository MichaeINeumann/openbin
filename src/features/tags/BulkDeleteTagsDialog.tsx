import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TagEntry } from './useTags';

interface BulkDeleteTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: string[];
  binsAffected: number;
  onConfirm: () => Promise<void>;
}

export function BulkDeleteTagsDialog({ open, onOpenChange, tags, binsAffected, onConfirm }: BulkDeleteTagsDialogProps) {
  const { t: tx } = useTranslation('ui');
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }
  const preview =
    tags.slice(0, 5).map((t) => `"${t}"`).join(', ') + (tags.length > 5 ? `, +${tags.length - 5} more` : '');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> {tx("delete_f6fdbe", { defaultValue: "Delete" })} {tags.length} {tx("tag_5e9b60", { defaultValue: "tag" })}{tags.length === 1 ? '' : 's'}?
          </DialogTitle>
          <DialogDescription> {tx("removes_12c60b", { defaultValue: "Removes" })} {preview} {tx("from_this_location_7460af", { defaultValue: "from this location. ~" })}{binsAffected} {tx("bin_9a5d56", { defaultValue: "bin" })}{binsAffected === 1 ? '' : 's'} {tx("will_be_updated_children_become_top_level_8979b0", { defaultValue: "will be updated. Children become top-level." })} </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button variant="destructive" onClick={handle} disabled={loading}>
            {loading ? tx("deleting_c7ac55", { defaultValue: "Deleting…" }) : tx("delete_f6fdbe", { defaultValue: "Delete" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Caller passes the tag list — sums their bin counts to a single number for the dialog copy. */
export function sumBinCounts(allTags: TagEntry[], selectedTagNames: string[]): number {
  const sel = new Set(selectedTagNames);
  return allTags.reduce((sum, t) => (sel.has(t.tag) ? sum + t.count : sum), 0);
}
