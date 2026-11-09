import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isPendingDeletion } from './adminUserDetailConstants';
import { type AdminUserDetail, capitalize, statusVariant } from './useAdminUsers';

interface AdminUserIdentityCardProps {
  detail: AdminUserDetail;
  showActiveUntil: boolean;
}

export function AdminUserIdentityCard({ detail, showActiveUntil }: AdminUserIdentityCardProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const createdAt = new Date(detail.createdAt);
  const showDeletionPending = isPendingDeletion(detail);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tx("identity_7e5a97", { defaultValue: "Identity" })}</CardTitle>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showDeletionPending ? (
            <Badge className="bg-[var(--color-warning-soft)] text-[var(--color-warning)]">{tx("deletion_pending_4e7833", { defaultValue: "Deletion pending" })}</Badge>
          ) : detail.deletedAt ? (
            <Badge variant="destructive">{tx("deleted_441bda", { defaultValue: "Deleted" })}</Badge>
          ) : null}
          {detail.suspendedAt && <Badge variant="destructive">{tx("suspended_794696", { defaultValue: "Suspended" })}</Badge>}
          {detail.isAdmin && <Badge variant="default">{tx("admin_4e7afe", { defaultValue: "Admin" })}</Badge>}
          <Badge variant="secondary">{capitalize(detail.plan)}</Badge>
          <Badge variant={statusVariant(detail.status)}>{capitalize(detail.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="ui-col-header">{tx("email_84add5", { defaultValue: "Email" })}</span>
            <p className="text-[15px] text-[var(--text-primary)]">{detail.email || '—'}</p>
          </div>
          <div>
            <span className="ui-col-header">{tx("display_name_8d6b34", { defaultValue: "Display Name" })}</span>
            <p className="text-[15px] text-[var(--text-primary)]">{detail.displayName || '—'}</p>
          </div>
          {showActiveUntil && (
            <div>
              <span className="ui-col-header">{tx("active_until_5d63c3", { defaultValue: "Active Until" })}</span>
              <p className="text-[15px] text-[var(--text-primary)]">{detail.activeUntil ? new Date(detail.activeUntil).toLocaleString(uiLanguage) : '—'}</p>
            </div>
          )}
          <div>
            <span className="ui-col-header">{tx("created_accf40", { defaultValue: "Created" })}</span>
            <p className="text-[15px] text-[var(--text-primary)]">{createdAt.toLocaleString(uiLanguage)}</p>
          </div>
          <div>
            <span className="ui-col-header">{tx("updated_f2f857", { defaultValue: "Updated" })}</span>
            <p className="text-[15px] text-[var(--text-primary)]">{new Date(detail.updatedAt).toLocaleString(uiLanguage)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
