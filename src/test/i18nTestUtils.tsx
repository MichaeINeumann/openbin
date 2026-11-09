import { type RenderHookResult, type RenderResult, render, renderHook } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import deActivity from '@/locales/de-DE/activity.json';
import deAuth from '@/locales/de-DE/auth.json';
import deCommon from '@/locales/de-DE/common.json';
import deUi from '@/locales/de-DE/ui.json';
import enActivity from '@/locales/en/activity.json';
import enAuth from '@/locales/en/auth.json';
import enCommon from '@/locales/en/common.json';
import enUi from '@/locales/en/ui.json';
import nbAuth from '@/locales/nb/auth.json';
import nbCommon from '@/locales/nb/common.json';

/**
 * A dedicated i18next instance (via createInstance(), not the shared default
 * export) so real-resource integration tests never collide with the app's
 * side-effecting src/lib/i18n.ts init — components under test read this
 * instance only through the <I18nextProvider> context below, regardless of
 * whether src/lib/i18n.ts has been imported elsewhere in the same test run.
 */
function createTestI18n() {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'auth'],
    defaultNS: 'common',
    resources: {
      'de-DE': { common: deCommon, auth: deAuth, ui: deUi, activity: deActivity },
      en: { common: enCommon, auth: enAuth, ui: enUi, activity: enActivity },
      nb: { common: nbCommon, auth: nbAuth },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

/**
 * Renders `ui` against a *real* i18next instance with the actual en/common
 * and en/auth JSON loaded synchronously (unlike the global test-setup mock,
 * which just echoes back key/defaultValue) — catches broken keys, missing
 * interpolation vars, and JSON typos that the mock wouldn't. Call
 * `vi.unmock('react-i18next')` at the top of a test file before using this,
 * since the global setup file mocks 'react-i18next' by default.
 */
export function renderWithI18n(ui: ReactElement, options?: { language?: string }): RenderResult {
  const instance = createTestI18n();
  if (options?.language) {
    instance.changeLanguage(options.language);
  }
  return render(<I18nextProvider i18n={instance}>{ui}</I18nextProvider>);
}

/**
 * The renderHook() counterpart of renderWithI18n(), for hooks whose output is
 * user-visible text (toast messages, labels) and therefore has to be asserted
 * against the real catalogs — the global mock cannot pluralize.
 */
export function renderHookWithI18n<T>(hook: () => T, options?: { language?: string }): RenderHookResult<T, unknown> {
  const instance = createTestI18n();
  if (options?.language) {
    instance.changeLanguage(options.language);
  }
  return renderHook(hook, {
    wrapper: ({ children }) => <I18nextProvider i18n={instance}>{children}</I18nextProvider>,
  });
}
