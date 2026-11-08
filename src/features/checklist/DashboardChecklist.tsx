import { Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCommandInputRef } from '@/features/tour/TourProvider';
import { cn, flatCard } from '@/lib/utils';
import { ChecklistItem } from './ChecklistItem';
import type { ChecklistStepId } from './checklistSteps';
import { useChecklist } from './useChecklist';

interface DashboardChecklistProps {
  totalBins: number;
  setCreateOpen: (open: boolean) => void;
  onUpgradeClick?: () => void;
}

export function DashboardChecklist({ totalBins, setCreateOpen, onUpgradeClick }: DashboardChecklistProps) {
  const { t: tx } = useTranslation('ui');
  const translatedSteps: Record<string, { title: string; description: string }> = {
    'create-bin': { title: tx('checklist_create-bin', { defaultValue: "Add your first bin" }), description: tx('checklist_create-bin_description', { defaultValue: "Snap a photo and let AI fill it in" }) },
    'add-three-bins': { title: tx('checklist_add-three-bins', { defaultValue: "Build out your shelf" }), description: tx('checklist_add-three-bins_description', { defaultValue: "Reach 3 bins so AI search has something to work with" }) },
    'ask-ai': { title: tx('checklist_ask-ai', { defaultValue: "Ask AI to find something" }), description: tx('checklist_ask-ai_description', { defaultValue: "Type a question \u2014 AI checks every bin" }) },
    'print-label': { title: tx('checklist_print-label', { defaultValue: "Print your first label" }), description: tx('checklist_print-label_description', { defaultValue: "A QR sticker turns any bin into a tap-to-open shortcut" }) },
  };
  const navigate = useNavigate();
  const { steps, completedCount, isHidden, dismiss } = useChecklist({ totalBins });

  if (isHidden) return null;

  function buildActions(stepId: ChecklistStepId, gated?: boolean) {
    if (stepId === 'create-bin') {
      return {
        primary: { label: tx('takePhoto', { defaultValue: 'Take a photo' }), onClick: () => setCreateOpen(true) },
        secondary: { label: tx('addManually', { defaultValue: 'Add manually' }), onClick: () => setCreateOpen(true) },
      };
    }
    if (stepId === 'add-three-bins') {
      return { primary: { label: tx('addAnother', { defaultValue: 'Add another' }), onClick: () => setCreateOpen(true) } };
    }
    if (stepId === 'ask-ai') {
      return {
        primary: {
          label: tx('tryIt', { defaultValue: 'Try it' }),
          onClick: () => {
            if (gated && onUpgradeClick) onUpgradeClick();
            else getCommandInputRef().current?.open();
          },
        },
      };
    }
    if (stepId === 'print-label') {
      return { primary: { label: tx('openPrint', { defaultValue: 'Open print' }), onClick: () => navigate('/print') } };
    }
    return {};
  }

  return (
    <section aria-labelledby="dash-checklist" className={cn(flatCard, 'p-4')}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <h2 id="dash-checklist" className="text-[15px] font-semibold text-[var(--text-primary)]"> {tx("get_started_90e40d", { defaultValue: "Get started" })} </h2>
          <span className="text-[12px] text-[var(--text-tertiary)]">
            {completedCount} {tx("of_de04fa", { defaultValue: "of" })} {steps.length}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={dismiss}
          aria-label={tx("dismiss_checklist_40c509", { defaultValue: "Dismiss checklist" })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {steps.map((step) => {
          const { primary, secondary } = buildActions(step.id, step.gated);
          return (
            <ChecklistItem
              key={step.id}
              icon={step.icon}
              title={translatedSteps[step.id]?.title ?? step.title}
              description={translatedSteps[step.id]?.description ?? step.description}
              complete={step.complete}
              primary={primary}
              secondary={secondary}
            />
          );
        })}
      </div>
    </section>
  );
}
