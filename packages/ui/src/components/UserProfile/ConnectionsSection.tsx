import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useClerk, useUser } from '@clerk/shared/react';
import type { AvailableConnector, CurrentUserConnection } from '@clerk/shared/types';
import { useCallback, useEffect, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { RemoveResourceForm } from '../../common';
import { useUserProfileContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Badge, Button, Flex, Link, localizationKeys, Text, useLocalizations } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFetch } from '../../hooks';

const CONNECT_ERROR_PARAM = 'clerk_connect_error';
// The connector of the flow this section sent to the provider, so a failure can name it.
const PENDING_CONNECTOR_KEY = 'clerk_connect_pending_connector';

type ConnectFailure = { code: string; connector: string | null };

const readConnectFailure = (): ConnectFailure | null => {
  const code = new URL(window.location.href).searchParams.get(CONNECT_ERROR_PARAM);
  let connector: string | null = null;
  try {
    connector = window.sessionStorage.getItem(PENDING_CONNECTOR_KEY);
    window.sessionStorage.removeItem(PENDING_CONNECTOR_KEY);
  } catch {
    // Storage can be unavailable; the message then names no service.
  }
  return code ? { code, connector } : null;
};

const rememberPendingConnector = (connector: string) => {
  try {
    window.sessionStorage.setItem(PENDING_CONNECTOR_KEY, connector);
  } catch {
    // See readConnectFailure.
  }
};

const failureMessages: Record<string, (service: string) => LocalizationKey> = {
  access_denied: service =>
    localizationKeys('userProfile.start.connectionsSection.failedAlert__accessDenied', { service }),
  insufficient_scopes: service =>
    localizationKeys('userProfile.start.connectionsSection.failedAlert__insufficientScopes', { service }),
  provider_account_mismatch: service =>
    localizationKeys('userProfile.start.connectionsSection.failedAlert__providerAccountMismatch', { service }),
  account_already_connected: service =>
    localizationKeys('userProfile.start.connectionsSection.failedAlert__accountAlreadyConnected', { service }),
  authorization_failed: service =>
    localizationKeys('userProfile.start.connectionsSection.failedAlert__authorizationFailed', { service }),
  attempt_expired: () => localizationKeys('userProfile.start.connectionsSection.failedAlert__attemptExpired'),
  attempt_invalid: () => localizationKeys('userProfile.start.connectionsSection.failedAlert__attemptInvalid'),
};

const failureMessage = (code: string, service: string) =>
  failureMessages[code]?.(service) ?? localizationKeys('userProfile.start.connectionsSection.failedAlert');

const removeConnectErrorFromUrl = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has(CONNECT_ERROR_PARAM)) {
    url.searchParams.delete(CONNECT_ERROR_PARAM);
    window.history.replaceState(withoutNextAppRouterMarker(window.history.state), '', url);
  }
};

function withoutNextAppRouterMarker(state: unknown): unknown {
  if (typeof state !== 'object' || state === null || !('__NA' in state)) {
    return state;
  }
  const copy: object = Object.assign(Array.isArray(state) ? [] : {}, state);
  Reflect.deleteProperty(copy, '__NA');
  return copy;
}

