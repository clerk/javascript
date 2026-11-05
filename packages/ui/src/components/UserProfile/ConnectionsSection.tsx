import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useClerk, useUser } from '@clerk/shared/react';
import type { AvailableConnector, CurrentUserConnection } from '@clerk/shared/types';
import { useEffect, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';
import { clerkWindowNavigate } from '@/ui/utils/windowNavigate';

import { RemoveResourceForm } from '../../common';
import { useUserProfileContext } from '../../contexts';
import { Badge, Box, Button, Flex, localizationKeys, Text } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFetch } from '../../hooks';

const CONNECT_ERROR_PARAM = 'clerk_connect_error';

const readConnectError = () => new URL(window.location.href).searchParams.get(CONNECT_ERROR_PARAM);

const removeConnectErrorFromUrl = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has(CONNECT_ERROR_PARAM)) {
    url.searchParams.delete(CONNECT_ERROR_PARAM);
    window.history.replaceState(withoutNextAppRouterMarker(window.history.state), '', url);
  }
};

// Next.js App Router ignores a URL change while its own marker is in the state.
function withoutNextAppRouterMarker(state: unknown): unknown {
  if (typeof state !== 'object' || state === null || !('__NA' in state)) {
    return state;
  }
  const copy: object = Object.assign(Array.isArray(state) ? [] : {}, state);
  Reflect.deleteProperty(copy, '__NA');
  return copy;
}

const PAGE_SIZE = 100;

// listAll reads every page, so a user with many services sees all of them.
async function listAll<T>(fetchPage: (offset: number) => Promise<{ data: T[]; total_count: number }>): Promise<T[]> {
  const items: T[] = [];
  for (;;) {
    const page = await fetchPage(items.length);
    items.push(...page.data);
    if (page.data.length === 0 || items.length >= page.total_count) {
      return items;
    }
  }
}

export const ConnectionsSection = withCardStateProvider(() => {
  const card = useCardState();
  const clerk = useClerk();
  const { user } = useUser();
  const { componentName, mode } = useUserProfileContext();
  const [failure] = useState(readConnectError);

  useEffect(removeConnectErrorFromUrl, []);

  const connectors = useFetch(() => listAll(offset => clerk.connect.connectors.list({ limit: PAGE_SIZE, offset })), {
    userId: user?.id,
    resource: 'connectors',
  });
  const connections = useFetch(() => listAll(offset => clerk.connect.connections.list({ limit: PAGE_SIZE, offset })), {
    userId: user?.id,
    resource: 'connections',
  });

  const loadFailed = Boolean(connectors.error || connections.error);
  if (!loadFailed && (!connectors.data || !connections.data)) {
    return null;
  }

  const allConnectors = connectors.data ?? [];
  const allConnections = connections.data ?? [];
  const unconnected = allConnectors.filter(
    connector => !allConnections.some(connection => connection.connector === connector.key),
  );

  if (!loadFailed && allConnectors.length === 0 && allConnections.length === 0) {
    return null;
  }

  const returnUrl = () => {
    const url = window.location.href;
    return mode === 'modal' ? appendModalState({ url, componentName }) : url;
  };

  const startFlow = async (id: string, command: () => Promise<{ status: string; action?: { url: string } }>) => {
    card.setLoading(id);
    card.setError(undefined);
    try {
      const result = await command();
      if (result.status === 'requires_action' && result.action) {
        // Stay loading while the browser leaves, so a second click cannot start
        // another flow.
        clerkWindowNavigate(clerk, result.action.url);
        return;
      }
      connections.revalidate();
      card.setIdle();
    } catch (err) {
      handleError(err as Error, [], card.setError);
      card.setIdle();
    }
  };

  const connect = (connector: AvailableConnector) =>
    startFlow(connector.key, () =>
      clerk.connect.connections.connect({ connector: connector.key, returnUrl: returnUrl() }),
    );
  const reconnect = (connection: CurrentUserConnection) =>
    startFlow(connection.id, () => clerk.connect.connections.reauthorize(connection.id, { returnUrl: returnUrl() }));

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.connectionsSection.title')}
      centered={false}
      id='connections'
    >
      <Card.Alert>{card.error}</Card.Alert>
      {failure ? (
        <Text
          colorScheme='danger'
          data-connect-error={failure}
          localizationKey={localizationKeys('userProfile.start.connectionsSection.failedAlert')}
        />
      ) : null}
      {loadFailed ? (
        <Text
          colorScheme='danger'
          data-connect-load-error
          localizationKey={localizationKeys('userProfile.start.connectionsSection.loadFailedAlert')}
        />
      ) : null}
      <Action.Root>
        <ProfileSection.ItemList id='connections'>
          {allConnections.map(connection => (
            <ConnectionItem
              key={connection.id}
              connection={connection}
              displayName={allConnectors.find(c => c.key === connection.connector)?.displayName ?? connection.connector}
              isLoading={card.isLoading}
              isReconnecting={card.loadingMetadata === connection.id}
              canReconnect={allConnectors.some(c => c.key === connection.connector)}
              onReconnect={() => void reconnect(connection)}
              onDisconnected={() => connections.revalidate()}
            />
          ))}
        </ProfileSection.ItemList>
      </Action.Root>
      {!loadFailed && unconnected.length > 0 ? (
        <ProfileSection.ActionMenu
          id='connections'
          triggerLocalizationKey={localizationKeys('userProfile.start.connectionsSection.primaryButton')}
        >
          {unconnected.map(connector => (
            <ProfileSection.ActionMenuItem
              key={connector.id}
              id={connector.key}
              variant='ghost'
              focusRing={false}
              closeAfterClick={false}
              data-connector={connector.key}
              isDisabled={card.isLoading}
              isLoading={card.loadingMetadata === connector.key}
              localizationKey={connector.displayName}
              onClick={() => void connect(connector)}
              sx={t => ({ justifyContent: 'start', gap: t.space.$2 })}
            />
          ))}
        </ProfileSection.ActionMenu>
      ) : null}
    </ProfileSection.Root>
  );
});

