import type { ReactNode } from 'react';
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
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { AdminUserActions } from './useAdminUserActions';
import { type AdminUserDetail, capitalize } from './useAdminUsers';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm: () => void;
}

function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, confirmVariant = 'default', onConfirm }: ConfirmDialogProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tx("cancel_77dfd2", { defaultValue: "Cancel" })}</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AdminUserDialogsProps {
  detail: AdminUserDetail;
  actions: AdminUserActions;
}

export function AdminUserDialogs({ detail, actions }: AdminUserDialogsProps) {
  const { t: tx } = useTranslation('ui');
  const email = <strong>{detail.email}</strong>;

  return (
    <>
      <ConfirmDialog
        open={actions.suspendOpen}
        onOpenChange={actions.setSuspendOpen}
        title={tx("suspend_user_36ad57", { defaultValue: "Suspend User" })}
        description={<>{tx("suspend_b24247", { defaultValue: "Suspend" })} {email}{tx("they_will_be_immediately_logged_out_and_unable_to_access_the_882ce8", { defaultValue: "? They will be immediately logged out and unable to access the app." })}</>}
        confirmLabel={tx("suspend_b24247", { defaultValue: "Suspend" })}
        confirmVariant="destructive"
        onConfirm={actions.handleSuspend}
      />

      <ConfirmDialog
        open={actions.revokeSessionsOpen}
        onOpenChange={actions.setRevokeSessionsOpen}
        title={tx("revoke_all_sessions_b84b88", { defaultValue: "Revoke All Sessions" })}
        description={<>{tx("this_will_log_93f735", { defaultValue: "This will log" })} {email} {tx("out_of_all_devices_immediately_730534", { defaultValue: "out of all devices immediately." })}</>}
        confirmLabel={tx("revoke_sessions_70ced2", { defaultValue: "Revoke Sessions" })}
        confirmVariant="destructive"
        onConfirm={actions.handleRevokeSessions}
      />

      <ConfirmDialog
        open={actions.revokeKeysOpen}
        onOpenChange={actions.setRevokeKeysOpen}
        title={tx("revoke_all_api_keys_17eb87", { defaultValue: "Revoke All API Keys" })}
        description={<>{tx("this_will_immediately_invalidate_all_api_keys_for_6856e0", { defaultValue: "This will immediately invalidate all API keys for" })} {email}{tx("any_integrations_using_these_keys_will_stop_working_fe1aea", { defaultValue: ". Any integrations using these keys will stop working." })}</>}
        confirmLabel={tx("revoke_all_keys_f3a78a", { defaultValue: "Revoke All Keys" })}
        confirmVariant="destructive"
        onConfirm={actions.handleRevokeAllApiKeys}
      />

      <ConfirmDialog
        open={actions.deleteOpen}
        onOpenChange={actions.setDeleteOpen}
        title={tx("delete_user_0a0a90", { defaultValue: "Delete User" })}
        description={<>{tx("permanently_delete_2eea1f", { defaultValue: "Permanently delete" })} {email}{tx("this_cannot_be_undone_all_their_data_will_be_removed_813316", { defaultValue: "? This cannot be undone. All their data will be removed." })}</>}
        confirmLabel={tx("delete_f6fdbe", { defaultValue: "Delete" })}
        confirmVariant="destructive"
        onConfirm={actions.handleDelete}
      />

      <ConfirmDialog
        open={actions.regenKeyOpen}
        onOpenChange={actions.setRegenKeyOpen}
        title={tx("regenerate_api_key_e7bcc8", { defaultValue: "Regenerate API Key" })}
        description={<>{tx("this_will_revoke_all_existing_api_keys_for_e69af3", { defaultValue: "This will revoke all existing API keys for" })} {email} {tx("and_create_a_new_one_c702dd", { defaultValue: "and create a new one." })}</>}
        confirmLabel={tx("regenerate_b04c99", { defaultValue: "Regenerate" })}
        onConfirm={actions.handleRegenerateApiKey}
      />

      <ConfirmDialog
        open={actions.pendingPlan !== null}
        onOpenChange={(open) => { if (!open) actions.setPendingPlan(null); }}
        title={tx("change_plan_9e6dfc", { defaultValue: "Change Plan" })}
        description={<>{tx("change_64fbd9", { defaultValue: "Change" })} {email}{tx("apos_s_plan_from_afeae5", { defaultValue: "&apos;s plan from" })} {capitalize(detail.plan)} {tx("to_4374aa", { defaultValue: "to" })} {actions.pendingPlan ? capitalize(actions.pendingPlan) : ''}?</>}
        confirmLabel={tx("confirm_04a212", { defaultValue: "Confirm" })}
        onConfirm={actions.confirmPlanChange}
      />

      <ConfirmDialog
        open={actions.pendingStatus !== null}
        onOpenChange={(open) => { if (!open) actions.setPendingStatus(null); }}
        title={tx("change_subscription_status_a5ae41", { defaultValue: "Change Subscription Status" })}
        description={<>{tx("change_64fbd9", { defaultValue: "Change" })} {email}{tx("apos_s_status_from_820b0c", { defaultValue: "&apos;s status from" })} {capitalize(detail.status)} {tx("to_4374aa", { defaultValue: "to" })} {actions.pendingStatus ? capitalize(actions.pendingStatus) : ''}?</>}
        confirmLabel={tx("confirm_04a212", { defaultValue: "Confirm" })}
        onConfirm={actions.confirmStatusChange}
      />

      <Dialog open={actions.editOpen} onOpenChange={(open) => !open && actions.setEditOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("edit_user_0e4572", { defaultValue: "Edit User" })}</DialogTitle>
          </DialogHeader>
          <form onSubmit={actions.handleEdit} className="space-y-5">
            <FormField label={tx("display_name_8d6b34", { defaultValue: "Display Name" })} htmlFor="edit-displayName">
              <Input
                id="edit-displayName"
                value={actions.editForm.displayName}
                onChange={(e) => actions.setEditForm((f) => ({ ...f, displayName: e.target.value }))}
              />
            </FormField>
            <FormField label={tx("email_84add5", { defaultValue: "Email" })} htmlFor="edit-email">
              <Input
                id="edit-email"
                type="email"
                value={actions.editForm.email}
                onChange={(e) => actions.setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </FormField>
            <FormField label={tx("new_password_4894cb", { defaultValue: "New Password" })} htmlFor="edit-password">
              <Input
                id="edit-password"
                type="password"
                value={actions.editForm.password}
                onChange={(e) => actions.setEditForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={tx("leave_blank_to_keep_current_600a66", { defaultValue: "Leave blank to keep current" })}
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => actions.setEditOpen(false)}>{tx("cancel_77dfd2", { defaultValue: "Cancel" })}</Button>
              <Button type="submit" disabled={actions.saving}>{actions.saving ? tx("saving_ae7e88", { defaultValue: "Saving..." }) : tx("save_efc007", { defaultValue: "Save" })}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