const PAGE_SIZE = 100;

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
  const { t } = useLocalizations();
  const [failure, setFailure] = useState(readConnectFailure);
  // The banner is about the last attempt. Any next action, or a success, replaces it.
  const clearFailure = useCallback(() => setFailure(null), []);

  useEffect(() => queueMicrotask(removeConnectErrorFromUrl), []);
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        card.setIdle();
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [card]);

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
  // A disconnected connection is reconnected, not counted as another account.
  const hasConnection = (connector: AvailableConnector) =>
    allConnections.some(connection => connection.connector === connector.slug && connection.status !== 'disconnected');
  const disconnectedConnectionOf = (connector: AvailableConnector) =>
    hasConnection(connector)
      ? undefined
      : allConnections.find(
          connection => connection.connector === connector.slug && connection.status === 'disconnected',
        );
  const connectorOf = (connection: CurrentUserConnection) => allConnectors.find(c => c.slug === connection.connector);
  const displayNameOf = (connection: CurrentUserConnection) =>
    connection.connectorDisplayName || connectorOf(connection)?.displayName || connection.connector;
  // A disabled connector is not listed among the available ones, so its connections cannot be reconnected.
  const isUnavailable = (connection: CurrentUserConnection) =>
    connection.connectorStatus === 'disabled' || !connectorOf(connection);
  const failedServiceName = () => {
    const slug = failure?.connector;
    const name =
      allConnectors.find(c => c.slug === slug)?.displayName ??
      allConnections.find(c => c.connector === slug)?.connectorDisplayName;
    return name || t(localizationKeys('userProfile.start.connectionsSection.unknownService'));
  };
  const apiKeyConnectors = allConnectors.filter(connector => connector.authenticationMethod === 'api_key');

  if (!loadFailed && allConnectors.length === 0 && allConnections.length === 0) {
    return null;
  }

  const returnUrl = () => {
    const url = window.location.href;
    return mode === 'modal' ? appendModalState({ url, componentName }) : url;
  };

  const startFlow = async (
    id: string,
    connector: string,
    command: () => Promise<{ status: string; action?: { url: string } }>,
  ) => {
    clearFailure();
    card.setLoading(id);
    card.setError(undefined);
    rememberPendingConnector(connector);
    try {
      const result = await command();
      if (result.status === 'requires_action') {
        // clerk.connect already sent the browser to the provider.
        return;
      }
      connections.revalidate();
      card.setIdle();
    } catch (err) {
      try {
        handleError(err as Error, [], card.setError);
      } finally {
        card.setIdle();
      }
    }
  };

  const reconnect = (connection: CurrentUserConnection) =>
    startFlow(connection.id, connection.connector, () =>
      clerk.connect.connections.reauthorize(connection.id, { returnUrl: returnUrl() }),
    );
  const connect = (connector: AvailableConnector) => {
    const disconnected = disconnectedConnectionOf(connector);
    if (disconnected) {
      return reconnect(disconnected);
    }
    return startFlow(connector.slug, connector.slug, () =>
      clerk.connect.connections.create({
        connector: connector.slug,
        returnUrl: returnUrl(),
        additionalAccount: hasConnection(connector),
      }),
    );
  };

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
          data-connect-error={failure.code}
          localizationKey={failureMessage(failure.code, failedServiceName())}
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
        <ClearOnAction onAction={clearFailure} />
        <ProfileSection.ItemList id='connections'>
          {allConnections.map(connection => (
            <ConnectionItem
              key={connection.id}
              connection={connection}
              connector={connectorOf(connection)}
              displayName={displayNameOf(connection)}
              scopeLabels={connectorOf(connection)?.scopeLabels ?? {}}
              isLoading={card.isLoading}
              isReconnecting={card.loadingMetadata === connection.id}
              isUnavailable={isUnavailable(connection)}
              onReconnect={() => void reconnect(connection)}
              onChanged={() => {
                clearFailure();
                connections.revalidate();
              }}
            />
          ))}
        </ProfileSection.ItemList>
        {!loadFailed && allConnectors.length > 0 ? (
          <ConnectorMenu
            connectors={allConnectors}
            hasConnection={hasConnection}
            disconnectedConnectionOf={disconnectedConnectionOf}
            apiKeyActionFor={connector => apiKeyAction(disconnectedConnectionOf(connector)?.id ?? connector.slug)}
            isLoading={card.isLoading}
            loadingKey={card.loadingMetadata}
            onOpen={clearFailure}
            onConnect={connector => void connect(connector)}
          />
        ) : null}
        {apiKeyConnectors.map(connector => (
          <Action.Open
            key={connector.id}
            value={apiKeyAction(connector.slug)}
          >
            <Action.Card>
              <ApiKeyScreen
                connector={connector}
                additionalAccount={hasConnection(connector)}
                onSaved={() => {
                  clearFailure();
                  connections.revalidate();
                }}
              />
            </Action.Card>
          </Action.Open>
        ))}
      </Action.Root>
    </ProfileSection.Root>
  );
});

const apiKeyAction = (id: string) => `api-key-${id}`;

// Opening a form (replace, disconnect, a key form) is the user's next action.
const ClearOnAction = ({ onAction }: { onAction: () => void }) => {
  const { active } = useActionContext();
  useEffect(() => {
    if (active) {
      onAction();
    }
  }, [active, onAction]);
  return null;
};

const accountLabelOf = (connection: CurrentUserConnection) =>
  connection.providerAccount?.label ?? connection.apiKeyHint ?? connection.slug;