const ConnectionMenu = ({ removeAction }: { removeAction: string }) => {
  const { open } = useActionContext();
  return (
    <ThreeDotsMenu
      actions={[
        {
          label: localizationKeys('userProfile.start.connectionsSection.destructiveActionTitle'),
          isDestructive: true,
          onClick: () => open(removeAction),
        },
      ]}
    />
  );
};

const DisconnectScreen = (props: { connectionId: string; displayName: string; onDisconnected: () => void }) => {
  const { connectionId, displayName, onDisconnected } = props;
  const clerk = useClerk();
  const { close } = useActionContext();
  return (
    <RemoveResourceForm
      title={localizationKeys('userProfile.start.connectionsSection.removeResource.title')}
      messageLine1={localizationKeys('userProfile.start.connectionsSection.removeResource.messageLine1', {
        identifier: displayName,
      })}
      messageLine2={localizationKeys('userProfile.start.connectionsSection.removeResource.messageLine2')}
      deleteResource={() => clerk.connect.connections.disconnect(connectionId)}
      onSuccess={() => {
        close();
        onDisconnected();
      }}
      onReset={close}
    />
  );
};

const ConnectionItem = (props: {
  connection: CurrentUserConnection;
  displayName: string;
  isLoading: boolean;
  isReconnecting: boolean;
  canReconnect: boolean;
  onReconnect: () => void;
  onDisconnected: () => void;
}) => {
  const { connection, displayName, isLoading, isReconnecting, canReconnect, onReconnect, onDisconnected } = props;
  const isActive = connection.status === 'active';
  const label = connection.providerAccount?.label;
  const removeAction = `disconnect-${connection.id}`;

  return (
    <>
      <ProfileSection.Item
        id='connections'
        data-connection-key={connection.key}
        data-connection-status={connection.status}
      >
        <Flex
          align='center'
          gap={2}
          sx={{ overflow: 'hidden' }}
        >
          <Text sx={t => ({ color: t.colors.$colorForeground })}>{displayName}</Text>
          {label ? (
            <Text
              truncate
              as='span'
              colorScheme='secondary'
            >{`• ${label}`}</Text>
          ) : null}
          {isActive ? null : (
            <Badge
              colorScheme={connection.status === 'needs_attention' ? 'warning' : 'secondary'}
              localizationKey={localizationKeys(
                connection.status === 'needs_attention'
                  ? 'userProfile.start.connectionsSection.status__needsAttention'
                  : 'userProfile.start.connectionsSection.status__disconnected',
              )}
            />
          )}
        </Flex>
        {connection.status === 'disconnected' ? null : <ConnectionMenu removeAction={removeAction} />}
      </ProfileSection.Item>
      {isActive || !canReconnect ? null : (
        <Box sx={t => ({ padding: `${t.sizes.$none} ${t.sizes.$none} ${t.sizes.$1x5} ${t.sizes.$1x5}` })}>
          <Button
            variant='link'
            isDisabled={isLoading}
            isLoading={isReconnecting}
            data-connect-action='reconnect'
            localizationKey={localizationKeys('userProfile.start.connectionsSection.actionLabel__reconnect')}
            onClick={onReconnect}
          />
        </Box>
      )}
      <Action.Open value={removeAction}>
        <Action.Card variant='destructive'>
          <DisconnectScreen
            connectionId={connection.id}
            displayName={displayName}
            onDisconnected={onDisconnected}
          />
        </Action.Card>
      </Action.Open>
    </>
  );
};
