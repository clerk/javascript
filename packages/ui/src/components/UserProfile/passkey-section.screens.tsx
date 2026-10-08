import { useActionContext } from '@/ui/elements/Action/ActionRoot';

import { RemovePasskeyForm } from './RemoveResourceForm';
import { UpdatePasskeyForm } from './UpdatePasskeyForm';

export const RemovePasskeyScreen = ({ passkeyId }: { passkeyId: string }) => {
  const { close } = useActionContext();
  return (
    <RemovePasskeyForm
      onSuccess={close}
      onReset={close}
      passkeyId={passkeyId}
    />
  );
};

export const UpdatePasskeyScreen = ({ passkeyId }: { passkeyId: string }) => {
  const { close } = useActionContext();
  return (
    <UpdatePasskeyForm
      onSuccess={close}
      onReset={close}
      passkeyId={passkeyId}
    />
  );
};
