import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PASSWORD_CHECKS, type PasswordCheckResult } from '@/lib/passwordStrength';
import { cn } from '@/lib/utils';

interface PasswordChecklistProps {
  checks: PasswordCheckResult;
}

export function PasswordChecklist({ checks }: PasswordChecklistProps) {
  const { t: tx } = useTranslation('ui');
  const labels = {
    length: tx('password_length', { defaultValue: "At least 8 characters" }),
    uppercase: tx('password_uppercase', { defaultValue: "Uppercase letter" }),
    lowercase: tx('password_lowercase', { defaultValue: "Lowercase letter" }),
    digit: tx('password_digit', { defaultValue: "Number" }),
  };
  return (
    <ul className="flex flex-col gap-1 text-[13px]" aria-label={tx("password_requirements_a1b02d", { defaultValue: "Password requirements" })}>
      {PASSWORD_CHECKS.map(({ key }) => (
        <li
          key={key}
          className="row-tight"
          aria-label={tx("label_value1_bc878a", { defaultValue: "{{labels[key]}} — {{value1}}", label: labels[key], value1: checks[key] ? tx('requirementMet', { defaultValue: 'met' }) : tx('requirementUnmet', { defaultValue: 'not met' }) })}
        >
          {checks[key] ? (
            <Check className="h-3.5 w-3.5 text-[var(--accent)] shrink-0 animate-check-pop" aria-hidden="true" />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--border-flat)]" aria-hidden="true" />
          )}
          <span className={cn(
            'transition-colors duration-200',
            checks[key] ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
          )}>
            {labels[key]}
          </span>
        </li>
      ))}
    </ul>
  );
}
