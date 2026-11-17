import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Separator } from '../../../components/separator';
import { Switch } from '../../../components/switch';
import { Table } from '../../../components/table';
import { ChevronDown } from '../../../icons/glyphs/chevron-down';
import { useMessages } from '../../../localization';
import { Collapsible } from '../../../primitives/collapsible';
import { Form } from '../../../primitives/form';
import { styles } from './access.styles';
import type { AccessData, ConnectionKind } from './access.types';
import {
  ConnectionInput,
  GoogleDirectoryCredentials,
  SsoConnectValues,
  SsoMetadataFields,
} from './access-connection.view';
import { AccessCopyField, AccessProviderIcon, AccessSelect } from './access-fields.view';
import type { AccessManageConnectionController } from './access-manage-connection.controller';

interface ManageProps {
  controller: AccessManageConnectionController;
  serviceProvider: AccessData['serviceProvider'];
}

export function AccessManageConnectionView({
  controller: c,
  kind,
  serviceProvider,
}: ManageProps & { kind: ConnectionKind }) {
  const m = useMessages('organizationProfile').access;
  const focus = useFlowAutoFocus<HTMLDivElement>();
  const provider = c.form.values.provider;
  return (
    <div
      ref={focus}
      tabIndex={-1}
    >
      <Form
        id={c.form.id}
        onSubmit={c.form.handleSubmit}
      >
        <div {...stylex.props(styles.stack)}>
          <Section.Error>{c.form.error}</Section.Error>
          <div {...stylex.props(styles.providerCard)}>
            <AccessProviderIcon provider={provider} />
            <Section.Label>{m.providers[provider]}</Section.Label>
            <Button
              size='sm'
              variant='outline'
              color='neutral'
              xstyle={styles.headerActions}
              aria-expanded={c.editingSettings}
              disabled={c.pending}
              onClick={c.onEditSettings}
            >
              {c.editingSettings ? m.done : m.edit}
            </Button>
          </div>
          <ConnectionInput
            controller={c}
            name='name'
            label={m.name}
          />
          {kind === 'sso' ? (
            <>
              {c.editingSettings ? <SsoMetadataFields controller={c} /> : null}
              <div {...stylex.props(styles.stepContent)}>
                <Section.Title>{m.connect}</Section.Title>
                <SsoConnectValues
                  oidc={provider === 'oidc'}
                  serviceProvider={serviceProvider}
                />
              </div>
              <SsoTestRuns controller={c} />
            </>
          ) : (
            <DirectorySettings
              controller={c}
              serviceProvider={serviceProvider}
            />
          )}
        </div>
      </Form>
    </div>
  );
}

