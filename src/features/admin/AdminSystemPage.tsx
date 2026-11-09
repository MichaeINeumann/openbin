import {
  MapPin,
  Plus,
  Search,
  Server,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { OptionGroup } from '@/components/ui/option-group';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth';
import { formatBytes, getErrorMessage, relativeTime } from '@/lib/utils';
import {
  fetchMaintenanceStatus,
  fetchSystemHealth,
  type MaintenanceStatus,
  type SystemHealth,
  toggleMaintenance,
  useAdminLocations,
  useAnnouncements,
  useAuditLog,
  useDeletionDiagnostics,
} from './useAdminSystem';

type Tab = 'system' | 'audit' | 'locations';

const PAGE_SIZE = 25;

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function HealthCard({ label, value, tone, subtitle }: { label: string; value: string | number; tone?: 'default' | 'warning'; subtitle?: string }) {
  const valueColor = tone === 'warning'
    ? 'text-[var(--color-warning)]'
    : 'text-[var(--text-primary)]';
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
      <span className="ui-col-header">{label}</span>
      <span className={`text-[20px] font-bold ${valueColor} leading-tight tabular-nums`}>{value}</span>
      {subtitle && (
        <span className="text-[11px] text-[var(--text-tertiary)]">{subtitle}</span>
      )}
    </div>
  );
}

// ── System Tab ──────────────────────────────────────────────────────

