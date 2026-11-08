import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import deAuth from '@/locales/de-DE/auth.json';
import deCommon from '@/locales/de-DE/common.json';
import deUi from '@/locales/de-DE/ui.json';
import enAuth from '@/locales/en/auth.json';
import enCommon from '@/locales/en/common.json';
import enUi from '@/locales/en/ui.json';

vi.unmock('react-i18next');
const { useTranslation } = await import('react-i18next');
const { renderWithI18n } = await import('../i18nTestUtils');
const { SocialButtons } = await import('@/features/auth/SocialButtons');

function keys(value: object, prefix = ''): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, val]) =>
    typeof val === 'string' ? [[`${prefix}${key}`, val]] : Object.entries(keys(val, `${prefix}${key}.`)),
  ));
}

function Count({ count }: { count: number }) {
  const { t } = useTranslation('common');
  return <span>{t('itemCount', { count })}</span>;
}

describe('German translations', () => {
  it.each([
    ['auth', enAuth, deAuth], ['common', enCommon, deCommon], ['ui', enUi, deUi],
  ])('has matching keys and interpolations in %s', (_name, english, german) => {
    const en = keys(english as object);
    const de = keys(german as object);
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
    for (const key of Object.keys(en)) {
      expect(de[key].trim()).not.toBe('');
      expect(de[key].match(/{{[^}]+}}/g)?.sort() ?? []).toEqual(en[key].match(/{{[^}]+}}/g)?.sort() ?? []);
    }
  });
  it('renders German login and preserves a custom OIDC provider name', () => {
    renderWithI18n(<SocialButtons providers={['google', 'oidc']} oidcDisplayName="Mein SSO" />, { language: 'de-DE' });
    expect(screen.getByText('Mit Google fortfahren')).toBeTruthy();
    expect(screen.getByText('Mit Mein SSO fortfahren')).toBeTruthy();
  });
  it('uses German singular and plural', () => {
    const view = renderWithI18n(<Count count={1} />, { language: 'de-DE' });
    expect(screen.getByText('1 Gegenstand')).toBeTruthy();
    view.rerender(<Count count={2} />);
    expect(screen.getByText('2 Gegenstände')).toBeTruthy();
  });
});
