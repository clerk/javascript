import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { ProviderIcon } from '@/ui/common';
import { Badge, Box, descriptors, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Animated } from '@/ui/elements/Animated';
import { Card } from '@/ui/elements/Card';
import { ProfileSection } from '@/ui/elements/Section';

import type { EnterpriseConnectionRow, useEnterpriseAccountsSectionModel } from './enterprise-accounts-section.model';
import type { useProfileConnectionController } from './profile-connection.controller';

type Account = NonNullable<ReturnType<typeof useEnterpriseAccountsSectionModel>['accounts']>[number];

const AddMenu = ({ children }: { children: ReactNode }) => (
  <ProfileSection.ActionMenu
    triggerLocalizationKey={localizationKeys('userProfile.start.enterpriseAccountsSection.primaryButton')}
    id='enterpriseAccounts'
  >
    {children}
  </ProfileSection.ActionMenu>
);

export const EnterpriseAccountsSectionView = ({
  error,
  accounts,
  addMenu,
}: {
  error?: string;
  accounts: Account[] | undefined;
  addMenu: ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
    id='enterpriseAccounts'
  >
    <Card.Alert>{error}</Card.Alert>
    <Animated>
      <ProfileSection.ItemList id='enterpriseAccounts'>
        {accounts?.map(account => (
          <EnterpriseAccountView
            key={account.id}
            account={account}
          />
        ))}
      </ProfileSection.ItemList>
      {addMenu}
    </Animated>
  </ProfileSection.Root>
);

EnterpriseAccountsSectionView.AddMenu = AddMenu;

const EnterpriseAccountView = ({ account }: { account: Account }) => (
  <Fragment key={account.id}>
    <ProfileSection.Item id='enterpriseAccounts'>
      <Flex
        align='center'
        sx={theme => ({ overflow: 'hidden', gap: theme.space.$2 })}
      >
        <ProviderIcon
          id={account.providerId}
          iconUrl={account.providerIconUrl}
          name={account.providerName}
          alt={`${account.providerName}'s icon`}
          elementDescriptor={[descriptors.providerIcon]}
          elementId={descriptors.enterpriseButtonsProviderIcon.setId(account.provider)}
          sx={{ flexShrink: 0 }}
        />
        <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <Flex
            gap={1}
            center
          >
            <Text
              truncate
              colorScheme='body'
            >
              {account.connectionName}
            </Text>
            <Text
              truncate
              as='span'
              colorScheme='secondary'
            >
              {account.label ? `• ${account.label}` : ''}
            </Text>
            {account.hasError && (
              <Badge
                colorScheme='danger'
                localizationKey={localizationKeys('badge__requiresAction')}
              />
            )}
          </Flex>
        </Box>
      </Flex>
    </ProfileSection.Item>
  </Fragment>
);

export const EnterpriseConnectButtonView = ({
  controller,
}: {
  controller: EnterpriseConnectionRow & ReturnType<typeof useProfileConnectionController>;
}) => (
  <ProfileSection.ActionMenuItem
    key={controller.id}
    id={controller.id}
    onClick={() => void controller.connect()}
    isDisabled={controller.isDisabled}
    variant='ghost'
    isLoading={controller.isLoading}
    focusRing={false}
    closeAfterClick={false}
    localizationKey={localizationKeys('userProfile.connectedAccountPage.socialButtonsBlockButton', {
      provider: controller.name,
    })}
    sx={theme => ({
      justifyContent: 'start',
      gap: theme.space.$2,
    })}
    leftIcon={
      <ProviderIcon
        id={controller.providerIconId}
        iconUrl={controller.providerIconUrl || undefined}
        name={controller.name}
        isLoading={controller.isLoading}
        isDisabled={controller.isDisabled}
        alt={`Connect ${controller.name} account`}
        elementDescriptor={descriptors.providerIcon}
        elementId={descriptors.providerIcon.setId(controller.providerIconId)}
      />
    }
  />
);
