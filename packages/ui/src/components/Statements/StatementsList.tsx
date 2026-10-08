import { useStatementsListModel } from './statements-list.model';
import { StatementsListView } from './statements-list.view';

/* -------------------------------------------------------------------------------------------------
 * StatementsList
 * -----------------------------------------------------------------------------------------------*/

export const StatementsList = () => {
  const model = useStatementsListModel();
  return <StatementsListView {...model} />;
};
