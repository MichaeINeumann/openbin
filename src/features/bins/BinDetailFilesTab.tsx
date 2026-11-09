import { Paperclip } from 'lucide-react';
import { lazy, Suspense, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/empty-state';
import { AttachmentsList } from '@/features/attachments/AttachmentsList';
import { useAttachments } from '@/features/attachments/useAttachments';
import { PhotoGallery } from '@/features/photos/PhotoGallery';
import { isAttachmentsEnabled } from '@/lib/qrConfig';
import { usePlan } from '@/lib/usePlan';
import { useUserPreferences } from '@/lib/userPreferences';
import { sectionHeader } from '@/lib/utils';
import type { Photo } from '@/types';

const UpgradePrompt = __EE__
  ? lazy(() => import('@/ee/UpgradePrompt').then(m => ({ default: m.UpgradePrompt })))
  : (() => null) as React.FC<Record<string, unknown>>;

interface BinDetailFilesTabProps {
  binId: string;
  photos: Photo[];
  canEdit: boolean;
  onAnalyzePhotos?: (photoIds: string[]) => void;
}

export function BinDetailFilesTab({ binId, photos, canEdit, onAnalyzePhotos }: BinDetailFilesTabProps) {
  const { t: tx } = useTranslation('ui');
  const attachmentsOn = isAttachmentsEnabled();
  const { planInfo, isGated } = usePlan();
  const attachmentsGated = isGated('attachments');
  const { attachments } = useAttachments(attachmentsOn ? binId : undefined);
  const { preferences } = useUserPreferences();
  const attachmentsDismissed = preferences.dismissed_upgrade_prompts.includes('attachments');
  const showPhotos = canEdit || photos.length > 0;
  const showAttachments = attachmentsOn && (
    attachments.length > 0 ||
    (canEdit && !(attachmentsGated && attachmentsDismissed))
  );
  const showSectionLabels = showPhotos && showAttachments;
  const idPrefix = useId();
  const photosLabelId = `${idPrefix}-photos`;
  const docsLabelId = `${idPrefix}-documents`;

  if (!showPhotos && !showAttachments) {
    return (
      <EmptyState
        icon={Paperclip}
        title={tx("no_files_ccc17f", { defaultValue: "No files" })}
        subtitle={tx("photos_and_attachments_added_to_this_bin_will_appear_here_5bbd5d", { defaultValue: "Photos and attachments added to this bin will appear here." })}
        compact
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {showPhotos && (
        <section aria-labelledby={showSectionLabels ? photosLabelId : undefined} className="flex flex-col gap-1">
          {showSectionLabels && (
            <h3 id={photosLabelId} className={sectionHeader}> {tx("photos_c8b2e8", { defaultValue: "Photos" })} </h3>
          )}
          <PhotoGallery binId={binId} variant="inline" onAnalyzePhotos={onAnalyzePhotos} />
        </section>
      )}
      {showAttachments && (
        <section aria-labelledby={showSectionLabels ? docsLabelId : undefined} className="flex flex-col gap-1">
          {showSectionLabels && (
            <h3 id={docsLabelId} className={sectionHeader}> {tx("documents_687c82", { defaultValue: "Documents" })} </h3>
          )}
          {__EE__ && attachmentsGated && canEdit && (
            <Suspense fallback={null}>
              <UpgradePrompt
                feature="Document Attachments"
                description={tx("upload_pdfs_spreadsheets_and_other_files_to_bins_e00610", { defaultValue: "Upload PDFs, spreadsheets, and other files to bins." })}
                upgradeAction={planInfo.upgradeAction}
                dismissKey="attachments"
              />
            </Suspense>
          )}
          <AttachmentsList
            binId={binId}
            attachments={attachments}
            canUpload={canEdit && !attachmentsGated}
            canDelete={canEdit}
          />
        </section>
      )}
    </div>
  );
}
