import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { OVERRIDE_FIELDS } from './adminUserDetailConstants';
import type { AdminUserOverrides } from './useAdminUserOverrides';

interface AdminUserOverridesCardProps {
  overrides: AdminUserOverrides;
}

export function AdminUserOverridesCard({ overrides }: AdminUserOverridesCardProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <Card>
      <CardHeader><CardTitle>{tx("limit_overrides_dde355", { defaultValue: "Limit Overrides" })}</CardTitle></CardHeader>
      <CardContent>
        <p className="text-[13px] text-[var(--text-tertiary)] mb-3"> {tx("override_plan_limits_for_this_user_leave_blank_to_use_plan_d_5b4d9e", { defaultValue: "Override plan limits for this user. Leave blank to use plan defaults." })} </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OVERRIDE_FIELDS.map(({ key, label, htmlId }) => (
            <FormField key={key} label={label} htmlFor={htmlId}>
              <Input
                id={htmlId}
                type="number"
                min={0}
                placeholder={tx("plan_default_59b8c2", { defaultValue: "Plan default" })}
                value={overrides.overrides[key] ?? ''}
                onChange={(e) =>
                  overrides.setOverrides((o) => ({ ...o, [key]: e.target.value ? Number(e.target.value) : null }))
                }
                className="h-8 text-[14px]"
              />
            </FormField>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" onClick={overrides.handleSaveOverrides} disabled={overrides.savingOverrides}>
            {overrides.savingOverrides ? tx("saving_ae7e88", { defaultValue: "Saving..." }) : tx("save_overrides_7a8d3c", { defaultValue: "Save Overrides" })}
          </Button>
          <Button variant="outline" size="sm" onClick={overrides.handleClearOverrides}>{tx("clear_all_3a88a6", { defaultValue: "Clear All" })}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
