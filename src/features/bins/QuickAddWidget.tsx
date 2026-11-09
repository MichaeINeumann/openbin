import { Camera, Check, ChevronLeft, Loader2, Plus, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LabelThreshold } from '@/components/ui/ai-progress-bar';
import { AiProgressBar } from '@/components/ui/ai-progress-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { useCreditCostLabel } from '@/lib/aiCreditCost';
import type { useDictation } from '@/lib/useDictation';
import { cn } from '@/lib/utils';
import { DictationButton } from './DictationButton';
import type { useQuickAdd } from './useQuickAdd';

interface QuickAddWidgetProps {
  quickAdd: ReturnType<typeof useQuickAdd>;
  aiEnabled: boolean;
  aiGated?: boolean;
  onUpgrade?: () => void;
  dictation?: ReturnType<typeof useDictation>;
  canTranscribe?: boolean;
  /** Visual treatment. `card` (default) is a standalone bordered card.
   *  `inline` strips outer chrome so the widget can live inside another container
   *  (e.g. as ItemList's footerSlot) and align to item-row geometry. */
  variant?: 'card' | 'inline';
  /** When true, the input shows a richer educational placeholder. Intended for the
   *  empty-list state inside `inline` mode. */
  isEmptyList?: boolean;
}

const QUICK_ADD_LABELS: LabelThreshold[] = [
  [0, 'Processing text...'],
  [15, 'Extracting items...'],
  [45, 'Structuring results...'],
  [75, 'Almost done...'],
];

