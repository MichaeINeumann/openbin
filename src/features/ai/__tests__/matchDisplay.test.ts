import { describe, expect, it } from 'vitest';
import { getMatchDisplay, parseRelevanceKind } from '../matchDisplay';
import type { QueryMatch } from '../useInventoryQuery';

describe('parseRelevanceKind', () => {
  it.each([
    ['contains "drill"', 'item'],
    ['contains "x with spaces"', 'item'],
    ['name contains "kitchen"', 'name'],
    ['tagged "garage"', 'tag'],
    ['tag contains "garage"', 'unknown'],
    ['pinned', 'metadata'],
    ['private', 'metadata'],
    ['in trash', 'metadata'],
    ['has checked-out items', 'metadata'],
    ['name similar to query', 'fuzzy'],
    ['matches query', 'unknown'],
    ['', 'unknown'],
    ['random gibberish', 'unknown'],
  ])('parses %j as %s', (input, expected) => {
    expect(parseRelevanceKind(input)).toBe(expected);
  });
});

/** Stand-in for the i18next lookup the component passes in. */
const itemCount = (count: number) => `${count} item${count === 1 ? '' : 's'}`;

describe('getMatchDisplay', () => {
  const baseMatch: QueryMatch = {
    bin_id: 'b1',
    name: 'Test',
    area_name: '',
    items: [],
    total_item_count: 0,
    tags: [],
    relevance: '',
    icon: '',
    color: '',
  };

  it('returns header-only for empty bin', () => {
    expect(getMatchDisplay(baseMatch, itemCount)).toEqual({
      mode: 'header-only',
      defaultExpanded: false,
      countLabel: '',
    });
  });

  it('returns nav-disclosure when items empty but total > 0 (plural)', () => {
    expect(getMatchDisplay({ ...baseMatch, total_item_count: 12 }, itemCount)).toEqual({
      mode: 'nav-disclosure',
      defaultExpanded: false,
      countLabel: '12 items',
    });
  });

  it('returns nav-disclosure with singular for 1 total item', () => {
    expect(getMatchDisplay({ ...baseMatch, total_item_count: 1 }, itemCount)).toEqual({
      mode: 'nav-disclosure',
      defaultExpanded: false,
      countLabel: '1 item',
    });
  });

  it('returns inline-disclosure collapsed by default for non-item kinds', () => {
    const match: QueryMatch = {
      ...baseMatch,
      items: [{ id: 'i1', name: 'X', quantity: null }],
      total_item_count: 1,
      relevance: 'name contains "test"',
    };
    expect(getMatchDisplay(match, itemCount)).toEqual({
      mode: 'inline-disclosure',
      defaultExpanded: false,
      countLabel: '1 item',
    });
  });

  it('auto-expands single item match (kind=item, items.length=1)', () => {
    const match: QueryMatch = {
      ...baseMatch,
      items: [{ id: 'i1', name: 'drill', quantity: null }],
      total_item_count: 12,
      relevance: 'contains "drill"',
    };
    expect(getMatchDisplay(match, itemCount)).toEqual({
      mode: 'inline-disclosure',
      defaultExpanded: true,
      countLabel: '1 item',
    });
  });

  it('does not auto-expand when item kind but multiple items', () => {
    const match: QueryMatch = {
      ...baseMatch,
      items: [
        { id: 'i1', name: 'AA battery', quantity: null },
        { id: 'i2', name: 'AAA battery', quantity: null },
      ],
      total_item_count: 5,
      relevance: 'contains "battery"',
    };
    expect(getMatchDisplay(match, itemCount).defaultExpanded).toBe(false);
  });

  it('does not auto-expand for tag-kind single item', () => {
    const match: QueryMatch = {
      ...baseMatch,
      items: [{ id: 'i1', name: 'rope', quantity: null }],
      total_item_count: 1,
      relevance: 'tagged "garage"',
    };
    expect(getMatchDisplay(match, itemCount).defaultExpanded).toBe(false);
  });

  it('does not auto-expand for metadata-kind single item', () => {
    const match: QueryMatch = {
      ...baseMatch,
      items: [{ id: 'i1', name: 'something', quantity: null }],
      total_item_count: 1,
      relevance: 'pinned',
    };
    expect(getMatchDisplay(match, itemCount).defaultExpanded).toBe(false);
  });
});
