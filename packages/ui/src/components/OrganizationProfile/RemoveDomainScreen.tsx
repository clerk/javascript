import { useActionContext } from '../../elements/Action/ActionRoot';
import { RemoveDomainForm } from './RemoveDomainForm';

type RemoveDomainScreenProps = { domainId: string };
export const RemoveDomainScreen = (props: RemoveDomainScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemoveDomainForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};
