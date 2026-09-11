import { Banner } from '../components/banner';
import { Button } from '../components/button';
import { Card } from '../components/card';
import type { DialogTriggerProps } from '../components/dialog';
import { Dialog } from '../components/dialog';
import { Icon } from '../components/icon';
import { Item } from '../components/item';
import { Spinner } from '../components/spinner';
import { fill } from './user-profile-account-section/user-profile-account-section.messages';
import { UserProfileProviderIcon } from './user-profile-provider-icon';
import { userProfileVerifyEmailSsoMessages as m } from './user-profile-verify-email-sso.messages';

export interface UserProfileVerifyEmailSsoViewProps {
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

export function UserProfileVerifyEmailSsoView({
  open,
  onOpenChange,
  trigger,
  emailAddress,
  connection,
  onConnect,
  isConnecting = false,
  errorMessage,
}: UserProfileVerifyEmailSsoViewProps) {
  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup size='card'>
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
            <Item.Root style={{ paddingInline: 0 }}>
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
                      name='arrow-right-top'
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
