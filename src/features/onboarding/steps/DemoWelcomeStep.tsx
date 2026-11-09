import { useTranslation } from 'react-i18next';
import { BrandIcon } from '@/components/BrandIcon';
import { Button } from '@/components/ui/button';

export function DemoWelcomeStep({ activeLocationId, onAdvance }: { activeLocationId: string; onAdvance: (id: string) => void }) {
  const { t: tx } = useTranslation('ui');
  return (
    <div className="flex flex-col items-center text-center">
      <BrandIcon className="h-16 w-16 text-[var(--accent)] mb-5" />
      <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-2"> {tx("welcome_to_openbin_36272a", { defaultValue: "Welcome to OpenBin" })} </h2>
      <p className="text-[14px] text-[var(--text-tertiary)] mb-6 leading-relaxed"> {tx("this_demo_has_a_pre_built_home_with_bins_already_organized_w_1baa09", { defaultValue: "This demo has a pre-built home with bins already organized. We'll walk through the key features in under a minute." })} </p>
      <Button
        type="button"
        onClick={() => onAdvance(activeLocationId)}
        className="w-full rounded-[var(--radius-md)] h-11 text-[15px]"
      > {tx("start_tour_f41b52", { defaultValue: "Start Tour" })} </Button>
    </div>
  );
}
