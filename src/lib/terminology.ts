import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocationList } from '@/features/locations/useLocations';
import { useAuth } from '@/lib/auth';

export interface Terminology {
  bin: string;
  bins: string;
  Bin: string;
  Bins: string;
  location: string;
  locations: string;
  Location: string;
  Locations: string;
  area: string;
  areas: string;
  Area: string;
  Areas: string;
}

export const DEFAULT_TERMINOLOGY: Terminology = {
  bin: 'bin',
  bins: 'bins',
  Bin: 'Bin',
  Bins: 'Bins',
  location: 'location',
  locations: 'locations',
  Location: 'Location',
  Locations: 'Locations',
  area: 'area',
  areas: 'areas',
  Area: 'Area',
  Areas: 'Areas',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Parse pipe-delimited "singular|plural" term, falling back to defaults */
function parseTerm(raw: string, defaultSingular: string, defaultPlural: string): { singular: string; plural: string } {
  if (!raw) return { singular: defaultSingular, plural: defaultPlural };
  const parts = raw.split('|');
  const singular = parts[0]?.trim() || defaultSingular;
  const plural = parts[1]?.trim() || defaultPlural;
  return { singular, plural };
}

export function useTerminology(): Terminology {
  const { i18n } = useTranslation();
  const { activeLocationId } = useAuth();
  const { locations } = useLocationList();

  return useMemo(() => {
    const loc = locations.find((l) => l.id === activeLocationId);
    const defaults = i18n.language === 'de-DE'
      ? ['Kiste', 'Kisten', 'Standort', 'Standorte', 'Bereich', 'Bereiche']
      : i18n.language === 'nb'
        ? ['boks', 'bokser', 'sted', 'steder', 'område', 'områder']
        : ['bin', 'bins', 'location', 'locations', 'area', 'areas'];

    const bin = parseTerm(loc?.term_bin ?? '', defaults[0], defaults[1]);
    const location = parseTerm(loc?.term_location ?? '', defaults[2], defaults[3]);
    const area = parseTerm(loc?.term_area ?? '', defaults[4], defaults[5]);

    return {
      bin: bin.singular,
      bins: bin.plural,
      Bin: capitalize(bin.singular),
      Bins: capitalize(bin.plural),
      location: location.singular,
      locations: location.plural,
      Location: capitalize(location.singular),
      Locations: capitalize(location.plural),
      area: area.singular,
      areas: area.plural,
      Area: capitalize(area.singular),
      Areas: capitalize(area.plural),
    };
  }, [activeLocationId, locations, i18n.language]);
}
