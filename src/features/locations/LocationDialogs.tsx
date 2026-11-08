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
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth';
import { useTerminology } from '@/lib/terminology';
import { createLocation, deleteLocation, joinLocation, updateLocation, useLocationList } from './useLocations';

interface LocationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationCreateDialog({ open, onOpenChange }: LocationCreateDialogProps) {
  const { t: tx } = useTranslation('ui');
  const { setActiveLocationId } = useAuth();
  const t = useTerminology();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setCreating(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const location = await createLocation(name.trim());
      setActiveLocationId(location.id);
      onOpenChange(false);
      showToast({ message: `Created "${location.name}"`, variant: 'success' });
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : `Failed to create ${t.location}`, variant: 'error' });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("create_6e157c", { defaultValue: "Create" })} {t.Location}</DialogTitle>
          <DialogDescription>
            A {t.location} {tx("is_a_shared_space_where_members_can_manage_e17cec", { defaultValue: "is a shared space where members can manage" })} {t.bins} {tx("together_2f0306", { defaultValue: "together." })} </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="location-name">Name</Label>
            <Input
              id="location-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tx("e_g_my_house_office_e0b7e2", { defaultValue: "e.g., My House, Office" })}
              maxLength={255}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button type="submit" disabled={!name.trim() || creating}>
              {creating ? tx("creating_28ea76", { defaultValue: "Creating..." }) : tx("create_6e157c", { defaultValue: "Create" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface LocationJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationJoinDialog({ open, onOpenChange }: LocationJoinDialogProps) {
  const { t: tx } = useTranslation('ui');
  const { setActiveLocationId } = useAuth();
  const t = useTerminology();
  const { showToast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (open) {
      setInviteCode('');
      setJoining(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      const location = await joinLocation(inviteCode.trim());
      setActiveLocationId(location.id);
      onOpenChange(false);
      showToast({ message: `Joined "${location.name}"`, variant: 'success' });
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : `Failed to join ${t.location}`, variant: 'error' });
    } finally {
      setJoining(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("join_e0d731", { defaultValue: "Join" })} {t.Location}</DialogTitle>
          <DialogDescription> {tx("enter_the_invite_code_shared_by_a_151431", { defaultValue: "Enter the invite code shared by a" })} {t.location} {tx("owner_to_join_9c1db3", { defaultValue: "owner to join." })} </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="invite-code">{tx("invite_code_6929e4", { defaultValue: "Invite Code" })}</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={tx("enter_invite_code_a64230", { defaultValue: "Enter invite code" })}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button type="submit" disabled={!inviteCode.trim() || joining}>
              {joining ? tx("joining_757a26", { defaultValue: "Joining..." }) : tx("join_e0d731", { defaultValue: "Join" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface LocationRenameDialogProps {
  locationId: string | null;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationRenameDialog({ locationId, currentName, open, onOpenChange }: LocationRenameDialogProps) {
  const { t: tx } = useTranslation('ui');
  const { showToast } = useToast();
  const t = useTerminology();
  const [name, setName] = useState(currentName);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setRenaming(false);
    }
  }, [open, currentName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationId || !name.trim()) return;
    setRenaming(true);
    try {
      await updateLocation(locationId, { name: name.trim() });
      onOpenChange(false);
      showToast({ message: `${t.Location} renamed`, variant: 'success' });
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : `Failed to rename ${t.location}`, variant: 'error' });
    } finally {
      setRenaming(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("rename_d3f4cb", { defaultValue: "Rename" })} {t.Location}</DialogTitle>
          <DialogDescription> {tx("enter_a_new_name_for_this_a74dd6", { defaultValue: "Enter a new name for this" })} {t.location}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="rename-location">Name</Label>
            <Input
              id="rename-location"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button type="submit" disabled={!name.trim() || renaming}>
              {renaming ? tx("saving_ae7e88", { defaultValue: "Saving..." }) : tx("save_efc007", { defaultValue: "Save" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface LocationDeleteDialogProps {
  locationId: string | null;
  locationName: string;
  binCount?: number;
  areaCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationDeleteDialog({ locationId, locationName, binCount, areaCount, open, onOpenChange }: LocationDeleteDialogProps) {
  const { t: tx } = useTranslation('ui');
  const { activeLocationId, setActiveLocationId } = useAuth();
  const { locations } = useLocationList();
  const t = useTerminology();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!locationId) return;
    setDeleting(true);
    try {
      await deleteLocation(locationId);
      if (activeLocationId === locationId) {
        const remaining = locations.filter((h) => h.id !== locationId);
        setActiveLocationId(remaining.length > 0 ? remaining[0].id : null);
      }
      onOpenChange(false);
      showToast({ message: `${t.Location} deleted`, variant: 'success' });
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : `Failed to delete ${t.location}`, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  }

  const assetParts: string[] = [];
  if (binCount != null && binCount > 0) assetParts.push(`${binCount} ${binCount !== 1 ? t.bins : t.bin}`);
  if (areaCount != null && areaCount > 0) assetParts.push(`${areaCount} ${areaCount !== 1 ? t.areas : t.area}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("delete_f6fdbe", { defaultValue: "Delete" })} {t.Location}?</DialogTitle>
          <DialogDescription> {tx("this_will_permanently_delete_quot_e325ff", { defaultValue: "This will permanently delete \"" })}{locationName}&quot;
            {assetParts.length > 0 ? <> {tx("including_d358da", { defaultValue: "including" })} {assetParts.join(' and ')}{tx("along_with_all_photos_d58863", { defaultValue: ", along with all photos." })} </> : tx("and_all_its_data_1aa591", { defaultValue: " and all its data. " })} {tx("this_cannot_be_undone_ad2526", { defaultValue: "This cannot be undone." })} </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? tx("deleting_e16cac", { defaultValue: "Deleting..." }) : tx("delete_f6fdbe", { defaultValue: "Delete" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
