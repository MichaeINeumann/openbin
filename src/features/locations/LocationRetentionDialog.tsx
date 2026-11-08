import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OptionGroup } from '@/components/ui/option-group';
import { useToast } from '@/components/ui/toast';
import { useTerminology } from '@/lib/terminology';
import { getErrorMessage } from '@/lib/utils';
import type { Location } from '@/types';
import { updateLocation } from './useLocations';

const joinRoleOptions = [
  { key: 'member' as const, label: 'Member' },
  { key: 'viewer' as const, label: 'Viewer' },
];

interface LocationRetentionDialogProps {
  location: Location | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationRetentionDialog({ location, open, onOpenChange }: LocationRetentionDialogProps) {
  const { t: tx } = useTranslation('ui');
  const { showToast } = useToast();
  const t = useTerminology();
  const [activityRetention, setActivityRetention] = useState(90);
  const [trashRetention, setTrashRetention] = useState(30);
  const [defaultJoinRole, setDefaultJoinRole] = useState<'member' | 'viewer'>('member');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && location) {
      setActivityRetention(location.activity_retention_days ?? 90);
      setTrashRetention(location.trash_retention_days ?? 30);
      setDefaultJoinRole(location.default_join_role ?? 'member');
      setSaving(false);
    }
  }, [open, location]);

  async function handleSave() {
    if (!location) return;
    setSaving(true);
    try {
      await updateLocation(location.id, {
        activity_retention_days: activityRetention,
        trash_retention_days: trashRetention,
        default_join_role: defaultJoinRole,
      });
      onOpenChange(false);
      showToast({ message: 'Retention settings saved', variant: 'success' });
    } catch (err) {
      showToast({ message: getErrorMessage(err, 'Failed to save retention settings'), variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.Location} {tx("settings_c7f73b", { defaultValue: "Settings" })}</DialogTitle>
          <DialogDescription> {tx("configure_data_retention_and_membership_defaults_for_this_2863ba", { defaultValue: "Configure data retention and membership defaults for this" })} {t.location}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="activity-retention">{tx("activity_log_retention_days_f0a235", { defaultValue: "Activity log retention (days)" })}</Label>
            <Input
              id="activity-retention"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={7}
              max={365}
              value={activityRetention}
              onChange={(e) => setActivityRetention(Number(e.target.value))}
            />
            <p className="text-[11px] text-[var(--text-tertiary)]">{tx("7_365_days_entries_older_than_this_are_automatically_pruned_272295", { defaultValue: "7–365 days. Entries older than this are automatically pruned." })}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trash-retention">{tx("trash_retention_days_06522e", { defaultValue: "Trash retention (days)" })}</Label>
            <Input
              id="trash-retention"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={7}
              max={365}
              value={trashRetention}
              onChange={(e) => setTrashRetention(Number(e.target.value))}
            />
            <p className="text-[11px] text-[var(--text-tertiary)]">{tx("7_365_days_deleted_a30bb7", { defaultValue: "7–365 days. Deleted" })} {t.bins} {tx("are_permanently_purged_after_this_period_9869d4", { defaultValue: "are permanently purged after this period." })}</p>
          </div>
          <div className="space-y-1.5">
            <Label>{tx("default_role_for_new_members_e052e4", { defaultValue: "Default role for new members" })}</Label>
            <OptionGroup
              options={joinRoleOptions}
              value={defaultJoinRole}
              onChange={setDefaultJoinRole}
            />
            <p className="text-[11px] text-[var(--text-tertiary)]">
              {defaultJoinRole === 'viewer'
                ? tx("new_members_will_be_read_only_until_promoted_56ab10", { defaultValue: "New members will be read-only until promoted." })
                : tx("new_members_can_create_and_edit_content_e30453", { defaultValue: "New members can create and edit content." })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button
            onClick={handleSave}
            disabled={saving || activityRetention < 7 || activityRetention > 365 || trashRetention < 7 || trashRetention > 365}
          >
            {saving ? tx("saving_ae7e88", { defaultValue: "Saving..." }) : tx("save_efc007", { defaultValue: "Save" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
