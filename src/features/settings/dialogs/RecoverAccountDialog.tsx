import { useState } from 'react';
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
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/utils';

export interface RecoverAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
  scheduledAt: string;
  onRecovered: () => Promise<void> | void;
}

export function RecoverAccountDialog({
  open,
  onOpenChange,
  email,
  password,
  scheduledAt,
  onRecovered,
}: RecoverAccountDialogProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const { recoverAccount } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleRecover() {
    setError('');
    setSubmitting(true);
    try {
      await recoverAccount(email, password);
      onOpenChange(false);
      await onRecovered();
    } catch (err) {
      setError(getErrorMessage(err, 'Recovery failed'));
    } finally {
      setSubmitting(false);
    }
  }

  const scheduledDate = new Date(scheduledAt).toLocaleDateString(uiLanguage, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("account_scheduled_for_deletion_29e2a2", { defaultValue: "Account scheduled for deletion" })}</DialogTitle>
          <DialogDescription> {tx("this_account_is_scheduled_for_permanent_deletion_on_eba9b0", { defaultValue: "This account is scheduled for permanent deletion on" })} {scheduledDate}{tx("recover_it_now_to_continue_using_your_account_9df156", { defaultValue: ". Recover it now to continue using your account." })} </DialogDescription>
        </DialogHeader>
        {error && (
          <output role="alert" className="block text-[13px] text-[var(--destructive)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-3.5 py-2.5 rounded-[var(--radius-md)]">
            {error}
          </output>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
          <Button type="button" onClick={handleRecover} disabled={submitting}>
            {submitting ? tx("recovering_b7275c", { defaultValue: "Recovering..." }) : tx("recover_account_914e1e", { defaultValue: "Recover account" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
