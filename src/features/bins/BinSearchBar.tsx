import { SlidersHorizontal } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DismissibleBadge } from '@/components/ui/dismissible-badge';
import { SearchInput } from '@/components/ui/search-input';
import { Tooltip } from '@/components/ui/tooltip';
import type { Terminology } from '@/lib/terminology';
import type { Area } from '@/types';
import type { BinFilters } from './useBins';

interface BinSearchBarProps {
  search: string;
  setSearch: (v: string) => void;
  filters: BinFilters;
  setFilters: (v: BinFilters | ((prev: BinFilters) => BinFilters)) => void;
  clearAll: () => void;
  areas: Area[];
  getTagStyle: (tag: string) => CSSProperties | undefined;
  activeCount: number;
  hasBadges: boolean;
  onOpenFilter: () => void;
  t: Terminology;
}

export function BinSearchBar({
  search,
  setSearch,
  filters,
  setFilters,
  clearAll,
  areas,
  getTagStyle,
  activeCount,
  hasBadges,
  onOpenFilter,
  t,
}: BinSearchBarProps) {
  const { t: tx } = useTranslation('ui');
  const showClear = hasBadges || Boolean(search);
  return (
    <div className="flex items-center gap-2.5">
      <SearchInput
        data-shortcut-search
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tx("search_bins_5c5eaa", { defaultValue: "Search {{bins}}...", bins: t.bins })}
        aria-label={tx("search_bins_c4ba23", { defaultValue: "Search {{bins}}", bins: t.bins })}
        containerClassName="flex-1"
        onClear={showClear ? clearAll : undefined}
        clearLabel={hasBadges ? 'Clear search and filters' : 'Clear search'}
      >
        {hasBadges && (
          <div className="row-tight overflow-x-auto scrollbar-hide min-w-0 shrink">
            {filters.tags.map((tag) => (
              <DismissibleBadge
                key={`tag-${tag}`}
                onDismiss={() => setFilters({ ...filters, tags: filters.tags.filter((t2) => t2 !== tag) })}
                ariaLabel={tx("remove_tag_filter_tag_a83ef4", { defaultValue: "Remove tag filter {{tag}}", tag: tag })}
                style={getTagStyle(tag)}
              >
                {tag}
              </DismissibleBadge>
            ))}
            {filters.tags.length >= 2 && (
              <Badge variant="outline" className="py-0.5 shrink-0 text-[11px] text-[var(--text-tertiary)]">
                {filters.tagMode === 'all' ? tx("all_tags_a0ef40", { defaultValue: "All tags" }) : tx("any_tag_6863f3", { defaultValue: "Any tag" })}
              </Badge>
            )}
            {filters.areas.map((areaKey) => {
              const areaName = areaKey === '__unassigned__' ? 'Unassigned' : areas.find((a) => a.id === areaKey)?.name ?? areaKey;
              return (
                <DismissibleBadge
                  key={`area-${areaKey}`}
                  onDismiss={() => setFilters({ ...filters, areas: filters.areas.filter((a) => a !== areaKey) })}
                  ariaLabel={tx("remove_area_filter_areaname_ad3aa8", { defaultValue: "Remove area filter {{areaName}}", areaName: areaName })}
                >
                  {areaName}
                </DismissibleBadge>
              );
            })}
            {filters.hasItems && (
              <DismissibleBadge onDismiss={() => setFilters({ ...filters, hasItems: false })} ariaLabel={tx("remove_has_items_filter_eb8d84", { defaultValue: "Remove has items filter" })}> {tx("has_items_ef61b5", { defaultValue: "Has items" })} </DismissibleBadge>
            )}
            {filters.hasNotes && (
              <DismissibleBadge onDismiss={() => setFilters({ ...filters, hasNotes: false })} ariaLabel={tx("remove_has_notes_filter_81c4e2", { defaultValue: "Remove has notes filter" })}> {tx("has_notes_f0af50", { defaultValue: "Has notes" })} </DismissibleBadge>
            )}
            {filters.needsOrganizing && (
              <DismissibleBadge onDismiss={() => setFilters({ ...filters, needsOrganizing: false })} ariaLabel={tx("remove_needs_organizing_filter_50fd50", { defaultValue: "Remove needs organizing filter" })}> {tx("needs_organizing_2c36ed", { defaultValue: "Needs organizing" })} </DismissibleBadge>
            )}
          </div>
        )}
      </SearchInput>
      <Tooltip content={tx("filter_d7decf", { defaultValue: "Filter" })} side="bottom">
        <Button
          variant="secondary"
          size="icon"
          onClick={onOpenFilter}
          className="shrink-0 relative rounded-[var(--radius-sm)]"
          aria-label={tx("filter_bins_7468dc", { defaultValue: "Filter {{bins}}", bins: t.bins })}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-[var(--accent)] text-[10px] font-bold text-white flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
        </Button>
      </Tooltip>
    </div>
  );
}
