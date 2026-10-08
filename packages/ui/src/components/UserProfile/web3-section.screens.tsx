import { useActionContext } from '@/ui/elements/Action/ActionRoot';

import { RemoveWeb3WalletForm } from './RemoveResourceForm';

export const RemoveWeb3WalletScreen = ({ walletId }: { walletId: string }) => {
  const { close } = useActionContext();
  return (
    <RemoveWeb3WalletForm
      onSuccess={close}
      onReset={close}
      walletId={walletId}
    />
  );
};
