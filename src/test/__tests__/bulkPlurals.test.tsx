import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.unmock('react-i18next');

const apiFetch = vi.fn();
vi.mock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => apiFetch(...args) }));
vi.mock('@/lib/eventBus', () => ({
  Events: { BINS: 'BINS', TAG_COLORS: 'TAG_COLORS', CHECKOUTS: 'CHECKOUTS' },
  notify: () => {},
  useRefreshOn: () => {},
}));
vi.mock('@/lib/auth', () => ({ useAuth: () => ({ activeLocationId: 'loc-1' }) }));
vi.mock('@/features/locations/useLocations', () => ({
  // A renamed container: bulk messages must use these words, not "bin"/"bins".
  useLocationList: () => ({ locations: [{ id: 'loc-1', term_bin: 'Kiste|Kisten' }] }),
  useLocationMembers: () => ({ members: [] }),
}));

const { useTranslation } = await import('react-i18next');
const { renderWithI18n } = await import('../i18nTestUtils');
const { useTagBulkActions } = await import('@/features/tags/useTagBulkActions');
const { useItemBulkActions } = await import('@/features/items/useItemBulkActions');
const { useCheckoutBulkActions } = await import('@/features/checkouts/useCheckoutBulkActions');
const { BulkReturnToBinDialog } = await import('@/features/checkouts/BulkReturnToBinDialog');

const noop = () => {};

function LanguageToggle() {
  const { i18n } = useTranslation();
  return (
    <button type="button" onClick={() => void i18n.changeLanguage('en')}>
      English
    </button>
  );
}

/** Renders `run` behind a button and collects every toast message it produces. */
function renderToasts(
  useRun: (showToast: (toast: { message: string }) => void) => () => void,
  language: string,
) {
  const messages: string[] = [];
  const showToast = ({ message }: { message: string }) => {
    messages.push(message);
  };

  function Harness() {
    const run = useRun(showToast);
    return (
      <>
        <LanguageToggle />
        <button type="button" onClick={run}>
          Run
        </button>
      </>
    );
  }

  renderWithI18n(<Harness />, { language });
  return messages;
}

const runButton = () => screen.getByRole('button', { name: 'Run' });

describe('bulk action messages', () => {
  it('pluralizes a tag deletion in German and counts bins with the location terminology', async () => {
    apiFetch.mockResolvedValue({ tagsDeleted: 3, binsUpdated: 1, orphanedChildren: 0 });
    const messages = renderToasts(
      (showToast) => {
        const { bulkDelete } = useTagBulkActions('loc-1', noop, showToast);
        return () => void bulkDelete(['a', 'b', 'c']);
      },
      'de-DE',
    );

    fireEvent.click(runButton());
    await waitFor(() => expect(messages).toHaveLength(1));
    expect(messages[0]).toBe('3 Tags aus 1 Kiste gelöscht');

    apiFetch.mockResolvedValue({ tagsDeleted: 1, binsUpdated: 4, orphanedChildren: 0 });
    fireEvent.click(runButton());
    await waitFor(() => expect(messages).toHaveLength(2));
    expect(messages[1]).toBe('1 Tag aus 4 Kisten gelöscht');

    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'English' })).toBeTruthy());
    fireEvent.click(runButton());
    await waitFor(() => expect(messages).toHaveLength(3));
    expect(messages[2]).toBe('Deleted 1 tag from 4 Kisten');
  });

  it('uses a separate message for setting and clearing a tag parent', async () => {
    apiFetch.mockResolvedValue({ tagsUpdated: 2 });
    const messages = renderToasts(
      (showToast) => {
        const { bulkSetParent } = useTagBulkActions('loc-1', noop, showToast);
        return () => void bulkSetParent(['a', 'b'], null);
      },
      'de-DE',
    );

    fireEvent.click(runButton());
    await waitFor(() => expect(messages).toHaveLength(1));
    expect(messages[0]).toBe('Übergeordnetes Tag für 2 Tags entfernt');
  });

  it('appends a failure count as its own sentence so both numbers pluralize', async () => {
    apiFetch.mockResolvedValue({ checkedOut: 2, errors: [{ id: 'x', reason: 'gone' }] });
    const messages = renderToasts(
      (showToast) => {
        const { bulkCheckout } = useItemBulkActions(noop, showToast);
        return () => void bulkCheckout(['a', 'b', 'c']);
      },
      'de-DE',
    );

    fireEvent.click(runButton());
    await waitFor(() => expect(messages).toHaveLength(1));
    expect(messages[0]).toBe('2 Gegenstände ausgeliehen. 1 fehlgeschlagen.');

    apiFetch.mockResolvedValue({ checkedOut: 1, errors: [] });
    fireEvent.click(runButton());
    await waitFor(() => expect(messages).toHaveLength(2));
    expect(messages[1]).toBe('1 Gegenstand ausgeliehen');
  });

  it('returns checked out items with and without a target bin', async () => {
    apiFetch.mockResolvedValue({ returned: 2, errors: [] });
    const messages = renderToasts(
      (showToast) => {
        const { bulkReturn, bulkReturnToBin } = useCheckoutBulkActions('loc-1', noop, showToast);
        return () => {
          void bulkReturn(['a', 'b']);
          void bulkReturnToBin(['a', 'b'], 'bin-9', 'Regal A');
        };
      },
      'de-DE',
    );

    fireEvent.click(runButton());
    await waitFor(() => expect(messages).toHaveLength(2));
    expect(messages).toContain('2 Gegenstände zurückgegeben');
    expect(messages).toContain('2 Gegenstände nach Regal A zurückgegeben');
  });

  it('translates a bulk dialog title, description and buttons with the location terminology', async () => {
    apiFetch.mockResolvedValue({ results: [], count: 0 });
    const checkouts = [
      { id: 'c1', origin_bin_id: 'b1' },
      { id: 'c2', origin_bin_id: 'b2' },
    ] as never;

    renderWithI18n(
      <>
        <LanguageToggle />
        <BulkReturnToBinDialog open onOpenChange={noop} checkouts={checkouts} onApply={async () => {}} />
      </>,
      { language: 'de-DE' },
    );

    await waitFor(() =>
      expect(screen.getByText('2 Gegenstände zurückgeben – Ziel auswählen (Kiste)')).toBeTruthy(),
    );
    expect(
      screen.getByText('Die Gegenstände stammen aus 2 Kisten. Sie werden alle in das gewählte Ziel verschoben.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Zurückgeben' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() => expect(screen.getByText('Return 2 items to a chosen Kiste')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Return' })).toBeTruthy();
  });
});
