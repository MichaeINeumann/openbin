import type { TFunction } from 'i18next';
import {
  ArrowRightLeft,
  Image,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserMinus,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import type { Terminology } from '@/lib/terminology';
import type activityMessages from '@/locales/en/activity.json';
import type { ActivityLogEntry } from '@/types';

export type EntityTypeFilter = '' | 'bin' | 'area' | 'member' | 'location';

export const ENTITY_TYPE_FILTERS: { value: EntityTypeFilter; label: string; tKey?: keyof Terminology }[] = [
  { value: '', label: 'All' },
  { value: 'bin', label: 'Bins', tKey: 'Bins' },
  { value: 'area', label: 'Areas', tKey: 'Areas' },
  { value: 'member', label: 'Members' },
  { value: 'location', label: 'Location', tKey: 'Location' },
];

export function getActionIcon(entry: ActivityLogEntry): ReactNode {
  const cls = 'h-3 w-3';
  const { action, entity_type } = entry;
  if (action === 'create') return createElement(Plus, { className: cls });
  if (action === 'update') return createElement(Pencil, { className: cls });
  if (action === 'delete' || action === 'permanent_delete') return createElement(Trash2, { className: cls });
  if (action === 'restore') return createElement(RotateCcw, { className: cls });
  if (action === 'add_photo') return createElement(Image, { className: cls });
  if (action === 'delete_photo') return createElement(Image, { className: cls });
  if (action === 'move_in' || action === 'move_out') return createElement(ArrowRightLeft, { className: cls });
  if (action === 'join') return createElement(LogIn, { className: cls });
  if (action === 'leave') return createElement(LogOut, { className: cls });
  if (action === 'remove_member') return createElement(UserMinus, { className: cls });
  if (action === 'change_role') return createElement(Users, { className: cls });
  if (action === 'regenerate_invite') return createElement(RotateCcw, { className: cls });
  if (entity_type === 'area') return createElement(MapPin, { className: cls });
  if (entity_type === 'member') return createElement(Users, { className: cls });
  return createElement(Package, { className: cls });
}

export function getActionColor(action: string): string {
  if (action === 'create') return 'text-[var(--color-success)]';
  if (action === 'delete' || action === 'permanent_delete') return 'text-[var(--destructive)]';
  if (action === 'restore') return 'text-[var(--accent)]';
  if (action === 'update') return 'text-[var(--color-warning)]';
  if (action === 'move_in' || action === 'move_out') return 'text-[var(--color-info)]';
  return 'text-[var(--text-tertiary)]';
}

const ACTION_BADGE_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  permanent_delete: 'Deleted',
  restore: 'Restored',
  add_photo: 'Photo',
  delete_photo: 'Photo',
  move_in: 'Moved',
  move_out: 'Moved',
  join: 'Joined',
  leave: 'Left',
  remove_member: 'Removed',
  change_role: 'Role',
  regenerate_invite: 'Invite',
};