const ConnectorMenu = (props: {
  connectors: AvailableConnector[];
  hasConnection: (connector: AvailableConnector) => boolean;
  disconnectedConnectionOf: (connector: AvailableConnector) => CurrentUserConnection | undefined;
  // The key form to open: the disconnected connection's, or a new connection's.
  apiKeyActionFor: (connector: AvailableConnector) => string;
  isLoading: boolean;
  loadingKey: unknown;
  onOpen: () => void;
  onConnect: (connector: AvailableConnector) => void;
}) => {
  const {
    connectors,
    hasConnection,
    disconnectedConnectionOf,
    apiKeyActionFor,
    isLoading,
    loadingKey,
    onOpen,
    onConnect,
  } = props;
  const { open, close } = useActionContext();
  const labelOf = (connector: AvailableConnector) => {
    if (hasConnection(connector)) {
      return localizationKeys('userProfile.start.connectionsSection.actionLabel__additionalAccount', {
        connector: connector.displayName,
      });
    }
    const disconnected = disconnectedConnectionOf(connector);
    return disconnected
      ? localizationKeys('userProfile.start.connectionsSection.actionLabel__reconnectAccount', {
          connector: connector.displayName,
          account: accountLabelOf(disconnected),
        })
      : connector.displayName;
  };
  return (
    <ProfileSection.ActionMenu
      id='connections'
      triggerLocalizationKey={localizationKeys('userProfile.start.connectionsSection.primaryButton')}
      // The menu replaces any open form, so it never sits on top of one.
      onClick={() => {
        close();
        onOpen();
      }}
    >
      {connectors.map(connector => {
        const usesApiKey = connector.authenticationMethod === 'api_key';
        return (
          <ProfileSection.ActionMenuItem
            key={connector.id}
            id={connector.slug}
            variant='ghost'
            focusRing={false}
            // An OAuth connect shows its progress in the menu until the redirect.
            closeAfterClick={usesApiKey}
            data-connector={connector.slug}
            isDisabled={isLoading}
            isLoading={loadingKey === connector.slug}
            localizationKey={labelOf(connector)}
            onClick={() => (usesApiKey ? open(apiKeyActionFor(connector)) : onConnect(connector))}
            sx={t => ({ justifyContent: 'start', gap: t.space.$2 })}
          />
        );
      })}
    </ProfileSection.ActionMenu>
  );
};

const ApiKeyScreen = (props: {
  connector: AvailableConnector;
  connection?: CurrentUserConnection;
  additionalAccount?: boolean;
  onSaved: () => void;
}) => {
  const { close } = useActionContext();
  return (
    <ApiKeyForm
      {...props}
      onSuccess={() => {
        close();
        props.onSaved();
      }}
      onReset={close}
    />
  );
};

const ApiKeyForm = withCardStateProvider(
  (props: {
    connector: AvailableConnector;
    connection?: CurrentUserConnection;
    additionalAccount?: boolean;
    onSuccess: () => void;
    onReset: () => void;
  }) => {
    const { connector, connection, additionalAccount, onSuccess, onReset } = props;
    const clerk = useClerk();
    const card = useCardState();
    const apiKeyField = useFormControl('apiKey', '', {
      type: 'password',
      label: localizationKeys('userProfile.start.connectionsSection.apiKeyForm.label'),
      placeholder: localizationKeys('userProfile.start.connectionsSection.apiKeyForm.placeholder'),
      isRequired: true,
    });
    const instructions = connector.apiKey?.instructions;
    const helpUrl = connector.apiKey?.helpUrl;

    const save = async () => {
      const apiKey = apiKeyField.value.trim();
      try {
        if (connection) {
          await clerk.connect.connections.reauthorize(connection.id, { apiKey });
        } else {
          await clerk.connect.connections.create({ connector: connector.slug, apiKey, additionalAccount });
        }
        onSuccess();
      } catch (err) {
        handleError(err as Error, [apiKeyField], card.setError);
      }
    };

    return (
      <FormContainer
        headerTitle={localizationKeys(
          connection
            ? 'userProfile.start.connectionsSection.apiKeyForm.title__replace'
            : 'userProfile.start.connectionsSection.apiKeyForm.title',
          { connector: connector.displayName },
        )}
      >
        {instructions || helpUrl ? (
          <Flex
            direction='col'
            gap={1}
          >
            {instructions ? (
              <Text
                colorScheme='secondary'
                data-api-key-instructions
              >
                {instructions}
              </Text>
            ) : null}
            {helpUrl ? (
              <Link
                href={helpUrl}
                isExternal
                data-api-key-help
                localizationKey={localizationKeys('userProfile.start.connectionsSection.apiKeyForm.helpLink')}
              />
            ) : null}
          </Flex>
        ) : null}
        <Form.Root onSubmit={save}>
          <Form.ControlRow elementId={apiKeyField.id}>
            <Form.PasswordInput
              {...apiKeyField.props}
              autoComplete='off'
              autoFocus
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={apiKeyField.value.trim().length === 0}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>
    );
  },
);

