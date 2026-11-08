import { Github, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TourLauncher } from '@/features/tour/TourLauncher';
import { listTours } from '@/features/tour/tourRegistry';
import { useAppSettings } from '@/lib/appSettings';
import { useUserPreferences } from '@/lib/userPreferences';
import { SettingsPageHeader } from '../SettingsPageHeader';
import { SettingsRow } from '../SettingsRow';
import { SettingsSection } from '../SettingsSection';

export function AboutSection() {
  const { t: tx } = useTranslation('ui');
  const { settings } = useAppSettings();
  const { updatePreferences } = useUserPreferences();
  const tours = listTours();

  return (
    <>
      <SettingsPageHeader title={tx("about_6b21fb", { defaultValue: "About" })} description={tx("version_info_and_resources_936488", { defaultValue: "Version info and resources." })} />

      <SettingsSection label={tx("app_fc4a69", { defaultValue: "App" })}>
        <div className="flex items-baseline gap-3 py-2">
          <span className="settings-entity-title">{settings.appName}</span>
          <span className="settings-hint tabular-nums tracking-wide">v{__APP_VERSION__}</span>
        </div>
      </SettingsSection>

      <SettingsSection label={tx("guided_tours_a42033", { defaultValue: "Guided tours" })} dividerAbove>
        <div className="flex flex-col">
          {tours.map((tour) => (
            <TourLauncher key={tour.id} tourId={tour.id} variant="menu" />
          ))}
        </div>
        <SettingsRow
          icon={RefreshCw}
          label={tx("reset_all_tours_16c33c", { defaultValue: "Reset all tours" })}
          description={tx("mark_every_tour_unseen_so_they_show_up_again_a1d8eb", { defaultValue: "Mark every tour unseen so they show up again" })}
          border={false}
          onClick={() => updatePreferences({ tours_seen: [] })}
        />
      </SettingsSection>

      <SettingsSection label={tx("resources_87df60", { defaultValue: "Resources" })} dividerAbove>
        <SettingsRow
          icon={Github}
          label="GitHub"
          description={tx("source_code_issues_and_releases_c52ffd", { defaultValue: "Source code, issues, and releases" })}
          border={false}
          onClick={() =>
            window.open('https://github.com/akifbayram/openbin', '_blank', 'noopener,noreferrer')
          }
        />
      </SettingsSection>
    </>
  );
}