export function getActionBadgeLabel(action: string, translate?: TFunction<'activity'>): string {
  if (Object.keys(ACTION_BADGE_LABELS).includes(action)) {
    const key = `badge_${action}` as keyof typeof activityMessages;
    return translate ? translate(key, { defaultValue: ACTION_BADGE_LABELS[action] }) : ACTION_BADGE_LABELS[action];
  }
  return action.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function getActionLabel(entry: ActivityLogEntry, t: Terminology, translate?: TFunction<'activity'>): string {
  const name = entry.entity_name ? `"${entry.entity_name}"` : '';
  const { action, entity_type } = entry;
  const actionKeys: Record<string, keyof typeof activityMessages> = {
    "create": 'create',
    "update": 'update',
    "delete": 'delete',
    "restore": 'restore',
    "permanent_delete": 'permanent_delete',
    "move": 'move',
    "add_photo": 'add_photo',
    "delete_photo": 'delete_photo',
    "join": 'join',
    "leave": 'leave',
    "remove_member": 'remove_member',
    "change_role": 'change_role',
    "regenerate_invite": 'regenerate_invite',
    move_in: 'move', move_out: 'move',
  };
  if (translate && actionKeys[action]) {
    return translate(actionKeys[action], {
      entity: entity_type === 'bin' ? t.bin : entity_type === 'area' ? t.area : t.location,
      name, from: entry.changes?.location?.old ?? '?', to: entry.changes?.location?.new ?? '?',
      defaultValue: getActionLabel(entry, t),
    });
  }


  if (entity_type === 'bin') {
    if (action === 'create') return `created ${t.bin} ${name}`;
    if (action === 'update') return `updated ${t.bin} ${name}`;
    if (action === 'delete') return `deleted ${t.bin} ${name}`;
    if (action === 'restore') return `restored ${t.bin} ${name}`;
    if (action === 'permanent_delete') return `permanently deleted ${t.bin} ${name}`;
    if (action === 'move_in' || action === 'move_out') {
      const from = entry.changes?.location?.old;
      const to = entry.changes?.location?.new;
      return `moved ${t.bin} ${name} from ${from ?? '?'} to ${to ?? '?'}`;
    }
    if (action === 'add_photo') return `added photo to ${t.bin} ${name}`;
    if (action === 'delete_photo') return `removed photo from ${t.bin} ${name}`;
  }
  if (entity_type === 'area') {
    if (action === 'create') return `created ${t.area} ${name}`;
    if (action === 'update') return `renamed ${t.area} to ${name}`;
    if (action === 'delete') return `deleted ${t.area} ${name}`;
  }
  if (entity_type === 'member') {
    if (action === 'join') return `joined the ${t.location}`;
    if (action === 'leave') return `left the ${t.location}`;
    if (action === 'remove_member') return `removed ${name}`;
    if (action === 'change_role') return `changed role for ${name}`;
  }
  if (entity_type === 'location') {
    if (action === 'create') return `created ${t.location} ${name}`;
    if (action === 'update') return `updated ${t.location} ${name}`;
    if (action === 'regenerate_invite') return `regenerated invite code`;
  }

  return `${action} ${entity_type} ${name}`;
}

const ITEM_FIELDS = new Set(['items_added', 'items_removed', 'items_renamed', 'items']);
const SKIP_FIELDS = new Set(['location', 'area_id', 'items_quantity']);

export function renderChangeDiff(entry: ActivityLogEntry, translate?: TFunction<'activity'>, terms?: Terminology): { field: string; old: string; new: string }[] | null {
  if (!entry.changes) return null;

  const fieldDiffs = Object.entries(entry.changes)
    .filter(([f]) => !ITEM_FIELDS.has(f) && !SKIP_FIELDS.has(f))
    .map(([field, diff]) => {
      const label =
        field === 'area' ? terms?.area ?? 'area' :
          Object.keys(SCALAR_LABEL_MAP).includes(field) || field === 'role'
            ? translate?.(`field_${field}` as keyof typeof activityMessages, { defaultValue: field === 'card_style' ? 'style' : field }) ?? (field === 'card_style' ? 'style' : field)
            : field;
      const formatVal = (val: unknown) => {
        if (field === 'card_style') {
          try {
            const parsed = typeof val === 'string' ? JSON.parse(val) : val;
            return (parsed?.variant as string) || 'default';
          } catch {
            return String(val || 'default');
          }
        }
        return val == null ? (translate?.('empty_value', { defaultValue: 'none' }) ?? 'none') : String(val);
      };
      return { field: label, old: formatVal(diff.old), new: formatVal(diff.new) };
    });

  const itemDiffs: { field: string; old: string; new: string }[] = [];
  const c = entry.changes;

  if (c.items_added) {
    const added = c.items_added.new as string[] | null;
    if (added && added.length > 0) {
      itemDiffs.push({ field: (translate?.('added_items', { defaultValue: '+ items' }) ?? '+ items'), old: '', new: added.join(', ') });
    }
  }
  if (c.items_removed) {
    const removed = c.items_removed.old as string[] | null;
    if (removed && removed.length > 0) {
      itemDiffs.push({ field: (translate?.('removed_items', { defaultValue: '− items' }) ?? '− items'), old: removed.join(', '), new: '' });
    }
  }
  if (c.items_renamed) {
    const renamed = c.items_renamed;
    if (Array.isArray(renamed.new)) {
      for (const pair of renamed.new as Array<{ old: string; new: string }>) {
        itemDiffs.push({ field: (translate?.('renamed', { defaultValue: 'renamed' }) ?? 'renamed'), old: String(pair.old), new: String(pair.new) });
      }
    } else {
      itemDiffs.push({
        field: (translate?.('renamed', { defaultValue: 'renamed' }) ?? 'renamed'),
        old: String(renamed.old ?? ''),
        new: String(renamed.new ?? ''),
      });
    }
  }

  const allDiffs = [...fieldDiffs, ...itemDiffs];
  return allDiffs.length > 0 ? allDiffs : null;
}

export function getEntityDescription(entry: ActivityLogEntry, t: Terminology, translate?: TFunction<'activity'>): string {
  const name = entry.entity_name ? `"${entry.entity_name}"` : '';
  const { action, entity_type } = entry;

  if (entity_type === 'bin') {
    if (action === 'move_in' || action === 'move_out') {
      const from = entry.changes?.location?.old;
      const to = entry.changes?.location?.new;
      return translate ? translate('entity_move', { entity: t.bin, name, from: from ?? '?', to: to ?? '?', defaultValue: `${t.bin} ${name} from ${from ?? '?'} to ${to ?? '?'}` }) : `${t.bin} ${name} from ${from ?? '?'} to ${to ?? '?'}`;
    }
    if (action === 'add_photo' || action === 'delete_photo') {
      return translate ? translate('entity_photo', { entity: t.bin, name, defaultValue: `photo on ${t.bin} ${name}` }) : `photo on ${t.bin} ${name}`;
    }
    return `${t.bin} ${name}`;
  }
  if (entity_type === 'area') return `${t.area} ${name}`;
  if (entity_type === 'member') {
    if (action === 'join') return translate ? translate('entity_location', { entity: t.location, defaultValue: `the ${t.location}` }) : `the ${t.location}`;
    if (action === 'leave') return translate ? translate('entity_location', { entity: t.location, defaultValue: `the ${t.location}` }) : `the ${t.location}`;
    if (action === 'remove_member') return name;
    if (action === 'change_role') return translate ? translate('entity_role', { name, defaultValue: `role for ${name}` }) : `role for ${name}`;
    return name;
  }
  if (entity_type === 'location') {
    if (action === 'regenerate_invite') return translate?.('invite_code', { defaultValue: 'invite code' }) ?? 'invite code';
    return `${t.location} ${name}`;
  }
  return `${entity_type} ${name}`;
}

type ScalarField = 'name' | 'notes' | 'tags' | 'icon' | 'color' | 'visibility' | 'card_style';

const SCALAR_LABEL_MAP: Record<ScalarField, string> = {
  name: 'name',
  notes: 'notes',
  tags: 'tags',
  icon: 'icon',
  color: 'color',
  visibility: 'visibility',
  card_style: 'style',
};

export function getChangedFieldLabels(entry: ActivityLogEntry, t: Terminology, translate?: TFunction<'activity'>): string[] {
  if (entry.action !== 'update' || entry.entity_type !== 'bin' || !entry.changes) {
    return [];
  }

  const labels: string[] = [];

  for (const [field, diff] of Object.entries(entry.changes)) {
    if (field === 'location' || field === 'area_id') continue;

    if (field === 'area') {
      labels.push(t.area);
      continue;
    }

    if (field === 'items_added') {
      const n = Array.isArray(diff.new) ? diff.new.length : 0;
      if (n > 0) labels.push(translate ? translate('items_added', { count: n, defaultValue: `+${n} item${n === 1 ? '' : 's'}` }) : `+${n} item${n === 1 ? '' : 's'}`);
      continue;
    }

    if (field === 'items_removed') {
      const n = Array.isArray(diff.old) ? (diff.old as unknown[]).length : 0;
      if (n > 0) labels.push(translate ? translate('items_removed', { count: n, defaultValue: `\u2212${n} item${n === 1 ? '' : 's'}` }) : `\u2212${n} item${n === 1 ? '' : 's'}`);
      continue;
    }

    if (field === 'items_renamed') {
      if (Array.isArray(diff.new)) {
        const n = diff.new.length;
        if (n > 0) labels.push(translate ? translate('items_renamed', { count: n, defaultValue: n === 1 ? 'renamed item' : `renamed ${n} items` }) : n === 1 ? 'renamed item' : `renamed ${n} items`);
      } else {
        labels.push(translate?.('items_renamed', { count: 1, defaultValue: 'renamed item' }) ?? 'renamed item');
      }
      continue;
    }

    if (field === 'items_quantity') {
      labels.push(translate?.('quantity', { defaultValue: 'quantity' }) ?? 'quantity');
      continue;
    }

    if (field === 'items') continue; // legacy reorder — no chip

    const scalar = SCALAR_LABEL_MAP[field as ScalarField];
    if (scalar) labels.push(translate?.(`field_${field}` as keyof typeof activityMessages, { defaultValue: scalar }) ?? scalar);
  }

  return labels;
}

/** Only application entity identifiers are localized; names remain untouched. */
export function getEntityTypeLabel(type: string, terms: Terminology, translate: TFunction<'activity'>): string {
  if (type === 'bin') return terms.bin;
  if (type === 'area') return terms.area;
  if (type === 'location') return terms.location;
  if (type === 'member') return translate('member', { defaultValue: 'member' });
  return type;
}
