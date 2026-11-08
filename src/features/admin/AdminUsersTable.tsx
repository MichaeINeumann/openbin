import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SortDirection, SortHeader } from '@/components/ui/sort-header';
import { Table, TableHeader, TableRow } from '@/components/ui/table';
import { cn, relativeTime } from '@/lib/utils';
import type { AdminFieldKey } from './useAdminColumnVisibility';
import { type AdminUser, capitalize, statusVariant } from './useAdminUsers';

function pctColor(pct: number): string {
  if (pct > 90) return 'text-[var(--destructive)]';
  if (pct >= 75) return 'text-[var(--color-warning)]';
  return '';
}

interface AdminUsersTableProps {
  users: AdminUser[];
  currentUserId: string;
  sortColumn: string;
  sortDirection: SortDirection;
  onSort: (column: string, direction: SortDirection) => void;
  onDelete: (user: AdminUser) => void;
  onClickUser: (id: string) => void;
  isVisible: (field: AdminFieldKey) => boolean;
}

export function AdminUsersTable({
  users,
  currentUserId,
  sortColumn,
  sortDirection,
  onSort,
  onDelete,
  onClickUser,
  isVisible,
}: AdminUsersTableProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  return (
    <Table>
      <TableHeader>
        <div className="flex-1 min-w-0">
          <SortHeader label={tx("user_9f8a23", { defaultValue: "User" })} column="email" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} />
        </div>
        {isVisible('email') && (
          <div className="hidden lg:block w-40">
            <SortHeader label={tx("email_84add5", { defaultValue: "Email" })} column="email" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} />
          </div>
        )}
        {isVisible('role') && (
          <div className="w-16">
            <span className="ui-col-header">{tx("role_c3f104", { defaultValue: "Role" })}</span>
          </div>
        )}
        <div className="w-16">
          <SortHeader label={tx("plan_ae2f98", { defaultValue: "Plan" })} column="plan" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} />
        </div>
        <div className="w-24">
          <SortHeader label="Status" column="status" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} />
        </div>
        {isVisible('bins') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("bins_3f1d8e", { defaultValue: "Bins" })} column="bins" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('locations') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("locs_a0505b", { defaultValue: "Locs" })} column="locations" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('storage') && (
          <div className="hidden lg:block w-20 text-right">
            <SortHeader label={tx("storage_9e092d", { defaultValue: "Storage" })} column="storage" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('lastActive') && (
          <div className="hidden sm:block w-24">
            <SortHeader label={tx("last_active_0eb2b9", { defaultValue: "Last Active" })} column="lastActive" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} />
          </div>
        )}
        {isVisible('items') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("items_44d25b", { defaultValue: "Items" })} column="items" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('photos') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("photos_c8b2e8", { defaultValue: "Photos" })} column="photos" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('scans30d') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label="Scans" column="scans30d" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('aiCredits') && (
          <div className="hidden lg:block w-20 text-right">
            <SortHeader label={tx("ai_credits_ca010c", { defaultValue: "AI Credits" })} column="aiCredits" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('apiKeys') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("keys_e5651c", { defaultValue: "Keys" })} column="apiKeys" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('apiRequests7d') && (
          <div className="hidden lg:block w-20 text-right">
            <SortHeader label={tx("reqs_7d_5bdb75", { defaultValue: "Reqs (7d)" })} column="apiRequests7d" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('binPct') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("bin_cc80de", { defaultValue: "Bin %" })} column="binPct" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('storagePct') && (
          <div className="hidden lg:block w-20 text-right">
            <SortHeader label={tx("stor_8a73f9", { defaultValue: "Stor %" })} column="storagePct" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('binsCreated7d') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("new_7d_a301a5", { defaultValue: "New (7d)" })} column="binsCreated7d" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('accountAge') && (
          <div className="hidden lg:block w-14 text-right">
            <SortHeader label={tx("age_ff9f1f", { defaultValue: "Age" })} column="accountAge" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} defaultDirection="desc" className="justify-end" />
          </div>
        )}
        {isVisible('created') && (
          <div className="hidden sm:block w-24">
            <SortHeader label={tx("created_accf40", { defaultValue: "Created" })} column="created" currentColumn={sortColumn} currentDirection={sortDirection} onSort={onSort} />
          </div>
        )}
        <div className="w-9" />
      </TableHeader>

      {users.map((u) => {
        const isSelf = u.id === currentUserId;
        const binPct = u.binLimit !== null && u.binLimit > 0
          ? Math.round((u.binCount / u.binLimit) * 100)
          : null;
        const storagePct = u.storageLimit !== null && u.storageLimit > 0
          ? Math.round((u.photoStorageMb / u.storageLimit) * 100)
          : null;
        const accountAge = Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000);

        return (
          <TableRow
            key={u.id}
            onClick={() => onClickUser(u.id)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onClickUser(u.id); }}
            className={cn((u.deletedAt || u.suspendedAt) && 'opacity-50')}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[14px] text-[var(--text-primary)] truncate">{u.displayName || u.email}</div>
              <div className="text-[12px] text-[var(--text-tertiary)] truncate">{u.email}</div>
            </div>
            {isVisible('email') && (
              <div className="hidden lg:block w-40 text-[14px] text-[var(--text-secondary)] truncate">{u.email || '—'}</div>
            )}
            {isVisible('role') && (
              <div className="w-16 text-[14px]">
                {u.isAdmin ? <Badge variant="default" className="text-[11px]">{tx("admin_4e7afe", { defaultValue: "Admin" })}</Badge> : <span className="text-[var(--text-tertiary)]">—</span>}
              </div>
            )}
            <div className="w-16 text-[14px]">
              <Badge variant="secondary" className="text-[11px]">{capitalize(u.plan)}</Badge>
            </div>
            <div className="w-24 text-[14px]">
              <span className="flex items-center gap-1.5">
                {u.deletionScheduledAt && new Date(u.deletionScheduledAt).getTime() > Date.now() ? (
                  <Badge className="text-[11px] bg-[var(--color-warning-soft)] text-[var(--color-warning)]">{tx("deletion_pending_4e7833", { defaultValue: "Deletion pending" })}</Badge>
                ) : u.deletedAt ? (
                  <Badge variant="destructive" className="text-[11px]">{tx("deleted_441bda", { defaultValue: "Deleted" })}</Badge>
                ) : null}
                {u.suspendedAt && <Badge variant="destructive" className="text-[11px]">{tx("suspended_794696", { defaultValue: "Suspended" })}</Badge>}
                <Badge variant={statusVariant(u.status)} className="text-[11px]">{capitalize(u.status)}</Badge>
              </span>
            </div>
            {isVisible('bins') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.binCount}</div>
            )}
            {isVisible('locations') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.locationCount}</div>
            )}
            {isVisible('storage') && (
              <div className="hidden lg:block w-20 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : `${u.photoStorageMb} MB`}</div>
            )}
            {isVisible('lastActive') && (
              <div className="hidden sm:block w-24">
                <span className="text-[12px] text-[var(--text-tertiary)] whitespace-nowrap">
                  {u.deletedAt ? '—' : relativeTime(u.lastActiveAt, uiLanguage)}
                </span>
              </div>
            )}
            {isVisible('items') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.itemCount}</div>
            )}
            {isVisible('photos') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.photoCount}</div>
            )}
            {isVisible('scans30d') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.scans30d}</div>
            )}
            {isVisible('aiCredits') && (
              <div className="hidden lg:block w-20 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">
                {u.deletedAt || u.aiCreditsLimit === 0 ? '—' : `${u.aiCreditsUsed}/${u.aiCreditsLimit}`}
              </div>
            )}
            {isVisible('apiKeys') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.apiKeyCount}</div>
            )}
            {isVisible('apiRequests7d') && (
              <div className="hidden lg:block w-20 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.apiRequests7d}</div>
            )}
            {isVisible('binPct') && (
              <div className={cn('hidden lg:block w-14 text-[14px] text-right tabular-nums', binPct !== null ? pctColor(binPct) : 'text-[var(--text-secondary)]')}>
                {u.deletedAt || binPct === null ? '—' : `${binPct}%`}
              </div>
            )}
            {isVisible('storagePct') && (
              <div className={cn('hidden lg:block w-20 text-[14px] text-right tabular-nums', storagePct !== null ? pctColor(storagePct) : 'text-[var(--text-secondary)]')}>
                {u.deletedAt || storagePct === null ? '—' : `${storagePct}%`}
              </div>
            )}
            {isVisible('binsCreated7d') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : u.binsCreated7d}</div>
            )}
            {isVisible('accountAge') && (
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] text-right tabular-nums">{u.deletedAt ? '—' : tx("accountage_d_9ff27e", { defaultValue: "{{accountAge}}d", accountAge: accountAge })}</div>
            )}
            {isVisible('created') && (
              <div className="hidden sm:block w-24">
                <span className="text-[12px] text-[var(--text-tertiary)] whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString(uiLanguage)}</span>
              </div>
            )}
            <div className="w-9 flex justify-center">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => { e.stopPropagation(); onDelete(u); }}
                disabled={isSelf}
                aria-label={tx("delete_value0_ea5388", { defaultValue: "Delete {{value0}}", value0: u.email })}
                className="text-[var(--destructive)] hover:text-[var(--destructive)]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TableRow>
        );
      })}
    </Table>
  );
}
