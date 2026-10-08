import { useStatements, useSubscriberTypeLocalizationRoot } from '@/contexts';
import { formatDate } from '@/ui/utils/formatDate';

import { useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import type { StatementsListData } from './statements.types';

export const useStatementsListModel = (): StatementsListData => {
  const { data: statements, isLoading, count } = useStatements();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { $ } = useLocalizations();
  const { navigate } = useRouter();

  return {
    isLoading,
    count,
    localizationRoot,
    rows: statements.map(statement => {
      const id = statement.id;
      return {
        id,
        date: formatDate(statement.timestamp, 'monthyear'),
        amount: $(statement.totals.grandTotal),
        onClick: () => void navigate(`statement/${id}`),
      };
    }),
  };
};
