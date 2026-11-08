import { FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/auth';
import { usePermissions } from '@/lib/usePermissions';
import { focusRing, formatBytes, getErrorMessage, relativeTime } from '@/lib/utils';
import type { Attachment } from '@/types';
import {
  deleteAttachment,
  getAttachmentDownloadUrl,
  uploadAttachment,
} from './useAttachments';

const MAX_MB = 5;

// Must stay in sync with ATTACHMENT_MIME_TYPES in server/src/lib/uploadConfig.ts.
const ACCEPTED_EXTENSIONS = [
  '.pdf', '.txt', '.csv', '.md', '.json', '.rtf',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.odt', '.ods', '.odp',
  '.zip', '.7z', '.tar', '.gz',
];
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'application/rtf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/zip',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
];
const ACCEPT_ATTR = [...ACCEPTED_EXTENSIONS, ...ACCEPTED_MIME_TYPES].join(',');
const ACCEPTED_EXTENSIONS_SET = new Set(ACCEPTED_EXTENSIONS);
const ACCEPTED_TYPES_HINT = 'PDF, Word, Excel, PowerPoint, text, CSV, JSON, ODF, ZIP, 7z, tar, gz';

function extOf(filename: string): string {
  const idx = filename.lastIndexOf('.');
  if (idx <= 0 || idx === filename.length - 1) return '';
  return filename.slice(idx).toLowerCase();
}

function getExtensionLabel(filename: string): string {
  const ext = extOf(filename);
  return ext ? ext.slice(1).toUpperCase().slice(0, 5) : 'FILE';
}

function isAcceptedFile(filename: string): boolean {
  return ACCEPTED_EXTENSIONS_SET.has(extOf(filename));
}

interface AttachmentsListProps {
  binId: string;
  attachments: Attachment[];
  canUpload: boolean;
  canDelete: boolean;
}

export function AttachmentsList({ binId, attachments, canUpload, canDelete }: AttachmentsListProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const rejected: string[] = [];
    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      if (!isAcceptedFile(file.name)) {
        rejected.push(file.name);
      } else {
        accepted.push(file);
      }
    }
    if (rejected.length > 0) {
      showToast({
        message: tx("value0_allowed_accepted_types_hint_ff9815", { defaultValue: "{{value0}}. Allowed: {{ACCEPTED_TYPES_HINT}}.", value0: rejected.length === 1 ? `"${rejected[0]}" is not a supported file type` : `${rejected.length} files have unsupported types`, ACCEPTED_TYPES_HINT: ACCEPTED_TYPES_HINT }),
        variant: 'error',
      });
    }
    if (accepted.length === 0) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploadingCount(accepted.length);
    await Promise.all(accepted.map(async (file) => {
      try {
        if (file.size > MAX_MB * 1024 * 1024) {
          showToast({ message: tx("value0_exceeds_the_max_mb_mb_limit_b5f574", { defaultValue: "\"{{value0}}\" exceeds the {{MAX_MB}} MB limit", value0: file.name, MAX_MB: MAX_MB }), variant: 'error' });
          return;
        }
        await uploadAttachment(binId, file);
      } catch (err) {
        showToast({ message: getErrorMessage(err, tx("failed_to_upload_value0_466f96", { defaultValue: "Failed to upload \"{{value0}}\"", value0: file.name })), variant: 'error' });
      } finally {
        setUploadingCount((c) => c - 1);
      }
    }));
    if (inputRef.current) inputRef.current.value = '';
  }, [binId, showToast]);

  const handleDelete = useCallback(async (attachment: Attachment) => {
    try {
      await deleteAttachment(attachment.id);
      showToast({ message: tx("attachment_deleted_dacb0d", { defaultValue: "Attachment deleted" }), variant: 'success' });
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_delete_07931f", { defaultValue: "Failed to delete" })), variant: 'error' });
    }
  }, [showToast]);

  const isOwnerOrAdmin = (a: Attachment) => isAdmin || a.created_by === user?.id;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
      {attachments.map((a) => (
        <div key={a.id} className="relative group flex-shrink-0">
          <a
            href={getAttachmentDownloadUrl(a.id)}
            download={a.filename}
            aria-label={tx("download_value0_316d33", { defaultValue: "Download {{value0}}", value0: a.filename })}
            className={`flex h-20 w-52 items-center gap-3 rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-3 transition-colors duration-150 hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] snap-start ${focusRing}`}
          >
            <div className="flex h-14 w-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-xs)] border border-[var(--border-subtle)]">
              <FileText className="h-5 w-5 text-[var(--text-secondary)]" aria-hidden="true" />
              <span className="ui-eyebrow text-[10px]">
                {getExtensionLabel(a.filename)}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p
                className="truncate text-[var(--text-base)] font-medium leading-tight text-[var(--text-primary)]"
                title={a.filename}
              >
                {a.filename}
              </p>
              <p className="mt-1 truncate text-[var(--text-xs)] leading-tight text-[var(--text-tertiary)]">
                {formatBytes(a.size)} · {relativeTime(a.created_at, uiLanguage)}
              </p>
            </div>
          </a>
          {canDelete && isOwnerOrAdmin(a) && (
            <Tooltip content={tx("delete_attachment_a4e1e5", { defaultValue: "Delete attachment" })}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(a)}
                className="absolute top-1 right-1 h-8 w-8 rounded-[var(--radius-xs)] bg-[var(--overlay-button)] text-white opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity hover:bg-[var(--overlay-button-hover)] hover:text-[var(--destructive)]"
                aria-label={tx("delete_value0_ea5388", { defaultValue: "Delete {{value0}}", value0: a.filename })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          )}
        </div>
      ))}
      {uploadingCount > 0 && Array.from({ length: uploadingCount }, (_, i) => (
        <output
          // biome-ignore lint/suspicious/noArrayIndexKey: identical stateless placeholders
          key={i}
          aria-live="polite"
          className="flex h-20 w-52 flex-shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--bg-input)] snap-start"
        >
          <Loader2 className="h-4 w-4 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
          <span className="text-[var(--text-xs)] text-[var(--text-tertiary)]">{tx("uploading_d921a7", { defaultValue: "Uploading…" })}</span>
        </output>
      ))}
      {canUpload && (
        <Tooltip content={tx("accepted_types_hint_up_to_max_mb_mb_e9bd33", { defaultValue: "{{ACCEPTED_TYPES_HINT}} · up to {{MAX_MB}} MB", ACCEPTED_TYPES_HINT: ACCEPTED_TYPES_HINT, MAX_MB: MAX_MB })}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={tx("add_attachment_allowed_types_accepted_types_hint_max_max_mb__303346", { defaultValue: "Add attachment. Allowed types: {{ACCEPTED_TYPES_HINT}}. Max {{MAX_MB}} MB.", ACCEPTED_TYPES_HINT: ACCEPTED_TYPES_HINT, MAX_MB: MAX_MB })}
            className={`flex h-20 w-52 flex-shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-tertiary)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)] snap-start ${focusRing}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="text-[var(--text-xs)] font-medium">{tx("add_file_d68f65", { defaultValue: "Add File" })}</span>
          </button>
        </Tooltip>
      )}
      {canUpload && (
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      )}
    </div>
  );
}
