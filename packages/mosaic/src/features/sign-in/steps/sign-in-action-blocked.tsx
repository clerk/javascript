import { Card } from '../../../components/card';
import { Link } from '../../../components/link';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import type { SignInActionBlockedDetails } from '../sign-in.types';
import { styles } from '../sign-in.styles';

interface SignInActionBlockedProps {
  details?: SignInActionBlockedDetails;
}

export function SignInActionBlocked({ details }: SignInActionBlockedProps) {
  const m = useMessages('signIn').actionBlocked;
  const href = details?.linkUrl;

  return (
    <>
      <Card.Header>
        <Card.Title>{details?.title ?? m.title}</Card.Title>
        <Card.Description>{details?.description ?? m.description}</Card.Description>
      </Card.Header>
      {href || details?.traceId ? (
        <Card.Content xstyle={styles.fieldStack}>
          {href ? (
            <Link
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              size='sm'
            >
              {details?.linkText ?? href}
            </Link>
          ) : null}
          {details?.traceId ? (
            <Text
              size='sm'
              color='foreground-secondary'
            >
              {m.traceIdLabel}{' '}
              <Text
                render={<span />}
                size='sm'
                xstyle={styles.traceId}
              >
                {details.traceId}
              </Text>
            </Text>
          ) : null}
        </Card.Content>
      ) : null}
    </>
  );
}