function SystemTab() {
  const { t: tx } = useTranslation('ui');
  const { showToast } = useToast();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceStatus | null>(null);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [loadingHealth, setLoadingHealth] = useState(true);

  const { diagnostics, isLoading: diagnosticsLoading } = useDeletionDiagnostics();
  const { announcements, isLoading: announcementsLoading, createAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [newBannerOpen, setNewBannerOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({ text: '', type: 'info' as 'info' | 'warning' | 'critical' });
  const [bannerSaving, setBannerSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchSystemHealth(), fetchMaintenanceStatus()])
      .then(([h, m]) => {
        setHealth(h);
        setMaintenance(m);
        setMaintenanceMsg(m.message || '');
      })
      .catch((err) => {
        showToast({ message: getErrorMessage(err, tx("failed_to_load_system_status_0ea5bf", { defaultValue: "Failed to load system status" })), variant: 'error' });
      })
      .finally(() => setLoadingHealth(false));
  }, [showToast, tx]);

  const handleToggleMaintenance = useCallback(async (enabled: boolean) => {
    try {
      const result = await toggleMaintenance(enabled, maintenanceMsg || undefined);
      setMaintenance(result);
      showToast({ message: enabled ? tx("maintenance_mode_enabled_4fb4a3", { defaultValue: "Maintenance mode enabled" }) : tx("maintenance_mode_disabled_93fde8", { defaultValue: "Maintenance mode disabled" }), variant: 'success' });
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_toggle_maintenance_0440f3", { defaultValue: "Failed to toggle maintenance" })), variant: 'error' });
    }
  }, [maintenanceMsg, showToast, tx]);

  const handleCreateBanner = useCallback(async () => {
    if (!bannerForm.text.trim()) return;
    setBannerSaving(true);
    try {
      await createAnnouncement({ text: bannerForm.text, type: bannerForm.type });
      showToast({ message: tx("announcement_created_5aede4", { defaultValue: "Announcement created" }), variant: 'success' });
      setNewBannerOpen(false);
      setBannerForm({ text: '', type: 'info' });
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_create_announcement_d7bbfa", { defaultValue: "Failed to create announcement" })), variant: 'error' });
    } finally {
      setBannerSaving(false);
    }
  }, [bannerForm, createAnnouncement, showToast, tx]);

  const handleDeleteBanner = useCallback(async (id: string) => {
    try {
      await deleteAnnouncement(id);
      showToast({ message: tx("announcement_deleted_867c79", { defaultValue: "Announcement deleted" }), variant: 'success' });
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_delete_announcement_1a5510", { defaultValue: "Failed to delete announcement" })), variant: 'error' });
    }
  }, [deleteAnnouncement, showToast, tx]);

  if (loadingHealth) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <div key={i} className="flex flex-col gap-1.5 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Health */}
      {health && (
        <Card>
          <CardHeader><CardTitle>{tx("system_health_bd51a1", { defaultValue: "System Health" })}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <HealthCard label={tx("db_size_44c0c3", { defaultValue: "DB Size" })} value={formatBytes(health.dbSizeBytes)} />
              <HealthCard label={tx("total_users_a028fc", { defaultValue: "Total Users" })} value={health.userCount.total} />
              <HealthCard label={tx("active_users_8f7c75", { defaultValue: "Active Users" })} value={health.userCount.active} />
              <HealthCard label={tx("deleted_users_14332e", { defaultValue: "Deleted Users" })} value={health.userCount.deleted} />
              <HealthCard label={tx("suspended_users_247bbe", { defaultValue: "Suspended Users" })} value={health.userCount.suspended} />
              <HealthCard label={tx("active_sessions_c71ffa", { defaultValue: "Active Sessions" })} value={health.activeSessions} />
              <HealthCard label={tx("uptime_6aafa8", { defaultValue: "Uptime" })} value={formatUptime(health.uptime)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account deletion lifecycle */}
      <Card>
        <CardHeader><CardTitle>{tx("account_deletion_lifecycle_96aa65", { defaultValue: "Account deletion lifecycle" })}</CardTitle></CardHeader>
        <CardContent>
          {diagnosticsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="flex flex-col gap-1.5 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-10" />
                </div>
              ))}
            </div>
          ) : diagnostics ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <HealthCard
                label={tx("pending_96f608", { defaultValue: "Pending" })}
                value={diagnostics.pendingDeletionCount}
                subtitle={tx("in_grace_window_2c0b7c", { defaultValue: "in grace window" })}
              />
              <HealthCard
                label={tx("expired_a689a9", { defaultValue: "Expired" })}
                value={diagnostics.expiredPendingCount}
                subtitle={tx("awaiting_cleanup_4e2e7a", { defaultValue: "awaiting cleanup" })}
                tone={diagnostics.expiredPendingCount > 0 ? 'warning' : 'default'}
              />
              <HealthCard
                label={tx("orphan_callbacks_0292e2", { defaultValue: "Orphan callbacks" })}
                value={diagnostics.subscriptionOrphanCount30d}
                subtitle={tx("last_30_days_6a725a", { defaultValue: "last 30 days" })}
              />
            </div>
          ) : (
            <p className="text-[14px] text-[var(--text-tertiary)] py-2">{tx("failed_to_load_diagnostics_5a67e3", { defaultValue: "Failed to load diagnostics." })}</p>
          )}
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader><CardTitle>{tx("maintenance_mode_a99b9e", { defaultValue: "Maintenance Mode" })}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="row-spread">
              <div>
                <span className="text-[14px] text-[var(--text-secondary)]">{tx("maintenance_mode_98cca5", { defaultValue: "Maintenance mode" })}</span>
                {maintenance?.enabled && (
                  <p className="text-[12px] text-[var(--color-warning)]">{tx("currently_active_dd2496", { defaultValue: "Currently active" })}</p>
                )}
              </div>
              <Switch
                checked={maintenance?.enabled ?? false}
                onCheckedChange={handleToggleMaintenance}
              />
            </div>
            <FormField label={tx("message_shown_to_users_ec2556", { defaultValue: "Message (shown to users)" })} htmlFor="maint-msg">
              <Input
                id="maint-msg"
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                placeholder={tx("we_are_performing_scheduled_maintenance_d936b6", { defaultValue: "We are performing scheduled maintenance..." })}
                className="text-[14px]"
              />
            </FormField>
            {maintenanceMsg !== (maintenance?.message || '') && (
              <Button size="sm" className="self-start" onClick={() => handleToggleMaintenance(maintenance?.enabled ?? false)}> {tx("update_message_2d2dab", { defaultValue: "Update Message" })} </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{tx("announcements_06b01c", { defaultValue: "Announcements" })}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setNewBannerOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> {tx("new_6403f2", { defaultValue: "New" })} </Button>
          </div>
        </CardHeader>
        <CardContent>
          {announcementsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-[14px] text-[var(--text-tertiary)] py-2">{tx("no_active_announcements_d247cc", { defaultValue: "No active announcements." })}</p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
              {announcements.map((a) => (
                <div key={a.id} className="row-spread py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={a.type === 'critical' ? 'destructive' : a.type === 'warning' ? 'outline' : 'secondary'} className="text-[11px] shrink-0">
                      {a.type}
                    </Badge>
                    <span className="text-[14px] text-[var(--text-primary)] truncate">{a.text}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteBanner(a.id)}
                    aria-label={tx("delete_announcement_bec58e", { defaultValue: "Delete announcement" })}
                    className="text-[var(--destructive)] hover:text-[var(--destructive)] shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create announcement dialog */}
      <Dialog open={newBannerOpen} onOpenChange={(open) => !open && setNewBannerOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("new_announcement_20115a", { defaultValue: "New Announcement" })}</DialogTitle>
            <DialogDescription>{tx("create_a_banner_announcement_visible_to_all_users_db6e62", { defaultValue: "Create a banner announcement visible to all users." })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label={tx("type_3deb74", { defaultValue: "Type" })} htmlFor="banner-type">
              <OptionGroup
                options={[
                  { key: 'info' as const, label: tx("info_4b631f", { defaultValue: "Info" }) },
                  { key: 'warning' as const, label: tx("warning_e9c455", { defaultValue: "Warning" }) },
                  { key: 'critical' as const, label: tx("critical_04b7b2", { defaultValue: "Critical" }) },
                ]}
                value={bannerForm.type}
                onChange={(type) => setBannerForm(f => ({ ...f, type }))}
                size="sm"
              />
            </FormField>
            <FormField label={tx("message_68f414", { defaultValue: "Message" })} htmlFor="banner-text">
              <Textarea
                id="banner-text"
                value={bannerForm.text}
                onChange={(e) => setBannerForm(f => ({ ...f, text: e.target.value }))}
                placeholder={tx("announcement_text_0fcf05", { defaultValue: "Announcement text..." })}
                rows={3}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewBannerOpen(false)}>{tx("cancel_77dfd2", { defaultValue: "Cancel" })}</Button>
            <Button onClick={handleCreateBanner} disabled={!bannerForm.text.trim() || bannerSaving}>
              {bannerSaving ? tx("creating_28ea76", { defaultValue: "Creating..." }) : tx("create_6e157c", { defaultValue: "Create" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Audit Log Tab ───────────────────────────────────────────────────

function AuditLogTab() {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const { entries, count, isLoading } = useAuditLog(page, { action: actionFilter || undefined });
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <div className="flex items-center gap-2">
        <SearchInput
          placeholder={tx("filter_by_action_96de54", { defaultValue: "Filter by action..." })}
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          onClear={actionFilter ? () => { setActionFilter(''); setPage(1); } : undefined}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <Table>
          <TableHeader>
            <div className="w-28"><Skeleton className="h-3 w-10" /></div>
            <div className="w-24"><Skeleton className="h-3 w-10" /></div>
            <div className="w-28"><Skeleton className="h-3 w-12" /></div>
            <div className="flex-1"><Skeleton className="h-3 w-10" /></div>
            <div className="hidden lg:block flex-1"><Skeleton className="h-3 w-12" /></div>
          </TableHeader>
          {Array.from({ length: 8 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--border-subtle)]">
              <div className="w-28"><Skeleton className="h-4 w-20" /></div>
              <div className="w-24"><Skeleton className="h-4 w-16" /></div>
              <div className="w-28"><Skeleton className="h-4 w-20" /></div>
              <div className="flex-1"><Skeleton className="h-4 w-24" /></div>
              <div className="hidden lg:block flex-1"><Skeleton className="h-4 w-16" /></div>
            </div>
          ))}
        </Table>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Search}
          title={tx("no_audit_entries_found_2154fb", { defaultValue: "No audit entries found" })}
          subtitle={actionFilter ? tx("try_a_different_filter_39e237", { defaultValue: "Try a different filter" }) : undefined}
          variant="search"
        />
      ) : (
        <Table>
          <TableHeader>
            <div className="w-28">
              <span className="ui-col-header">{tx("time_6c82e6", { defaultValue: "Time" })}</span>
            </div>
            <div className="w-24">
              <span className="ui-col-header">{tx("actor_cbd19b", { defaultValue: "Actor" })}</span>
            </div>
            <div className="w-28">
              <span className="ui-col-header">{tx("action_97c89a", { defaultValue: "Action" })}</span>
            </div>
            <div className="flex-1">
              <span className="ui-col-header">{tx("target_61ad50", { defaultValue: "Target" })}</span>
            </div>
            <div className="hidden lg:block flex-1">
              <span className="ui-col-header">Details</span>
            </div>
          </TableHeader>
          {entries.map((entry) => (
            <TableRow key={entry.id} className="cursor-default [@media(hover:hover)]:hover:bg-[var(--bg-hover)]">
              <div className="w-28">
                <span className="text-[12px] text-[var(--text-tertiary)] whitespace-nowrap">{relativeTime(entry.createdAt, uiLanguage)}</span>
              </div>
              <div className="w-24 truncate">
                <span className="text-[14px] text-[var(--text-secondary)]">{entry.actorName}</span>
              </div>
              <div className="w-28">
                <Badge variant="secondary" className="text-[11px]">{entry.action}</Badge>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] text-[var(--text-primary)] truncate block">
                  {entry.targetName || entry.targetId || '—'}
                </span>
                {entry.targetType && (
                  <span className="text-[12px] text-[var(--text-tertiary)]">{entry.targetType}</span>
                )}
              </div>
              <div className="hidden lg:block flex-1 min-w-0">
                <span className="text-[12px] text-[var(--text-tertiary)] truncate block">
                  {entry.details ? Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                </span>
              </div>
            </TableRow>
          ))}
        </Table>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={count}
        pageSize={PAGE_SIZE}
        itemLabel="entries"
      />
    </>
  );
}

// ── Locations Tab ───────────────────────────────────────────────────

function LocationsTab() {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { locations, count, isLoading } = useAdminLocations(search, page);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <div className="flex items-center gap-2">
        <SearchInput
          placeholder={tx("search_locations_2d80e7", { defaultValue: "Search locations..." })}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          onClear={search ? () => { setSearch(''); setPage(1); } : undefined}
          className="flex-1"
        />
        <Badge variant="secondary" className="text-[11px]">{count}</Badge>
      </div>

      {isLoading ? (
        <Table>
          <TableHeader>
            <div className="flex-1"><Skeleton className="h-3 w-12" /></div>
            <div className="w-24"><Skeleton className="h-3 w-10" /></div>
            <div className="hidden sm:block w-16"><Skeleton className="h-3 w-10" /></div>
            <div className="hidden sm:block w-14"><Skeleton className="h-3 w-8" /></div>
            <div className="hidden lg:block w-14"><Skeleton className="h-3 w-10" /></div>
            <div className="hidden sm:block w-24"><Skeleton className="h-3 w-14" /></div>
          </TableHeader>
          {Array.from({ length: 8 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--border-subtle)]">
              <div className="flex-1 min-w-0"><Skeleton className="h-4 w-28" /></div>
              <div className="w-24"><Skeleton className="h-4 w-16" /></div>
              <div className="hidden sm:block w-16"><Skeleton className="h-4 w-8" /></div>
              <div className="hidden sm:block w-14"><Skeleton className="h-4 w-8" /></div>
              <div className="hidden lg:block w-14"><Skeleton className="h-4 w-8" /></div>
              <div className="hidden sm:block w-24"><Skeleton className="h-3 w-16" /></div>
            </div>
          ))}
        </Table>
      ) : locations.length === 0 ? (
        <EmptyState
          icon={Search}
          title={tx("no_locations_found_8caada", { defaultValue: "No locations found" })}
          subtitle={search ? tx("try_a_different_search_term_39d642", { defaultValue: "Try a different search term" }) : undefined}
          variant="search"
        />
      ) : (
        <Table>
          <TableHeader>
            <div className="flex-1">
              <span className="ui-col-header">Name</span>
            </div>
            <div className="w-24">
              <span className="ui-col-header">{tx("owner_89ff31", { defaultValue: "Owner" })}</span>
            </div>
            <div className="hidden sm:block w-16">
              <span className="ui-col-header">{tx("members_1cb449", { defaultValue: "Members" })}</span>
            </div>
            <div className="hidden sm:block w-14">
              <span className="ui-col-header">{tx("bins_3f1d8e", { defaultValue: "Bins" })}</span>
            </div>
            <div className="hidden lg:block w-14">
              <span className="ui-col-header">{tx("areas_14ce09", { defaultValue: "Areas" })}</span>
            </div>
            <div className="hidden sm:block w-24">
              <span className="ui-col-header">{tx("created_accf40", { defaultValue: "Created" })}</span>
            </div>
          </TableHeader>
          {locations.map((loc) => (
            <TableRow key={loc.id} className="cursor-default [@media(hover:hover)]:hover:bg-[var(--bg-hover)]">
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-medium text-[var(--text-primary)] truncate block">{loc.name}</span>
              </div>
              <div className="w-24 truncate">
                <span className="text-[14px] text-[var(--text-secondary)]">{loc.ownerDisplayName || loc.ownerUsername}</span>
              </div>
              <div className="hidden sm:block w-16 text-[14px] text-[var(--text-secondary)] tabular-nums">{loc.memberCount}</div>
              <div className="hidden sm:block w-14 text-[14px] text-[var(--text-secondary)] tabular-nums">{loc.binCount}</div>
              <div className="hidden lg:block w-14 text-[14px] text-[var(--text-secondary)] tabular-nums">{loc.areaCount}</div>
              <div className="hidden sm:block w-24">
                <span className="text-[12px] text-[var(--text-tertiary)] whitespace-nowrap">{new Date(loc.createdAt).toLocaleDateString(uiLanguage)}</span>
              </div>
            </TableRow>
          ))}
        </Table>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={count}
        pageSize={PAGE_SIZE}
        itemLabel="locations"
      />
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export function AdminSystemPage() {
  const { t: tx } = useTranslation('ui');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (user && !user.isAdmin) navigate('/', { replace: true });
  }, [user, navigate]);

  const [tab, setTab] = useState<Tab>('system');

  // Prevent flash of admin content for non-admins
  if (user && !user.isAdmin) return null;

  return (
    <div className="page-content-wide">
      <PageHeader
        title="System"
        back
        backTo="/admin/users"
        actions={
          <OptionGroup
            options={[
              { key: 'system' as const, label: 'System', icon: Server },
              { key: 'audit' as const, label: tx("audit_log_28dd75", { defaultValue: "Audit Log" }), icon: ShieldAlert },
              { key: 'locations' as const, label: tx("locations_e59e8f", { defaultValue: "Locations" }), icon: MapPin },
            ]}
            value={tab}
            onChange={setTab}
          />
        }
      />

      {tab === 'system' && <SystemTab />}
      {tab === 'audit' && <AuditLogTab />}
      {tab === 'locations' && <LocationsTab />}
    </div>
  );
}
