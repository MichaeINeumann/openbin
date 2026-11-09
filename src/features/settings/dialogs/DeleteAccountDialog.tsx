import { lazy, Suspense, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioOption } from '@/components/ui/radio-option';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth';
import { usePlan } from '@/lib/usePlan';
import { cn, getErrorMessage } from '@/lib/utils';
import type { CheckoutAction } from '@/types';
import { exportZip } from '../exportImport';

const DELETION_GRACE_PERIOD_DAYS = 30;
const CONFIRM_PHRASE = 'delete my account';

type Step = 'summary' | 'subscription' | 'confirm';
type RefundPolicy = 'none' | 'prorated';

const CheckoutLink = __EE__
  ? lazy(() => import('@/ee/checkoutAction').then(m => ({ default: m.CheckoutLink })))
  : (() => null) as React.FC<{ action: CheckoutAction; className?: string; children: React.ReactNode; target?: '_self' | '_blank' }>;

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { t: tx } = useTranslation('ui');
  const { user, deleteAccount, activeLocationId } = useAuth();
  const { planInfo, isSelfHosted } = usePlan();
  const { showToast } = useToast();

  const hasPassword = user?.hasPassword !== false;
  const hasActiveSub =
    !isSelfHosted &&
    !!user &&
    user.plan !== undefined &&
    user.plan !== 'free' &&
    user.subscriptionStatus === 'active';

  const [step, setStep] = useState<Step>('summary');
  const [refundPolicy, setRefundPolicy] = useState<RefundPolicy>('none');
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExportData() {
    if (!activeLocationId || exporting) return;
    setExporting(true);
    try {
      await exportZip(activeLocationId);
      showToast({ message: 'Backup downloaded', variant: 'success' });
    } catch (err) {
      showToast({
        message: getErrorMessage(err, 'Failed to download backup'),
        variant: 'error',
      });
    } finally {
      setExporting(false);
    }
  }

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Defer reset slightly so exit animation isn't disturbed
      const id = window.setTimeout(() => {
        setStep('summary');
        setRefundPolicy('none');
        setConfirmText('');
        setPassword('');
        setSubmitting(false);
        setError(null);
      }, 200);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  if (!user) return null;

  const totalSteps = hasActiveSub ? 3 : 2;
  const stepNumber = step === 'summary' ? 1 : step === 'subscription' ? 2 : hasActiveSub ? 3 : 2;

  function goNext() {
    setError(null);
    if (step === 'summary') {
      setStep(hasActiveSub ? 'subscription' : 'confirm');
    } else if (step === 'subscription') {
      setStep('confirm');
    }
  }

  function goBack() {
    setError(null);
    if (step === 'confirm') {
      setStep(hasActiveSub ? 'subscription' : 'summary');
    } else if (step === 'subscription') {
      setStep('summary');
    }
  }

  const confirmTextValid = confirmText === CONFIRM_PHRASE;
  const passwordValid = !hasPassword || password.length > 0;
  const canSubmit = confirmTextValid && passwordValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await deleteAccount(
        hasPassword ? password : undefined,
        refundPolicy,
      );
      showToast({
        message: result.scheduledAt
          ? `Account scheduled for deletion on ${new Date(result.scheduledAt).toLocaleDateString()}`
          : 'Account deleted',
        variant: 'success',
      });
      // auth state already cleared by deleteAccount
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete account'));
      setSubmitting(false);
    }
  }

  const planLabel = user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : '';
  const periodLabel = planInfo?.billingPeriod ?? 'quarterly';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 mb-1">
            <DialogTitle>
              {step === 'summary' && tx("delete_account_ee1b9a", { defaultValue: "Delete Account" })}
              {step === 'subscription' && tx("cancel_subscription_58b2bd", { defaultValue: "Cancel Subscription" })}
              {step === 'confirm' && tx("confirm_account_deletion_678c6a", { defaultValue: "Confirm Account Deletion" })}
            </DialogTitle>
            <span className="text-[12px] text-[var(--text-tertiary)] shrink-0"> {tx("step_dc416e", { defaultValue: "Step" })} {stepNumber} {tx("of_de04fa", { defaultValue: "of" })} {totalSteps}
            </span>
          </div>
          {step === 'summary' && (
            <DialogDescription> {tx("you_re_about_to_delete_3b6037", { defaultValue: "You're about to delete" })} <span className="font-medium text-[var(--text-secondary)]">{user.email}</span>.
            </DialogDescription>
          )}
          {step === 'subscription' && (
            <DialogDescription> {tx("choose_how_to_handle_your_active_subscription_c25bf8", { defaultValue: "Choose how to handle your active subscription." })} </DialogDescription>
          )}
          {step === 'confirm' && (
            <DialogDescription> {tx("this_action_will_be_irreversible_after_the_d1c61d", { defaultValue: "This action will be irreversible after the" })} {DELETION_GRACE_PERIOD_DAYS}{tx("day_recovery_window_b872b0", { defaultValue: "-day recovery window." })} </DialogDescription>
          )}
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="mb-4 px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 text-[13px] text-[var(--destructive)]"
          >
            {error}
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-4">
            <div className="space-y-2 text-[14px] text-[var(--text-secondary)]">
              <p> {tx("this_will_permanently_delete_your_account_in_e36d50", { defaultValue: "This will permanently delete your account in" })}{' '}
                <span className="font-medium text-[var(--text-primary)]">{DELETION_GRACE_PERIOD_DAYS} {tx("days_5548ae", { defaultValue: "days" })}</span>.
              </p>
              <p>{tx("you_can_recover_your_account_by_signing_in_until_then_920331", { defaultValue: "You can recover your account by signing in until then." })}</p>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)] mb-2">{tx("what_will_be_deleted_a80ca3", { defaultValue: "What will be deleted:" })}</p>
              <ul className="text-[13px] text-[var(--text-secondary)] list-disc pl-5 space-y-1">
                <li>{tx("all_bins_and_items_in_locations_where_you_are_the_only_membe_98ab21", { defaultValue: "All bins and items in locations where you are the only member" })}</li>
                <li>{tx("all_photos_and_attachments_you_uploaded_dee923", { defaultValue: "All photos and attachments you uploaded" })}</li>
                <li>{tx("your_api_keys_and_personal_settings_5cb177", { defaultValue: "Your API keys and personal settings" })}</li>
                <li>{tx("locations_shared_with_others_will_be_preserved_1e5f25", { defaultValue: "Locations shared with others will be preserved" })}</li>
              </ul>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleExportData}
                  disabled={exporting || !activeLocationId}
                  className="text-sm"
                >
                  {exporting ? tx("downloading_c177e4", { defaultValue: "Downloading…" }) : tx("download_my_data_first_f5acd7", { defaultValue: "↓ Download my data first" })}
                </Button>
                <p className="text-xs text-[var(--text-tertiary)] mt-1"> {tx("get_a_copy_of_your_bins_items_photos_and_tags_before_deletin_8fdb58", { defaultValue: "Get a copy of your bins, items, photos, and tags before deleting." })} </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
              <Button type="button" variant="destructive" onClick={goNext}> {tx("continue_2e0262", { defaultValue: "Continue" })} </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'subscription' && (
          <div className="space-y-4">
            <p className="text-[14px] text-[var(--text-secondary)]"> {tx("you_have_an_active_45c877", { defaultValue: "You have an active" })}{' '}
              <span className="font-medium text-[var(--text-primary)]">{planLabel}</span> {tx("subscription_billing_bd5364", { defaultValue: "subscription billing" })}{' '}
              <span className="font-medium text-[var(--text-primary)]">{periodLabel}</span>.
            </p>
            <div className="space-y-2">
              <RadioOption
                selected={refundPolicy === 'none'}
                onClick={() => setRefundPolicy('none')}
                label={tx("cancel_and_stop_billing_now_f9fb95", { defaultValue: "Cancel and stop billing now" })}
                description={tx("no_refund_for_the_unused_time_a17dc2", { defaultValue: "No refund for the unused time." })}
              />
              <RadioOption
                selected={refundPolicy === 'prorated'}
                onClick={() => setRefundPolicy('prorated')}
                label={tx("cancel_and_refund_the_unused_time_21498b", { defaultValue: "Cancel and refund the unused time" })}
                description={tx("a_prorated_refund_will_be_issued_for_the_remainder_of_the_bi_555429", { defaultValue: "A prorated refund will be issued for the remainder of the billing period." })}
              />
            </div>
            {planInfo?.portalAction && __EE__ && (
              <p className="text-[12px] text-[var(--text-tertiary)]"> {tx("or_just_358ed0", { defaultValue: "Or just" })}{' '}
                <Suspense fallback={<span>{tx("cancel_your_subscription_a82126", { defaultValue: "cancel your subscription" })}</span>}>
                  <CheckoutLink
                    action={planInfo.portalAction}
                    target="_blank"
                    className="text-[var(--accent)] hover:underline"
                  > {tx("cancel_your_subscription_a82126", { defaultValue: "cancel your subscription" })} </CheckoutLink>
                </Suspense>{' '} {tx("without_deleting_your_account_8f2d8e", { defaultValue: "without deleting your account." })} </p>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={goBack}> {tx("back_b52b36", { defaultValue: "Back" })} </Button>
              <Button type="button" variant="destructive" onClick={goNext}> {tx("continue_2e0262", { defaultValue: "Continue" })} </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-phrase"> {tx("type_3deb74", { defaultValue: "Type" })} <span className="font-mono text-[var(--text-primary)]">{CONFIRM_PHRASE}</span> {tx("to_confirm_836e41", { defaultValue: "to confirm" })} </Label>
              <Input
                id="confirm-phrase"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
                placeholder={CONFIRM_PHRASE}
                aria-invalid={confirmText.length > 0 && !confirmTextValid}
              />
            </div>
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{tx("enter_your_password_137816", { defaultValue: "Enter your password" })}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder={tx("password_8be3c9", { defaultValue: "Password" })}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={goBack} disabled={submitting}> {tx("back_b52b36", { defaultValue: "Back" })} </Button>
              <Button type="submit" variant="destructive" disabled={!canSubmit}>
                {submitting ? tx("deleting_e16cac", { defaultValue: "Deleting..." }) : tx("delete_account_ee1b9a", { defaultValue: "Delete Account" })}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface DeletionPendingBannerProps {
  scheduledAt: string;
}

export function DeletionPendingBanner({ scheduledAt }: DeletionPendingBannerProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const date = new Date(scheduledAt).toLocaleDateString(uiLanguage, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <output
      className={cn(
        'block mb-4 px-4 py-3 rounded-[var(--radius-md)]',
        'bg-[var(--destructive)]/8 border border-[var(--destructive)]/30',
        'text-[13px] text-[var(--text-secondary)]',
      )}
    >
      <p className="font-medium text-[var(--destructive)] mb-1">{tx("account_scheduled_for_deletion_29e2a2", { defaultValue: "Account scheduled for deletion" })}</p>
      <p> {tx("your_account_is_scheduled_for_deletion_on_4cc2fc", { defaultValue: "Your account is scheduled for deletion on" })}{' '}
        <span className="font-medium text-[var(--text-primary)]">{date}</span>{tx("sign_back_in_before_then_to_recover_it_a0c0c2", { defaultValue: ". Sign back in before then to recover it." })} </p>
    </output>
  );
}
