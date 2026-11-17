import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { EmptyState } from '../../../components/empty-state';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Table } from '../../../components/table';
import { Tabs } from '../../../components/tabs';
import { Tooltip } from '../../../components/tooltip';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { EnterpriseConnections } from '../../../icons/glyphs/enterprise-connections';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { Users } from '../../../icons/glyphs/users';
import { useMessages } from '../../../localization';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import type { AccessConnection, AccessPolicy, ConnectionKind } from './access.types';
import { AccessProviderIcon } from './access-fields.view';

export function AccessOverview({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  return (
    <Tabs.Root
      value={controller.tab}
      onValueChange={controller.onTabChange}
    >
      <Tabs.List aria-label={m.title}>
        <Tabs.Tab value='policies'>{m.policies}</Tabs.Tab>
        <Tabs.Tab value='connections'>{m.connections}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel
        value='policies'
        xstyle={styles.stack}
      >
        {controller.policyLoad.isPending ? <div role='status'>{m.loadingPolicy}</div> : null}
        <Section.Error>{controller.policyLoad.error}</Section.Error>
        <Section.Root>
          <Section.Group>
            <Section.Header>
              <Section.Content>
                <Section.Title xstyle={styles.compactTitle}>{m.accessPolicies}</Section.Title>
                <Section.Description xstyle={styles.compactDescription}>{m.description}</Section.Description>
              </Section.Content>
              <Section.Actions xstyle={styles.headerActions}>
                {controller.data.canCreatePolicy !== false ? (
                  <Button
                    disabled={controller.policyLoad.isPending}
                    onClick={() => controller.onEdit()}
                  >
                    {m.addPolicy}
                  </Button>
                ) : null}
              </Section.Actions>
            </Section.Header>
            <PolicyTable
              controller={controller}
              policies={controller.data.policies.filter(policy => policy.status === 'active')}
              includeDefault
            />
          </Section.Group>
        </Section.Root>
        {controller.data.policies.some(policy => policy.status !== 'active') ? (
          <Section.Root>
            <Section.Group>
              <Section.Header>
                <Section.Title>{m.inactive}</Section.Title>
              </Section.Header>
              <PolicyTable
                controller={controller}
                policies={controller.data.policies.filter(policy => policy.status !== 'active')}
              />
            </Section.Group>
          </Section.Root>
        ) : null}
        {controller.data.policyListError ? (
          <div>
            <Section.Error>{m.loadPoliciesError}</Section.Error>
            <Button onClick={() => void controller.data.retryPolicies?.()}>{m.retry}</Button>
          </div>
        ) : controller.data.loadMorePolicies ? (
          <SubmitButton
            type='button'
            isPending={Boolean(controller.data.isLoadingMorePolicies)}
            onClick={controller.data.loadMorePolicies}
          >
            {m.loadMorePolicies}
          </SubmitButton>
        ) : null}
      </Tabs.Panel>
      <Tabs.Panel
        value='connections'
        xstyle={styles.stack}
      >
        <ConnectionsTable
          controller={controller}
          kind='sso'
        />
        <ConnectionsTable
          controller={controller}
          kind='directory'
        />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

function ConnectionsTable({ controller, kind }: { controller: AccessController; kind: ConnectionKind }) {
  const m = useMessages('organizationProfile').access;
  const title = kind === 'sso' ? m.ssoShort : m.directorySync;
  const empty = kind === 'sso' ? m.emptySso : m.emptyDirectory;
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title xstyle={styles.compactTitle}>{title}</Section.Title>
          {(kind === 'sso' ? controller.data.canCreateSso : controller.data.canCreateDirectory) !== false ? (
            <Section.Actions xstyle={styles.headerActions}>
              <Button
                size='sm'
                variant='outline'
                color='neutral'
                aria-label={kind === 'sso' ? m.addConnection : m.addDirectory}
                onClick={() => controller.onSetup(kind)}
              >
                <Icon glyph={Plus} />
                {m.add}
              </Button>
            </Section.Actions>
          ) : null}
        </Section.Header>
        {controller.data.isLoadingConnections ? (
          <Section.Description role='status'>{m.loadingConnections}</Section.Description>
        ) : null}
        {controller.data.connectionLoadError ? (
          <Section.Error>
            {m.loadConnectionsError}
            <Button onClick={() => void controller.data.retryConnections?.()}>{m.retry}</Button>
          </Section.Error>
        ) : null}
        <Table.Root aria-label={title}>
          <Table.Header>
            <Table.Column width='50%'>{m.connection}</Table.Column>
            <Table.Column>{m.status}</Table.Column>
            <Table.Column
              width='3.5rem'
              align='end'
            >
              <VisuallyHidden>{m.actions}</VisuallyHidden>
            </Table.Column>
          </Table.Header>
          <Table.Body
            items={controller.data.connections.filter(item => item.kind === kind)}
            itemToStringValue={item => item.id}
            renderEmptyState={
              controller.data.isLoadingConnections || controller.data.connectionLoadError
                ? undefined
                : () => (
                    <EmptyState.Root role='status'>
                      <EmptyState.Icon glyph={kind === 'sso' ? EnterpriseConnections : Users} />
                      <EmptyState.Label>{empty.label}</EmptyState.Label>
                      <EmptyState.Description>{empty.description}</EmptyState.Description>
                    </EmptyState.Root>
                  )
            }
          >
            {item => (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <ConnectionName connection={item} />
                </Table.Cell>
                <Table.Cell>
                  <Badge color={item.status === 'inactive' ? 'neutral' : 'positive'}>
                    {item.status === 'inactive' ? m.inactive : m.active}
                  </Badge>
                </Table.Cell>
                <Table.Cell align='end'>
                  {item.canManage !== false ? (
                    <ActionMenu
                      label={m.actions}
                      actions={[{ label: m.manage, onClick: () => controller.onManage(item.id) }]}
                    />
                  ) : null}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Section.Group>
    </Section.Root>
  );
}

function ConnectionName({ connection }: { connection: AccessConnection }) {
  return (
    <span {...stylex.props(styles.connectionName)}>
      <AccessProviderIcon provider={connection.configuration.provider} />
      {connection.configuration.name}
    </span>
  );
}

function PolicyTable({
  controller,
  policies,
  includeDefault = false,
}: {
  controller: AccessController;
  policies: AccessPolicy[];
  includeDefault?: boolean;
}) {
  const m = useMessages('organizationProfile').access;
  const rows = policies.map(policy => ({ id: policy.id, policy }));
  const items: { id: string; policy?: AccessPolicy }[] =
    includeDefault && (controller.data.defaultPolicy || !controller.data.live)
      ? [...rows, { id: controller.data.defaultPolicy?.id ?? 'everyone' }]
      : rows;
  return (
    <Table.Root aria-label={m.policies}>
      <Table.Header>
        <Table.Column>{m.target}</Table.Column>
        <Table.Column>{m.enrollment}</Table.Column>
        <Table.Column>{m.authentication}</Table.Column>
        <Table.Column
          width='3.5rem'
          align='end'
        >
          <VisuallyHidden>{m.actions}</VisuallyHidden>
        </Table.Column>
      </Table.Header>
      <Table.Body
        items={items}
        itemToStringValue={item => item.id}
        renderEmptyState={() => m.noPolicies}
      >
        {item => (
          <Table.Row key={item.id}>
            <Table.Cell>
              {item.policy ? (
                item.policy.domains.map(domain => domain.name).join(', ') || m.draft
              ) : (
                <PolicyLabelWithHelp
                  label={policies.length ? m.everyoneElse : m.everyone}
                  description={m.everyoneDescription}
                />
              )}
              {item.policy && item.policy.status !== 'active' ? (
                <Badge
                  color='neutral'
                  xstyle={styles.policyStatusBadge}
                >
                  {m[item.policy.status]}
                </Badge>
              ) : null}
            </Table.Cell>
            <Table.Cell>
              <PolicyConnections
                connections={controller.data.connections.filter(
                  connection =>
                    item.policy?.enrollment === 'directory' && item.policy.directoryConnectionId === connection.id,
                )}
                fallback={
                  (item.policy?.directoryConnectionId &&
                    item.policy.connectionNames?.[item.policy.directoryConnectionId]) ||
                  m[item.policy?.enrollment ?? controller.data.defaultPolicy?.enrollment ?? 'invitation']
                }
              />
            </Table.Cell>
            <Table.Cell>
              {item.policy?.authentication === 'sso' ? (
                <PolicyConnections
                  connections={controller.data.connections.filter(connection =>
                    item.policy?.ssoConnectionIds.includes(connection.id),
                  )}
                  fallback={
                    item.policy.ssoConnectionIds
                      .map(id => item.policy?.connectionNames?.[id])
                      .filter(Boolean)
                      .join(', ') || m.sso
                  }
                />
              ) : (
                <PolicyLabelWithHelp
                  label={m.defaultAuthentication}
                  description={m.defaultDescription}
                />
              )}
            </Table.Cell>
            <Table.Cell align='end'>
              {item.policy && item.policy.canEdit !== false ? (
                <ActionMenu
                  label={m.actions}
                  disabled={controller.policyLoad.isPending}
                  actions={[{ label: m.manage, onClick: () => controller.onEdit(item.policy) }]}
                />
              ) : null}
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

function PolicyLabelWithHelp({ label, description }: { label: string; description: string }) {
  return (
    <span {...stylex.props(styles.policyLabel)}>
      {label}
      <Tooltip.Root>
        <Tooltip.Trigger
          aria-label={description}
          render={
            <Button
              variant='link'
              color='neutral'
              size='xs'
            />
          }
        >
          <Icon
            glyph={InformationCircle}
            size='sm'
          />
        </Tooltip.Trigger>
        <Tooltip.Popup>{description}</Tooltip.Popup>
      </Tooltip.Root>
    </span>
  );
}

function PolicyConnections({ connections, fallback }: { connections: AccessConnection[]; fallback: string }) {
  return connections.length ? (
    <div {...stylex.props(styles.policyConnections)}>
      {connections.map(connection => (
        <ConnectionName
          key={connection.id}
          connection={connection}
        />
      ))}
    </div>
  ) : (
    fallback
  );
}
