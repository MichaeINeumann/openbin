import { Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OptionGroupOption } from '@/components/ui/option-group';
import { OptionGroup } from '@/components/ui/option-group';
import type { BinVisibility } from '@/types';

interface VisibilityPickerProps {
  value: BinVisibility;
  onChange: (value: BinVisibility) => void;
}

export function VisibilityPicker({ value, onChange }: VisibilityPickerProps) {
  const { t: tx } = useTranslation('ui');
  const options: OptionGroupOption<BinVisibility>[] = [
    { key: 'location', label: tx('visibility_everyone'), icon: Globe },
    { key: 'private', label: tx('visibility_onlyMe'), icon: Lock },
  ];
  return <OptionGroup options={options} value={value} onChange={onChange} />;
}
