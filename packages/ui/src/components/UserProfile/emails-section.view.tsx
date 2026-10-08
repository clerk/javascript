import { Fragment } from 'react';

import { Badge, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import type { useEmailMenuController, useEmailsSectionController } from './emails-section.controller';
import { EmailMenu, EmailScreen, RemoveEmailScreen } from './emails-section.screens';

type Controller = ReturnType<typeof useEmailsSectionController>;
type MenuController = ReturnType<typeof useEmailMenuController>;

export const EmailMenuView = ({ controller }: { controller: MenuController }) => {
  if (controller.actions.length === 0) {
    return null;
  }
  return <ThreeDotsMenu actions={controller.actions} />;
};

export const EmailsSectionView = ({ controller }: { controller: Controller }) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.emailAddressesSection.title')}
    centered={false}
    id='emailAddresses'
  >
    <Action.Root>
      <ProfileSection.ItemList id='emailAddresses'>
        {controller.emails.map(email => (
          <Fragment key={email.emailAddress}>
            <ProfileSection.Item id='emailAddresses'>
              <Flex sx={t => ({ overflow: 'hidden', gap: t.space.$1, alignItems: 'center' })}>
                <Text
                  sx={t => ({ color: t.colors.$colorForeground })}
                  truncate
                >
                  {email.emailAddress}
                </Text>
                {email.isPrimary && <Badge localizationKey={localizationKeys('badge__primary')} />}
                {!email.isVerified && <Badge localizationKey={localizationKeys('badge__unverified')} />}
              </Flex>
              <EmailMenu
                emailId={email.id}
                isVerified={email.isVerified}
                shouldAllowDeletion={controller.shouldAllowDeletion}
              />
            </ProfileSection.Item>

            <Action.Open value={`remove-${email.id}`}>
              <Action.Card variant='destructive'>
                <RemoveEmailScreen emailId={email.id} />
              </Action.Card>
            </Action.Open>

            <Action.Open value={`verify-${email.id}`}>
              <Action.Card>
                <EmailScreen emailId={email.id} />
              </Action.Card>
            </Action.Open>
          </Fragment>
        ))}
        {controller.shouldAllowCreation && (
          <>
            <Action.Trigger value='add'>
              <ProfileSection.ArrowButton
                id='emailAddresses'
                localizationKey={localizationKeys('userProfile.start.emailAddressesSection.primaryButton')}
              />
            </Action.Trigger>
            <Action.Open value='add'>
              <Action.Card>
                <EmailScreen />
              </Action.Card>
            </Action.Open>
          </>
        )}
      </ProfileSection.ItemList>
    </Action.Root>
  </ProfileSection.Root>
);
