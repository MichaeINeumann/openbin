import { Check, Clock, Copy, Eye, Globe, Link2, Loader2, Lock, Trash2 } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { usePlan } from '@/lib/usePlan';
import { cn, getErrorMessage } from '@/lib/utils';
import { type BinShare, createShare, revokeShare, useBinShare } from './useBinShare';

const UpgradePrompt = __EE__
  ? lazy(() => import('@/ee/UpgradePrompt').then(m => ({ default: m.UpgradePrompt })))
  : (() => null) as React.FC<Record<string, unknown>>;

interface ShareBinDialogProps {
  binId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareBinDialog({ binId, open, onOpenChange }: ShareBinDialogProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const { isGated, isSelfHosted, planInfo } = usePlan();
  const sharingGated = !isSelfHosted && isGated('binSharing');
  const { share, isLoading, setShare } = useBinShare(open ? binId : undefined);
  const { showToast } = useToast();
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('unlisted');
  const [expiry, setExpiry] = useState<string>('none');
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  function computeExpiresAt(): string | null {
    if (expiry === 'none') return null;
    const now = new Date();
    const hours = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 }[expiry];
    if (!hours) return null;
    return new Date(now.getTime() + hours * 3600_000).toISOString();
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const result = await createShare(binId, visibility, computeExpiresAt());
      setShare(result);
    } catch (err) {
      showToast({ message: getErrorMessage(err, 'Failed to create share link'), variant: 'error' });
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke() {
    setRevoking(true);
    try {
      await revokeShare(binId);
      setShare(null);
    } catch (err) {
      showToast({ message: getErrorMessage(err, 'Failed to revoke share link'), variant: 'error' });
    } finally {
      setRevoking(false);
    }
  }

  function getShareUrl(s: BinShare): string {
    return s.url || `${window.location.origin}/s/${s.token}`;
  }

  async function handleCopy() {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(getShareUrl(share));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({ message: 'Link copied to clipboard', variant: 'success' });
    } catch {
      showToast({ message: 'Failed to copy link', variant: 'error' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("share_09ca55", { defaultValue: "Share" })}</DialogTitle>
        </DialogHeader>

        {sharingGated ? (
          __EE__ && (
            <Suspense fallback={null}>
              <UpgradePrompt
                feature="Bin Sharing"
                description={tx("generate_public_or_unlisted_links_to_share_bins_with_anyone_450879", { defaultValue: "Generate public or unlisted links to share bins with anyone." })}
                upgradeAction={planInfo.upgradeAction}
              />
            </Suspense>
          )
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : share ? (
          <div className="space-y-4">
            {/* Share URL */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getShareUrl(share)}
                onFocus={(e) => e.target.select()}
                className="flex-1 min-w-0 rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] truncate outline-none border-none"
              />
              <Button variant="outline" size="icon" onClick={handleCopy} aria-label={tx("copy_link_2f84ee", { defaultValue: "Copy link" })}>
                {copied ? <Check className="h-4 w-4 text-[var(--color-success)]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium',
                share.visibility === 'public'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
              )}>
                {share.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {share.visibility === 'public' ? tx("public_dc5eb7", { defaultValue: "Public" }) : tx("unlisted_8d92c5", { defaultValue: "Unlisted" })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {share.viewCount} {tx("view_8f3a07", { defaultValue: "view" })}{share.viewCount !== 1 ? 's' : ''}
              </span>
              {share.expiresAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {tx("expires_a99be3", { defaultValue: "Expires" })} {new Date(share.expiresAt).toLocaleDateString(uiLanguage)}
                </span>
              )}
            </div>

            {/* Revoke */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevoke}
              disabled={revoking}
              className="text-[var(--destructive)]"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {revoking ? tx("revoking_e1cd32", { defaultValue: "Revoking..." }) : tx("revoke_link_f7aefb", { defaultValue: "Revoke Link" })}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]"> {tx("create_a_link_that_anyone_can_use_to_view_this_bin_without_l_80d599", { defaultValue: "Create a link that anyone can use to view this bin without logging in." })} </p>

            {/* Visibility selector */}
            <div className="space-y-2">
              <span className="ui-group-label">{tx("visibility_7d9ff4", { defaultValue: "Visibility" })}</span>
              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="share-visibility"
                    checked={visibility === 'unlisted'}
                    onChange={() => setVisibility('unlisted')}
                    className="accent-[var(--accent)] mt-0.5"
                  />
                  <div>
                    <span className="text-[var(--text-primary)] inline-flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5" /> {tx("unlisted_8d92c5", { defaultValue: "Unlisted" })} </span>
                    <p className="text-xs text-[var(--text-tertiary)]">{tx("only_people_with_the_link_can_view_6a10bd", { defaultValue: "Only people with the link can view" })}</p>
                  </div>
                </label>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="share-visibility"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="accent-[var(--accent)] mt-0.5"
                  />
                  <div>
                    <span className="text-[var(--text-primary)] inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> {tx("public_dc5eb7", { defaultValue: "Public" })} </span>
                    <p className="text-xs text-[var(--text-tertiary)]">{tx("discoverable_and_visible_to_anyone_b8e577", { defaultValue: "Discoverable and visible to anyone" })}</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Expiration selector */}
            <div className="space-y-2">
              <span className="ui-group-label">{tx("expiration_1c8211", { defaultValue: "Expiration" })}</span>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] border border-[var(--border-flat)] outline-none"
              >
                <option value="none">{tx("never_80c305", { defaultValue: "Never" })}</option>
                <option value="1h">{tx("1_hour_f030c3", { defaultValue: "1 hour" })}</option>
                <option value="24h">{tx("24_hours_cb4780", { defaultValue: "24 hours" })}</option>
                <option value="7d">{tx("7_days_0a8dd6", { defaultValue: "7 days" })}</option>
                <option value="30d">{tx("30_days_7d4278", { defaultValue: "30 days" })}</option>
              </select>
            </div>

            <Button onClick={handleCreate} disabled={creating}>
              {creating ? tx("creating_28ea76", { defaultValue: "Creating..." }) : tx("create_share_link_983707", { defaultValue: "Create Share Link" })}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
