import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type PromptTab = 'analysis' | 'command' | 'query' | 'structure' | 'reorganization' | 'tagSuggestion';

const V = ({ children }: { children: string }) => (
  <code className="text-[var(--text-xs)] px-1 py-0.5 rounded bg-[var(--bg-input)]">{children}</code>
);

function PromptHelp({ tab }: { tab: PromptTab }) {
  const { t: tx } = useTranslation('ui');
  const content: Record<PromptTab, ReactNode> = {
  analysis: <>{tx("existing_tags_and_custom_fields_are_passed_automatically_in__541779", { defaultValue: "Existing tags and custom fields are passed automatically in the user message. This prompt defines the instructions only." })}</>,
  command: <>{tx("inventory_context_bins_items_areas_tags_colors_icons_is_pass_8b2001", { defaultValue: "Inventory context (bins, items, areas, tags, colors, icons) is passed automatically. This prompt defines the instructions only." })}</>,
  query: <>{tx("inventory_context_bins_items_areas_tags_is_passed_automatica_504326", { defaultValue: "Inventory context (bins, items, areas, tags) is passed automatically. This prompt defines the instructions only." })}</>,
  structure: <>{tx("bin_name_and_existing_items_are_appended_automatically_this__82be81", { defaultValue: "Bin name and existing items are appended automatically. This prompt defines the extraction rules." })}</>,
  reorganization: <>{tx("available_variables_32e2e7", { defaultValue: "Available variables:" })} <V>{'{max_bins_instruction}'}</V> <V>{'{area_instruction}'}</V> <V>{'{strictness_instruction}'}</V> <V>{'{granularity_instruction}'}</V> <V>{'{duplicates_instruction}'}</V> <V>{'{ambiguous_instruction}'}</V> <V>{'{outliers_instruction}'}</V> <V>{'{items_per_bin_instruction}'}</V> <V>{'{notes_instruction}'}</V>{tx("existing_tags_are_passed_automatically_in_the_user_message_b9fc9f", { defaultValue: ". Existing tags are passed automatically in the user message." })}</>,
  tagSuggestion: <>{tx("governs_ai_tag_suggestions_tags_mode_on_the_reorganize_page__59fa75", { defaultValue: "Governs AI tag suggestions (Tags mode on the Reorganize page). The model sees the full tag vocabulary of the location plus a list of bins with items/area/existing tags, and proposes a cleaner taxonomy and per-bin assignments. Available variables:" })} <V>{'{change_level_instruction}'}</V> <V>{'{granularity_instruction}'}</V> <V>{'{tag_count_instruction}'}</V> <V>{'{notes_instruction}'}</V>.</>,
};

  return <>{content[tab]}</>;
}

export const PROMPT_HELP_TEXT: Record<PromptTab, ReactNode> = {
  analysis: <PromptHelp tab="analysis" />,
  command: <PromptHelp tab="command" />,
  query: <PromptHelp tab="query" />,
  structure: <PromptHelp tab="structure" />,
  reorganization: <PromptHelp tab="reorganization" />,
  tagSuggestion: <PromptHelp tab="tagSuggestion" />,
};
