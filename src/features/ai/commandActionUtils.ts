import type { TFunction } from 'i18next';
import {ArrowUpDown, CircleHelp,
  Copy, FileText, FolderMinus, FolderPen, Hash, Image as ImageIcon, LogIn, LogOut, MapPin, Minus, Package, Palette, PenLine, Pin, PinOff,
  Plus, Tag, Trash2, Undo2,
} from 'lucide-react';
import type { Terminology } from '@/lib/terminology';
import type { CommandAction } from './useCommand';

/**
 * The i18next `t` bound to the 'ui' namespace. Taken as a parameter rather than
 * read from a hook so describeAction() stays a plain function that the tests
 * and the non-React call sites can use.
 */
type Translate = TFunction<'ui'>;

export function isBinCreatingAction(action: CommandAction): boolean {
  return action.type === 'create_bin' || action.type === 'duplicate_bin';
}

/**
 * Fill in missing `bin_name` (and `target_bin_name` for return_item) on AI
 * command actions using a local bin_id → bin name map. Providers (notably
 * Gemini) sometimes omit these optional fields even though the system prompt
 * and few-shot examples require them — the raw JSON is otherwise shown to the
 * user as `Delete "undefined"`. Pure function: does not mutate input.
 */
export function enrichActionsWithNames(
  actions: CommandAction[],
  binMap: Map<string, { name: string }>,
): CommandAction[] {
  return actions.map((action) => {
    let next = action;
    if ('bin_id' in action && typeof action.bin_id === 'string') {
      const hasName = 'bin_name' in action && typeof (action as { bin_name?: unknown }).bin_name === 'string' && (action as { bin_name: string }).bin_name.length > 0;
      if (!hasName) {
        const name = binMap.get(action.bin_id)?.name;
        if (name) next = { ...action, bin_name: name } as CommandAction;
      }
    }
    if (next.type === 'return_item' && next.target_bin_id && !next.target_bin_name) {
      const target = binMap.get(next.target_bin_id)?.name;
      if (target) next = { ...next, target_bin_name: target };
    }
    return next;
  });
}

/** Read bin_name from action, falling back to a readable placeholder. */
/** Falls back to a generic placeholder when bin_name is missing AND no map entry resolves it. */
function resolveBinName(action: CommandAction, t: Terminology, tx: Translate): string {
  const name = (action as { bin_name?: unknown }).bin_name;
  return typeof name === 'string' && name.length > 0
    ? name
    : tx('aiAction_unknownBin', { term: t.bin });
}

export function isDestructiveAction(action: CommandAction): boolean {
  return action.type === 'delete_bin' || action.type === 'remove_items' || action.type === 'remove_tags'
    || action.type === 'delete_area' || action.type === 'unpin_bin';
}

export function getActionIcon(action: CommandAction) {
  switch (action.type) {
    case 'add_items': return Plus;
    case 'remove_items': return Minus;
    case 'modify_item': return FileText;
    case 'set_item_quantity': return Hash;
    case 'create_bin': return Package;
    case 'delete_bin': return Trash2;
    case 'add_tags': return Tag;
    case 'remove_tags': return Tag;
    case 'modify_tag': return Tag;
    case 'set_area': return MapPin;
    case 'set_notes': return FileText;
    case 'set_icon': return ImageIcon;
    case 'set_color': return Palette;
    case 'update_bin': return PenLine;
    case 'restore_bin': return Undo2;
    case 'duplicate_bin': return Copy;
    case 'pin_bin': return Pin;
    case 'unpin_bin': return PinOff;
    case 'rename_area': return FolderPen;
    case 'delete_area': return FolderMinus;
    case 'set_tag_color': return Palette;
    case 'reorder_items': return ArrowUpDown;
    case 'checkout_item': return LogOut;
    case 'return_item': return LogIn;
    default: return CircleHelp;
  }
}

export function describeAction(action: CommandAction, t: Terminology, tx: Translate): string {
  const binName = resolveBinName(action, t, tx);
  switch (action.type) {
    case 'add_items':
      return tx('aiAction_addItems', {
        binName,
        items: action.items
          .map((i) => (typeof i === 'string' ? i : i.quantity ? `${i.name} (\u00d7${i.quantity})` : i.name))
          .join(', '),
      });
    case 'remove_items':
      return tx('aiAction_removeItems', { binName, items: action.items.join(', ') });
    case 'modify_item':
      return tx('aiAction_modifyItem', { binName, oldItem: action.old_item, newItem: action.new_item });
    case 'set_item_quantity':
      return action.quantity <= 0
        ? tx('aiAction_removeItem', { binName, itemName: action.item_name })
        : tx('aiAction_setQuantity', { binName, itemName: action.item_name, quantity: action.quantity });
    case 'create_bin': {
      let desc = tx('aiAction_createBin', { term: t.bin, name: action.name });
      if (action.area_name) desc += tx('aiAction_createBinInArea', { areaName: action.area_name });
      if (action.items?.length) desc += tx('ai_actionWithItems', { count: action.items.length });
      return desc;
    }
    case 'delete_bin':
      return tx('aiAction_deleteBin', { binName });
    case 'add_tags':
      return tx('ai_actionAddTags', { count: action.tags.length, tags: action.tags.join(', '), binName });
    case 'remove_tags':
      return tx('ai_actionRemoveTags', { count: action.tags.length, tags: action.tags.join(', '), binName });
    case 'modify_tag':
      return tx('aiAction_modifyTag', { binName, oldTag: action.old_tag, newTag: action.new_tag });
    case 'set_area':
      return tx('aiAction_setArea', { binName, term: t.area, areaName: action.area_name });
    case 'set_notes':
      if (action.mode === 'clear') return tx('aiAction_clearNotes', { binName });
      if (action.mode === 'append') return tx('aiAction_appendNotes', { binName });
      return tx('aiAction_setNotes', { binName });
    case 'set_icon':
      return tx('aiAction_setIcon', { binName, icon: action.icon });
    case 'set_color':
      return tx('aiAction_setColor', { binName, color: action.color });
    case 'update_bin': {
      const fields = (['name', 'notes', 'tags', 'area_name', 'icon', 'color', 'visibility'] as const)
        .filter((f) => (action as Record<string, unknown>)[f] !== undefined)
        .map((f) => tx(`aiField_${f}`));
      return tx('aiAction_updateBin', { binName, fields: fields.join(', ') });
    }
    case 'restore_bin':
      return tx('aiAction_restoreBin', { binName });
    case 'duplicate_bin':
      return action.new_name
        ? tx('aiAction_duplicateBinAs', { binName, newName: action.new_name })
        : tx('aiAction_duplicateBin', { binName });
    case 'pin_bin':
      return tx('aiAction_pinBin', { binName });
    case 'unpin_bin':
      return tx('aiAction_unpinBin', { binName });
    case 'rename_area':
      return tx('aiAction_renameArea', { term: t.area, areaName: action.area_name, newName: action.new_name });
    case 'delete_area':
      return tx('aiAction_deleteArea', { term: t.area, areaName: action.area_name });
    case 'set_tag_color':
      return tx('aiAction_setTagColor', { tag: action.tag, color: action.color });
    case 'reorder_items':
      return tx('aiAction_reorderItems', { binName });
    case 'checkout_item':
      return tx('aiAction_checkoutItem', { binName, itemName: action.item_name });
    case 'return_item':
      return tx('aiAction_returnItem', {
        itemName: action.item_name,
        binName: action.target_bin_name || binName,
      });
    default:
      return tx('aiAction_unknown', { type: (action as Record<string, unknown>).type });
  }
}
