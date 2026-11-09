import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OptionGroupOption } from '@/components/ui/option-group';
import { OptionGroup } from '@/components/ui/option-group';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import {
  ITEM_PAGE_SIZE_OPTIONS,
  type PageSizeValue,
  setItemPageSize,
  useItemPageSize,
} from '@/features/bins/useItemPageSize';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { SUPPORTED_LANGUAGES, setLanguage, useLanguage } from '@/lib/language';
import { useTerminology } from '@/lib/terminology';
import type { ThemePreference } from '@/lib/theme';
import { useTheme } from '@/lib/theme';
import { useUserPreferences } from '@/lib/userPreferences';
import { SettingsPageHeader } from '../SettingsPageHeader';
import { SettingsRow } from '../SettingsRow';
import { SettingsSection } from '../SettingsSection';

export function PreferencesSection() {
  const { t: tx } = useTranslation('ui');
  const themeOptions: OptionGroupOption<ThemePreference>[] = [
    { key: 'light', label: tx('themeLight', { defaultValue: 'Light' }), icon: Sun },
    { key: 'dark', label: tx('themeDark', { defaultValue: 'Dark' }), icon: Moon },
    { key: 'auto', label: tx('themeAuto', { defaultValue: 'Auto' }), icon: Monitor },
  ];
  const ITEM_PAGE_SIZE_SELECT_OPTIONS = ITEM_PAGE_SIZE_OPTIONS.map(value => ({
    value,
    label: value === 'all' ? tx('allOnPage', { defaultValue: 'All on one page' }) : tx('perPage', { count: value, defaultValue: `${value} per page` }),
  }));
  const { preference, setThemePreference } = useTheme();
  const { preferences, updatePreferences } = useUserPreferences();
  const { pageSize: itemPageSize } = useItemPageSize();
  const term = useTerminology();
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  function handleLanguageChange(code: string) {
    const previousLanguage = language;
    const previousUserLanguage = user?.language ?? null;
    setLanguage(code);
    if (user) updateUser({ ...user, language: code });
    apiFetch('/api/auth/profile', { method: 'PUT', body: { language: code } }).catch((err) => {
      console.error('Failed to persist language preference', err);
      setLanguage(previousLanguage);
      if (user) updateUser({ ...user, language: previousUserLanguage });
      showToast({ message: tx('languageSaveFailed', { defaultValue: 'Failed to save language preference' }), variant: 'error' });
    });
  }

  return (
    <>
      <SettingsPageHeader
        title={tx("preferences_9dfd34", { defaultValue: "Preferences" })}
        description={tx("customize_your_experience_8c8dfd", { defaultValue: "Customize your experience." })}
      />

      <SettingsSection label={tx("appearance_41def7", { defaultValue: "Appearance" })}>
        <SettingsRow
          label={tx("theme_a797e3", { defaultValue: "Theme" })}
          control={
            <OptionGroup
              options={themeOptions}
              value={preference}
              onChange={setThemePreference}
              iconOnly
            />
          }
        />
        <SettingsRow
          label={tx("language_89b86a", { defaultValue: "Language" })}
          control={
            <Select<string>
              value={language}
              options={SUPPORTED_LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
              onChange={handleLanguageChange}
              ariaLabel={tx("language_89b86a", { defaultValue: "Language" })}
              size="sm"
              align="right"
            />
          }
        />
      </SettingsSection>

      <SettingsSection label={tx("display_574ff9", { defaultValue: "Display" })} dividerAbove>
        <SettingsRow
          label={tx("items_per_bin_page_61b503", { defaultValue: "Items per {{bin}} page", bin: term.bin })}
          description={tx("number_of_items_shown_before_pagination_select_all_on_one_pa_57624d", { defaultValue: "Number of items shown before pagination. Select \"All on one page\" to disable." })}
          control={
            <Select<PageSizeValue>
              value={itemPageSize}
              options={ITEM_PAGE_SIZE_SELECT_OPTIONS}
              onChange={setItemPageSize}
              ariaLabel={tx("items_per_bin_page_61b503", { defaultValue: "Items per {{bin}} page", bin: term.bin })}
              size="sm"
              align="right"
            />
          }
        />
      </SettingsSection>

      <SettingsSection label={tx("keyboard_6662c4", { defaultValue: "Keyboard" })} dividerAbove>
        <SettingsRow
          label={tx("keyboard_shortcuts_b46575", { defaultValue: "Keyboard Shortcuts" })}
          description={
            <span> {tx("press_ea683a", { defaultValue: "Press" })}{' '}
              <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-[var(--radius-sm)] bg-[var(--bg-input)] font-mono text-[var(--text-xs)] text-[var(--text-secondary)] leading-none">
                ?
              </kbd>{' '} {tx("to_view_all_shortcuts_d8f721", { defaultValue: "to view all shortcuts" })} </span>
          }
          control={
            <Switch
              checked={preferences.keyboard_shortcuts_enabled}
              onCheckedChange={(checked) =>
                updatePreferences({ keyboard_shortcuts_enabled: checked })
              }
            />
          }
        />
      </SettingsSection>

      <SettingsSection label={tx("usage_tracking_ee57f7", { defaultValue: "Usage Tracking" })} dividerAbove>
        <SettingsRow
          label={tx("scan_qr_code_e7d8c3", { defaultValue: "Scan QR code" })}
          description={tx("record_a_usage_dot_when_you_scan_a_qr_code_17d182", { defaultValue: "Record a usage dot when you scan a QR code" })}
          border={false}
          control={
            <Switch
              checked={preferences.usage_tracking_scan}
              onCheckedChange={(checked) => updatePreferences({ usage_tracking_scan: checked })}
            />
          }
        />
        <SettingsRow
          label={tx("manual_code_lookup_2bd85b", { defaultValue: "Manual code lookup" })}
          description={tx("record_when_you_look_up_a_bin_by_typing_its_code_28453d", { defaultValue: "Record when you look up a {{bin}} by typing its code", bin: term.bin })}
          border={false}
          control={
            <Switch
              checked={preferences.usage_tracking_manual_lookup}
              onCheckedChange={(checked) => updatePreferences({ usage_tracking_manual_lookup: checked })}
            />
          }
        />
        <SettingsRow
          label={tx("view_bin_460d01", { defaultValue: "View {{bin}}", bin: term.bin })}
          description={tx("record_every_time_you_open_a_bin_detail_page_273ecb", { defaultValue: "Record every time you open a {{bin}} detail page", bin: term.bin })}
          border={false}
          control={
            <Switch
              checked={preferences.usage_tracking_view}
              onCheckedChange={(checked) => updatePreferences({ usage_tracking_view: checked })}
            />
          }
        />
        <SettingsRow
          label={tx("modify_bin_41a94f", { defaultValue: "Modify {{bin}}", bin: term.bin })}
          description={tx("record_when_you_edit_a_bin_s_contents_or_metadata_f8b67e", { defaultValue: "Record when you edit a {{bin}}'s contents or metadata", bin: term.bin })}
          border={false}
          control={
            <Switch
              checked={preferences.usage_tracking_modify}
              onCheckedChange={(checked) => updatePreferences({ usage_tracking_modify: checked })}
            />
          }
        />
        <SettingsRow
          label={tx("default_granularity_abc648", { defaultValue: "Default granularity" })}
          description={tx("initial_zoom_level_for_the_usage_heatmap_e23dda", { defaultValue: "Initial zoom level for the usage heatmap" })}
          border={false}
          control={
            <OptionGroup
              options={[
                { key: 'daily' as const, label: tx("day_987b9c", { defaultValue: "Day" }) },
                { key: 'weekly' as const, label: tx("week_f82be6", { defaultValue: "Week" }) },
                { key: 'monthly' as const, label: tx("month_082bc3", { defaultValue: "Month" }) },
              ]}
              value={preferences.usage_granularity}
              onChange={(v) => updatePreferences({ usage_granularity: v })}
              size="sm"
            />
          }
        />
      </SettingsSection>
    </>
  );
}
