import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@/components/ui/tooltip';
import { SettingsRow } from '@/features/settings/SettingsRow';
import { useUserPreferences } from '@/lib/userPreferences';
import { cn, focusRing, iconButton } from '@/lib/utils';
import { useTourContext } from './TourProvider';
import { getTour, type TourId } from './tourRegistry';

interface TourLauncherProps {
  tourId: TourId;
  variant?: 'icon' | 'menu';
  className?: string;
}

export function TourLauncher({ tourId, variant = 'icon', className }: TourLauncherProps) {
  const { t: tx } = useTranslation('ui');
  const tourCtx = useTourContext();
  const { preferences } = useUserPreferences();
  const tour = getTour(tourId);
  if (!tour) return null;
  const seen = (preferences.tours_seen ?? []).includes(tourId);

  function start() {
    tourCtx?.tour.start(tourId);
  }

  if (variant === 'icon') {
    // Hide the launcher once the user has taken the tour. It remains replayable
    // from Settings → About (the `menu` variant below) for intentional revisits.
    if (seen) return null;
    return (
      <Tooltip content={tx("tour_value0_ff3aa5", { defaultValue: "Tour: {{value0}}", value0: tour.title })} side="bottom">
        <button
          type="button"
          onClick={start}
          aria-label={tx("tour_value0_ff3aa5", { defaultValue: "Tour: {{value0}}", value0: tour.title })}
          className={cn(
            iconButton,
            focusRing,
            'rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
            className,
          )}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </Tooltip>
    );
  }

  const stepCount = tx('count_steps', { count: tour.steps.length });
  return (
    <SettingsRow
      icon={tour.icon}
      label={tour.title}
      description={tour.summary}
      onClick={start}
      control={
        <span className="text-[12px] text-[var(--text-tertiary)] tabular-nums">
          {seen ? `✓ ${stepCount}` : stepCount}
        </span>
      }
      border={false}
    />
  );
}