function SsoTestRuns({ controller: c }: Pick<ManageProps, 'controller'>) {
  const m = useMessages('organizationProfile').access;
  return (
    <div {...stylex.props(styles.stepContent)}>
      <Section.Header>
        <Section.Content>
          <Section.Title>{m.test}</Section.Title>
          <Section.Description>{m.manageSsoTestDescription}</Section.Description>
        </Section.Content>
        <Section.Actions>
          {c.onStartTest ? (
            <Button
              type='button'
              onClick={c.onStartTest}
              disabled={c.pending}
            >
              {m.startTest}
            </Button>
          ) : null}
          {c.testUrl ? (
            <a
              href={c.testUrl}
              target='_blank'
              rel='noreferrer'
            >
              {m.openTest}
            </a>
          ) : null}
          <SubmitButton
            type='button'
            variant='outline'
            color='neutral'
            isPending={c.testing}
            disabled={c.form.isSubmitting || Boolean(c.onStartTest && !c.testUrl)}
            onClick={c.onTest}
          >
            {m.test}
          </SubmitButton>
        </Section.Actions>
      </Section.Header>
      <Section.Error>{c.error}</Section.Error>
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger
          render={
            <Button
              variant='ghost'
              color='neutral'
              fullWidth
              xstyle={styles.manageLogsTrigger}
            />
          }
        >
          {m.logs} <Badge color='neutral'>{c.runs.length}</Badge>
          <Icon
            glyph={ChevronDown}
            xstyle={styles.headerActions}
          />
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <Table.Root aria-label={m.logs}>
            <Table.Header>
              <Table.Column>{m.timestamp}</Table.Column>
              <Table.Column>{m.runDetails}</Table.Column>
              <Table.Column>{m.status}</Table.Column>
            </Table.Header>
            <Table.Body
              items={c.runs}
              itemToStringValue={run => String(run.id)}
              renderEmptyState={() => m.noTestRuns}
            >
              {run => (
                <Table.Row key={run.id}>
                  <Table.Cell>{run.date}</Table.Cell>
                  <Table.Cell>{run.detail ?? m.notProvided}</Table.Cell>
                  <Table.Cell>
                    <Badge color={run.success ? 'positive' : 'negative'}>{run.success ? m.passed : m.failed}</Badge>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

function DirectorySettings({ controller: c, serviceProvider }: ManageProps) {
  const m = useMessages('organizationProfile').access;
  const google = c.form.values.provider === 'google';
  const mapping = c.form.values.directoryAttributeMapping;
  const attributes = [
    { id: 'email', label: m.email, path: mapping?.['email'] ?? 'emails[0].value' },
    { id: 'familyName', label: m.lastName, path: mapping?.['familyName'] ?? 'name.familyName' },
    { id: 'firstName', label: m.firstName, path: mapping?.['firstName'] ?? 'name.givenName' },
    { id: 'userName', label: m.username, path: mapping?.['userName'] ?? 'userName' },
  ];
  return (
    <>
      {!google ? (
        <div {...stylex.props(styles.stepContent)}>
          <AccessCopyField
            label={m.scimEndpoint}
            value={serviceProvider?.scimUrl ?? ''}
          />
          <div {...stylex.props(styles.connectionRow)}>
            <div {...stylex.props(styles.grow)}>
              <AccessCopyField
                label={m.bearerToken}
                value={c.token}
              />
            </div>
            <SubmitButton
              type='button'
              variant='outline'
              color='neutral'
              isPending={c.generatingToken}
              disabled={c.form.isSubmitting || c.testing || !c.canGenerateToken}
              onClick={c.onGenerateToken}
            >
              {m.generateNewToken}
            </SubmitButton>
          </div>
          {c.token ? <Section.Description>{m.tokenNotice}</Section.Description> : null}
        </div>
      ) : null}
      {c.form.values.enabled !== undefined ? (
        <Field.Root
          orientation='horizontal'
          disabled={c.pending}
        >
          <Switch
            checked={c.form.values.enabled}
            onChange={event => c.form.setValue('enabled', event.target.checked)}
          />
          <Field.Label>{m.directorySync}</Field.Label>
        </Field.Root>
      ) : null}
      {c.editingSettings ? (
        <div {...stylex.props(styles.stepContent)}>
          {google ? <GoogleDirectoryCredentials controller={c} /> : null}
          <Field.Root
            orientation='horizontal'
            disabled={c.pending}
          >
            <Switch
              checked={c.form.values.syncGroups}
              onChange={event => c.form.setValue('syncGroups', event.target.checked)}
            />
            <Field.Label>{m.syncGroups}</Field.Label>
          </Field.Root>
        </div>
      ) : null}
      <Separator />
      <div {...stylex.props(styles.stepContent)}>
        <Section.Title>{m.attributes}</Section.Title>
        <Table.Root aria-label={m.attributes}>
          <Table.Header>
            <Table.Column>{m.clerkAttribute}</Table.Column>
            <Table.Column>{m.scimAttribute}</Table.Column>
          </Table.Header>
          <Table.Body
            items={attributes}
            itemToStringValue={attribute => attribute.id}
          >
            {attribute => (
              <Table.Row key={attribute.id}>
                <Table.Cell>{attribute.label}</Table.Cell>
                <Table.Cell>
                  <code>{attribute.path}</code>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
      <div {...stylex.props(styles.stepContent)}>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.testProvisioning}</Section.Title>
            <Section.Description>{m.directoryTest}</Section.Description>
          </Section.Content>
          <Section.Actions>
            <SubmitButton
              type='button'
              variant='outline'
              color='neutral'
              isPending={c.testing}
              disabled={c.form.isSubmitting || c.generatingToken}
              onClick={c.onTest}
            >
              {m.runTest}
            </SubmitButton>
          </Section.Actions>
        </Section.Header>
        <Section.Error>{c.error}</Section.Error>
        <div role='status'>
          {c.result ? (
            <Badge color={c.result.success ? 'positive' : 'negative'}>
              {c.result.success ? (c.result.email ?? m.passed) : m.failed}
            </Badge>
          ) : (
            <Section.Description>{m.waitingForUsers}</Section.Description>
          )}
        </div>
      </div>
      <DirectoryRoles controller={c} />
    </>
  );
}

function DirectoryRoles({ controller: c }: Pick<ManageProps, 'controller'>) {
  const m = useMessages('organizationProfile').access;
  const roles = [
    { value: 'member', label: m.member },
    { value: 'admin', label: m.admin },
    { value: 'none', label: m.none },
  ];
  return (
    <div {...stylex.props(styles.stepContent)}>
      <Section.Title>{m.roleMapping}</Section.Title>
      <Section.Description>{m.roleDescription}</Section.Description>
      <Table.Root aria-label={m.roleMapping}>
        <Table.Header>
          <Table.Column>{m.priority}</Table.Column>
          <Table.Column>{m.directoryGroup}</Table.Column>
          <Table.Column>{m.groupRole}</Table.Column>
        </Table.Header>
        <Table.Body
          items={c.roleRows}
          itemToStringValue={row => (row.group === null ? 'default' : `group:${row.group}`)}
        >
          {({ group, priority }) => (
            <Table.Row key={group === null ? 'default' : `group:${group}`}>
              <Table.Cell>{priority ?? '—'}</Table.Cell>
              <Table.Cell>{group ? (c.result?.groupNames?.[group] ?? group) : m.everyoneElse}</Table.Cell>
              <Table.Cell>
                <AccessSelect
                  label={group ?? m.defaultRole}
                  hideLabel
                  value={
                    group === null
                      ? c.form.values.defaultRole
                      : (c.form.values.groupRoles[group] ??
                        c.result?.groupRoles?.[group] ??
                        (c.live ? 'none' : 'member'))
                  }
                  items={roles}
                  disabled={c.pending}
                  onChange={value => {
                    if (group === null) {
                      c.form.setValue('defaultRole', value);
                    } else {
                      c.form.setValue('groupRoles', { ...c.form.values.groupRoles, [group]: value });
                    }
                  }}
                />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
