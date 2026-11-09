import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('react-i18next');
const state = vi.hoisted(() => ({
  user: null as { id: string; language: string | null } | null,
  activeLocationId: 'default',
  locations: [
    { id: 'default', term_bin: '', term_location: '', term_area: '' },
    { id: 'custom', term_bin: 'Box|Boxes', term_location: 'Workshop|Workshops', term_area: 'Shelf|Shelves' },
  ],
}));
vi.mock('@/lib/auth', () => ({ useAuth: () => state }));
vi.mock('@/features/locations/useLocations', () => ({ useLocationList: () => ({ locations: state.locations }) }));

const { I18nextProvider, useTranslation } = await import('react-i18next');
const { default: i18n, i18nReady } = await import('@/lib/i18n');
const { LanguageSync } = await import('@/components/LanguageSync');
const { useTerminology } = await import('@/lib/terminology');
await i18nReady;

function Probe() {
  const { t } = useTranslation('common');
  const terms = useTerminology();
  return <>
    <span>{t('itemCount', { count: 2 })}</span>
    <output data-testid="terms">{[terms.bin, terms.bins, terms.location, terms.locations, terms.area, terms.areas].join(' / ')}</output>
  </>;
}

function App() {
  return <I18nextProvider i18n={i18n}><LanguageSync /><Probe /></I18nextProvider>;
}

beforeEach(async () => {
  state.user = null;
  state.activeLocationId = 'default';
  await i18n.changeLanguage('en');
});
afterEach(() => cleanup());

describe('profile language and custom terminology', () => {
  it('uses German for a user without a preference, overriding the previous local English choice', async () => {
    state.user = { id: 'new-user', language: null };
    render(<App />);
    await screen.findByText('2 Gegenstände');
    expect(screen.getByTestId('terms').textContent).toBe('Kiste / Kisten / Standort / Standorte / Bereich / Bereiche');
    expect(localStorage.getItem('openbin-language')).toBe('de-DE');
    expect(document.documentElement.lang).toBe('de-DE');
    expect(state.user.language).toBeNull();
  });

  it('reconciles different users on the same device without carrying over another user’s language', async () => {
    state.user = { id: 'english-user', language: 'en' };
    const view = render(<App />);
    expect(screen.getByText('2 items')).toBeTruthy();
    state.user = { id: 'norwegian-user', language: 'nb' };
    view.rerender(<App />);
    await screen.findByText('2 gjenstander');
    state.user = { id: 'unset-user', language: null };
    view.rerender(<App />);
    await screen.findByText('2 Gegenstände');
    state.user = { id: 'english-user', language: 'en' };
    view.rerender(<App />);
    await screen.findByText('2 items');
    expect(localStorage.getItem('openbin-language')).toBe('en');
  });

  it('keeps an anonymous visitor’s explicit language choice', async () => {
    await i18n.changeLanguage('nb');
    render(<App />);
    expect(screen.getByText('2 gjenstander')).toBeTruthy();
    expect(i18n.language).toBe('nb');
  });

  it('updates default terms on language changes and preserves custom terms across location changes', async () => {
    const originalLocations = structuredClone(state.locations);
    const view = render(<App />);
    expect(screen.getByTestId('terms').textContent).toBe('bin / bins / location / locations / area / areas');
    await act(async () => { await i18n.changeLanguage('de-DE'); });
    expect(screen.getByTestId('terms').textContent).toBe('Kiste / Kisten / Standort / Standorte / Bereich / Bereiche');
    state.activeLocationId = 'custom';
    view.rerender(<App />);
    const custom = 'Box / Boxes / Workshop / Workshops / Shelf / Shelves';
    expect(screen.getByTestId('terms').textContent).toBe(custom);
    await act(async () => { await i18n.changeLanguage('nb'); });
    expect(screen.getByTestId('terms').textContent).toBe(custom);
    state.activeLocationId = 'default';
    view.rerender(<App />);
    await waitFor(() => expect(screen.getByTestId('terms').textContent).toBe('boks / bokser / sted / steder / område / områder'));
    expect(state.locations).toEqual(originalLocations);
  });
});
