import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AiCreditDisplay } from '@/features/ai/AiCreditDisplay';
import { visionWeight } from '@/lib/aiCreditCost';

interface AiRetryBandProps {
  photoCount: number;
  onScan: () => void;
  onDismiss: () => void;
}

/** Post-cancel affordance: lets the user re-trigger AI scanning or fall back to manual entry. */
export function AiRetryBand({ photoCount, onScan, onDismiss }: AiRetryBandProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--ai-accent)]/20 bg-[var(--ai-accent)]/5 p-3 flex flex-col gap-2">
      <Button variant="ai" onClick={onScan} fullWidth>
        <Sparkles className="h-4 w-4 mr-1.5" /> {tx("scan_with_ai_c2b0f0", { defaultValue: "Scan with AI" })} </Button>
      <AiCreditDisplay cost={visionWeight(photoCount)} className="self-center" />
      <button
        type="button"
        onClick={onDismiss}
        className="self-center text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1"
      > {tx("continue_manually_05acb9", { defaultValue: "Continue manually" })} </button>
    </div>
  );
}
