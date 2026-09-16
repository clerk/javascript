import * as stylex from '@stylexjs/stylex';

import { Banner } from '../../../components/banner';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Spinner } from '../../../components/spinner';
import { Text } from '../../../components/text';
import { fill, rich } from '../../../utils/messages';
import { styles as profileStyles } from '../user-profile-profile-panel.styles';
import { userProfileVerifyEmailLinkMessages as m } from './user-profile-verify-email-link.messages';
import { styles } from './user-profile-verify-email-link.styles';

export interface UserProfileVerifyEmailLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  emailAddress: string;
  onResend: () => void;
  isResending?: boolean;
  resendSeconds?: number;
  errorMessage?: string;
}

export function UserProfileVerifyEmailLinkDialog({
  open,
  onOpenChange,
  trigger,
  emailAddress,
  onResend,
  isResending = false,
  resendSeconds = 0,
  errorMessage,
}: UserProfileVerifyEmailLinkDialogProps) {
  return (
    <Dialog.Root
      dismissOn='escape'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup variant='card'>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.title}</Card.Title>
          </Card.Header>
          <Card.Content xstyle={styles.content}>
            {errorMessage ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{errorMessage}</Banner.Label>
              </Banner.Root>
            ) : null}
            <div
              role='status'
              {...stylex.props(styles.status)}
            >
              <Spinner size='sm' />
              <Text xstyle={styles.emphasis}>{m.waiting}</Text>
            </div>
            <div {...stylex.props(styles.details)}>
              <Card.Description>{fill(m.description, { emailAddress })}</Card.Description>
              <Button
                type='button'
                size='sm'
                variant='link'
                color='neutral'
                disabled={isResending || resendSeconds > 0}
                onClick={onResend}
              >
                {isResending ? (
                  m.resending
                ) : resendSeconds > 0 ? (
                  <span>
                    {rich(m.resendCountdown, {
                      values: { seconds: <span {...stylex.props(profileStyles.countdown)}>{resendSeconds}</span> },
                    })}
                  </span>
                ) : (
                  m.resend
                )}
              </Button>
            </div>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                />
              }
            >
              {m.cancel}
            </Dialog.Close>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
