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
import { useBinTerm } from '@/lib/terminology';
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
  const binTerm = useBinTerm();
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
    tags.slice(0, 5).map((t) => `“${t}”`).join(', ') +
    (tags.length > 5 ? tx('tags_previewMore', { count: tags.length - 5 }) : '');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx('tags_bulkDeleteTitle', { count: tags.length })}</DialogTitle>
          <DialogDescription>
            {tx('tags_bulkDeleteDescription', { count: binsAffected, term: binTerm(binsAffected), preview })}
          </DialogDescription>
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
