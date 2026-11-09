import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('react-i18next');

beforeEach(() => {
  vi.resetModules();
  localStorage.removeItem('openbin-language');
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('en-US');
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['en-US', 'nb']);
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.setItem('openbin-language', 'en');
});

describe('application language initialization', () => {
  it.each([null, 'fr', 'invalid'])('defaults to German with stored preference %s despite English browser language', async (stored) => {
    if (stored !== null) localStorage.setItem('openbin-language', stored);
    const { default: i18n, i18nReady } = await import('@/lib/i18n');
    await i18nReady;
    expect(i18n.language).toBe('de-DE');
    expect(i18n.t('itemCount', { count: 2 })).toBe('2 Gegenstände');
    expect(localStorage.getItem('openbin-language')).toBe('de-DE');
  });

  it.each(['de-DE', 'en', 'nb'])('restores an explicit %s preference', async (language) => {
    localStorage.setItem('openbin-language', language);
    const { default: i18n, i18nReady } = await import('@/lib/i18n');
    await i18nReady;
    expect(i18n.language).toBe(language);
  });

  it('falls back to English when a German translation is missing', async () => {
    const { default: i18n, i18nReady } = await import('@/lib/i18n');
    await i18nReady;
    // Temporarily omit a German namespace to exercise the actual fallback configuration.
    const german = i18n.getResourceBundle('de-DE', 'common');
    i18n.removeResourceBundle('de-DE', 'common');
    try {
      expect(i18n.t('actions.cancel')).toBe('Cancel');
      expect(i18n.language).toBe('de-DE');
    } finally {
      i18n.addResourceBundle('de-DE', 'common', german);
    }
  });
});
