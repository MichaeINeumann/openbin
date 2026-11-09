import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/toast';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useBinCountLabel, useTerminology } from '@/lib/terminology';
import type { ExportData } from '@/types';
import {
  countCSVBins,
  exportAllData,
  exportCsv,
  exportZip,
  ImportError,
  type ImportResult,
  importCSV,
  importData,
  importZip,
  parseImportFile,
  validateCSVHeader,
} from './exportImport';

/** Returns a catalog key; the caller translates so the text follows the language. */
function importErrorKey(err: unknown) {
  if (err instanceof ImportError) {
    switch (err.code) {
      case 'FILE_TOO_LARGE': return 'data_fileTooLarge';
      case 'INVALID_JSON': return 'data_invalidJson';
      case 'INVALID_FORMAT': return 'data_invalidFormat';
    }
  }
  return 'data_backupReadFailed';
}

type ExportFormat = 'zip' | 'json' | 'csv';
type ImportFormat = 'zip' | 'json' | 'csv';

interface ImportPreview {
  toCreate: { name: string; itemCount: number; tags: string[] }[];
  toSkip: { name: string; reason: string }[];
  totalBins: number;
  totalItems: number;
}

export function useDataSectionActions() {
  const { activeLocationId } = useAuth();
  const { showToast } = useToast();
  const { t: tx } = useTranslation('ui');
  const term = useTerminology();
  const binCount = useBinCountLabel();

  function resolveLocationId(locationId?: string | null): string | null {
    return locationId ?? activeLocationId ?? null;
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('zip');
  const [exporting, setExporting] = useState(false);

  // Import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFormatRaw, setImportFormatRaw] = useState<ImportFormat>('json');
  const [importMode, setImportModeRaw] = useState<'merge' | 'replace'>('merge');
  const [pendingData, setPendingData] = useState<ExportData | null>(null);
  const [csvPending, setCsvPending] = useState<{ file: File; bins: number; items: number } | null>(null);
  const [zipPending, setZipPending] = useState<{ file: File } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  // Cache the merge-mode result so mode toggles don't re-upload files
  const mergePreviewRef = useRef<ImportPreview | null>(null);

  async function fetchDryRun(
    source: { json: ExportData } | { file: File; format: 'csv' | 'zip' },
    mode: 'merge' | 'replace',
    locationId?: string | null,
  ) {
    const targetLocationId = resolveLocationId(locationId);
    if (!targetLocationId) return;
    try {
      let result: ImportPreview;
      if ('json' in source) {
        result = await apiFetch<ImportPreview>(`/api/locations/${targetLocationId}/import`, {
          method: 'POST',
          body: { bins: source.json.bins, mode, dryRun: true },
        });
      } else {
        const formData = new FormData();
        formData.append('file', source.file);
        formData.append('mode', mode);
        formData.append('dryRun', 'true');
        result = await apiFetch<ImportPreview>(
          `/api/locations/${targetLocationId}/import/${source.format}`,
          { method: 'POST', body: formData },
        );
      }
      if (mode === 'merge') mergePreviewRef.current = result;
      setImportPreview(result);
    } catch {
      // silently ignore — fall back to count-only summary
    }
  }

  function setImportFormat(format: ImportFormat) {
    setImportFormatRaw(format);
    setPendingData(null);
    setCsvPending(null);
    setZipPending(null);
    setImportPreview(null);
    mergePreviewRef.current = null;
  }

  function setImportMode(mode: 'merge' | 'replace') {
    setImportModeRaw(mode);
    if (!importPreview) return;

    if (mode === 'replace') {
      // In replace mode all bins are created — derive client-side, no re-upload
      const allBins = [...importPreview.toCreate, ...importPreview.toSkip.map(b => ({
        name: b.name, itemCount: 0, tags: [] as string[],
      }))];
      setImportPreview({
        toCreate: allBins,
        toSkip: [],
        totalBins: importPreview.totalBins,
        totalItems: importPreview.totalItems,
      });
    } else if (mergePreviewRef.current) {
      // Switching back to merge — use cached result
      setImportPreview(mergePreviewRef.current);
    } else if (importFormatRaw === 'json' && pendingData) {
      fetchDryRun({ json: pendingData }, mode);
    } else if (importFormatRaw === 'csv' && csvPending) {
      fetchDryRun({ file: csvPending.file, format: 'csv' }, mode);
    } else if (importFormatRaw === 'zip' && zipPending) {
      fetchDryRun({ file: zipPending.file, format: 'zip' }, mode);
    }
  }

  function resetImportState() {
    setPendingData(null);
    setCsvPending(null);
    setZipPending(null);
    setImportFormatRaw('zip');
    setImportModeRaw('merge');
    setImportPreview(null);
    mergePreviewRef.current = null;
  }

  // --- Export ---

  async function handleExport(locationId?: string | null) {
    const targetLocationId = resolveLocationId(locationId);
    if (!targetLocationId) {
      showToast({ message: tx('data_selectLocationFirst', { term: term.location }) });
      return;
    }
    setExporting(true);
    try {
      switch (exportFormat) {
        case 'zip':
          await exportZip(targetLocationId);
          showToast({ message: tx('data_exportZipSuccess') });
          break;
        case 'json':
          await exportAllData(targetLocationId);
          showToast({ message: tx('data_exportJsonSuccess') });
          break;
        case 'csv':
          await exportCsv(targetLocationId);
          showToast({ message: tx('data_exportCsvSuccess') });
          break;
      }
      setExportDialogOpen(false);
    } catch {
      const failedKey = exportFormat === 'zip'
        ? 'data_exportZipFailed'
        : exportFormat === 'csv'
          ? 'data_exportCsvFailed'
          : 'data_exportFailed';
      showToast({ message: tx(failedKey) });
    } finally {
      setExporting(false);
    }
  }

  // --- Import ---

  function handleImportFileClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFileSelected(files: FileList | null, locationId?: string | null) {
    const targetLocationId = resolveLocationId(locationId);
    if (!files?.[0] || !targetLocationId) return;
    const file = files[0];

    if (importFormatRaw === 'zip') {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        showToast({ message: tx('data_pickZipFile') });
      } else {
        setZipPending({ file });
        fetchDryRun({ file, format: 'zip' }, importMode, locationId);
      }
    } else if (importFormatRaw === 'json') {
      try {
        const data = await parseImportFile(file);
        setPendingData(data);
        fetchDryRun({ json: data }, importMode, locationId);
      } catch (err) {
        showToast({ message: tx(importErrorKey(err)) });
      }
    } else {
      try {
        const text = await file.text();
        if (!text.trim()) {
          showToast({ message: tx('data_csvEmpty') });
          return;
        }
        if (!validateCSVHeader(text)) {
          showToast({ message: tx('data_csvBadHeader') });
          return;
        }
        const counts = countCSVBins(text);
        setCsvPending({ file, bins: counts.bins, items: counts.items });
        fetchDryRun({ file, format: 'csv' }, importMode, locationId);
      } catch {
        showToast({ message: tx('data_csvReadFailed') });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function buildImportToast(result: ImportResult, isReplace: boolean): string {
    const parts: string[] = [binCount(result.binsImported)];
    if (result.trashedBinsImported) parts.push(tx('data_trashedCount', { count: result.trashedBinsImported }));
    if (result.photosImported) parts.push(tx('count_photos', { count: result.photosImported }));
    const summary = parts.join(', ');
    const skipped = !isReplace && result.binsSkipped
      ? tx('data_skippedSuffix', { count: result.binsSkipped })
      : '';
    return isReplace ? tx('data_replacedAll', { summary }) : tx('data_imported', { summary, skipped });
  }

  async function handleConfirmImport(locationId?: string | null) {
    const targetLocationId = resolveLocationId(locationId);
    if (!targetLocationId) return;

    if (importFormatRaw === 'zip' && zipPending) {
      setImporting(true);
      try {
        const result = await importZip(targetLocationId, zipPending.file, importMode);
        showToast({ message: buildImportToast(result, importMode === 'replace') });
        setZipPending(null);
        setImportDialogOpen(false);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        showToast({ message: tx('data_zipImportFailed', { detail }) });
      } finally {
        setImporting(false);
      }
    } else if (importFormatRaw === 'json' && pendingData) {
      setImporting(true);
      try {
        const result = await importData(targetLocationId, pendingData, importMode);
        showToast({ message: buildImportToast(result, importMode === 'replace') });
        setPendingData(null);
        setImportDialogOpen(false);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        showToast({
          message: importMode === 'replace'
            ? tx('data_replaceImportFailed', { detail })
            : tx('data_importFailed', { detail }),
        });
      } finally {
        setImporting(false);
      }
    } else if (importFormatRaw === 'csv' && csvPending) {
      setImporting(true);
      try {
        const result = await importCSV(targetLocationId, csvPending.file, importMode);
        showToast({
          message: tx('data_importedWithItems', {
            bins: binCount(result.binsImported),
            items: tx('count_items', { count: result.itemsImported }),
            skipped: result.binsSkipped ? tx('data_skippedSuffix', { count: result.binsSkipped }) : '',
          }),
        });
        setCsvPending(null);
        setImportDialogOpen(false);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        showToast({ message: tx('data_csvImportFailed', { detail }) });
      } finally {
        setImporting(false);
      }
    }
  }

  return {
    fileInputRef,
    exportDialogOpen,
    setExportDialogOpen,
    exportFormat,
    setExportFormat,
    exporting,
    importDialogOpen,
    setImportDialogOpen,
    importFormat: importFormatRaw,
    setImportFormat,
    importMode,
    setImportMode,
    pendingData,
    csvPending,
    zipPending,
    importing,
    importPreview,
    handleExport,
    handleImportFileClick,
    handleImportFileSelected,
    handleConfirmImport,
    resetImportState,
  };
}