const ConnectionMenu = ({ removeAction, replaceAction }: { removeAction: string; replaceAction?: string }) => {
  const { open } = useActionContext();
  return (
    <ThreeDotsMenu
      actions={[
        ...(replaceAction
          ? [
              {
                label: localizationKeys('userProfile.start.connectionsSection.actionLabel__replaceApiKey'),
                onClick: () => open(replaceAction),
              },
            ]
          : []),
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
  connector: AvailableConnector | undefined;
  displayName: string;
  scopeLabels: Record<string, string>;
  isLoading: boolean;
  isReconnecting: boolean;
  isUnavailable: boolean;
  onReconnect: () => void;
  onChanged: () => void;
}) => {
  const {
    connection,
    connector,
    displayName,
    scopeLabels,
    isLoading,
    isReconnecting,
    isUnavailable,
    onReconnect,
    onChanged,
  } = props;
  const grantedScopes = connection.scopes.map(scope => scopeLabels[scope] ?? scope).join(', ');
  const isActive = connection.status === 'active';
  const isDisconnected = connection.status === 'disconnected';
  const label = connection.providerAccount?.label ?? connection.apiKeyHint;
  const removeAction = `disconnect-${connection.id}`;
  // An API key connection reconnects through the key form instead of a redirect.
  const apiKeyConnector = !isUnavailable && connector?.authenticationMethod === 'api_key' ? connector : undefined;
  const replaceAction = apiKeyConnector ? apiKeyAction(connection.id) : undefined;
  const canReconnect = !isActive && !isUnavailable;

  const badge = isUnavailable
    ? { colorScheme: 'secondary' as const, key: 'userProfile.start.connectionsSection.status__unavailable' as const }
    : connection.status === 'needs_attention'
      ? { colorScheme: 'warning' as const, key: 'userProfile.start.connectionsSection.status__needsAttention' as const }
      : isDisconnected
        ? {
            colorScheme: 'secondary' as const,
            key: 'userProfile.start.connectionsSection.status__disconnected' as const,
          }
        : null;

  const reconnectButton = canReconnect ? (
    replaceAction ? (
      <Action.Trigger value={replaceAction}>
        <Button
          variant='link'
          isDisabled={isLoading}
          data-connect-action='reconnect'
          localizationKey={localizationKeys('userProfile.start.connectionsSection.actionLabel__reconnect')}
        />
      </Action.Trigger>
    ) : (
      <Button
        variant='link'
        isDisabled={isLoading}
        isLoading={isReconnecting}
        data-connect-action='reconnect'
        localizationKey={localizationKeys('userProfile.start.connectionsSection.actionLabel__reconnect')}
        onClick={onReconnect}
      />
    )
  ) : null;

  return (
    <>
      <ProfileSection.Item
        id='connections'
        data-connection-slug={connection.slug}
        data-connection-status={connection.status}
        data-connector-status={isUnavailable ? 'unavailable' : 'active'}
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
          {/* The slug tells two accounts of one connector apart, and is what backend code passes. */}
          <Text
            as='span'
            variant='caption'
            colorScheme='secondary'
            data-connection-slug-label
            sx={t => ({ fontFamily: t.fonts.$mono, flexShrink: 0 })}
          >
            {connection.slug}
          </Text>
          {badge ? (
            <Badge
              colorScheme={badge.colorScheme}
              localizationKey={localizationKeys(badge.key)}
            />
          ) : null}
        </Flex>
        {reconnectButton || !isDisconnected ? (
          <Flex
            align='center'
            gap={2}
            sx={{ flexShrink: 0 }}
          >
            {reconnectButton}
            {isDisconnected ? null : (
              <ConnectionMenu
                removeAction={removeAction}
                replaceAction={replaceAction}
              />
            )}
          </Flex>
        ) : null}
      </ProfileSection.Item>
      {isUnavailable ? (
        <Text
          colorScheme='secondary'
          variant='caption'
          data-connection-unavailable
          sx={t => ({ padding: `${t.sizes.$none} ${t.sizes.$none} ${t.sizes.$1x5} ${t.sizes.$1x5}` })}
          localizationKey={localizationKeys('userProfile.start.connectionsSection.unavailableDescription')}
        />
      ) : null}
      {isDisconnected || !grantedScopes ? null : (
        <Text
          colorScheme='secondary'
          variant='caption'
          data-connection-scopes
          sx={t => ({ padding: `${t.sizes.$none} ${t.sizes.$none} ${t.sizes.$1x5} ${t.sizes.$1x5}` })}
          localizationKey={localizationKeys('userProfile.start.connectionsSection.grantedScopes', {
            scopes: grantedScopes,
          })}
        />
      )}
      {apiKeyConnector && replaceAction ? (
        <Action.Open value={replaceAction}>
          <Action.Card>
            <ApiKeyScreen
              connector={apiKeyConnector}
              connection={connection}
              onSaved={onChanged}
            />
          </Action.Card>
        </Action.Open>
      ) : null}
      <Action.Open value={removeAction}>
        <Action.Card variant='destructive'>
          <DisconnectScreen
            connectionId={connection.id}
            displayName={displayName}
            onDisconnected={onChanged}
          />
        </Action.Card>
      </Action.Open>
    </>
  );
};
