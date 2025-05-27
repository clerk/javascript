import { SubscriberTypeContext } from '../../contexts';
import { StatementPage } from '../Statements';

export const OrganizationStatementPage = () => {
  return (
    <SubscriberTypeContext.Provider value='org'>
      <StatementPage />
    </SubscriberTypeContext.Provider>
  );
};
