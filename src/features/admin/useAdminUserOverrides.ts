import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/toast';
import { clearOverrides, fetchOverrides, grantAiCredits, resetAiCredits, type UserLimitOverrides, updateOverrides } from '@/ee/adminOverrides';
import { getErrorMessage } from '@/lib/utils';
import type { AdminUserDetail } from './useAdminUsers';

interface UseAdminUserOverridesOptions {
  detail: AdminUserDetail | null;
  selfHosted: boolean;
  refresh: () => void;
}

export function useAdminUserOverrides({ detail, selfHosted, refresh }: UseAdminUserOverridesOptions) {
  const { t: tx } = useTranslation('ui');
  const { showToast } = useToast();
  const [overrides, setOverrides] = useState<Partial<UserLimitOverrides>>({});
  const [savingOverrides, setSavingOverrides] = useState(false);
  const [grantAmount, setGrantAmount] = useState('');

  const detailId = detail?.id;
  useEffect(() => {
    if (!detailId || selfHosted) return;
    let ignore = false;
    fetchOverrides(detailId)
      .then((o) => {
        if (!ignore) setOverrides(o);
      })
      .catch((err) => {
        if (!ignore) {
          showToast({ message: getErrorMessage(err, tx("failed_to_load_user_overrides_4a905b", { defaultValue: "Failed to load user overrides" })), variant: 'error' });
        }
      });
    return () => {
      ignore = true;
    };
  }, [detailId, selfHosted, showToast, tx]);

  const handleSaveOverrides = useCallback(async () => {
    if (!detail) return;
    setSavingOverrides(true);
    try {
      await updateOverrides(detail.id, overrides);
      showToast({ message: tx("overrides_saved_49c04f", { defaultValue: "Overrides saved" }), variant: 'success' });
      refresh();
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_save_overrides_7749c1", { defaultValue: "Failed to save overrides" })), variant: 'error' });
    } finally {
      setSavingOverrides(false);
    }
  }, [detail, overrides, showToast, refresh, tx]);

  const handleClearOverrides = useCallback(async () => {
    if (!detail) return;
    try {
      await clearOverrides(detail.id);
      setOverrides({});
      showToast({ message: tx("overrides_cleared_66231c", { defaultValue: "Overrides cleared" }), variant: 'success' });
      refresh();
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_clear_overrides_0fbeda", { defaultValue: "Failed to clear overrides" })), variant: 'error' });
    }
  }, [detail, showToast, refresh, tx]);

  const handleGrantCredits = useCallback(async () => {
    if (!detail || !grantAmount) return;
    try {
      await grantAiCredits(detail.id, Number(grantAmount));
      showToast({ message: tx("grantamount_ai_credits_granted_27625e", { defaultValue: "{{grantAmount}} AI credits granted", grantAmount: grantAmount }), variant: 'success' });
      setGrantAmount('');
      refresh();
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_grant_credits_58cbb6", { defaultValue: "Failed to grant credits" })), variant: 'error' });
    }
  }, [detail, grantAmount, showToast, refresh, tx]);

  const handleResetCredits = useCallback(async () => {
    if (!detail) return;
    try {
      await resetAiCredits(detail.id);
      showToast({ message: tx("ai_credits_reset_ed2d38", { defaultValue: "AI credits reset" }), variant: 'success' });
      refresh();
    } catch (err) {
      showToast({ message: getErrorMessage(err, tx("failed_to_reset_credits_3dbb1c", { defaultValue: "Failed to reset credits" })), variant: 'error' });
    }
  }, [detail, showToast, refresh, tx]);

  return {
    overrides,
    setOverrides,
    savingOverrides,
    grantAmount,
    setGrantAmount,
    handleSaveOverrides,
    handleClearOverrides,
    handleGrantCredits,
    handleResetCredits,
  };
}

export type AdminUserOverrides = ReturnType<typeof useAdminUserOverrides>;
