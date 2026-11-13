import { Card } from '../../../components/card';
import { Icon, IconFrame } from '../../../components/icon';
import { Spinner } from '../../../components/spinner';
import { Text } from '../../../components/text';
import type { IconComponent } from '../../../icons/glyph';
import { ArrowLeftRight } from '../../../icons/glyphs/arrow-left-right';
import { ExclamationCircle } from '../../../icons/glyphs/exclamation-circle';
import { useMessages } from '../../../localization';
import { statusColors, styles } from '../sign-in.styles';
import type { SignInEmailLinkStatus as Status } from '../sign-in.types';
import { emailLinkStatusCopy } from '../sign-in.utils';

interface SignInEmailLinkStatusProps {
  status: Status;
  globalErrorMessage?: string;
}

const icons: Record<Exclude<Status, 'loading'>, { glyph: IconComponent; color: keyof typeof statusColors }> = {
  'signed-in': { glyph: ArrowLeftRight, color: 'brand' },
  'signed-in-other-tab': { glyph: ArrowLeftRight, color: 'brand' },
  transferable: { glyph: ArrowLeftRight, color: 'brand' },
  expired: { glyph: ExclamationCircle, color: 'warning' },
  failed: { glyph: ExclamationCircle, color: 'negative' },
  'client-mismatch': { glyph: ExclamationCircle, color: 'warning' },
};

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
        {status === 'loading' ? (
          <Spinner />
        ) : (
          <>
            <IconFrame
              filled
              bordered={false}
              size='lg'
              xstyle={statusColors[icons[status].color]}
            >
              <Icon
                glyph={icons[status].glyph}
                size='lg'
              />
            </IconFrame>
            <Text color='foreground-secondary'>{m.emailLink.closeTab}</Text>
          </>
        )}
      </Card.Content>
    </>
  );
}
