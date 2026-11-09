import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useAppSettings } from '@/lib/appSettings';
import { SettingsPageHeader } from '../SettingsPageHeader';
import { SettingsSection } from '../SettingsSection';
import { SavedBadge, useSavedFlash } from '../useSavedFlash';

export function PersonalizationSection() {
  const { t: tx } = useTranslation('ui');
  const TERM_ROWS = [
    { key: 'termBin', singular: tx('personalization_termBin'), plural: tx('personalization_termBinPlural'), hint: tx('personalization_termBinHint') },
    { key: 'termLocation', singular: tx('personalization_termLocation'), plural: tx('personalization_termLocationPlural'), hint: tx('personalization_termLocationHint') },
    { key: 'termArea', singular: tx('personalization_termArea'), plural: tx('personalization_termAreaPlural'), hint: tx('personalization_termAreaHint') },
  ] as const;
  const { settings, updateSettings, resetSettings } = useAppSettings();
  const { saved, flash } = useSavedFlash();

  return (
    <>
      <SettingsPageHeader
        title={tx("personalization_f20345", { defaultValue: "Personalization" })}
        description={tx("customize_naming_and_branding_for_your_workspace_9f1d66", { defaultValue: "Customize naming and branding for your workspace." })}
        action={<SavedBadge visible={saved} />}
      />

      <SettingsSection label={tx("app_name_4fb431", { defaultValue: "App Name" })}>
        <FormField label={tx("workspace_name_6e0f2b", { defaultValue: "Workspace name" })} htmlFor="app-name" hint={tx('personalization_nameHint')}>
          <Input
            id="app-name"
            value={settings.appName}
            onChange={(e) => updateSettings({ appName: e.target.value })}
            onBlur={flash}
            placeholder="OpenBin"
          />
        </FormField>
      </SettingsSection>

      <SettingsSection
        label={tx("custom_terminology_3edc57", { defaultValue: "Custom Terminology" })}
        dividerAbove
        description={tx("rename_core_concepts_to_match_your_workflow_singular_and_plu_3aefa1", { defaultValue: "Rename core concepts to match your workflow. Singular and plural are used throughout the UI." })}
      >
        <div className="flex flex-col gap-4">
          {TERM_ROWS.map(({ key, singular, plural, hint }) => {
            const raw = settings[key];
            const parts = raw ? raw.split('|') : ['', ''];
            return (
              <div key={key} className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_1fr] sm:items-start">
                <div className="flex flex-col gap-0.5 sm:pt-2">
                  <span className="settings-field-label">{singular}</span>
                  <span className="settings-hint">{hint}</span>
                </div>
                <Input
                  value={parts[0] || ''}
                  onChange={(e) => {
                    const newSingular = e.target.value;
                    const newPlural = parts[1] || '';
                    updateSettings({ [key]: newSingular || newPlural ? `${newSingular}|${newPlural}` : '' });
                  }}
                  onBlur={flash}
                  placeholder={singular}
                  aria-label={tx("singular_singular_name_752278", { defaultValue: "{{singular}} singular name", singular: singular })}
                />
                <Input
                  value={parts[1] || ''}
                  onChange={(e) => {
                    const newSingular = parts[0] || '';
                    const newPlural = e.target.value;
                    updateSettings({ [key]: newSingular || newPlural ? `${newSingular}|${newPlural}` : '' });
                  }}
                  onBlur={flash}
                  placeholder={plural}
                  aria-label={tx("plural_plural_name_974a28", { defaultValue: "{{plural}} plural name", plural: plural })}
                />
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <div className="pt-2">
        <Button variant="outline" onClick={resetSettings}>
          <RotateCcw className="h-4 w-4 mr-2" /> {tx("reset_to_defaults_ddefe4", { defaultValue: "Reset to defaults" })} </Button>
      </div>
    </>
  );
}
