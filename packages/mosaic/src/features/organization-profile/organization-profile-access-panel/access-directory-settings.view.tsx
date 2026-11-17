import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { SubmitButton } from '../../../components/button';
import { Field } from '../../../components/field';
import { Section } from '../../../components/section';
import { Separator } from '../../../components/separator';
import { Switch } from '../../../components/switch';
import { Table } from '../../../components/table';
import { useMessages } from '../../../localization';
import { styles } from './access.styles';
import { GoogleDirectoryCredentials } from './access-connection-fields.view';
import { AccessCopyField, AccessSelect } from './access-fields.view';
import type { ManageProps } from './access-manage-connection.view';

export function DirectorySettings({ controller, serviceProvider }: ManageProps) {
  const m = useMessages('organizationProfile').access;
  const google = controller.form.values.provider === 'google';
  const mapping = controller.form.values.directoryAttributeMapping;
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
                value={controller.token}
              />
            </div>
            <SubmitButton
              type='button'
              variant='outline'
              color='neutral'
              isPending={controller.generatingToken}
              disabled={controller.form.isSubmitting || controller.testing || !controller.canGenerateToken}
              onClick={controller.onGenerateToken}
            >
              {m.generateNewToken}
            </SubmitButton>
          </div>
          {controller.token ? <Section.Description>{m.tokenNotice}</Section.Description> : null}
        </div>
      ) : null}
      {controller.form.values.enabled !== undefined ? (
        <Field.Root
          orientation='horizontal'
          disabled={controller.pending}
        >
          <Switch
            checked={controller.form.values.enabled}
            onChange={event => controller.form.setValue('enabled', event.target.checked)}
          />
          <Field.Label>{m.directorySync}</Field.Label>
        </Field.Root>
      ) : null}
      {controller.editingSettings ? (
        <div {...stylex.props(styles.stepContent)}>
          {google ? <GoogleDirectoryCredentials controller={controller} /> : null}
          <Field.Root
            orientation='horizontal'
            disabled={controller.pending}
          >
            <Switch
              checked={controller.form.values.syncGroups}
              onChange={event => controller.form.setValue('syncGroups', event.target.checked)}
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
              isPending={controller.testing}
              disabled={controller.form.isSubmitting || controller.generatingToken}
              onClick={controller.onTest}
            >
              {m.runTest}
            </SubmitButton>
          </Section.Actions>
        </Section.Header>
        <Section.Error>{controller.error}</Section.Error>
        <div role='status'>
          {controller.result && !controller.result.pending ? (
            <Badge color={controller.result.success ? 'positive' : 'negative'}>
              {controller.result.success ? (controller.result.email ?? m.passed) : m.failed}
            </Badge>
          ) : (
            <Section.Description>{m.waitingForUsers}</Section.Description>
          )}
        </div>
      </div>
      <DirectoryRoles controller={controller} />
    </>
  );
}

function DirectoryRoles({ controller }: Pick<ManageProps, 'controller'>) {
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
          items={controller.roleRows}
          itemToStringValue={row => (row.group === null ? 'default' : `group:${row.group}`)}
        >
          {({ group, priority }) => (
            <Table.Row key={group === null ? 'default' : `group:${group}`}>
              <Table.Cell>{priority ?? '—'}</Table.Cell>
              <Table.Cell>{group ? (controller.result?.groupNames?.[group] ?? group) : m.everyoneElse}</Table.Cell>
              <Table.Cell>
                <AccessSelect
                  label={group ?? m.defaultRole}
                  hideLabel
                  value={
                    group === null
                      ? controller.form.values.defaultRole
                      : (controller.form.values.groupRoles[group] ??
                        controller.result?.groupRoles?.[group] ??
                        (controller.live ? 'none' : 'member'))
                  }
                  items={roles}
                  disabled={controller.pending}
                  onChange={value => {
                    if (group === null) {
                      controller.form.setValue('defaultRole', value);
                    } else {
                      controller.form.setValue('groupRoles', { ...controller.form.values.groupRoles, [group]: value });
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
