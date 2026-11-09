import { Check, Copy, Download, QrCode, RefreshCw, Share2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Disclosure } from '@/components/ui/disclosure';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';
import { getQRCodeStyling, rawQrToDataURL } from '@/lib/qr';
import { cn, getErrorMessage } from '@/lib/utils';
import type { Location } from '@/types';
import { regenerateInvite } from './useLocations';

interface LocationInviteShareProps {
  location: Location;
  variant?: 'card' | 'compact';
}

export function LocationInviteShare({ location, variant = 'card' }: LocationInviteShareProps) {
  const { t: tx } = useTranslation('ui');
  const { showToast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const isAdmin = location.role === 'admin';
  const inviteCode = location.invite_code;
  const inviteLink = useMemo(
    () => (inviteCode ? `${window.location.origin}/register?invite=${encodeURIComponent(inviteCode)}` : ''),
    [inviteCode],
  );

  useEffect(() => {
    if (!qrOpen || !inviteLink) {
      setQrUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const Ctor = await getQRCodeStyling();
      const qr = new Ctor({
        width: 256,
        height: 256,
        type: 'canvas',
        data: inviteLink,
        margin: 1,
        dotsOptions: { type: 'square', color: '#000000' },
        backgroundOptions: { color: '#ffffff' },
      });
      const raw = await qr.getRawData('png');
      if (!raw || cancelled) return;
      const url = await rawQrToDataURL(raw);
      if (!cancelled) setQrUrl(url);
    })();
    return () => { cancelled = true; };
  }, [qrOpen, inviteLink]);

  const handleCopyLink = useCallback(async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      showToast({ message: tx("failed_to_copy_35654b", { defaultValue: "Failed to copy" }), variant: 'error' });
    }
  }, [inviteLink, showToast, tx]);

  const handleCopyCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      showToast({ message: tx("failed_to_copy_35654b", { defaultValue: "Failed to copy" }), variant: 'error' });
    }
  }, [inviteCode, showToast, tx]);

  const handleShare = useCallback(async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: tx("join_value0_3ebf99", { defaultValue: "Join {{value0}}", value0: location.name }), url: inviteLink });
      } catch { /* cancelled by user */ }
    } else {
      try {
        await navigator.clipboard.writeText(inviteLink);
        showToast({ message: tx("invite_link_copied_898f60", { defaultValue: "Invite link copied" }), variant: 'success' });
      } catch {
        showToast({ message: tx("failed_to_copy_35654b", { defaultValue: "Failed to copy" }), variant: 'error' });
      }
    }
  }, [inviteLink, location.name, showToast, tx]);

  const handleDownloadQr = useCallback(() => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `invite-qr-${location.name}.png`;
    a.click();
  }, [qrUrl, location.name]);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      await regenerateInvite(location.id);
      setConfirmRegenerate(false);
      showToast({ message: tx("invite_link_regenerated_e48c88", { defaultValue: "Invite link regenerated" }), variant: 'success' });
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_regenerate_46c644", { defaultValue: "Failed to regenerate" })), variant: 'error' });
    } finally {
      setRegenerating(false);
    }
  }, [location.id, showToast, tx]);

  if (!isAdmin || !inviteCode) return null;

  const role = location.default_join_role === 'viewer' ? 'viewer' : 'member';
  const isCompact = variant === 'compact';

  return (
    <div className={cn('space-y-2', !isCompact && 'pt-3 border-t border-[var(--border-flat)]')}>
      {/* Role chip */}
      <div className="px-0.5">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-full)] bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-medium"> {tx("joins_as_17fac6", { defaultValue: "Joins as" })} {role === 'viewer' ? tx("viewer_dbad9f", { defaultValue: "Viewer" }) : tx("member_6853c9", { defaultValue: "Member" })}
        </span>
      </div>

      {/* Link row */}
      <div className="flex items-center gap-1.5 p-2 rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
        <span className="flex-1 min-w-0 px-1 text-[13px] text-[var(--text-secondary)] truncate" title={inviteLink}>
          {inviteLink}
        </span>
        <Tooltip content={linkCopied ? tx("copied_8e3df4", { defaultValue: "Copied" }) : tx("copy_link_2f84ee", { defaultValue: "Copy link" })} side="top">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleCopyLink}
            className="shrink-0"
            aria-label={tx("copy_invite_link_1cad13", { defaultValue: "Copy invite link" })}
          >
            {linkCopied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            {linkCopied ? tx("copied_8e3df4", { defaultValue: "Copied" }) : tx("copy_af74f7", { defaultValue: "Copy" })}
          </Button>
        </Tooltip>
        <Tooltip content={qrOpen ? tx("hide_qr_code_766f17", { defaultValue: "Hide QR code" }) : tx("show_qr_code_2df2dd", { defaultValue: "Show QR code" })} side="top">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setQrOpen((o) => !o)}
            className="shrink-0"
            aria-label={qrOpen ? tx("hide_qr_code_766f17", { defaultValue: "Hide QR code" }) : tx("show_qr_code_2df2dd", { defaultValue: "Show QR code" })}
            aria-pressed={qrOpen}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </Tooltip>
        <Tooltip content={tx("share_09ca55", { defaultValue: "Share" })} side="top">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleShare}
            className="shrink-0"
            aria-label={tx("share_invite_link_a0630b", { defaultValue: "Share invite link" })}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>

      {/* Helper text */}
      <p className="text-[12px] text-[var(--text-tertiary)] px-0.5">{tx('locations_inviteLinkHint', { location: location.name })}
      </p>

      {/* QR code panel */}
      {qrOpen && (
        <div className="flex flex-col items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
          <p className="text-[12px] text-[var(--text-secondary)]"> {tx("scan_to_join_91be17", { defaultValue: "Scan to join" })} <span className="font-semibold">{location.name}</span>
          </p>
          {qrUrl ? (
            <img src={qrUrl} alt={tx("invite_qr_code_70bd89", { defaultValue: "Invite QR code" })} className="w-44 h-44 rounded-[var(--radius-md)]" />
          ) : (
            <Skeleton className="w-44 h-44" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownloadQr}
            disabled={!qrUrl}
            className="text-[12px]"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> {tx("download_a479c9", { defaultValue: "Download" })} </Button>
        </div>
      )}

      {/* Manual code disclosure (Regenerate now lives inside) */}
      <div className="pt-1">
        <Disclosure label={tx("show_code_892e83", { defaultValue: "Show code" })} labelClassName="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] py-1">
          <div className="space-y-2 pt-1">
            <p className="text-[11px] text-[var(--text-tertiary)]"> {tx("for_typing_manually_in_the_join_dialog_a8dfa2", { defaultValue: "For typing manually in the Join dialog." })} </p>
            <div className="flex items-center gap-1.5 p-2 rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
              <code className="flex-1 min-w-0 text-[12px] font-mono text-[var(--text-primary)] tracking-wider break-all">
                {inviteCode}
              </code>
              <Tooltip content={codeCopied ? tx("copied_8e3df4", { defaultValue: "Copied" }) : tx("copy_code_6c1069", { defaultValue: "Copy code" })} side="top">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopyCode}
                  className="shrink-0"
                  aria-label={tx("copy_invite_code_26ed37", { defaultValue: "Copy invite code" })}
                >
                  {codeCopied
                    ? <Check className="h-4 w-4 text-[var(--color-success)]" />
                    : <Copy className="h-4 w-4" />}
                </Button>
              </Tooltip>
            </div>
            <button
              type="button"
              onClick={() => setConfirmRegenerate(true)}
              disabled={regenerating}
              className="inline-flex items-center gap-1 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--destructive)] disabled:opacity-50 transition-colors py-1"
              aria-label={tx("regenerate_invite_link_a9bd8a", { defaultValue: "Regenerate invite link" })}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', regenerating && 'animate-spin')} />
              <span>{tx("regenerate_link_8bf2f0", { defaultValue: "Regenerate link" })}</span>
            </button>
          </div>
        </Disclosure>
      </div>

      {/* Regenerate confirmation */}
      <Dialog open={confirmRegenerate} onOpenChange={(v) => { if (!regenerating) setConfirmRegenerate(v); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("regenerate_invite_link_5380e0", { defaultValue: "Regenerate invite link?" })}</DialogTitle>
            <DialogDescription> {tx("the_current_link_and_qr_code_will_stop_working_immediately_a_5baae8", { defaultValue: "The current link and QR code will stop working immediately. Anyone you've already shared them with — including printed QR codes — will lose access until you share the new link." })} </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmRegenerate(false)}
              disabled={regenerating}
            > {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? tx("regenerating_07e5b0", { defaultValue: "Regenerating…" }) : tx("regenerate_b04c99", { defaultValue: "Regenerate" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
