import { useTranslation } from 'react-i18next';
import { ItemQueryResults } from './ItemQueryResults';
import { QueryIntroText } from './QueryIntroText';
import type { QueryResult } from './useInventoryQuery';

interface QueryAnswerBodyProps {
  queryResult: QueryResult;
  onBinClick: (binId: string, isTrashed?: boolean) => void;
}

export function QueryAnswerBody({ queryResult, onBinClick }: QueryAnswerBodyProps) {
  const { t: tx } = useTranslation('ui');
  const { answer, matches } = queryResult;
  return (
    <div className="space-y-3">
      <QueryIntroText text={answer} />
      <ItemQueryResults matches={matches} onBinClick={onBinClick} />
      {matches.length === 0 && !answer.trim() && (
        <p className="text-[13px] text-[var(--text-tertiary)] text-center py-2"> {tx("no_matching_bins_found_try_different_terms_or_check_trash_65ccfe", { defaultValue: "No matching bins found. Try different terms or check trash." })} </p>
      )}
    </div>
  );
}
