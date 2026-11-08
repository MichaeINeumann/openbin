import { ChevronLeft } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AreaPicker } from '@/features/areas/AreaPicker';
import { useTerminology } from '@/lib/terminology';
import { cn, stickyDialogFooter } from '@/lib/utils';
import { AddMoreTile } from './AddMoreTile';
import { BinStack } from './BinStack';
import { DragGhost } from './DragGhost';
import { useBinSizes } from './photoGridTypes';
import { SplitZone } from './SplitZone';
import type { BulkAddAction, BulkAddState } from './useBulkGroupAdd';
import { usePhotoGridDrag } from './usePhotoGridDrag';

interface PhotoGroupingGridProps {
  state: BulkAddState;
  dispatch: React.Dispatch<BulkAddAction>;
  effectiveMax: number;
  locationId: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAddMore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function PhotoGroupingGrid({
  state,
  dispatch,
  effectiveMax,
  locationId,
  fileInputRef,
  onAddMore,
  onContinue,
  onBack,
}: PhotoGroupingGridProps) {
  const { t: tx } = useTranslation('ui');
  const t = useTerminology();
  const sizes = useBinSizes();
  const totalPhotos = state.groups.reduce((acc, g) => acc + g.photos.length, 0);

  const {
    activeDrag,
    keyboardMove,
    recentlyReceivedId,
    announcement,
    showSplitZone,
    splitZoneActive,
    showKeyboardSplitButton,
    onPhotoPointerDown,
    onPhotoKeyDown,
    onKeyboardSplit,
  } = usePhotoGridDrag({ state, dispatch });

  const handleRemovePhoto = useCallback(
    (photoId: string) => dispatch({ type: 'REMOVE_PHOTO', photoId }),
    [dispatch],
  );

  const isSinglePhoto = totalPhotos === 1;
  let displayIndex = 0;

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6 space-y-1">
        <h2 className="text-[17px] font-semibold leading-tight text-[var(--text-primary)]"> {tx("one_b58b5a", { defaultValue: "One" })} {t.bin} {tx("per_stack_d64795", { defaultValue: "per stack" })} </h2>
        {!keyboardMove && (
          <p className="text-[13px] leading-snug text-[var(--text-secondary)]">
            {isSinglePhoto
              ? tx("add_more_photos_to_create_several_bins_at_once_b1ffc3", { defaultValue: "Add more photos to create several {{bins}} at once.", bins: t.bins })
              : tx("drag_photos_onto_each_other_to_put_them_in_the_same_bin_1b7324", { defaultValue: "Drag photos onto each other to put them in the same {{bin}}.", bin: t.bin })}
          </p>
        )}
        {keyboardMove && (
          <p className="text-[13px] leading-snug text-[var(--accent)]"> {tx("moving_photo_5f0dd5", { defaultValue: "Moving photo" })} {keyboardMove.indexLabel}{tx("press_another_photo_or_06f6dd", { defaultValue: ". Press another photo, or" })}{' '}
            <kbd className="rounded border border-[var(--border-flat)] bg-[var(--bg-input)] px-1 text-[11px]">
              Esc
            </kbd>{' '} {tx("to_cancel_aea2c0", { defaultValue: "to cancel." })} </p>
        )}
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onAddMore}
      />

      <div className="flex flex-wrap" style={{ gap: sizes.gap }}>
        {state.groups.map((group, gi) => {
          const baseIndex = displayIndex;
          displayIndex += group.photos.length;
          return (
            <BinStack
              key={group.id}
              group={group}
              binNumber={gi + 1}
              sizes={sizes}
              baseDisplayIndex={baseIndex}
              activeDrag={activeDrag}
              keyboardMove={keyboardMove}
              isReceiving={recentlyReceivedId === group.id}
              onPhotoPointerDown={onPhotoPointerDown}
              onPhotoKeyDown={onPhotoKeyDown}
              onRemove={handleRemovePhoto}
            />
          );
        })}
        {totalPhotos < effectiveMax && (
          <AddMoreTile sizes={sizes} onClick={() => fileInputRef.current?.click()} />
        )}
      </div>

      {showKeyboardSplitButton && keyboardMove && (
        <button
          type="button"
          onClick={onKeyboardSplit}
          className="mt-4 self-start rounded-[var(--radius-md)] border border-[var(--accent)] px-3 py-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
        > {tx("move_photo_7f0a3b", { defaultValue: "Move photo" })} {keyboardMove.indexLabel} {tx("to_a_new_ef8ad5", { defaultValue: "to a new" })} {t.bin}
        </button>
      )}

      <SplitZone visible={showSplitZone} active={splitZoneActive} />

      <div className="mt-6 mb-6 space-y-2">
        <Label className="text-[13px] font-medium text-[var(--text-primary)]">
          {t.Area}
          <span className="ml-1 text-[12px] font-normal text-[var(--text-tertiary)]">· optional</span>
        </Label>
        <AreaPicker
          locationId={locationId ?? undefined}
          value={state.sharedAreaId}
          onChange={(areaId) => dispatch({ type: 'SET_SHARED_AREA', areaId })}
        />
      </div>

      <div className={cn('row-spread', stickyDialogFooter)}>
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {tx("back_b52b36", { defaultValue: "Back" })} </Button>
        <Button onClick={onContinue} disabled={state.groups.length === 0}> {tx("continue_2e0262", { defaultValue: "Continue" })} </Button>
      </div>

      <output aria-live="polite" className="sr-only">
        {announcement}
      </output>

      {activeDrag && <DragGhost drag={activeDrag} sizes={sizes} />}
    </div>
  );
}
