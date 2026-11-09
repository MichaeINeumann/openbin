import { BarChart3, Globe, Lock, Mail, Search, Settings, UserPlus, Users } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OptionGroup } from '@/components/ui/option-group';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import type { SortDirection } from '@/components/ui/sort-header';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth';
import { usePlan } from '@/lib/usePlan';
import { getErrorMessage } from '@/lib/utils';
import { AdminColumnVisibilityMenu } from './AdminColumnVisibilityMenu';
import { AdminUsersTable } from './AdminUsersTable';
import { useAdminColumnVisibility } from './useAdminColumnVisibility';
import { type AdminUser, useAdminUsers } from './useAdminUsers';

const AdminMetricsSection = __EE__
  ? lazy(() => import('@/ee/AdminMetricsSection').then((m) => ({ default: m.AdminMetricsSection })))
  : (() => null) as React.FC;

const PAGE_SIZE = 25;

export function AdminUsersPage() {
  const { t: tx } = useTranslation('ui');
  const { user } = useAuth();
  const { isSelfHosted } = usePlan();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (user && !user.isAdmin) navigate('/', { replace: true });
  }, [user, navigate]);

  const [tab, setTab] = useState<'users' | 'metrics'>('users');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { visibility, toggleField, isVisible } = useAdminColumnVisibility();
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', displayName: '', isAdmin: false });
  const [createLoading, setCreateLoading] = useState(false);

  const sortParam = `${sortDirection === 'desc' ? '-' : ''}${sortColumn}`;
  const { users, count, isLoading, registration, deleteUser, updateRegistrationMode, createUser } = useAdminUsers(search, page, sortParam);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      showToast({ message: tx("user_value0_deleted_cb7e5e", { defaultValue: "User {{value0}} deleted", value0: deleteTarget.email }), variant: 'success' });
      setDeleteTarget(null);
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_delete_user_121656", { defaultValue: "Failed to delete user" })), variant: 'error' });
    }
  }, [deleteTarget, deleteUser, showToast, tx]);

  const handleRegistrationChange = useCallback(async (mode: string) => {
    try {
      await updateRegistrationMode(mode as 'open' | 'invite' | 'closed');
      showToast({ message: tx("registration_mode_set_to_mode_1b97a5", { defaultValue: "Registration mode set to {{mode}}", mode: mode }), variant: 'success' });
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_update_registration_mode_f30ba6", { defaultValue: "Failed to update registration mode" })), variant: 'error' });
    }
  }, [updateRegistrationMode, showToast, tx]);

  const handleCreate = useCallback(async () => {
    setCreateLoading(true);
    try {
      await createUser({
        email: createForm.email,
        password: createForm.password,
        displayName: createForm.displayName || undefined,
        isAdmin: createForm.isAdmin,
      });
      showToast({ message: tx("user_value0_created_3e033b", { defaultValue: "User {{value0}} created", value0: createForm.email }), variant: 'success' });
      setCreateOpen(false);
      setCreateForm({ email: '', password: '', displayName: '', isAdmin: false });
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_create_user_22e17f", { defaultValue: "Failed to create user" })), variant: 'error' });
    } finally {
      setCreateLoading(false);
    }
  }, [createForm, createUser, showToast, tx]);

  // Prevent flash of admin content for non-admins
  if (user && !user.isAdmin) return null;

  const registrationSection = (
    <Card>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              {registration.locked ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />} {tx("registration_b233e7", { defaultValue: "Registration" })} </p>
            {registration.locked && (
              <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{tx("locked_by_registration_mode_env_var_093e7f", { defaultValue: "Locked by REGISTRATION_MODE env var" })}</p>
            )}
          </div>
          <OptionGroup
            options={[
              { key: 'open' as const, label: tx("open_cf9b77", { defaultValue: "Open" }), icon: UserPlus, disabled: registration.locked, disabledTitle: 'Locked by env var' },
              { key: 'invite' as const, label: tx("invite_b13660", { defaultValue: "Invite" }), icon: Mail, disabled: registration.locked, disabledTitle: 'Locked by env var' },
              { key: 'closed' as const, label: tx("closed_88d86b", { defaultValue: "Closed" }), icon: Lock, disabled: registration.locked, disabledTitle: 'Locked by env var' },
            ]}
            value={registration.mode}
            onChange={handleRegistrationChange}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="page-content-wide">
      <PageHeader
        title={tx("admin_4e7afe", { defaultValue: "Admin" })}
        back
        actions={
          <div className="flex items-center gap-2">
            {__EE__ && !isSelfHosted && (
              <OptionGroup
                options={[
                  { key: 'users' as const, label: tx("users_57f2b1", { defaultValue: "Users" }), icon: Users },
                  { key: 'metrics' as const, label: tx("metrics_ddf6a1", { defaultValue: "Metrics" }), icon: BarChart3 },
                ]}
                value={tab}
                onChange={setTab}
              />
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/system')}>
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              System
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> {tx("create_user_b25c91", { defaultValue: "Create User" })} </Button>
          </div>
        }
      />

      {/* Self-hosted: registration + users (no tabs) */}
      {/* Cloud: show tab content */}
      {(isSelfHosted || tab === 'users') && (
        <>
          {/* Registration — self-hosted only shows here (cloud has it in metrics tab) */}
          {isSelfHosted && registrationSection}

          {/* Section label */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--text-secondary)]" />
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">{tx("users_57f2b1", { defaultValue: "Users" })}</h2>
            <Badge variant="secondary" className="text-[11px]">{count}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={tx("search_users_8cdc4c", { defaultValue: "Search users..." })}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onClear={search ? () => { setSearch(''); setPage(1); } : undefined}
              className="flex-1"
            />
            <AdminColumnVisibilityMenu visibility={visibility} onToggle={toggleField} />
          </div>

          {/* Users table */}
          {isLoading ? (
            <Table>
              <TableHeader>
                <div className="flex-1"><Skeleton className="h-3 w-12" /></div>
                <div className="hidden lg:block w-40"><Skeleton className="h-3 w-12" /></div>
                <div className="w-16"><Skeleton className="h-3 w-8" /></div>
                <div className="w-16"><Skeleton className="h-3 w-8" /></div>
                <div className="w-24"><Skeleton className="h-3 w-10" /></div>
                <div className="hidden lg:block w-14"><Skeleton className="h-3 w-8" /></div>
                <div className="hidden lg:block w-14"><Skeleton className="h-3 w-8" /></div>
                <div className="hidden lg:block w-20"><Skeleton className="h-3 w-10" /></div>
                <div className="hidden sm:block w-24"><Skeleton className="h-3 w-14" /></div>
                <div className="w-9" />
              </TableHeader>
              {Array.from({ length: 8 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--border-subtle)]">
                  <div className="flex-1 min-w-0 space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="hidden lg:block w-40"><Skeleton className="h-4 w-24" /></div>
                  <div className="w-16"><Skeleton className="h-5 w-12" /></div>
                  <div className="w-16"><Skeleton className="h-5 w-12" /></div>
                  <div className="w-24"><Skeleton className="h-5 w-14" /></div>
                  <div className="hidden lg:block w-14"><Skeleton className="h-4 w-8" /></div>
                  <div className="hidden lg:block w-14"><Skeleton className="h-4 w-8" /></div>
                  <div className="hidden lg:block w-20"><Skeleton className="h-4 w-12" /></div>
                  <div className="hidden sm:block w-24"><Skeleton className="h-3 w-16" /></div>
                  <div className="w-9" />
                </div>
              ))}
            </Table>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Search}
              title={tx("no_users_found_612eb3", { defaultValue: "No users found" })}
              subtitle={search ? tx("try_a_different_search_term_39d642", { defaultValue: "Try a different search term" }) : undefined}
              variant="search"
            />
          ) : (
            <AdminUsersTable
              users={users}
              currentUserId={user?.id ?? ''}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onDelete={setDeleteTarget}
              onClickUser={(id) => navigate(`/admin/users/${id}`)}
              isVisible={isVisible}
            />
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalCount={count}
            pageSize={PAGE_SIZE}
            itemLabel="users"
          />
        </>
      )}

      {__EE__ && !isSelfHosted && tab === 'metrics' && (
        <>
          {registrationSection}
          <Suspense fallback={null}>
            <AdminMetricsSection />
          </Suspense>
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("delete_user_0a0a90", { defaultValue: "Delete User" })}</DialogTitle>
            <DialogDescription> {tx("permanently_delete_2eea1f", { defaultValue: "Permanently delete" })} <strong>{deleteTarget?.email}</strong>{tx("this_cannot_be_undone_all_their_data_will_be_removed_813316", { defaultValue: "? This cannot be undone. All their data will be removed." })} </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{tx("cancel_77dfd2", { defaultValue: "Cancel" })}</Button>
            <Button variant="destructive" onClick={handleDelete}>{tx("delete_f6fdbe", { defaultValue: "Delete" })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create user dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateOpen(false);
          setCreateForm({ email: '', password: '', displayName: '', isAdmin: false });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("create_user_b25c91", { defaultValue: "Create User" })}</DialogTitle>
            <DialogDescription>{tx("create_a_new_user_account_f307c2", { defaultValue: "Create a new user account." })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-5">
            <FormField label={tx("email_84add5", { defaultValue: "Email" })} htmlFor="create-email">
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={tx("email_84add5", { defaultValue: "Email" })}
                autoComplete="email"
              />
            </FormField>
            <FormField label={tx("password_8be3c9", { defaultValue: "Password" })} htmlFor="create-password" hint="8+ characters, mixed case, one digit">
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={tx("password_8be3c9", { defaultValue: "Password" })}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label={tx("display_name_8d6b34", { defaultValue: "Display Name" })} htmlFor="create-displayName">
              <Input
                id="create-displayName"
                value={createForm.displayName}
                onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Optional"
              />
            </FormField>
            <div className="flex items-center gap-2">
              <Switch
                checked={createForm.isAdmin}
                onCheckedChange={(checked) => setCreateForm((f) => ({ ...f, isAdmin: checked }))}
              />
              <Label>{tx("admin_4e7afe", { defaultValue: "Admin" })}</Label>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>{tx("cancel_77dfd2", { defaultValue: "Cancel" })}</Button>
              <Button type="submit" disabled={!createForm.email || !createForm.password || createLoading}>
                {createLoading ? tx("creating_28ea76", { defaultValue: "Creating..." }) : tx("create_6e157c", { defaultValue: "Create" })}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
