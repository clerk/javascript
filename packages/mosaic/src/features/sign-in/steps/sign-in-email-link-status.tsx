import { Card } from '../../../components/card';
import { Spinner } from '../../../components/spinner';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';
import type { SignInStep } from '../sign-in.types';
import { emailLinkStatusCopy } from '../sign-in.utils';

interface SignInEmailLinkStatusProps {
  step: Extract<SignInStep, { purpose: 'email-link-status' }>;
  globalErrorMessage?: string;
}

export function SignInEmailLinkStatus({ step, globalErrorMessage }: SignInEmailLinkStatusProps) {
  const m = useMessages('signIn');
  const copy = emailLinkStatusCopy(step, m);

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
        {step.status === 'loading' ? <Spinner /> : <Text color='foreground-secondary'>{m.emailLink.closeTab}</Text>}
      </Card.Content>
    </>
  );
}
