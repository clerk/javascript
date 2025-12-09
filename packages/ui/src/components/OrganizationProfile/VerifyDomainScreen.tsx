import { useActionContext } from '../../elements/Action/ActionRoot';
import { VerifyDomainForm } from './VerifyDomainForm';

type VerifyDomainScreenProps = { domainId: string };
export const VerifyDomainScreen = (props: VerifyDomainScreenProps) => {
  const { close } = useActionContext();
  return (
    <VerifyDomainForm
      onSuccess={close}
      onReset={close}
      skipToVerified={false}
      {...props}
    />
  );
};
