import { KeyRound, LogOut, ShieldOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { AdminUserActions } from './useAdminUserActions';
import type { AdminUserDetail } from './useAdminUsers';

interface AdminUserSecurityCardProps {
  detail: AdminUserDetail;
  isSelf: boolean;
  actions: AdminUserActions;
}

export function AdminUserSecurityCard({ detail, isSelf, actions }: AdminUserSecurityCardProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  return (
    <Card>
      <CardHeader><CardTitle>{tx("security_f25ce1", { defaultValue: "Security" })}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
          <div className="row-spread py-3 first:pt-0">
            <div>
              <span className="text-[14px] text-[var(--text-secondary)]">{tx("account_status_8dd86c", { defaultValue: "Account status" })}</span>
              {detail.suspendedAt && (
                <p className="text-[12px] text-[var(--destructive)]"> {tx("suspended_794696", { defaultValue: "Suspended" })} {new Date(detail.suspendedAt).toLocaleString(uiLanguage)}
                </p>
              )}
            </div>
            {detail.suspendedAt ? (
              <Button variant="outline" size="sm" onClick={actions.handleReactivate}>{tx("reactivate_cd28a1", { defaultValue: "Reactivate" })}</Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.setSuspendOpen(true)}
                disabled={isSelf}
                className="text-[var(--destructive)] hover:text-[var(--destructive)]"
              >
                <ShieldOff className="h-3.5 w-3.5 mr-1.5" /> {tx("suspend_b24247", { defaultValue: "Suspend" })} </Button>
            )}
          </div>

          <div className="row-spread py-3">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("revoke_all_sessions_f2c6c1", { defaultValue: "Revoke all sessions" })}</span>
            <Button variant="outline" size="sm" onClick={() => actions.setRevokeSessionsOpen(true)}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Revoke
            </Button>
          </div>

          <div className="row-spread py-3">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("require_password_change_64c216", { defaultValue: "Require password change" })}</span>
            <Switch
              checked={!!detail.stats.forcePasswordChange}
              onCheckedChange={actions.handleForcePasswordChange}
              disabled={isSelf}
            />
          </div>

          <div className="row-spread py-3 last:pb-0">
            <span className="text-[14px] text-[var(--text-secondary)]">{tx("revoke_all_api_keys_90d9af", { defaultValue: "Revoke all API keys" })}</span>
            <Button variant="outline" size="sm" onClick={() => actions.setRevokeKeysOpen(true)}>
              <KeyRound className="h-3.5 w-3.5 mr-1.5" /> {tx("revoke_all_f396ba", { defaultValue: "Revoke All" })} </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
