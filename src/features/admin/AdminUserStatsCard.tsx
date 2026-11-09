import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { relativeTime } from '@/lib/utils';
import { LimitStatItem, StatItem } from './AdminUserStatItems';
import type { AdminUserDetail } from './useAdminUsers';

interface AdminUserStatsCardProps {
  detail: AdminUserDetail;
}

export function AdminUserStatsCard({ detail }: AdminUserStatsCardProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const createdAt = new Date(detail.createdAt);
  const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / 86400000);
  const showLimits =
    detail.stats.binLimit !== null || detail.stats.storageLimit !== null || detail.stats.aiCreditsLimit > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tx("stats_be763e", { defaultValue: "Stats" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <StatItem label={tx("last_active_0eb2b9", { defaultValue: "Last Active" })} value={relativeTime(detail.lastActiveAt, uiLanguage)} />
          <StatItem label={tx("locations_e59e8f", { defaultValue: "Locations" })} value={detail.stats.locationCount} />
          <StatItem label={tx("bins_3f1d8e", { defaultValue: "Bins" })} value={detail.stats.binCount} />
          <StatItem label={tx("items_44d25b", { defaultValue: "Items" })} value={detail.stats.itemCount} />
          <StatItem label={tx("photos_c8b2e8", { defaultValue: "Photos" })} value={detail.stats.photoCount} />
          <StatItem label={tx("storage_mb_6f5f14", { defaultValue: "Storage (MB)" })} value={detail.stats.photoStorageMb} />
          <StatItem label={tx("scans_30d_3cc55e", { defaultValue: "Scans (30d)" })} value={detail.stats.scans30d} />
          <StatItem label={tx("api_keys_e18ffc", { defaultValue: "API Keys" })} value={detail.stats.apiKeyCount} />
          <StatItem label={tx("api_reqs_7d_d954fa", { defaultValue: "API Reqs (7d)" })} value={detail.stats.apiRequests7d} />
          <StatItem label={tx("shares_d15dcb", { defaultValue: "Shares" })} value={detail.stats.shareCount} />
          <StatItem label={tx("new_bins_7d_01a8ca", { defaultValue: "New Bins (7d)" })} value={detail.stats.binsCreated7d} />
          <StatItem label={tx("account_age_9a177a", { defaultValue: "Account Age" })} value={`${accountAgeDays}d`} />
        </div>

        {showLimits && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
            <LimitStatItem label={tx("bin_usage_28c3e0", { defaultValue: "Bin Usage" })} used={detail.stats.binCount} limit={detail.stats.binLimit} />
            <LimitStatItem label={tx("storage_usage_e7f595", { defaultValue: "Storage Usage" })} used={detail.stats.photoStorageMb} limit={detail.stats.storageLimit} unit="MB" />
            {detail.stats.aiCreditsLimit > 0 && (
              <LimitStatItem label={tx("ai_credits_ca010c", { defaultValue: "AI Credits" })} used={detail.stats.aiCreditsUsed} limit={detail.stats.aiCreditsLimit} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
