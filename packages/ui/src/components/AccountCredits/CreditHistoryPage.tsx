import { useCreditHistoryModel } from './credit-history.model';
import { CreditHistoryView } from './credit-history.view';

export const CreditHistoryPage = (): JSX.Element => {
  const model = useCreditHistoryModel();
  return <CreditHistoryView {...model} />;
};
