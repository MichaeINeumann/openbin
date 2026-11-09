import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ActivityLogEntry } from '@/types';

vi.unmock('react-i18next');
vi.mock('@/lib/auth', () => ({ useAuth: () => ({ activeLocationId: 'custom' }) }));
vi.mock('@/features/locations/useLocations', () => ({
  useLocationList: () => ({ locations: [{ id: 'custom', term_bin: 'Box|Boxes', term_area: 'Shelf|Shelves', term_location: 'Workshop|Workshops' }] }),
  useLocationMembers: () => ({ members: [] }),
}));
const { useTranslation } = await import('react-i18next');
const { renderWithI18n } = await import('../i18nTestUtils');
const { ActivityTableView } = await import('@/features/activity/ActivityTableView');
const { ActivityFilterBar } = await import('@/features/activity/ActivityFilterBar');
const { getActionLabel } = await import('@/features/activity/activityHelpers');
const { DEFAULT_TERMINOLOGY } = await import('@/lib/terminology');

const base: ActivityLogEntry = {
  id: 'activity-1', location_id: 'custom', user_id: 'user-1', user_name: 'alex', display_name: 'Alex',
  action: 'update', entity_type: 'bin', entity_id: 'bin-1', entity_name: 'M2 Screws',
  changes: null, auth_method: null, api_key_name: null, created_at: '2026-11-09T12:00:00Z',
};

function View({ entry }: { entry: ActivityLogEntry }) {
  const { i18n } = useTranslation();
  return <MemoryRouter>
    <button type="button" onClick={() => void i18n.changeLanguage('en')}>English</button>
    <ActivityTableView entries={[entry]} hasMore={false} isLoadingMore={false} loadMore={() => {}} />
    <ActivityFilterBar entityTypeFilter="" onEntityTypeChange={() => {}} userId="" onUserIdChange={() => {}}
      dateFrom="" onDateFromChange={() => {}} dateTo="" onDateToChange={() => {}} searchQuery="" onSearchChange={() => {}} />
  </MemoryRouter>;
}

describe('localized activity views', () => {
  it('describes shopping list entries without mislabeling them as locations', () => {
    const entry = { ...base, action: 'create', entity_type: 'shopping_list' };
    function Summary() {
      const { t } = useTranslation('activity');
      return <p>{getActionLabel(entry, DEFAULT_TERMINOLOGY, t)}</p>;
    }
    renderWithI18n(<><Summary /><View entry={entry} /></>, { language: 'de-DE' });
    expect(screen.getByText('Einkaufslisten-Eintrag "M2 Screws"')).toBeTruthy();
    expect(screen.getByText('hat Einkaufslisten-Eintrag "M2 Screws" erstellt')).toBeTruthy();
  });

  it('translates badges, changes, filters and navigation while preserving custom terms and stored names', async () => {
    const entry = { ...base, changes: {
      name: { old: 'Original Screws', new: 'M2 Screws' },
      items_added: { old: null, new: ['Schraube', 'Bolt'] },
      items_removed: { old: ['Nut'], new: null },
      area: { old: null, new: 'Top Shelf' },
    } };
    const original = structuredClone(entry);
    renderWithI18n(<View entry={entry} />, { language: 'de-DE' });
    expect(screen.getByText('Geändert')).toBeTruthy();
    expect(screen.getByText('+2 Gegenstände')).toBeTruthy();
    expect(screen.getByText('−1 Gegenstand')).toBeTruthy();
    expect(screen.getByText('Box "M2 Screws"')).toBeTruthy();
    expect(screen.getByText('Alle')).toBeTruthy();
    expect(screen.getByText('Mitglieder')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Geändert.*M2 Screws/ }));
    expect(screen.getByRole('button', { name: 'Box anzeigen' })).toBeTruthy();
    expect(screen.getByText('+ Gegenstände')).toBeTruthy();
    expect(screen.getByText('Original Screws')).toBeTruthy();
    expect(screen.getByText('Schraube, Bolt')).toBeTruthy();
    expect(screen.getByText('keine Angabe')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() => expect(screen.getAllByText('Updated')).toHaveLength(2));
    expect(screen.getByText('+2 items')).toBeTruthy();
    expect(screen.getByText('Members')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View Box' })).toBeTruthy();
    expect(screen.getByText('Box "M2 Screws"')).toBeTruthy();
    expect(entry).toEqual(original);
  });

  it('localizes movement descriptions without translating either location name', () => {
    renderWithI18n(<View entry={{ ...base, action: 'move_in', changes: { location: { old: 'Garage', new: 'Workshop' } } }} />, { language: 'de-DE' });
    expect(screen.getByText('Verschoben')).toBeTruthy();
    expect(screen.getByText('Box "M2 Screws" von Garage nach Workshop')).toBeTruthy();
  });
});
