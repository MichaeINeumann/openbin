import type errors from './locales/en/errors.json';
import type activity from './locales/en/activity.json';
import 'i18next';
import type ui from './locales/en/ui.json';
import type auth from './locales/en/auth.json';
import type common from './locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      errors: typeof errors;
      activity: typeof activity;
      ui: typeof ui;
      common: typeof common;
      auth: typeof auth;
    };
  }
}
