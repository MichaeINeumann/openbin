import { Clock, Download, Trash2, Upload } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LocationSelectList } from '@/features/locations/LocationSelectList';
import { useLocationList } from '@/features/locations/useLocations';
import { useAuth } from '@/lib/auth';

import type { Location } from '@/types';
import { SettingsPageHeader } from '../SettingsPageHeader';
import { SettingsRadioCard } from '../SettingsRadioCard';
import { SettingsRow } from '../SettingsRow';
import { SettingsSection } from '../SettingsSection';
import { useDataSectionActions } from '../useDataSectionActions';

function StepLabel({
  step,
  total,
  id,
  children,
}: {
  step: number;
  total: number;
  id?: string;
  children: ReactNode;
}) {
  const { t: tx } = useTranslation('ui');
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--bg-active)] text-[var(--text-xs)] font-semibold tabular-nums text-[var(--text-secondary)]"
      >
        {step}
      </span>
      <span id={id} className="settings-subheading">
        {children}
        <span className="sr-only"> {tx("step_6801c9", { defaultValue: "(step" })} {step} {tx("of_de04fa", { defaultValue: "of" })} {total})</span>
      </span>
    </div>
  );
}

function LocationPickerSection({
  locations,
  value,
  onChange,
}: {
  locations: Location[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const { t: tx } = useTranslation('ui');
  if (locations.length <= 1) return null;
  return (
    <div className="space-y-2">
      <span className="settings-subheading">{tx("location_d219c6", { defaultValue: "Location" })}</span>
      <div className="max-h-40 overflow-y-auto">
        <LocationSelectList locations={locations} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

export function DataSection() {
  const { t: tx } = useTranslation('ui');
  const navigate = useNavigate();
  const { activeLocationId } = useAuth();

  const actions = useDataSectionActions();
  const {
    fileInputRef,
    exportDialogOpen,
    setExportDialogOpen,
    exportFormat,
    setExportFormat,
    exporting,
    importDialogOpen,
    setImportDialogOpen,
    importFormat,
    setImportFormat,
    importMode,
    setImportMode,
    pendingData,
    csvPending,
    zipPending,
    importing,
    importPreview: dryRunPreview,
    handleExport,
    handleImportFileClick,
    handleImportFileSelected,
    handleConfirmImport,
    resetImportState,
  } = actions;

  const { locations } = useLocationList();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(activeLocationId ?? null);

  const activeLocation = locations.find((l) => l.id === activeLocationId);
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);
  const selectedLocationName = selectedLocation?.name ?? 'Current location';

  const hasImportFile =
    (importFormat === 'zip' && zipPending != null) ||
    (importFormat === 'json' && pendingData != null) ||
    (importFormat === 'csv' && csvPending != null);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const importSummary = dryRunPreview
    ? null
    : importFormat === 'zip' && zipPending
      ? `${zipPending.file.name} (${formatFileSize(zipPending.file.size)})`
      : importFormat === 'json' && pendingData
        ? `Found ${pendingData.bins.length} bin${pendingData.bins.length !== 1 ? 's' : ''}`
        : importFormat === 'csv' && csvPending
          ? `Found ${csvPending.bins} bin${csvPending.bins !== 1 ? 's' : ''} with ${csvPending.items} item${csvPending.items !== 1 ? 's' : ''}`
          : null;

  return (
    <>
      <SettingsPageHeader
        title={tx("data_e5e429", { defaultValue: "Data" })}
        description={tx("export_import_and_manage_your_workspace_data_f54e37", { defaultValue: "Export, import, and manage your workspace data." })}
      />

      <SettingsSection label={tx("manage_bf58d1", { defaultValue: "Manage" })}>
        <SettingsRow
          icon={Clock}
          label={tx("activity_log_a3abad", { defaultValue: "Activity Log" })}
          description={
            activeLocation?.activity_retention_days
              ? tx("changes_from_the_last_value0_days_30dd9e", { defaultValue: "Changes from the last {{value0}} days", value0: activeLocation.activity_retention_days })
              : tx("recent_changes_and_actions_6586a4", { defaultValue: "Recent changes and actions" })
          }
          onClick={() => navigate('/settings/activity')}
        />
        <SettingsRow
          icon={Trash2}
          label={tx("trash_e3bf62", { defaultValue: "Trash" })}
          description={
            activeLocation?.trash_retention_days
              ? tx("restore_within_value0_days_then_permanently_deleted_a67a16", { defaultValue: "Restore within {{value0}} days — then permanently deleted", value0: activeLocation.trash_retention_days })
              : tx("restore_or_permanently_remove_deleted_bins_19f839", { defaultValue: "Restore or permanently remove deleted bins" })
          }
          onClick={() => navigate('/settings/trash')}
        />
      </SettingsSection>

      <SettingsSection label={tx("export_import_2be810", { defaultValue: "Export & Import" })} dividerAbove>
        <SettingsRow
          icon={Download}
          label={tx("export_f3e4fa", { defaultValue: "Export" })}
          description={tx("download_a_backup_or_spreadsheet_of_this_workspace_c6fff5", { defaultValue: "Download a backup or spreadsheet of this workspace" })}
          onClick={() => {
            setSelectedLocationId(activeLocationId ?? null);
            setExportDialogOpen(true);
          }}
          disabled={!activeLocationId}
        />
        <SettingsRow
          icon={Upload}
          label={tx("import_d6fbc9", { defaultValue: "Import" })}
          description={tx("restore_from_a_backup_or_load_a_spreadsheet_b3cd46", { defaultValue: "Restore from a backup or load a spreadsheet" })}
          onClick={() => {
            resetImportState();
            setSelectedLocationId(activeLocationId ?? null);
            setImportDialogOpen(true);
          }}
          disabled={!activeLocationId}
        />
      </SettingsSection>

      <input
        ref={fileInputRef}
        type="file"
        accept={importFormat === 'zip' ? '.zip,application/zip' : importFormat === 'csv' ? '.csv,text/csv' : '.json'}
        className="hidden"
        onChange={(e) => handleImportFileSelected(e.target.files, selectedLocationId)}
      />

      <Dialog
        open={exportDialogOpen}
        onOpenChange={(open) => {
          if (!open && !exporting) setExportDialogOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("export_f3e4fa", { defaultValue: "Export" })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <LocationPickerSection
              locations={locations}
              value={selectedLocationId}
              onChange={setSelectedLocationId}
            />
            <div className="space-y-2.5">
              <span id="export-format-label" className="settings-subheading">Format</span>
              <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="export-format-label">
                <SettingsRadioCard
                  name="export-format"
                  value="zip"
                  current={exportFormat}
                  onChange={setExportFormat}
                  title={tx("backup_zip_fc18a0", { defaultValue: "Backup (ZIP)" })}
                  description={tx("all_data_including_photos_cb0e3c", { defaultValue: "All data including photos" })}
                />
                <SettingsRadioCard
                  name="export-format"
                  value="json"
                  current={exportFormat}
                  onChange={setExportFormat}
                  title={tx("backup_json_a6b8ca", { defaultValue: "Backup (JSON)" })}
                  description={tx("data_and_settings_no_photos_f36bf9", { defaultValue: "Data and settings, no photos" })}
                />
                <SettingsRadioCard
                  name="export-format"
                  value="csv"
                  current={exportFormat}
                  onChange={setExportFormat}
                  title={tx("spreadsheet_csv_1b5f65", { defaultValue: "Spreadsheet (CSV)" })}
                  description={tx("open_in_excel_or_google_sheets_72e65c", { defaultValue: "Open in Excel or Google Sheets" })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExportDialogOpen(false)} disabled={exporting}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button onClick={() => handleExport(selectedLocationId)} disabled={exporting}>
              {exporting ? tx("exporting_d16ade", { defaultValue: "Exporting..." }) : tx("export_selectedlocationname_4fc90a", { defaultValue: "Export {{selectedLocationName}}", selectedLocationName: selectedLocationName })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          if (!open && !importing) {
            setImportDialogOpen(false);
            resetImportState();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("import_d6fbc9", { defaultValue: "Import" })}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <LocationPickerSection
              locations={locations}
              value={selectedLocationId}
              onChange={setSelectedLocationId}
            />

            <div className="space-y-2.5">
              <StepLabel step={1} total={3} id="import-format-label">Format</StepLabel>
              <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="import-format-label">
                <SettingsRadioCard
                  name="import-format"
                  value="zip"
                  current={importFormat}
                  onChange={setImportFormat}
                  title={tx("backup_zip_fc18a0", { defaultValue: "Backup (ZIP)" })}
                  description={tx("all_data_including_photos_cb0e3c", { defaultValue: "All data including photos" })}
                />
                <SettingsRadioCard
                  name="import-format"
                  value="json"
                  current={importFormat}
                  onChange={setImportFormat}
                  title={tx("backup_json_a6b8ca", { defaultValue: "Backup (JSON)" })}
                  description={tx("data_and_settings_no_photos_f36bf9", { defaultValue: "Data and settings, no photos" })}
                />
                <SettingsRadioCard
                  name="import-format"
                  value="csv"
                  current={importFormat}
                  onChange={setImportFormat}
                  title={tx("spreadsheet_csv_1b5f65", { defaultValue: "Spreadsheet (CSV)" })}
                  description={tx("bins_and_items_from_a_spreadsheet_bfc631", { defaultValue: "Bins and items from a spreadsheet" })}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <StepLabel step={2} total={3} id="import-mode-label">{tx("mode_a7b93d", { defaultValue: "Mode" })}</StepLabel>
              <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="import-mode-label">
                <SettingsRadioCard
                  name="import-mode"
                  value="merge"
                  current={importMode}
                  onChange={setImportMode}
                  title={tx("merge_ea8f0d", { defaultValue: "Merge" })}
                  description={tx("add_new_data_skip_existing_83cf31", { defaultValue: "Add new data, skip existing" })}
                />
                <SettingsRadioCard
                  name="import-mode"
                  value="replace"
                  current={importMode}
                  onChange={setImportMode}
                  title={tx("replace_a7cf7b", { defaultValue: "Replace" })}
                  description={tx("delete_all_existing_data_first_20efa1", { defaultValue: "Delete all existing data first" })}
                  destructive
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <StepLabel step={3} total={3}>{tx("file_2c3caf", { defaultValue: "File" })}</StepLabel>
              <Button variant="outline" onClick={handleImportFileClick} disabled={importing}>
                {hasImportFile ? tx("change_file_106257", { defaultValue: "Change File" }) : tx("select_file_5c0c87", { defaultValue: "Select File" })}
              </Button>
              {dryRunPreview && (
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-input)] p-2 text-[var(--text-sm)]">
                  {dryRunPreview.toCreate.map((b) => (
                    <div
                      key={b.name}
                      className="flex items-center gap-2 rounded-[var(--radius-xs)] px-2 py-1"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success)]" />
                      <span className="truncate flex-1">{b.name}</span>
                      <span className="tabular-nums text-[var(--text-tertiary)]">{b.itemCount} {tx("items_7316c8", { defaultValue: "items" })}</span>
                    </div>
                  ))}
                  {dryRunPreview.toSkip.map((b) => (
                    <div
                      key={`skip-${b.name}`}
                      className="flex items-center gap-2 rounded-[var(--radius-xs)] px-2 py-1 opacity-50"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-tertiary)]" />
                      <span className="truncate flex-1">{b.name}</span>
                      <span className="text-[var(--text-tertiary)]">{tx("skip_c7e168", { defaultValue: "skip" })}</span>
                    </div>
                  ))}
                </div>
              )}
              {importSummary && (
                <p className="settings-row-desc">{importSummary}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setImportDialogOpen(false);
                resetImportState();
              }}
              disabled={importing}
            > {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button
              variant={importMode === 'replace' ? 'destructive' : 'default'}
              onClick={() => handleConfirmImport(selectedLocationId)}
              disabled={!hasImportFile || importing}
            >
              {importing ? tx("importing_b7353a", { defaultValue: "Importing..." }) : importMode === 'replace' ? tx("replace_import_2b5181", { defaultValue: "Replace & Import" }) : tx("import_selectedlocationname_0b4d19", { defaultValue: "Import {{selectedLocationName}}", selectedLocationName: selectedLocationName })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
