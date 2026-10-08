import { useAccountCreditsModel } from './account-credits.model';
import { AccountCreditsView } from './account-credits.view';

export const AccountCredits = () => {
  const model = useAccountCreditsModel();

  if (model.status !== 'ready') {
    return null;
  }

  const { status: _status, ...viewProps } = model;
  return <AccountCreditsView {...viewProps} />;
};
