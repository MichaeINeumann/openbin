import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.unmock('react-i18next');
const { useTranslation } = await import('react-i18next');
const { renderWithI18n } = await import('../i18nTestUtils');
const { UsageHeatmap } = await import('@/features/usage/UsageHeatmap');

function SwitchableCalendar() {
  const { i18n } = useTranslation();
  return <>
    <button type="button" onClick={() => void i18n.changeLanguage('en')}>English</button>
    <UsageHeatmap data={[{ date: '2026-03-01', count: 2 }]} year={2026} granularity="monthly" />
  </>;
}

describe('usage language with real translation resources', () => {
  it('updates calendar labels and accessible descriptions on language change', async () => {
    renderWithI18n(<SwitchableCalendar />, { language: 'de-DE' });
    expect(screen.getByText(/^Mär(?:z)?$/)).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Monatliche Nutzungsübersicht für 2026. 1 aktiver Monat.' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() => expect(screen.getByText('Mar')).toBeTruthy());
    expect(screen.queryByText(/^Mär(?:z)?$/)).toBeNull();
    expect(screen.getByRole('img', { name: 'Monthly usage heatmap for 2026. 1 active month.' })).toBeTruthy();
  });

  it('localizes day tooltips without changing the ISO date used for navigation', () => {
    const onDayClick = vi.fn();
    renderWithI18n(<UsageHeatmap
      data={[{ date: '2026-03-01', count: 2 }, { date: '2026-03-02', count: 1 }]}
      year={2026} granularity="daily" onDayClick={onDayClick}
    />, { language: 'de-DE' });
    const day = screen.getByRole('button', { name: '1. März 2026 — 2 Nutzungen' });
    expect(screen.getByRole('button', { name: '2. März 2026 — 1 Nutzung' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Tägliche Nutzungsübersicht für 2026. 2 aktive Tage.' })).toBeTruthy();
    fireEvent.click(day);
    expect(onDayClick).toHaveBeenCalledWith('2026-03-01');
  });
});
