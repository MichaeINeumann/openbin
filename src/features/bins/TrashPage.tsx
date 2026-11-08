import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { useToast } from '@/components/ui/toast';
import { useLocationList } from '@/features/locations/useLocations';
import { SettingsPageHeader } from '@/features/settings/SettingsPageHeader';
import { useAuth } from '@/lib/auth';
import { useTerminology } from '@/lib/terminology';
import { usePermissions } from '@/lib/usePermissions';
import { relativeTime } from '@/lib/utils';
import type { Bin } from '@/types';
import { notifyBinsChanged, permanentDeleteBin, restoreBinFromTrash, useTrashBins } from './useBins';

export function TrashPage() {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const navigate = useNavigate();
  const { bins, isLoading } = useTrashBins();
  const { showToast } = useToast();
  const { activeLocationId } = useAuth();
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const t = useTerminology();
  const { locations } = useLocationList();
  const [confirmDelete, setConfirmDelete] = useState<Bin | null>(null);
  const activeLoc = locations.find((l) => l.id === activeLocationId);
  const retentionDays = (activeLoc as { trash_retention_days?: number } | undefined)?.trash_retention_days ?? 30;

  useEffect(() => {
    if (!permissionsLoading && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [permissionsLoading, isAdmin, navigate]);

  if (permissionsLoading || !isAdmin) {
    return null;
  }

  async function handleRestore(bin: Bin) {
    try {
      await restoreBinFromTrash(bin.id);
      showToast({ message: `"${bin.name}" restored`, variant: 'success' });
    } catch {
      showToast({ message: `Failed to restore ${t.bin}`, variant: 'error' });
    }
  }

  async function handlePermanentDelete() {
    if (!confirmDelete) return;
    try {
      await permanentDeleteBin(confirmDelete.id);
      notifyBinsChanged();
      showToast({ message: `"${confirmDelete.name}" permanently deleted`, variant: 'success' });
    } catch {
      showToast({ message: `Failed to delete ${t.bin}`, variant: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <>
      <SettingsPageHeader
        title={tx("trash_e3bf62", { defaultValue: "Trash" })}
        description={tx('trashRetention', { bins: t.bins, count: retentionDays, defaultValue: `Deleted ${t.bins} are kept for ${retentionDays} day${retentionDays !== 1 ? 's' : ''} before being permanently removed.` })}
      />

      {isLoading ? (
        <SkeletonList count={3} className="flex flex-col gap-3">
          {() => (
            <Card>
              <CardContent className="py-3 px-4">
                <div className="row-spread gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3.5 w-1/3" />
                  </div>
                  <div className="row-tight shrink-0">
                    <Skeleton className="h-8 w-20 rounded-[var(--radius-full)]" />
                    <Skeleton className="h-8 w-8 rounded-[var(--radius-full)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </SkeletonList>
      ) : bins.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title={tx("trash_is_empty_49b796", { defaultValue: "Trash is empty" })}
          subtitle={tx("deleted_bins_will_appear_here_9a2956", { defaultValue: "Deleted {{bins}} will appear here", bins: t.bins })}
          variant="positive"
        />
      ) : (
        <div className="space-y-3">
          {bins.map((bin) => (
            <Card key={bin.id}>
              <CardContent className="py-3 px-4">
                <div className="row-spread gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                      {bin.name}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]"> {tx("deleted_441bda", { defaultValue: "Deleted" })} {relativeTime(bin.deleted_at ?? bin.updated_at, uiLanguage)}
                      {bin.area_name ? ` · ${bin.area_name}` : ''}
                      {Array.isArray(bin.items) && bin.items.length > 0 ? ` · ${bin.items.length} ${bin.items.length === 1 ? 'item' : 'items'}` : ''}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="row-tight shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(bin)}
                        className="h-8 px-2.5 text-[var(--accent)]"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> {tx("restore_3cbe6d", { defaultValue: "Restore" })} </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(bin)}
                        className="h-8 px-2.5 text-[var(--destructive)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm permanent delete */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("permanently_delete_2e2237", { defaultValue: "Permanently Delete" })}</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-[var(--radius-xl)] bg-[var(--destructive-soft)] flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-[var(--destructive)]" />
            </div>
            <div>
              <p className="text-[15px] text-[var(--text-primary)]"> {tx("are_you_sure_you_want_to_permanently_delete_a4fae6", { defaultValue: "Are you sure you want to permanently delete" })} <strong>"{confirmDelete?.name}"</strong>?
              </p>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1"> {tx("this_action_cannot_be_undone_all_photos_will_also_be_deleted_cbc66d", { defaultValue: "This action cannot be undone. All photos will also be deleted." })} </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDelete}
              > {tx("delete_forever_e25485", { defaultValue: "Delete Forever" })} </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
