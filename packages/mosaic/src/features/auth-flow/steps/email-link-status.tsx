import { Card } from '../../../components/card';
import { Spinner } from '../../../components/spinner';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { styles } from '../auth-flow.styles';
import type { AuthFlowEmailLinkState } from '../auth-flow.types';
import { emailLinkStatusCopy } from '../auth-flow.utils';

interface EmailLinkStatusNoticeProps {
  step: AuthFlowEmailLinkState;
  globalErrorMessage?: string;
}

export function EmailLinkStatusNotice({ step, globalErrorMessage }: EmailLinkStatusNoticeProps) {
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
