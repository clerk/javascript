import { useActionContext } from '../../elements/Action/ActionRoot';
import { VerifiedDomainForm } from './VerifiedDomainForm';

type VerifiedDomainScreenProps = { domainId: string };
export const VerifiedDomainScreen = (props: VerifiedDomainScreenProps) => {
  const { close } = useActionContext();
  return (
    <VerifiedDomainForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};
