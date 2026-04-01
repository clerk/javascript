import { SubscriberTypeContext } from '../../contexts';
import { StatementPage } from '../Statements';

export const OrganizationStatementPage = () => {
  return (
    <SubscriberTypeContext.Provider value='organization'>
      <StatementPage />
    </SubscriberTypeContext.Provider>
  );
};
