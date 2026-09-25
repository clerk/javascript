import { Banner } from '../../../components/banner';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Icon } from '../../../components/icon';
import { Item } from '../../../components/item';
import { Spinner } from '../../../components/spinner';
import { fill, useMessages } from '../../../localization';
import { UserProfileProviderIcon } from '../user-profile-provider-icon';
import { styles } from './user-profile-verify-email-sso.styles';

export interface UserProfileVerifyEmailSsoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  emailAddress: string;
  connection: {
    provider: string;
    domain: string;
    iconUrl?: string;
  };
  onConnect: () => void;
  isConnecting?: boolean;
  errorMessage?: string;
}

export function UserProfileVerifyEmailSsoDialog({
  open,
  onOpenChange,
  trigger,
  emailAddress,
  connection,
  onConnect,
  isConnecting = false,
  errorMessage,
}: UserProfileVerifyEmailSsoDialogProps) {
  const m = useMessages('userProfileVerifyEmailSso');
  return (
    <Dialog.Root
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
            <Card.Description>{fill(m.description, { emailAddress })}</Card.Description>
          </Card.Header>
          <Card.Content>
            {errorMessage ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{errorMessage}</Banner.Label>
              </Banner.Root>
            ) : null}
            <Item.Root xstyle={styles.connection}>
              {connection.iconUrl ? <UserProfileProviderIcon iconUrl={connection.iconUrl} /> : null}
              <Item.Content>
                <Item.Label>{connection.provider}</Item.Label>
                <Item.Description>{fill(m.connectionDescription, { domain: connection.domain })}</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Button
                  type='button'
                  size='sm'
                  disabled={isConnecting}
                  aria-busy={isConnecting}
                  onClick={onConnect}
                >
                  {m.connect}
                  {isConnecting ? (
                    <Spinner size='sm' />
                  ) : (
                    <Icon
                      name='arrow-up-right'
                      placement='inline-end'
                      size='sm'
                    />
                  )}
                </Button>
              </Item.Actions>
            </Item.Root>
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
