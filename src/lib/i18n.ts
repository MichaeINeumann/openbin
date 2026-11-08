import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import { STORAGE_KEYS } from './storageKeys';

export interface SupportedLanguage {
  code: string;
  label: string;
}

// Single source of truth for supported locales — src/lib/language.ts
// re-exports this for existing call sites. server/src/routes/auth/profile.ts
// keeps its own hardcoded allowlist (client/server are separate builds with
// no shared package), guarded against drift by
// src/lib/__tests__/languageAllowlist.test.ts.
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'nb', label: 'Norsk (bokmål)' },
];

const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export const i18nReady = i18next
  .use(LanguageDetector)
  .use(resourcesToBackend((lng: string, ns: string) => import(`../locales/${lng}/${ns}.json`)))
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: (() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
        return stored && SUPPORTED_LANGUAGE_CODES.includes(stored) ? stored : 'de-DE';
      } catch { return 'de-DE'; }
    })(),
    ns: ['common', 'auth', 'ui', 'activity', 'errors'],
    defaultNS: 'common',
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    load: 'currentOnly',
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: STORAGE_KEYS.LANGUAGE,
      caches: ['localStorage'],
      convertDetectedLanguage: (code: string) => SUPPORTED_LANGUAGE_CODES.includes(code) ? code : 'de-DE',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18next;
