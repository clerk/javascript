import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Link } from '../../../components/link';
import { Section } from '../../../components/section';
import { Table } from '../../../components/table';
import { ChevronDown } from '../../../icons/glyphs/chevron-down';
import { useMessages } from '../../../localization';
import { Collapsible } from '../../../primitives/collapsible';
import { Form } from '../../../primitives/form';
import { styles } from './access.styles';
import type { AccessData, ConnectionKind } from './access.types';
import { ConnectionInput, SsoConnectValues, SsoMetadataFields } from './access-connection-fields.view';
import { DirectorySettings } from './access-directory-settings.view';
import { AccessProviderIcon } from './access-fields.view';
import type { AccessManageConnectionController } from './access-manage-connection.controller';

export interface ManageProps {
  controller: AccessManageConnectionController;
  serviceProvider: AccessData['serviceProvider'];
}

export function AccessManageConnectionView({
  controller,
  kind,
  serviceProvider,
}: ManageProps & { kind: ConnectionKind }) {
  const m = useMessages('organizationProfile').access;
  const focus = useFlowAutoFocus<HTMLDivElement>();
  const provider = controller.form.values.provider;
  return (
    <div
      ref={focus}
      tabIndex={-1}
    >
      <Form
        id={controller.form.id}
        onSubmit={controller.form.handleSubmit}
      >
        <div {...stylex.props(styles.stack)}>
          <Section.Error>{controller.form.error}</Section.Error>
          <div {...stylex.props(styles.providerCard)}>
            <AccessProviderIcon provider={provider} />
            <Section.Label>
              {kind === 'directory' && provider === 'saml' ? m.customDirectory : m.providers[provider]}
            </Section.Label>
            <Button
              size='sm'
              variant='outline'
              color='neutral'
              xstyle={styles.headerActions}
              aria-expanded={controller.editingSettings}
              disabled={controller.pending}
              onClick={controller.onEditSettings}
            >
              {controller.editingSettings ? m.done : m.edit}
            </Button>
          </div>
          <ConnectionInput
            controller={controller}
            name='name'
            readOnly={kind === 'directory' && controller.live}
            label={m.name}
          />
          {kind === 'sso' ? (
            <>
              {controller.editingSettings ? <SsoMetadataFields controller={controller} /> : null}
              <div {...stylex.props(styles.stepContent)}>
                <Section.Title>{m.connect}</Section.Title>
                <SsoConnectValues
                  oidc={provider === 'oidc'}
                  serviceProvider={serviceProvider}
                />
              </div>
              <SsoTestRuns controller={controller} />
            </>
          ) : (
            <DirectorySettings
              controller={controller}
              serviceProvider={serviceProvider}
            />
          )}
        </div>
      </Form>
    </div>
  );
}

function SsoTestRuns({ controller }: Pick<ManageProps, 'controller'>) {
  const m = useMessages('organizationProfile').access;
  return (
    <div {...stylex.props(styles.stepContent)}>
      <Section.Header>
        <Section.Content>
          <Section.Title>{m.test}</Section.Title>
          <Section.Description>{m.manageSsoTestDescription}</Section.Description>
        </Section.Content>
        <Section.Actions>
          {controller.onStartTest ? (
            <Button
              type='button'
              onClick={controller.onStartTest}
              disabled={controller.pending}
            >
              {m.startTest}
            </Button>
          ) : null}
          {controller.testUrl ? (
            <Link
              href={controller.testUrl}
              target='_blank'
              rel='noreferrer'
            >
              {m.openTest}
            </Link>
          ) : null}
          <SubmitButton
            type='button'
            variant='outline'
            color='neutral'
            isPending={controller.testing}
            disabled={controller.pending || Boolean(controller.onStartTest && !controller.testUrl)}
            onClick={controller.onTest}
          >
            {m.test}
          </SubmitButton>
        </Section.Actions>
      </Section.Header>
      <Section.Error>{controller.error}</Section.Error>
      {controller.result?.pending ? <Section.Description role='status'>{m.testPending}</Section.Description> : null}
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
          {m.logs} <Badge color='neutral'>{controller.runs.length}</Badge>
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
              items={controller.runs}
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
