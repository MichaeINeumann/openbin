import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Disclosure } from '@/components/ui/disclosure';
import { OptionGroup, type OptionGroupOption } from '@/components/ui/option-group';
import { SearchInput } from '@/components/ui/search-input';
import { useLocationMembers } from '@/features/locations/useLocations';
import { useAuth } from '@/lib/auth';
import { useTerminology } from '@/lib/terminology';
import { cn, inputBase } from '@/lib/utils';
import { ENTITY_TYPE_FILTERS, type EntityTypeFilter } from './activityHelpers';

const filterControl = cn(inputBase, 'flex-1 min-w-0 py-1.5 text-[13px]');

interface ActivityFilterBarProps {
  entityTypeFilter: EntityTypeFilter;
  onEntityTypeChange: (v: EntityTypeFilter) => void;
  userId: string;
  onUserIdChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

export function ActivityFilterBar({
  entityTypeFilter,
  onEntityTypeChange,
  userId,
  onUserIdChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  searchQuery,
  onSearchChange,
}: ActivityFilterBarProps) {
  const { t: tx } = useTranslation('ui');
  const t = useTerminology();
  const { activeLocationId } = useAuth();
  const { members } = useLocationMembers(activeLocationId);
  const filterOptions = useMemo<OptionGroupOption<EntityTypeFilter>[]>(
    () => ENTITY_TYPE_FILTERS.map((f) => ({ key: f.value, label: f.tKey ? t[f.tKey] : f.label })),
    [t],
  );

  const hasActiveFilters = userId || dateFrom || dateTo;

  const filterControls = (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={userId}
        onChange={(e) => onUserIdChange(e.target.value)}
        aria-label={tx("filter_by_user_0b6fa3", { defaultValue: "Filter by user" })}
        className={filterControl}
      >
        <option value="">{tx("all_users_ce832d", { defaultValue: "All users" })}</option>
        {members.map((m) => (
          <option key={m.user_id} value={m.user_id}>
            {m.display_name || m.email}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        aria-label={tx("from_date_3b5d11", { defaultValue: "From date" })}
        className={filterControl}
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        aria-label={tx("to_date_af244d", { defaultValue: "To date" })}
        className={filterControl}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-2 mb-4">
      <SearchInput
        placeholder={tx("search_activity_f084d3", { defaultValue: "Search activity..." })}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={searchQuery ? () => onSearchChange('') : undefined}
      />

      <OptionGroup
        options={filterOptions}
        value={entityTypeFilter}
        onChange={onEntityTypeChange}
        size="sm"
      />

      <div className="hidden lg:block">
        {filterControls}
      </div>

      <div className="lg:hidden">
        <Disclosure
          label={<span>{hasActiveFilters ? tx("filters_active_effdfe", { defaultValue: "Filters (active)" }) : tx("filters_96e578", { defaultValue: "Filters" })}</span>}
          indicator={!!hasActiveFilters}
          defaultOpen={!!hasActiveFilters}
        >
          {filterControls}
        </Disclosure>
      </div>
    </div>
  );
}
