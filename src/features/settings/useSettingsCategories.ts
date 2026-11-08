import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { usePermissions } from '@/lib/usePermissions';
import { filterCategories, translateCategory } from './settingsCategories';

export function useSettingsCategories() {
  const { t } = useTranslation('ui');
  const { user } = useAuth();
  const { isAdmin } = usePermissions();

  const isSiteAdmin = !!user?.isAdmin;
  const isEE = typeof __EE__ !== 'undefined' && __EE__;

  const categories = useMemo(
    () => filterCategories({ isAdmin, isEE, isSiteAdmin }).map(category => translateCategory(category, t)),
    [isAdmin, isEE, isSiteAdmin, t],
  );

  const mainCategories = useMemo(
    () => categories.filter((c) => !c.adminSection),
    [categories],
  );

  const adminCategories = useMemo(
    () => categories.filter((c) => c.adminSection),
    [categories],
  );

  return { categories, mainCategories, adminCategories };
}
