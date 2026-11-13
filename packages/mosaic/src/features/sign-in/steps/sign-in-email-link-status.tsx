import { Card } from '../../../components/card';
import { Spinner } from '../../../components/spinner';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';
import type { SignInEmailLinkStatus as Status } from '../sign-in.types';
import { emailLinkStatusCopy } from '../sign-in.utils';

interface SignInEmailLinkStatusProps {
  status: Status;
  globalErrorMessage?: string;
}

export function SignInEmailLinkStatus({ status, globalErrorMessage }: SignInEmailLinkStatusProps) {
  const m = useMessages('signIn');
  const copy = emailLinkStatusCopy(status, m);

  return (
    <>
      <Card.Header>
        <Card.Title>{copy.title}</Card.Title>
        <Card.Description>{copy.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content xstyle={styles.status}>
        {status === 'loading' ? <Spinner /> : <Text color='foreground-secondary'>{m.emailLink.closeTab}</Text>}
      </Card.Content>
    </>
  );
}
