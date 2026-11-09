import type { TFunction } from 'i18next';
import type { LucideIcon } from 'lucide-react';
import {
  CreditCard,
  Database,
  Info,
  Paintbrush,
  Settings,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';

export interface SettingsCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  path: string;
  external?: boolean;
  gate?: 'admin' | 'ee' | 'siteAdmin';
  adminSection?: boolean;
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'account',
    label: 'Account',
    description: 'Profile, security, API keys',
    icon: User,
    path: 'account',
  },
  {
    id: 'subscription',
    label: 'Subscription',
    description: 'Plan and billing',
    icon: CreditCard,
    path: 'subscription',
    gate: 'ee',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Theme, shortcuts, dashboard',
    icon: Settings,
    path: 'preferences',
  },
  {
    id: 'personalization',
    label: 'Personalization',
    description: 'App name and terminology',
    icon: Paintbrush,
    path: 'personalization',
    gate: 'admin',
  },
  {
    id: 'ai',
    label: 'AI',
    description: 'Provider, models, prompts',
    icon: Sparkles,
    path: 'ai',
    gate: 'admin',
  },
  {
    id: 'data',
    label: 'Data',
    description: 'Export, import, activity',
    icon: Database,
    path: 'data',
    gate: 'admin',
  },
  {
    id: 'about',
    label: 'About',
    description: 'Version and info',
    icon: Info,
    path: 'about',
  },
  {
    id: 'admin',
    label: 'Admin Dashboard',
    description: 'Manage users and system',
    icon: Shield,
    path: '/admin/users',
    external: true,
    gate: 'siteAdmin',
    adminSection: true,
  },
];

interface FilterOptions {
  isAdmin: boolean;
  isEE: boolean;
  isSiteAdmin: boolean;
}

export function filterCategories(options: FilterOptions): SettingsCategory[] {
  const { isAdmin, isEE, isSiteAdmin } = options;
  return SETTINGS_CATEGORIES.filter((cat) => {
    if (!cat.gate) return true;
    if (cat.gate === 'admin') return isAdmin;
    if (cat.gate === 'ee') return isEE;
    if (cat.gate === 'siteAdmin') return isSiteAdmin;
    return false;
  });
}

export function translateCategory(category: SettingsCategory, t: TFunction<'ui'>): SettingsCategory {
  switch (category.id) {
    case 'account': return { ...category, label: t('category_account', { defaultValue: "Account" }), description: t('category_account_description', { defaultValue: "Profile, security, API keys" }) };
    case 'subscription': return { ...category, label: t('category_subscription', { defaultValue: "Subscription" }), description: t('category_subscription_description', { defaultValue: "Plan and billing" }) };
    case 'preferences': return { ...category, label: t('category_preferences', { defaultValue: "Preferences" }), description: t('category_preferences_description', { defaultValue: "Theme, shortcuts, dashboard" }) };
    case 'personalization': return { ...category, label: t('category_personalization', { defaultValue: "Personalization" }), description: t('category_personalization_description', { defaultValue: "App name and terminology" }) };
    case 'ai': return { ...category, label: t('category_ai', { defaultValue: "AI" }), description: t('category_ai_description', { defaultValue: "Provider, models, prompts" }) };
    case 'data': return { ...category, label: t('category_data', { defaultValue: "Data" }), description: t('category_data_description', { defaultValue: "Export, import, activity" }) };
    case 'about': return { ...category, label: t('category_about', { defaultValue: "About" }), description: t('category_about_description', { defaultValue: "Version and info" }) };
    case 'admin': return { ...category, label: t('category_admin', { defaultValue: "Admin Dashboard" }), description: t('category_admin_description', { defaultValue: "Manage users and system" }) };
    default: return category;
  }
}
