import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/toast';
import { useAiStream } from '@/features/ai/useAiStream';
import { useTextStructuring } from '@/features/ai/useTextStructuring';
import { buildAiPhotoFormData, compressPhotosForAi } from '@/features/photos/aiPhotoFormData';
import { describePhotoUploadError, uploadPhotosToBin } from '@/features/photos/photoUpload';
import { notifyPhotosChanged } from '@/features/photos/usePhotos';
import { ApiError } from '@/lib/api';
import { clientItemId, parseItemQuantity, toItemPayload } from '@/lib/itemQuantities';
import type { AiSuggestedItem, AiSuggestions, BinItem } from '@/types';
import { addItemsToBin } from './useBins';

/** `photo` = uploading and/or analysing a single photo for new items. */
type QuickAddState = 'input' | 'expanded' | 'processing' | 'photo' | 'preview';

const normalizeName = (name: string) => name.trim().toLocaleLowerCase();

/** Keep only items the bin doesn't already list (case-insensitive), de-duplicated. */
export function newItemsOnly(items: Array<AiSuggestedItem | string>, existingItems: string[]): AiSuggestedItem[] {
  const seen = new Set(existingItems.map(normalizeName));
  const result: AiSuggestedItem[] = [];
  for (const raw of items) {
    // Providers are normalised to objects server-side; AI_MOCK still sends strings.
    const item: AiSuggestedItem = typeof raw === 'string' ? { name: raw } : raw;
    const key = normalizeName(item?.name ?? '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({ ...item, name: item.name.trim() });
  }
  return result;
}

interface UseQuickAddOptions {
  binId?: string;
  binName: string;
  existingItems: string[];
  activeLocationId: string | undefined;
  aiConfigured?: boolean;
  onNavigateAiSetup?: () => void;
  onAdd?: (items: BinItem[]) => void;
}

export function useQuickAdd(options: UseQuickAddOptions) {
  const { binId, binName, existingItems, activeLocationId, aiConfigured = false, onNavigateAiSetup = () => {}, onAdd } = options;
  const { showToast } = useToast();
  const { t: tx } = useTranslation('ui');

  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<QuickAddState>('input');
  const [expandedText, setExpandedText] = useState('');
  const [checked, setChecked] = useState<Map<number, boolean>>(new Map());

  const {
    structuredItems,
    isStructuring,
    error: structureError,
    structure,
    clearStructured,
  } = useTextStructuring();

  const photoFailedMessage = tx('quickAdd_photoAnalyzeFailed', { defaultValue: "Couldn't analyze the photo — try again" });
  const storedPhotoAnalysis = useAiStream<AiSuggestions>('/api/ai/analyze/stream', photoFailedMessage);
  const filePhotoAnalysis = useAiStream<AiSuggestions>('/api/ai/analyze-image/stream', photoFailedMessage);
  const [photoItems, setPhotoItems] = useState<AiSuggestedItem[] | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const isAnalyzingPhoto = storedPhotoAnalysis.isStreaming || filePhotoAnalysis.isStreaming;
  const photoError = storedPhotoAnalysis.error ?? filePhotoAnalysis.error;
  const previewItems = photoItems ?? structuredItems;

  function reset() {
    setState('input');
    setExpandedText('');
    clearStructured();
    setChecked(new Map());
    setPhotoItems(null);
    storedPhotoAnalysis.cancel();
    filePhotoAnalysis.cancel();
    storedPhotoAnalysis.clear();
    filePhotoAnalysis.clear();
  }

  function showPhotoResult(result: AiSuggestions | null) {
    if (!result) return; // error stays visible in the `photo` panel
    const fresh = newItemsOnly(Array.isArray(result.items) ? result.items : [], existingItems);
    if (fresh.length === 0) {
      showToast({ message: tx('quickAdd_photoNoNewItems', { defaultValue: 'No new items found in this photo' }) });
      reset();
      return;
    }
    const initial = new Map<number, boolean>();
    for (let i = 0; i < fresh.length; i++) initial.set(i, true);
    setChecked(initial);
    setPhotoItems(fresh);
    setState('preview');
  }

  /** Analyse only the given stored photos and offer their new items for adding. */
  async function analyzePhotos(photoIds: string[]) {
    if (photoIds.length === 0) return;
    if (!aiConfigured) {
      onNavigateAiSetup();
      return;
    }
    clearStructured();
    setPhotoItems(null);
    filePhotoAnalysis.clear();
    setState('photo');
    showPhotoResult(await storedPhotoAnalysis.stream({ photoIds }));
  }

  /** Store a new photo in the bin, then analyse just that photo. If the bin's
   *  photo limit is reached the photo is analysed without being stored. */
  async function handlePhotoFile(file: File) {
    if (!binId) return;
    if (!aiConfigured) {
      onNavigateAiSetup();
      return;
    }
    clearStructured();
    setPhotoItems(null);
    setState('photo');
    setPhotoUploading(true);
    let uploaded: Awaited<ReturnType<typeof uploadPhotosToBin>>;
    try {
      uploaded = await uploadPhotosToBin(binId, [file]);
    } finally {
      setPhotoUploading(false);
    }
    notifyPhotosChanged();

    if (uploaded.uploadedIds.length > 0) {
      await analyzePhotos(uploaded.uploadedIds);
      return;
    }

    const err = uploaded.failures[0]?.error;
    if (err instanceof ApiError && err.code === 'BIN_PHOTO_LIMIT') {
      showToast({
        message: tx('quickAdd_photoNotStored', {
          reason: describePhotoUploadError(err, tx),
          defaultValue: 'Photo not saved: {{reason}} Items are detected anyway.',
        }),
        variant: 'warning',
        duration: 8000,
      });
      storedPhotoAnalysis.clear();
      const [compressed] = await compressPhotosForAi([file]);
      showPhotoResult(await filePhotoAnalysis.stream(
        buildAiPhotoFormData({ photos: [compressed], locationId: activeLocationId }),
      ));
      return;
    }

    showToast({ message: describePhotoUploadError(err, tx), variant: 'error', duration: 8000 });
    reset();
  }

  function handleStructure(text: string) {
    setState('processing');
    structure({
      text,
      mode: 'items',
      context: { binName, existingItems },
      locationId: activeLocationId,
    }).then((items) => {
      if (items) {
        const initial = new Map<number, boolean>();
        for (let i = 0; i < items.length; i++) initial.set(i, true);
        setChecked(initial);
        setState('preview');
      } else {
        setState('expanded');
      }
    });
  }

  async function handleAdd() {
    const trimmed = value.trim();
    if (!trimmed || (!binId && !onAdd) || saving) return;
    setSaving(true);
    try {
      const segments = trimmed.includes(',')
        ? trimmed.split(',').map((s) => s.trim()).filter(Boolean)
        : [trimmed];
      const parsed = segments.map((s) => parseItemQuantity(s));
      if (onAdd) {
        const binItems: BinItem[] = parsed.map((p) => ({ id: clientItemId(), name: p.name, quantity: p.quantity }));
        onAdd(binItems);
      } else {
        const items = parsed.map((p) => toItemPayload(p));
        if (items.length > 0 && binId) {
          await addItemsToBin(binId, items);
          showToast({ message: tx('items_addedCount', { count: items.length }) });
        }
      }
      setValue('');
    } catch {
      showToast({ message: 'Failed to add item' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\n') || (!binId && !onAdd)) return;
    e.preventDefault();
    const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const capped = lines.slice(0, 500);
    if (lines.length > 500) {
      showToast({ message: `Pasted ${lines.length} lines — only the first 500 will be added`, variant: 'warning' });
    }
    const parsed = capped.map((s) => parseItemQuantity(s));
    setSaving(true);
    try {
      if (onAdd) {
        const binItems: BinItem[] = parsed.map((p) => ({ id: clientItemId(), name: p.name, quantity: p.quantity }));
        onAdd(binItems);
      } else {
        const items = parsed.map((p) => toItemPayload(p));
        if (binId) {
          await addItemsToBin(binId, items);
          showToast({ message: `Added ${items.length} items` });
        }
      }
      setValue('');
    } catch {
      showToast({ message: tx('items_addFailed') });
    } finally {
      setSaving(false);
    }
  }

  function handleAiClick() {
    if (!aiConfigured) {
      onNavigateAiSetup();
      return;
    }
    clearStructured();
    if (value.trim()) {
      const text = value.trim();
      setExpandedText(text);
      setValue('');
      handleStructure(text);
    } else {
      setExpandedText('');
      setState('expanded');
    }
  }

  function handleExpandedKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!expandedText.trim() || isStructuring) return;
      handleStructure(expandedText.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      reset();
    }
  }

  function handleExtractClick() {
    if (!expandedText.trim() || isStructuring) return;
    handleStructure(expandedText.trim());
  }

  function toggleChecked(index: number) {
    setChecked((prev) => {
      const next = new Map(prev);
      next.set(index, !(prev.get(index) ?? true));
      return next;
    });
  }

  async function handleConfirmAdd() {
    if (!previewItems || (!binId && !onAdd)) return;
    const selected = previewItems.filter((_, i) => checked.get(i) !== false);
    if (selected.length === 0) return;
    try {
      if (onAdd) {
        const binItems: BinItem[] = selected.map((item) => ({
          id: clientItemId(),
          name: item.name,
          quantity: item.quantity ?? null,
        }));
        onAdd(binItems);
      } else {
        const items = selected.map((item) => item.quantity ? { name: item.name, quantity: item.quantity } : item.name);
        if (binId) {
          await addItemsToBin(binId, items);
          showToast({ message: tx('items_addedCount', { count: selected.length }) });
        }
      }
    } catch {
      showToast({ message: 'Failed to add items' });
    }
    reset();
  }

  function backToExpanded() {
    if (photoItems) {
      reset();
      return;
    }
    clearStructured();
    setChecked(new Map());
    setState('expanded');
  }

  const selectedCount = previewItems
    ? previewItems.filter((_, i) => checked.get(i) !== false).length
    : 0;

  return {
    value,
    setValue,
    saving,
    state,
    expandedText,
    setExpandedText,
    checked,
    structuredItems: previewItems,
    isStructuring,
    structureError,
    selectedCount,
    handleAdd,
    handlePaste,
    handleAiClick,
    handleExpandedKeyDown,
    handleExtractClick,
    toggleChecked,
    handleConfirmAdd,
    backToExpanded,
    cancelExpanded: reset,
    // Single-photo item detection (bin detail only — needs a stored bin)
    photoSupported: !!binId,
    photoUploading,
    isAnalyzingPhoto,
    photoError,
    isPhotoPreview: photoItems !== null,
    handlePhotoFile,
    analyzePhotos,
  };
}
