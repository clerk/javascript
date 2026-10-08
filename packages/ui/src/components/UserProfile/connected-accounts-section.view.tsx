import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { ProviderIcon } from '@/ui/common';
import { Box, Button, descriptors, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { Card } from '@/ui/elements/Card';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import type {
  useConnectedAccountController,
  useConnectedAccountsSectionController,
} from './connected-accounts-section.controller';

export const ConnectedAccountsSectionView = ({
  controller,
  items,
  addMenu,
}: {
  controller: ReturnType<typeof useConnectedAccountsSectionController>;
  items: ReactNode;
  addMenu: ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.connectedAccountsSection.title')}
    centered={false}
    id='connectedAccounts'
  >
    <Card.Alert>{controller.error}</Card.Alert>
    <Action.Root
      value={controller.actionValue}
      onChange={controller.setActionValue}
    >
      <ProfileSection.ItemList id='connectedAccounts'>{items}</ProfileSection.ItemList>
      {addMenu}
    </Action.Root>
  </ProfileSection.Root>
);

export const ConnectedAccountView = ({
  controller,
  removeScreen,
}: {
  controller: ReturnType<typeof useConnectedAccountController>;
  removeScreen: ReactNode;
}) => (
  <Fragment key={controller.id}>
    <ProfileSection.Item id='connectedAccounts'>
      <Flex
        align='center'
        sx={theme => ({ overflow: 'hidden', gap: theme.space.$2 })}
      >
        <ProviderIcon
          id={controller.provider}
          iconUrl={controller.providerIconUrl}
          name={controller.providerName}
          alt={controller.providerName}
          elementDescriptor={descriptors.providerIcon}
          elementId={descriptors.socialButtonsProviderIcon.setId(controller.provider)}
          sx={{ flexShrink: 0 }}
        />
        <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <Flex
            gap={1}
            center
          >
            <Text sx={theme => ({ color: theme.colors.$colorForeground })}>{`${controller.providerName}`}</Text>
            <Text
              truncate
              as='span'
              colorScheme='secondary'
            >
              {controller.label ? `• ${controller.label}` : ''}
            </Text>
          </Flex>
        </Box>
      </Flex>

      <ThreeDotsMenu actions={controller.actions} />
    </ProfileSection.Item>
    {controller.shouldDisplayReconnect && (
      <Box
        sx={theme => ({
          padding: `${theme.sizes.$none} ${theme.sizes.$none} ${theme.sizes.$1x5} ${theme.sizes.$8x5}`,
        })}
      >
        <Text
          colorScheme='secondary'
          sx={theme => ({
            paddingInlineEnd: theme.sizes.$1x5,
            display: 'inline-block',
          })}
          localizationKey={localizationKeys('userProfile.start.connectedAccountsSection.subtitle__disconnected')}
        />

        <Button
          sx={{ display: 'inline-block' }}
          onClick={() => void controller.reconnect()}
          variant='link'
          localizationKey={localizationKeys('userProfile.start.connectedAccountsSection.actionLabel__connectionFailed')}
        />
      </Box>
    )}

    {controller.hasErrorCode && !controller.shouldDisplayReconnect && (
      <Text
        colorScheme='danger'
        sx={theme => ({
          padding: `${theme.sizes.$none} ${theme.sizes.$1x5} ${theme.sizes.$1x5} ${theme.sizes.$8x5}`,
        })}
      >
        {controller.fallbackErrorMessage}
      </Text>
    )}

    <Action.Open value={`remove-${controller.id}`}>
      <Action.Card variant='destructive'>{removeScreen}</Action.Card>
    </Action.Open>
  </Fragment>
);
