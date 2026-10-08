import { useStatementPageModel } from './statement-page.model';
import { StatementPageView } from './statement-page.view';

export const StatementPage = () => {
  const model = useStatementPageModel();
  return <StatementPageView {...model} />;
};
