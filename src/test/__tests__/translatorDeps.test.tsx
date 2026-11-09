import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.unmock('react-i18next');

const apiFetch = vi.fn();
vi.mock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => apiFetch(...args) }));
vi.mock('@/lib/eventBus', () => ({
  Events: { BINS: 'BINS', TAG_COLORS: 'TAG_COLORS' },
  notify: () => {},
  useRefreshOn: () => {},
}));

const { useTranslation } = await import('react-i18next');
const { renderWithI18n } = await import('../i18nTestUtils');
const { useTagBulkActions } = await import('@/features/tags/useTagBulkActions');
const { Html5QrcodePlugin } = await import('@/features/qrcode/Html5QrcodePlugin');

function LanguageToggle() {
  const { i18n } = useTranslation();
  return (
    <button type="button" onClick={() => void i18n.changeLanguage('en')}>
      English
    </button>
  );
}

describe('translator dependencies in memoized hooks', () => {
  it('rebuilds a memoized mutation callback so its toast follows the current language', async () => {
    const messages: string[] = [];
    // Stable identities so `tx` is the only dependency that changes on a
    // language switch — otherwise the callback would be rebuilt anyway and the
    // test could not tell a stale translator apart from a fresh one.
    const clearSelection = () => {};
    const showToast = ({ message }: { message: string }) => {
      messages.push(message);
    };

    function Harness() {
      const { bulkDelete } = useTagBulkActions('loc-1', clearSelection, showToast);
      return (
        <>
          <LanguageToggle />
          <button type="button" onClick={() => void bulkDelete(['alt'])}>
            Delete
          </button>
        </>
      );
    }

    apiFetch.mockResolvedValue({ tagsDeleted: 1, binsUpdated: 2, orphanedChildren: 0 });
    renderWithI18n(<Harness />, { language: 'de-DE' });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(messages).toHaveLength(1));
    expect(messages[0]).toContain('gelöscht');

    // Without `tx` in the callback's dependency list the handler would keep the
    // translator bound at first render and still report German here.
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'English' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(messages).toHaveLength(2));
    expect(messages[1]).toContain('Deleted');
    expect(messages[1]).not.toContain('gelöscht');
  });

  it('translates a camera start failure at render time so it follows a later language switch', async () => {
    vi.doMock('html5-qrcode', () => ({
      Html5Qrcode: class {
        isScanning = false;
        start() {
          // Rejecting with a non-Error makes getErrorMessage use the translated
          // fallback instead of a provider string.
          return Promise.reject({ name: 'NotAllowedError' });
        }
        getState() {
          return 2;
        }
      },
    }));

    renderWithI18n(
      <>
        <LanguageToggle />
        <Html5QrcodePlugin onScanSuccess={() => {}} />
      </>,
      { language: 'de-DE' },
    );

    await waitFor(() => expect(screen.getByText('Scanner konnte nicht gestartet werden')).toBeTruthy());
    expect(screen.getByText('Kamera konnte nicht gestartet werden')).toBeTruthy();

    // The scanner only starts once, so the message must be translated on render
    // rather than captured as a string inside the mount effect.
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() => expect(screen.getByText('Failed to start scanner')).toBeTruthy());
    expect(screen.getByText('Failed to start camera')).toBeTruthy();

    vi.doUnmock('html5-qrcode');
  });
});
