import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { windowNavigate } from '@clerk/shared/internal/clerk-js/windowNavigate';
import { __internal_useUserEnterpriseConnections, useReverification, useUser } from '@clerk/shared/react';
import type {
  EnterpriseAccountConnectionResource,
  EnterpriseAccountResource,
  OAuthProvider,
} from '@clerk/shared/types';
import { Fragment, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';
import { sleep } from '@/utils/sleep';

import { ProviderIcon } from '../../common';
import { useUserProfileContext } from '../../contexts';
import { Badge, Box, descriptors, Flex, localizationKeys, Text } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { RemoveEnterpriseAccountForm } from './RemoveResourceForm';

const EnterpriseConnectMenuButton = (props: { connection: EnterpriseAccountConnectionResource }) => {
  const { connection } = props;
  const card = useCardState();
  const { user } = useUser();
  const { componentName, mode } = useUserProfileContext();
  const isModal = mode === 'modal';
  const loadingKey = `enterprise_${connection.id}`;

  const createExternalAccount = useReverification(() => {
    const redirectUrl = isModal ? appendModalState({ url: window.location.href, componentName }) : window.location.href;

    return user?.createExternalAccount({
      enterpriseConnectionId: connection.id,
      redirectUrl,
    });
  });

  const connect = () => {
    if (!user) {
      return;
    }

    card.setLoading(loadingKey);

    return createExternalAccount()
      .then(res => {
        if (res?.verification?.externalVerificationRedirectURL) {
          void sleep(2000).then(() => card.setIdle(loadingKey));
          windowNavigate(res.verification.externalVerificationRedirectURL);
        }
      })
      .catch(err => {
        handleError(err, [], card.setError);
        card.setIdle(loadingKey);
      });
  };

  const providerWithoutPrefix = connection?.name;

  return (
    <ProfileSection.ActionMenuItem
      key={connection.id}
      id={connection.id}
      onClick={connect}
      isDisabled={card.isLoading}
      variant='ghost'
      isLoading={card.loadingMetadata === loadingKey}
      focusRing={false}
      closeAfterClick={false}
      localizationKey={localizationKeys('userProfile.connectedAccountPage.socialButtonsBlockButton', {
        provider: connection.name,
      })}
      sx={t => ({
        justifyContent: 'start',
        gap: t.space.$2,
      })}
      leftIcon={
        <ProviderIcon
          id={providerWithoutPrefix}
          iconUrl={connection.logoPublicUrl}
          name={connection.name}
          isLoading={card.loadingMetadata === loadingKey}
          isDisabled={card.isLoading}
          alt={`Connect ${connection.name} account`}
          elementDescriptor={descriptors.providerIcon}
          elementId={descriptors.providerIcon.setId(providerWithoutPrefix)}
        />
      }
    />
  );
};

const AddEnterpriseAccount = ({
  onClick,
  enterpriseConnections,
}: {
  onClick?: () => void;
  enterpriseConnections: EnterpriseAccountConnectionResource[];
}) => {
  if (enterpriseConnections.length === 0) {
    return null;
  }

  return (
    <ProfileSection.ActionMenu
      triggerLocalizationKey={localizationKeys('userProfile.start.enterpriseAccountsSection.primaryButton')}
      id='enterpriseAccounts'
      onClick={onClick}
    >
      {enterpriseConnections.map(connection => (
        <EnterpriseConnectMenuButton
          connection={connection}
          key={connection.id}
        />
      ))}
    </ProfileSection.ActionMenu>
  );
};

type RemoveEnterpriseAccountScreenProps = { accountId: string };
const RemoveEnterpriseAccountScreen = (props: RemoveEnterpriseAccountScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemoveEnterpriseAccountForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

export const EnterpriseAccountsSection = withCardStateProvider(() => {
  const { user } = useUser();
  const card = useCardState();
  const [actionValue, setActionValue] = useState<string | null>(null);

  const activeEnterpriseAccounts = user?.enterpriseAccounts.filter(
    ({ enterpriseConnection }) => enterpriseConnection?.active,
  );

  const { data: userEnterpriseConnections = [] } = __internal_useUserEnterpriseConnections({
    withOrganizationAccountLinking: true,
  });
  const linkableEnterpriseConnections = userEnterpriseConnections.filter(c => c.allowOrganizationAccountLinking);

  if (!activeEnterpriseAccounts?.length && !linkableEnterpriseConnections.length) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
      id='enterpriseAccounts'
      centered={false}
    >
      <Card.Alert>{card.error}</Card.Alert>
      <Action.Root
        value={actionValue}
        onChange={setActionValue}
      >
        <ProfileSection.ItemList id='enterpriseAccounts'>
          {activeEnterpriseAccounts?.map(account => (
            <EnterpriseAccount
              key={account.id}
              account={account}
            />
          ))}
        </ProfileSection.ItemList>
        <AddEnterpriseAccount
          enterpriseConnections={linkableEnterpriseConnections}
          onClick={() => setActionValue(null)}
        />
      </Action.Root>
    </ProfileSection.Root>
  );
});

const EnterpriseAccount = ({ account }: { account: EnterpriseAccountResource }) => {
  const label = account.emailAddress;
  const connectionName = account?.enterpriseConnection?.name;
  const error = account.verification?.error?.longMessage;
  const accountId = account.id ?? '';

  return (
    <Fragment key={accountId}>
      <ProfileSection.Item
        id='enterpriseAccounts'
        sx={t => ({
          gap: t.space.$2,
          justifyContent: 'start',
        })}
      >
        <Flex sx={t => ({ overflow: 'hidden', gap: t.space.$2 })}>
          <EnterpriseAccountProviderIcon account={account} />
          <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <Flex
              gap={1}
              center
            >
              <Text
                truncate
                colorScheme='body'
              >
                {connectionName}
              </Text>
              <Text
                truncate
                as='span'
                colorScheme='secondary'
              >
                {label ? `• ${label}` : ''}
              </Text>
              {error && (
                <Badge
                  colorScheme='danger'
                  localizationKey={localizationKeys('badge__requiresAction')}
                />
              )}
            </Flex>
          </Box>
        </Flex>

        <EnterpriseAccountMenu account={account} />
      </ProfileSection.Item>

      <Action.Open value={`remove-${accountId}`}>
        <Action.Card variant='destructive'>
          <RemoveEnterpriseAccountScreen accountId={accountId} />
        </Action.Card>
      </Action.Open>
    </Fragment>
  );
};

const EnterpriseAccountMenu = ({ account }: { account: EnterpriseAccountResource }) => {
  const { open } = useActionContext();
  const accountId = account.id;

  const actions = (
    [
      {
        label: localizationKeys('userProfile.start.enterpriseAccountsSection.destructiveActionTitle'),
        isDestructive: true,
        onClick: () => open(`remove-${accountId}`),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

const EnterpriseAccountProviderIcon = ({ account }: { account: EnterpriseAccountResource }) => {
  const { provider, enterpriseConnection } = account;

  const providerWithoutPrefix = provider.replace(/(oauth_|saml_)/, '').trim() as OAuthProvider;
  const connectionName = enterpriseConnection?.name ?? providerWithoutPrefix;

  return (
    <ProviderIcon
      id={providerWithoutPrefix}
      iconUrl={enterpriseConnection?.logoPublicUrl}
      name={connectionName}
      alt={`${connectionName}'s icon`}
      elementDescriptor={[descriptors.providerIcon]}
      elementId={descriptors.enterpriseButtonsProviderIcon.setId(account.provider)}
    />
  );
};
