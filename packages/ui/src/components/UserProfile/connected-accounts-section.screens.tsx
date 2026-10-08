import { useActionContext } from '@/ui/elements/Action/ActionRoot';

import { RemoveConnectedAccountForm } from './RemoveResourceForm';

export const RemoveConnectedAccountScreen = ({ accountId }: { accountId: string }) => {
  const { close } = useActionContext();
  return (
    <RemoveConnectedAccountForm
      onSuccess={close}
      onReset={close}
      accountId={accountId}
    />
  );
};
