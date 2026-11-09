import { KeyRound, Mail, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptionGroup } from '@/components/ui/option-group';
import { Switch } from '@/components/ui/switch';
import { isPendingDeletion, PLAN_OPTIONS, SUB_STATUS_OPTIONS } from './adminUserDetailConstants';
import type { AdminUserActions } from './useAdminUserActions';
import type { AdminUserDetail } from './useAdminUsers';

interface AdminUserActionsCardProps {
  detail: AdminUserDetail;
  isSelf: boolean;
  adminDisabled: boolean;
  showCloudControls: boolean;
  actions: AdminUserActions;
}

export function AdminUserActionsCard({ detail, isSelf, adminDisabled, showCloudControls, actions }: AdminUserActionsCardProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const showRecoverRow = isPendingDeletion(detail);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tx("actions_c3cd63", { defaultValue: "Actions" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
          <div className="row-spread py-3 first:pt-0">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("admin_role_ad9b46", { defaultValue: "Admin role" })}</span>
            <Switch
              checked={detail.isAdmin}
              onCheckedChange={actions.handleToggleAdmin}
              disabled={adminDisabled}
            />
          </div>

          <div className="row-spread py-3">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("edit_details_4173a9", { defaultValue: "Edit details" })}</span>
            <Button variant="outline" size="sm" onClick={actions.openEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> {tx("edit_530164", { defaultValue: "Edit" })} </Button>
          </div>

          {showCloudControls && (
            <div className="row-spread py-3">
              <span className="text-[14px] text-[var(--text-secondary)]">{tx("plan_tier_6da6be", { defaultValue: "Plan tier" })}</span>
              <OptionGroup
                options={PLAN_OPTIONS}
                value={detail.plan}
                onChange={actions.handlePlanChange}
                size="sm"
              />
            </div>
          )}

          {showCloudControls && (
            <div className="row-spread py-3">
              <span className="text-[14px] text-[var(--text-secondary)]">{tx("subscription_8fde48", { defaultValue: "Subscription" })}</span>
              <OptionGroup
                options={SUB_STATUS_OPTIONS}
                value={detail.status}
                onChange={actions.handleStatusChange}
                size="sm"
              />
            </div>
          )}

          {showCloudControls && (
            <div className="row-spread py-3">
              <span className="text-[14px] text-[var(--text-secondary)]">{tx("active_until_8b6d20", { defaultValue: "Active until" })}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="datetime-local"
                  value={actions.activeUntilInput}
                  onChange={(e) => actions.setActiveUntilInput(e.target.value)}
                  className="w-auto text-[14px] h-8"
                />
                {actions.activeUntilDirty && (
                  <Button size="sm" onClick={actions.handleSaveActiveUntil}>{tx("save_efc007", { defaultValue: "Save" })}</Button>
                )}
              </div>
            </div>
          )}

          <div className="row-spread py-3">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("regenerate_api_key_ad4ae5", { defaultValue: "Regenerate API key" })}</span>
            <Button variant="outline" size="sm" onClick={() => actions.setRegenKeyOpen(true)}>
              <KeyRound className="h-3.5 w-3.5 mr-1.5" /> {tx("regenerate_b04c99", { defaultValue: "Regenerate" })} </Button>
          </div>

          <div className="row-spread py-3">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("send_password_reset_86ee20", { defaultValue: "Send password reset" })}</span>
            <Button variant="outline" size="sm" onClick={actions.handleSendPasswordReset} disabled={!detail.email}>
              <Mail className="h-3.5 w-3.5 mr-1.5" /> {tx("send_reset_24b20e", { defaultValue: "Send Reset" })} </Button>
          </div>

          {showRecoverRow && detail.deletionScheduledAt && (
            <div className="row-spread py-3">
              <div>
                <span className="text-[14px] text-[var(--text-secondary)]">Recover account</span>
                <p className="text-[12px] text-[var(--text-tertiary)]"> {tx("scheduled_for_deletion_on_8cb7d4", { defaultValue: "Scheduled for deletion on" })} {new Date(detail.deletionScheduledAt).toLocaleString(uiLanguage)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={actions.handleRecoverDeletion}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> {tx("recover_4addbf", { defaultValue: "Recover" })} </Button>
            </div>
          )}

          <div className="row-spread py-3 last:pb-0">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("delete_user_9afe6c", { defaultValue: "Delete user" })}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.setDeleteOpen(true)}
              disabled={isSelf}
              className="text-[var(--destructive)] hover:text-[var(--destructive)]"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> {tx("delete_f6fdbe", { defaultValue: "Delete" })} </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
