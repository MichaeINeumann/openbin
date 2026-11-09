import { useTranslation } from 'react-i18next';
import { OptionGroup } from '@/components/ui/option-group';
import { useUserPreferences } from '@/lib/userPreferences';
import type { UsageGranularity } from '@/types';

interface GranularitySegmentedProps {
  /** Optional override — if provided, uses local state; otherwise persists to user prefs. */
  value?: UsageGranularity;
  onChange?: (granularity: UsageGranularity) => void;
}

export function GranularitySegmented({ value, onChange }: GranularitySegmentedProps) {
  const { t } = useTranslation('ui');
  const OPTIONS = [
    { key: 'daily' as const, label: t('day_987b9c', { defaultValue: 'Day' }) },
    { key: 'weekly' as const, label: t('week_f82be6', { defaultValue: 'Week' }) },
    { key: 'monthly' as const, label: t('month_082bc3', { defaultValue: 'Month' }) },
  ];
  const { preferences, updatePreferences } = useUserPreferences();
  const current = value ?? preferences.usage_granularity;

  function handleChange(next: UsageGranularity) {
    if (onChange) {
      onChange(next);
    } else {
      updatePreferences({ usage_granularity: next });
    }
  }

  return (
    <OptionGroup
      options={OPTIONS}
      value={current}
      onChange={handleChange}
      size="sm"
    />
  );
}
