import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Panel } from '../../../components/panel';
import { Section } from '../../../components/section';
import { Table } from '../../../components/table';
import { Tabs } from '../../../components/tabs';
import { Tooltip } from '../../../components/tooltip';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { ArrowLeft } from '../../../icons/glyphs/arrow-left';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';
import { rtl } from '../../../styles/rtl.styles';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import type { AccessConnection, AccessPolicy, ConnectionKind } from './access.types';
import { AccessConnectionFooter, AccessConnectionHeader, AccessConnectionSteps } from './access-connection.view';
import { AccessDomainsView } from './access-domains.view';
import { AccessProviderIcon } from './access-fields.view';
import { AccessManageConnectionView } from './access-manage-connection.view';
import { AccessPolicyView } from './access-policy.view';

export function AccessBackAction({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const manageBackLabel = c.step === 'editor' ? (c.form.values.id ? m.managePolicy : m.addPolicy) : m.connections;
  return (
    <Button
      variant='ghost'
      color='neutral'
      aria-label={c.manageKind ? manageBackLabel : m.back}
      xstyle={c.manageKind ? undefined : styles.back}
      disabled={c.form.isSubmitting || c.wizard.pending || c.manager.pending}
      onClick={
        c.manageKind
          ? c.manager.onClose
          : c.request?.kind === 'directory'
            ? () => c.wizard.onOpenChange(false)
            : c.onBack
      }
    >
      <Icon
        glyph={ArrowLeft}
        xstyle={rtl.mirror}
      />
      {c.manageKind ? manageBackLabel : null}
    </Button>
  );
}
export function AccessFooter({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  if (c.manageKind) {
    const { form, pending } = c.manager;
    return (
      <SubmitButton
        form={form.id}
        isPending={form.isSubmitting}
        disabled={!form.isDirty || !form.canSubmit || pending}
      >
        {m.saveConnection}
      </SubmitButton>
    );
  }
  if (c.request?.kind === 'directory') {
    return <AccessConnectionFooter controller={c.wizard} />;
  }
  return (
    <>
      {!c.data.live || c.form.values.authentication === 'sso' ? (
        <Button
          variant='outline'
          color='neutral'
          disabled={c.form.isSubmitting}
          onClick={c.onSaveDraft}
        >
          {m.saveDraft}
        </Button>
      ) : null}
      <Button
        disabled={c.form.isSubmitting || !c.canActivate}
        onClick={c.onActivate}
      >
        {c.form.values.id ? m.save : m.activate}
      </Button>
    </>
  );
}
export function OrganizationProfileAccessPanelView({
  controller: c,
  title,
  showEditorControls = false,
}: {
  controller: AccessController;
  title?: string;
  showEditorControls?: boolean;
}) {
  return (
    <Panel.Root render={<div {...themeProps('organization-profile-access-panel')} />}>
      <Panel.Title>{title ?? c.pageTitle}</Panel.Title>
      {showEditorControls && c.pageStep !== 'list' ? <AccessBackAction controller={c} /> : null}
      <Flow.Root
        xstyle={styles.pageFlow}
        value={c.pageStep}
        direction={c.direction}
        state={c}
      >
        {current => (
          <>
            <Flow.Step
              ids={['list']}
              xstyle={styles.pageStep}
            >
              <AccessOverview controller={current} />
            </Flow.Step>
            <Flow.Step
              ids={['editor']}
              xstyle={styles.pageStep}
            >
              <AccessPolicyView controller={current} />
            </Flow.Step>
            <Flow.Step
              ids={['manage']}
              xstyle={styles.pageStep}
            >
              {current.manageKind ? (
                <AccessManageConnectionView
                  controller={current.manager}
                  kind={current.manageKind}
                  serviceProvider={current.manageServiceProvider}
                />
              ) : null}
            </Flow.Step>
            <Flow.Step
              ids={['directory']}
              xstyle={styles.pageStep}
            >
              <Card.Content xstyle={styles.inlineContent}>
                <Section.Error>{current.wizard.form.error}</Section.Error>
                <AccessConnectionSteps
                  controller={current.wizard}
                  data={current.data}
                />
              </Card.Content>
            </Flow.Step>
          </>
        )}
      </Flow.Root>
      {showEditorControls && c.pageStep !== 'list' ? (
        <Section.Actions>
          <AccessFooter controller={c} />
        </Section.Actions>
      ) : null}
      <AccessDomainsView controller={c} />
      <Dialog.Root
        open={c.request?.kind === 'sso'}
        onOpenChange={c.wizard.onOpenChange}
      >
        <Dialog.Popup compactPlacement='center'>
          <Card.Root
            size='lg'
            xstyle={styles.dialogCard}
            renderBranding={false}
          >
            <AccessConnectionHeader />
            <Card.Banner color='negative'>{c.wizard.form.error}</Card.Banner>
            <Card.Content>
              <AccessConnectionSteps
                controller={c.wizard}
                data={c.data}
              />
            </Card.Content>
            <Card.Footer xstyle={styles.footer}>
              <AccessConnectionFooter controller={c.wizard} />
            </Card.Footer>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    </Panel.Root>
  );
}
function AccessOverview({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  return (
    <Tabs.Root
      value={c.tab}
      onValueChange={c.onTabChange}
    >
      <Tabs.List aria-label={m.title}>
        <Tabs.Tab value='policies'>{m.policies}</Tabs.Tab>
        <Tabs.Tab value='connections'>{m.connections}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel
        value='policies'
        xstyle={styles.stack}
      >
        {c.policyLoad.isPending ? <div role='status'>{m.loadingPolicy}</div> : null}
        <Section.Error>{c.policyLoad.error}</Section.Error>
        <Section.Root>
          <Section.Group>
            <Section.Header>
              <Section.Content>
                <Section.Title>{m.accessPolicies}</Section.Title>
                <Section.Description>{m.description}</Section.Description>
              </Section.Content>
              <Section.Actions xstyle={styles.headerActions}>
                {c.data.canCreatePolicy !== false ? (
                  <Button
                    disabled={c.policyLoad.isPending}
                    onClick={() => c.onEdit()}
                  >
                    {m.addPolicy}
                  </Button>
                ) : null}
              </Section.Actions>
            </Section.Header>
            <PolicyTable
              controller={c}
              policies={c.data.policies.filter(policy => policy.status === 'active')}
              includeDefault
            />
          </Section.Group>
        </Section.Root>
        {c.data.policies.some(policy => policy.status !== 'active') ? (
          <Section.Root>
            <Section.Group>
              <Section.Header>
                <Section.Title>{m.inactive}</Section.Title>
              </Section.Header>
              <PolicyTable
                controller={c}
                policies={c.data.policies.filter(policy => policy.status !== 'active')}
              />
            </Section.Group>
          </Section.Root>
        ) : null}
        {c.data.policyListError ? (
          <div>
            <Section.Error>{m.loadPoliciesError}</Section.Error>
            <Button onClick={() => void c.data.retryPolicies?.()}>{m.retry}</Button>
          </div>
        ) : c.data.loadMorePolicies ? (
          <SubmitButton
            type='button'
            isPending={Boolean(c.data.isLoadingMorePolicies)}
            onClick={c.data.loadMorePolicies}
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
          controller={c}
          kind='sso'
        />
        <ConnectionsTable
          controller={c}
          kind='directory'
        />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
function ConnectionsTable({ controller: c, kind }: { controller: AccessController; kind: ConnectionKind }) {
  const m = useMessages('organizationProfile').access;
  const title = kind === 'sso' ? m.ssoShort : m.directorySync;
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>{title}</Section.Title>
          {(kind === 'sso' ? c.data.canCreateSso : c.data.canCreateDirectory) !== false ? (
            <Section.Actions xstyle={styles.headerActions}>
              <Button
                size='sm'
                variant='outline'
                color='neutral'
                aria-label={kind === 'sso' ? m.addConnection : m.addDirectory}
                onClick={() => c.onSetup(kind)}
              >
                <Icon glyph={Plus} />
                {m.add}
              </Button>
            </Section.Actions>
          ) : null}
        </Section.Header>
        {c.data.isLoadingConnections ? (
          <Section.Description role='status'>{m.loadingConnections}</Section.Description>
        ) : null}
        {c.data.connectionLoadError ? (
          <Section.Error>
            {m.loadConnectionsError}
            <Button onClick={() => void c.data.retryConnections?.()}>{m.retry}</Button>
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
            items={c.data.connections.filter(item => item.kind === kind)}
            itemToStringValue={item => item.id}
            renderEmptyState={() => m.noConnections}
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
                      actions={[{ label: m.manage, onClick: () => c.onManage(item.id) }]}
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
  controller: c,
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
    includeDefault && (c.data.defaultPolicy || !c.data.live)
      ? [...rows, { id: c.data.defaultPolicy?.id ?? 'everyone' }]
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
                connections={c.data.connections.filter(
                  connection =>
                    item.policy?.enrollment === 'directory' && item.policy.directoryConnectionId === connection.id,
                )}
                fallback={
                  (item.policy?.directoryConnectionId &&
                    item.policy.connectionNames?.[item.policy.directoryConnectionId]) ||
                  m[item.policy?.enrollment ?? c.data.defaultPolicy?.enrollment ?? 'invitation']
                }
              />
            </Table.Cell>
            <Table.Cell>
              {item.policy?.authentication === 'sso' ? (
                <PolicyConnections
                  connections={c.data.connections.filter(connection =>
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
                  disabled={c.policyLoad.isPending}
                  actions={[{ label: m.manage, onClick: () => c.onEdit(item.policy) }]}
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