export function QuickAddWidget({ quickAdd, aiEnabled, aiGated, onUpgrade, dictation, canTranscribe, variant = 'card', isEmptyList }: QuickAddWidgetProps) {
  const { t: tx } = useTranslation('ui');
  const inputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const showPhotoButton = quickAdd.photoSupported && (aiEnabled || aiGated);
  const photoLabel = tx('quickAdd_addFromPhoto', { defaultValue: 'Add items from a photo' });
  const photoProgressLabels: LabelThreshold[] = [
    [0, tx('quickAdd_photoProgressUpload', { defaultValue: 'Uploading photo…' })],
    [15, tx('quickAdd_photoProgressIdentify', { defaultValue: 'Identifying items…' })],
    [60, tx('quickAdd_photoProgressAlmost', { defaultValue: 'Almost done…' })],
  ];
  const isRecording = dictation?.state === 'recording';
  const isInline = variant === 'inline';
  const hasValue = quickAdd.value.trim().length > 0;
  const { label: aiAddLabel } = useCreditCostLabel(tx('quickAdd_addWithAi'), 1);
  // Sub-panel padding for expanded/preview states. In `card` variant the outer
  // wrapper supplies padding; in `inline` we add it per-state to align with row inset.
  const panelClass = isInline ? 'space-y-2 px-3.5 py-2.5' : 'space-y-2';
  const inputPlaceholder = tx(
    isEmptyList && isInline ? 'quickAdd_placeholderEmpty' : 'quickAdd_placeholder',
  );
  return (
    <div
      data-tour="quick-add"
      className={cn(
        !isInline && 'mt-3 rounded-[var(--radius-sm)] border border-[var(--border-flat)] bg-[var(--bg-input)] p-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--accent)]',
      )}
    >
      {quickAdd.state === 'input' && (!dictation || dictation.state === 'idle' || isRecording) && (
        <div className={cn('row-tight min-h-[44px]', isInline && 'px-3.5 py-1 bg-[var(--bg-hover)] focus-within:bg-[var(--bg-input)] transition-colors')}>
          {isInline && (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (hasValue) quickAdd.handleAdd();
                inputRef.current?.focus();
              }}
              disabled={quickAdd.saving}
              className={cn(
                'shrink-0 size-11 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors disabled:opacity-50',
                'text-[var(--accent)] hover:bg-[var(--bg-active)]',
              )}
              aria-label={tx("add_item_5bcf4d", { defaultValue: "Add item" })}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <Input
            ref={inputRef}
            value={quickAdd.value}
            onChange={(e) => quickAdd.setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                quickAdd.handleAdd();
              }
            }}
            onPaste={quickAdd.handlePaste}
            placeholder={inputPlaceholder}
            disabled={isRecording}
            className={cn(
              'h-7 border-0 bg-transparent py-0 focus-visible:ring-0 focus-visible:shadow-none',
              isInline ? 'px-0 text-[15px]' : 'px-0.5 text-base',
            )}
          />
          {!isInline && !isRecording && hasValue && (
            <Tooltip content={tx("add_item_5bcf4d", { defaultValue: "Add item" })}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { quickAdd.handleAdd(); inputRef.current?.focus(); }}
                disabled={quickAdd.saving}
                className="shrink-0 flex items-center justify-center size-11 rounded-[var(--radius-lg)] text-[var(--accent)] hover:bg-[var(--bg-active)] transition-colors disabled:opacity-50"
                aria-label={tx("add_item_5bcf4d", { defaultValue: "Add item" })}
              >
                <Plus className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
          {!isRecording && (aiEnabled || aiGated) && (
            <Tooltip content={aiAddLabel}>
              <button
                type="button"
                onClick={aiGated ? onUpgrade : quickAdd.handleAiClick}
                className="shrink-0 flex items-center justify-center size-11 rounded-[var(--radius-lg)] text-[var(--text-tertiary)] hover:bg-[var(--bg-active)] transition-colors"
                aria-label={aiAddLabel}
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
          {!isRecording && showPhotoButton && (
            <Tooltip content={photoLabel}>
              <button
                type="button"
                onClick={aiGated ? onUpgrade : () => photoInputRef.current?.click()}
                className="shrink-0 flex items-center justify-center size-11 rounded-[var(--radius-lg)] text-[var(--text-tertiary)] hover:bg-[var(--bg-active)] transition-colors"
                aria-label={photoLabel}
              >
                <Camera className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
          {canTranscribe && dictation && (dictation.state === 'idle' || isRecording) && (
            <DictationButton dictation={dictation} />
          )}
        </div>
      )}

      {dictation && dictation.state !== 'idle' && !isRecording && (
        isInline ? (
          <div className="px-3.5 py-2">
            <DictationButton dictation={dictation} />
          </div>
        ) : (
          <DictationButton dictation={dictation} />
        )
      )}

      {(quickAdd.state === 'expanded' || quickAdd.state === 'processing') && (
        <div className={panelClass}>
          <textarea
            autoComplete="off"
            value={quickAdd.expandedText}
            onChange={(e) => quickAdd.setExpandedText(e.target.value)}
            onKeyDown={quickAdd.handleExpandedKeyDown}
            placeholder={tx("list_or_describe_items_e_g_three_socks_aa_batteries_winter_j_2cde76", { defaultValue: "List or describe items, e.g. 'three socks, AA batteries, winter jacket'" })}
            rows={3}
            disabled={quickAdd.isStructuring}
            className="w-full min-h-[80px] bg-[var(--bg-elevated)] rounded-[var(--radius-sm)] px-3 py-2 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none resize-none disabled:opacity-50"
          />
          {!quickAdd.isStructuring && !quickAdd.structureError && (
            <p className="text-[12px] text-[var(--text-quaternary)] -mt-0.5"> {tx("paste_or_type_freely_ai_will_clean_it_up_7fb5cf", { defaultValue: "Paste or type freely — AI will clean it up" })} </p>
          )}
          {quickAdd.isStructuring && (
            <AiProgressBar active compact labels={QUICK_ADD_LABELS} />
          )}
          {quickAdd.structureError && (
            <p className="text-[13px] text-[var(--destructive)]">{quickAdd.structureError}</p>
          )}
          <div className="row">
            <button
              type="button"
              onClick={quickAdd.cancelExpanded}
              className="text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            > {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </button>
            <div className="flex-1" />
            <Button
              variant="ai"
              type="button"
              size="sm"
              onClick={quickAdd.handleExtractClick}
              disabled={!quickAdd.expandedText.trim() || quickAdd.isStructuring}
              className="gap-1.5"
            >
              {quickAdd.isStructuring ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {quickAdd.isStructuring ? tx("extracting_9a5349", { defaultValue: "Extracting..." }) : tx("extract_items_5dd358", { defaultValue: "Extract Items" })}
            </Button>
          </div>
        </div>
      )}

      {showPhotoButton && (
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) quickAdd.handlePhotoFile(file);
          }}
        />
      )}

      {quickAdd.state === 'photo' && (
        <div className={panelClass}>
          {(quickAdd.photoUploading || quickAdd.isAnalyzingPhoto) && (
            <AiProgressBar active compact labels={photoProgressLabels} />
          )}
          {quickAdd.photoError && !quickAdd.isAnalyzingPhoto && (
            <p className="text-[13px] text-[var(--destructive)]">{quickAdd.photoError}</p>
          )}
          <div className="row">
            <button
              type="button"
              onClick={quickAdd.cancelExpanded}
              className="text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            > {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </button>
          </div>
        </div>
      )}

      {quickAdd.state === 'preview' && quickAdd.structuredItems && (
        <div className={panelClass}>
          <div className="flex flex-wrap gap-1.5">
            {quickAdd.structuredItems.map((item, i) => {
              const checked = quickAdd.checked.get(i) !== false;
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: items identified by index for toggle
                <button key={i}
                  type="button"
                  onClick={() => quickAdd.toggleChecked(i)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full min-h-[44px] px-3 py-2 text-[13px] transition-all',
                    checked
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] line-through',
                  )}
                >
                  {checked && <Check className="h-3 w-3" />}
                  {item.quantity ? `${item.name} (×${item.quantity})` : item.name}
                </button>
              );
            })}
          </div>
          <div className="row pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={quickAdd.backToExpanded}
              className="gap-0.5"
            >
              <ChevronLeft className="h-4 w-4" /> {tx("back_b52b36", { defaultValue: "Back" })} </Button>
            <div className="flex-1" />
            <Button
              type="button"
              size="sm"
              onClick={quickAdd.handleConfirmAdd}
              disabled={quickAdd.selectedCount === 0}
              > {tx("add_61cc55", { defaultValue: "Add" })} {quickAdd.selectedCount}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
