import { AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Crossfade } from '@/components/ui/crossfade';
import { EmptyState } from '@/components/ui/empty-state';
import { SettingsPageHeader } from '@/features/settings/SettingsPageHeader';
import { useTerminology } from '@/lib/terminology';
import { usePermissions } from '@/lib/usePermissions';
import { ActivityFilterBar } from './ActivityFilterBar';
import { ActivityTableSkeleton } from './ActivityTableSkeleton';
import { ActivityTableView } from './ActivityTableView';
import type { EntityTypeFilter } from './activityHelpers';
import { getActionLabel } from './activityHelpers';
import { usePaginatedActivityLog } from './useActivity';

export function ActivityPage() {
  const { t: tx } = useTranslation('ui');
  const { t: translateActivity } = useTranslation('activity');
  const navigate = useNavigate();
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const t = useTerminology();

  // Filter state
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityTypeFilter>('');
  const [userId, setUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Server-side filtered data
  const { entries, isLoading, isLoadingMore, hasMore, error, loadMore } = usePaginatedActivityLog(
    entityTypeFilter,
    userId || undefined,
    dateFrom || undefined,
    dateTo || undefined,
    50,
  );

  // Client-side text search filter
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter((e) => {
      if (e.display_name.toLowerCase().includes(q)) return true;
      if (e.entity_name?.toLowerCase().includes(q)) return true;
      if (getActionLabel(e, t, translateActivity).toLowerCase().includes(q)) return true;
      return false;
    });
  }, [entries, searchQuery, t]);

  useEffect(() => {
    if (!permissionsLoading && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [permissionsLoading, isAdmin, navigate]);

  if (!permissionsLoading && !isAdmin) {
    return null;
  }

  const hasFilters = entityTypeFilter || userId || dateFrom || dateTo || searchQuery;

  return (
    <>
      <SettingsPageHeader title={tx("activity_log_a3abad", { defaultValue: "Activity Log" })} description={tx("view_changes_and_actions_across_your_location_2cfa8d", { defaultValue: "View changes and actions across your location." })} />

      <ActivityFilterBar
        entityTypeFilter={entityTypeFilter}
        onEntityTypeChange={setEntityTypeFilter}
        userId={userId}
        onUserIdChange={setUserId}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Crossfade
        isLoading={(isLoading || permissionsLoading) && entries.length === 0}
        skeleton={<ActivityTableSkeleton count={8} withHeader />}
      >
        {error ? (
          <EmptyState
            icon={AlertTriangle}
            title={tx("failed_to_load_activity_152439", { defaultValue: "Failed to load activity" })}
            subtitle={error}
          />
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={hasFilters ? tx("no_matching_activity_26303c", { defaultValue: "No matching activity" }) : 'No activity yet'}
            subtitle={
              hasFilters
                ? tx("try_different_filters_or_search_terms_b77124", { defaultValue: "Try different filters or search terms" })
                : tx("actions_like_creating_editing_and_deleting_bins_will_appear__4ef92e", { defaultValue: "Actions like creating, editing, and deleting {{bins}} will appear here", bins: t.bins })
            }
            variant={hasFilters ? 'search' : undefined}
          />
        ) : (
          <ActivityTableView
            entries={filteredEntries}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            loadMore={loadMore}
            searchQuery={searchQuery}
          />
        )}
      </Crossfade>
    </>
  );
}
