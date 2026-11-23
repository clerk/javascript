import { Card } from '../../components/card';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';
import { styles } from './auth.styles';
import type { AuthEmailLinkStatusValue as Status } from './auth.types';

interface StatusCopy {
  title: string;
  description: string;
}

export interface AuthEmailLinkStatusMessages {
  loading: StatusCopy;
  signedIn: StatusCopy;
  signedInOtherTab: StatusCopy;
  transferable: StatusCopy;
  expired: StatusCopy;
  failed: StatusCopy;
  clientMismatch: StatusCopy;
  closeTab: string;
}

const statusCopy = {
  loading: 'loading',
  'signed-in': 'signedIn',
  'signed-in-other-tab': 'signedInOtherTab',
  transferable: 'transferable',
  expired: 'expired',
  failed: 'failed',
  'client-mismatch': 'clientMismatch',
} as const satisfies Record<Status, keyof AuthEmailLinkStatusMessages>;

interface AuthEmailLinkStatusProps {
  messages: AuthEmailLinkStatusMessages;
  status: Status;
  globalErrorMessage?: string;
}

export function AuthEmailLinkStatus({ messages, status, globalErrorMessage }: AuthEmailLinkStatusProps) {
  const copy = messages[statusCopy[status]];

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
        {status === 'loading' ? <Spinner /> : <Text color='foreground-secondary'>{messages.closeTab}</Text>}
      </Card.Content>
    </>
  );
}
