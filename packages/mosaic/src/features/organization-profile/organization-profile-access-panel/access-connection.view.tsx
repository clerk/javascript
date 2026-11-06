import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { CopyButton } from '../../../components/copy-button';
import { EmptyState } from '../../../components/empty-state';
import { Field } from '../../../components/field';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import { Icon, IconFrame } from '../../../components/icon';
import { Input } from '../../../components/input';
import { InputGroup } from '../../../components/input-group';
import { Section } from '../../../components/section';
import { SegmentedControl } from '../../../components/segmented-control';
import { Separator } from '../../../components/separator';
import { Switch } from '../../../components/switch';
import { Table } from '../../../components/table';
import { ArrowUpRight } from '../../../icons/glyphs/arrow-up-right';
import { ChevronDown } from '../../../icons/glyphs/chevron-down';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { RotateAntiClockwise } from '../../../icons/glyphs/rotate-anti-clockwise';
import { ShieldCheck } from '../../../icons/glyphs/shield-check';
import { useMessages } from '../../../localization';
import { Collapsible } from '../../../primitives/collapsible';
import { Form } from '../../../primitives/form';
import { mergeStyleProps, themeProps } from '../../../props';
import { styles } from './access.styles';
import type { AccessData, AccessProvider } from './access.types';
import type { AccessConnectionController } from './access-connection.controller';
import { AccessCopyField, AccessProviderIcon, AccessSelect } from './access-fields.view';

type ConnectionProps = { controller: AccessConnectionController; data: AccessData };

export function AccessConnectionFooter({ controller: c }: { controller: AccessConnectionController }) {
  const m = useMessages('organizationProfile').access;
  const progress = c.kind === 'sso' ? c.progress : c.directoryStep;
  const total = c.kind === 'sso' ? 3 : 4;
  return (
    <>
      {c.step !== 'saved' && (c.kind === 'sso' || c.step !== 'provider') ? (
        <AccessStepIndicator
          current={progress}
          total={total}
        />
      ) : null}
      {c.step === 'saved' && c.kind === 'sso' ? (
        <Button
          fullWidth={false}
          variant='outline'
          color='neutral'
          onClick={() => c.onOpenChange(false)}
        >
          {m.cancel}
        </Button>
      ) : null}
      {c.step === 'provider' ? (
        <Button
          fullWidth={false}
          variant='outline'
          color='neutral'
          disabled={c.pending}
          onClick={() => c.onOpenChange(false)}
        >
          {m.back}
        </Button>
      ) : c.step !== 'saved' && (c.kind === 'sso' || c.step !== 'configure') ? (
        <Button
          fullWidth={false}
          variant='outline'
          color='neutral'
          disabled={c.pending}
          onClick={c.onBack}
        >
          {m.back}
        </Button>
      ) : null}
      <SubmitButton
        fullWidth={false}
        type='button'
        isPending={c.form.isSubmitting}
        disabled={!c.canContinue}
        onClick={c.onContinue}
      >
        {c.canSave ? m.save : m.continue}
      </SubmitButton>
    </>
  );
}

function AccessStepIndicator({ current, total }: { current: number; total: number }) {
  const m = useMessages('organizationProfile').access;
  const steps = Array.from({ length: total }, (_, index) => index + 1);
  return (
    <div {...stylex.props(styles.connectionProgress)}>
      <Section.Description xstyle={styles.progressLabel}>
        {m.step}{' '}
        <span {...stylex.props(styles.progressCount)}>
          {current} {m.of} {total}
        </span>
      </Section.Description>
      <div
        role='progressbar'
        aria-label={m.progress}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        {...stylex.props(styles.progress)}
      >
        {steps.map(step => (
          <span
            key={step}
            {...stylex.props(styles.progressStep, step === current && styles.progressCurrent)}
          />
        ))}
      </div>
    </div>
  );
}

export function AccessConnectionSteps(props: ConnectionProps) {
  const c = props.controller;
  return (
    <Flow.Root
      value={c.step}
      direction={c.direction}
      state={props}
    >
      {current => (
        <>
          <Flow.Step
            ids={['provider']}
            xstyle={styles.connectionStep}
          >
            <ProviderStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['configure']}
            xstyle={styles.connectionStep}
          >
            <ConfigureStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['attributes']}
            xstyle={styles.connectionStep}
          >
            <AttributesStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['assignment']}
            xstyle={styles.connectionStep}
          >
            <AssignmentStep />
          </Flow.Step>
          <Flow.Step
            ids={['metadata']}
            xstyle={styles.connectionStep}
          >
            <MetadataStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['test']}
            xstyle={styles.connectionStep}
          >
            <TestStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['roles']}
            xstyle={styles.connectionStep}
          >
            <RolesStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['saved', 'complete']}
            xstyle={styles.connectionStep}
          >
            <SavedStep controller={current.controller} />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}

export function AccessConnectionHeader({ editing }: { editing: boolean }) {
  const m = useMessages('organizationProfile').access;
  return (
    <Card.Header xstyle={styles.dialogHeader}>
      <Card.Title xstyle={styles.dialogTitle}>{editing ? m.manageSso : m.ssoTitle}</Card.Title>
    </Card.Header>
  );
}
function StepTitle({ children }: { children: string }) {
  const focus = useFlowAutoFocus<HTMLHeadingElement>();
  return (
    <Section.Header>
      <Section.Title
        ref={focus}
        tabIndex={-1}
      >
        {children}
      </Section.Title>
    </Section.Header>
  );
}
function ProviderStep({ controller: c }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  const providers: AccessProvider[] =
    c.kind === 'directory' ? ['okta', 'entra', 'google'] : ['okta', 'entra', 'google', 'saml', 'oidc'];
  const groups: AccessProvider[][] =
    c.kind === 'directory' ? [providers] : [providers.filter(provider => provider !== 'oidc'), ['oidc']];
  return (
    <>
      <StepTitle>{m.chooseProvider}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        {groups.map(group => (
          <div
            key={group[0]}
            {...mergeStyleProps(themeProps('access-provider-group'), stylex.props(styles.providerGroupStack))}
          >
            {c.kind === 'sso' ? (
              <Section.Description>{group[0] === 'oidc' ? m.oidc : m.saml}</Section.Description>
            ) : null}
            <div {...mergeStyleProps(themeProps('access-providers'), stylex.props(styles.grid))}>
              {group.map(provider => (
                <Button
                  key={provider}
                  variant='outline'
                  color='neutral'
                  aria-pressed={c.form.values.provider === provider}
                  xstyle={[styles.provider, c.form.values.provider === provider && styles.selectedProvider]}
                  onClick={() => c.onProvider(provider)}
                >
                  <IconFrame
                    filled={c.form.values.provider !== provider}
                    size='sm'
                  >
                    <AccessProviderIcon provider={provider} />
                  </IconFrame>
                  {m.providers[provider]}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function ConnectionInput({
  controller: c,
  name,
  label,
  type = 'text',
}: {
  controller: AccessConnectionController;
  name:
    | 'name'
    | 'metadataUrl'
    | 'signOnUrl'
    | 'issuer'
    | 'certificate'
    | 'clientId'
    | 'clientSecret'
    | 'tokenUrl'
    | 'userInfoUrl'
    | 'subjectEmail';
  label: string;
  type?: 'text' | 'password' | 'url' | 'email';
}) {
  const m = useMessages('organizationProfile').access;
  return (
    <Field.Root
      disabled={c.pending}
      xstyle={name === 'metadataUrl' && styles.metadataInput}
    >
      <Field.Label>{label}</Field.Label>
      <Input
        type={type}
        placeholder={name === 'metadataUrl' ? m.pasteUrl : undefined}
        {...c.form.register(name)}
      />
    </Field.Root>
  );
}
function ConfigureStep({ controller: c, data }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  return (
    <>
      <StepTitle>
        {c.editing
          ? m.connectionSettings
          : c.kind === 'sso' && c.form.values.provider !== 'oidc'
            ? m.createSamlApp
            : m.configure}
      </StepTitle>
      <Form
        id={c.form.id}
        onSubmit={c.form.handleSubmit}
        {...mergeStyleProps(themeProps('access-connection-form'), stylex.props(styles.stepContent))}
      >
        {c.kind === 'directory' ? <Section.Description>{m.directoryConfigureDescription}</Section.Description> : null}
        <div {...mergeStyleProps(themeProps('access-selected-provider'), stylex.props(styles.providerGroup))}>
          <div {...stylex.props(styles.providerSummary)}>
            <AccessProviderIcon provider={c.form.values.provider} />
            <Section.Label>{m.providers[c.form.values.provider]}</Section.Label>
            <Button
              variant='outline'
              color='neutral'
              xstyle={styles.headerActions}
              onClick={c.onBack}
              disabled={c.pending}
            >
              {m.change}
            </Button>
          </div>
          {c.kind === 'directory' ? (
            <div {...mergeStyleProps(themeProps('access-provider-instructions'), stylex.props(styles.instructions))}>
              <Collapsible.Root>
                <Collapsible.Trigger
                  render={
                    <Button
                      variant='ghost'
                      color='neutral'
                      size='xs'
                      fullWidth
                      xstyle={styles.instructionsTrigger}
                    />
                  }
                >
                  {m.viewInstructions}
                  <Icon glyph={ChevronDown} />
                </Collapsible.Trigger>
                <Collapsible.Panel>
                  <div {...stylex.props(styles.instructionsContent)}>
                    <Section.Description>
                      {c.form.values.provider === 'google' ? m.googleInstructions : m.directoryInstructions}
                    </Section.Description>
                  </div>
                </Collapsible.Panel>
              </Collapsible.Root>
            </div>
          ) : null}
        </div>
        <ConnectionInput
          controller={c}
          name='name'
          label={m.name}
        />
        {c.kind === 'directory' ? (
          <DirectoryConfiguration
            controller={c}
            data={data}
          />
        ) : (
          <SsoConfiguration
            controller={c}
            data={data}
          />
        )}
      </Form>
    </>
  );
}
function SsoConfiguration({ controller: c, data }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  const oidc = c.form.values.provider === 'oidc';
  return (
    <>
      {!c.editing ? (
        <Section.Description>
          {oidc ? m.oidcInstructions : c.form.values.provider === 'okta' ? m.oktaSamlInstructions : m.samlInstructions}
        </Section.Description>
      ) : null}
      {oidc ? (
        <AccessCopyField
          label={m.redirectUri}
          value={data.serviceProvider.redirectUri}
        />
      ) : (
        <>
          <AccessCopyField
            label={m.signOnUrl}
            value={data.serviceProvider.signOnUrl}
          />
          <AccessCopyField
            label={m.audience}
            value={data.serviceProvider.audience}
          />
        </>
      )}
    </>
  );
}
function MetadataStep({ controller: c }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  const oidc = c.form.values.provider === 'oidc';
  return (
    <Form
      onSubmit={c.form.handleSubmit}
      {...mergeStyleProps(themeProps('access-connection-form'), stylex.props(styles.stepContent))}
    >
      {oidc ? (
        <>
          <ConnectionInput
            controller={c}
            name='clientId'
            label={m.clientId}
          />
          <ConnectionInput
            controller={c}
            name='clientSecret'
            label={m.clientSecret}
            type='password'
          />
        </>
      ) : null}
      <SegmentedControl.Root
        value={c.form.values.mode}
        onValueChange={c.onModeChange}
        xstyle={styles.fit}
        aria-label={m.configure}
      >
        <SegmentedControl.Item value='metadata'>{m.metadata}</SegmentedControl.Item>
        {!oidc ? <SegmentedControl.Item value='file'>{m.metadataFile}</SegmentedControl.Item> : null}
        <SegmentedControl.Item value='manual'>{m.manual}</SegmentedControl.Item>
      </SegmentedControl.Root>
      <div {...stylex.props(styles.headingGroup)}>
        <StepTitle>
          {c.form.values.mode === 'metadata'
            ? m.metadataHeading
            : c.form.values.mode === 'file'
              ? m.metadataFile
              : m.manual}
        </StepTitle>
        {c.form.values.mode === 'metadata' && c.form.values.provider === 'okta' ? (
          <Section.Description>{m.oktaMetadataInstructions}</Section.Description>
        ) : null}
      </div>
      {c.form.values.mode === 'metadata' ? (
        <ConnectionInput
          controller={c}
          name='metadataUrl'
          label={oidc ? m.discoveryUrl : m.metadataUrl}
          type='url'
        />
      ) : null}
      {c.form.values.mode === 'file' ? (
        <Field.Root>
          <Field.Label>{m.file}</Field.Label>
          <Input
            type='file'
            accept='.xml,text/xml,application/xml'
            onChange={event => c.form.setValue('metadataFile', event.target.files?.[0] ?? null)}
          />
          <Field.Description>{c.form.values.metadataFile?.name}</Field.Description>
        </Field.Root>
      ) : null}
      {c.form.values.mode === 'manual' ? (
        <>
          <ConnectionInput
            controller={c}
            name='signOnUrl'
            label={m.signOnUrl}
            type='url'
          />
          {oidc ? (
            <>
              <ConnectionInput
                controller={c}
                name='tokenUrl'
                label={m.tokenUrl}
                type='url'
              />
              <ConnectionInput
                controller={c}
                name='userInfoUrl'
                label={m.userInfoUrl}
                type='url'
              />
            </>
          ) : (
            <>
              <ConnectionInput
                controller={c}
                name='issuer'
                label={m.issuer}
              />
              <ConnectionInput
                controller={c}
                name='certificate'
                label={m.certificate}
              />
            </>
          )}
        </>
      ) : null}
    </Form>
  );
}
function DirectoryConfiguration({ controller: c, data }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  return (
    <>
      {c.matchingSsoConnections.length > 1 ? (
        <AccessSelect
          label={m.ssoConnection}
          value={c.form.values.ssoConnectionId || null}
          items={c.matchingSsoConnections.map(item => ({ value: item.id, label: item.configuration.name }))}
          onChange={id => c.form.setValue('ssoConnectionId', id)}
          disabled={c.pending}
        />
      ) : null}
      {!c.matchingSsoConnections.length ? <Section.Note>{m.missingSso}</Section.Note> : null}
      {c.form.values.provider === 'google' ? (
        <>
          <ConnectionInput
            controller={c}
            name='subjectEmail'
            label={m.subjectEmail}
            type='email'
          />
          <Field.Root
            disabled={c.pending}
            invalid={c.form.fields.serviceAccountFile.feedback?.type === 'error'}
          >
            <Field.Label>{m.serviceAccount}</Field.Label>
            <Input
              type='file'
              accept='.json,application/json'
              onChange={event => c.onServiceAccount(event.target.files?.[0] ?? null)}
            />
            <Field.Description>{c.form.values.serviceAccountFile?.name}</Field.Description>
            <Field.Feedback feedback={c.form.fields.serviceAccountFile.feedback} />
          </Field.Root>
        </>
      ) : (
        <>
          <AccessCopyField
            label={m.scimEndpoint}
            value={data.serviceProvider.scimUrl}
          />
          <div {...stylex.props(styles.connectionRow)}>
            <div {...stylex.props(styles.grow)}>
              <AccessCopyField
                label={m.bearerToken}
                value={c.tokenVisible ? data.serviceProvider.token : ''}
              />
            </div>
            <Button
              variant='outline'
              color='neutral'
              disabled={c.tokenVisible}
              onClick={c.onRevealToken}
            >
              <Icon glyph={RotateAntiClockwise} />
              {m.generateToken}
            </Button>
          </div>
          <div {...stylex.props(styles.row)}>
            <Icon glyph={InformationCircle} />
            <Section.Description>{m.tokenNotice}</Section.Description>
          </div>
        </>
      )}
    </>
  );
}
function AttributesStep({ controller: c }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  const attributes: { id: string; label: string; expression?: string }[] =
    c.kind === 'directory'
      ? [
          { id: 'userName', label: m.email },
          { id: 'name.givenName', label: m.firstName },
          { id: 'name.familyName', label: m.lastName },
        ]
      : [
          {
            id: c.form.values.provider === 'oidc' ? 'email' : 'mail',
            label: m.email,
            expression: 'user.profile.email',
          },
          {
            id: c.form.values.provider === 'oidc' ? 'given_name' : 'firstName',
            label: m.firstName,
            expression: 'user.profile.firstName',
          },
          {
            id: c.form.values.provider === 'oidc' ? 'family_name' : 'lastName',
            label: m.lastName,
            expression: 'user.profile.lastName',
          },
        ];
  return (
    <>
      <StepTitle>{c.kind === 'sso' ? m.attributeStatements : m.attributes}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        <Section.Description>
          {c.kind === 'directory'
            ? m.directoryAttributes
            : c.form.values.provider === 'okta'
              ? m.oktaAttributeDescription
              : m.attributeDescription}
        </Section.Description>
        <Table.Root aria-label={m.attributes}>
          <Table.Header>
            <Table.Column>{m.fromProvider}</Table.Column>
            <Table.Column>{m.mapsTo}</Table.Column>
          </Table.Header>
          <Table.Body
            items={attributes}
            itemToStringValue={item => item.id}
          >
            {item => (
              <Table.Row key={item.id}>
                <Table.Cell>
                  {item.id}{' '}
                  {c.kind === 'sso' ? (
                    <Badge color={item.label === m.email ? 'warning' : 'neutral'}>
                      {item.label === m.email ? m.required : m.optional}
                    </Badge>
                  ) : null}
                </Table.Cell>
                <Table.Cell>
                  {c.kind === 'sso' && c.form.values.provider === 'okta' ? (
                    <InputGroup.Root>
                      <InputGroup.Input
                        aria-label={item.id}
                        readOnly
                        value={item.expression}
                      />
                      <InputGroup.End>
                        <CopyButton
                          value={item.expression ?? ''}
                          label={m.copy}
                          copiedLabel={m.copied}
                        />
                      </InputGroup.End>
                    </InputGroup.Root>
                  ) : (
                    item.label
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
    </>
  );
}
function AssignmentStep() {
  const m = useMessages('organizationProfile').access;
  return (
    <>
      <StepTitle>{m.assignment}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        <Section.Description>{m.assignmentDescription}</Section.Description>
        <ol {...stylex.props(styles.instructionsList)}>
          <li>{m.assignStepOne}</li>
          <li>{m.assignStepTwo}</li>
        </ol>
        <div {...stylex.props(styles.row)}>
          <Icon glyph={InformationCircle} />
          <Section.Description>{m.assignmentTip}</Section.Description>
        </div>
      </div>
    </>
  );
}
function TestStep({ controller: c, data }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  const rows = [
    { id: 'email', label: m.email, value: c.result?.email },
    { id: 'firstName', label: m.firstName, value: c.result?.firstName },
    { id: 'lastName', label: m.lastName, value: c.result?.lastName },
  ];
  return (
    <>
      <StepTitle>{c.kind === 'sso' ? m.testYourConnection : m.test}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        <Section.Description>{c.kind === 'directory' ? m.directoryTest : m.testDescription}</Section.Description>
        {c.kind === 'sso' ? (
          <>
            <AccessCopyField
              label={m.testUrl}
              value={data.serviceProvider.testUrl}
            />
            <a
              href={data.serviceProvider.testUrl}
              target='_blank'
              rel='noreferrer'
              {...mergeStyleProps(themeProps('access-test-link'), stylex.props(styles.row, styles.fit))}
            >
              <Icon glyph={ArrowUpRight} />
              {m.openTest}
            </a>
          </>
        ) : null}
        <Separator />
        <div {...stylex.props(styles.row)}>
          <Section.Title>{m.testResults}</Section.Title>
          <SubmitButton
            variant='outline'
            color='neutral'
            type='button'
            isPending={c.test.isPending}
            disabled={c.form.isSubmitting}
            xstyle={styles.headerActions}
            onClick={c.onTest}
          >
            <Icon glyph={RotateAntiClockwise} />
            {m.runTest}
          </SubmitButton>
        </div>
        <Section.Error>{c.test.error}</Section.Error>
        {c.result ? (
          <>
            <div role='status'>
              <Badge color={c.result.success ? 'positive' : 'negative'}>{c.result.success ? m.passed : m.failed}</Badge>
            </div>
            <Section.Body>
              <div {...stylex.props(styles.fields)}>
                {!c.result.success ? (
                  <>
                    <Section.Title>{m.errorTitle}</Section.Title>
                    <Section.Error>{m.missingEmail}</Section.Error>
                    <Separator />
                    <Section.Title>{m.howToFix}</Section.Title>
                    <ol {...stylex.props(styles.instructionsList)}>
                      <li>{m.fixStepOne}</li>
                      <li>{m.fixStepTwo}</li>
                    </ol>
                    <Separator />
                  </>
                ) : null}
                <Section.Title>{m.dataReceived}</Section.Title>
                <Table.Root aria-label={m.received}>
                  <Table.Header>
                    <Table.Column>{m.fromProvider}</Table.Column>
                    <Table.Column>{m.mapsTo}</Table.Column>
                    <Table.Column>{m.received}</Table.Column>
                  </Table.Header>
                  <Table.Body
                    items={rows}
                    itemToStringValue={item => item.id}
                  >
                    {item => (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          {item.id === 'email' && c.form.values.provider !== 'oidc' ? 'mail' : item.id}
                        </Table.Cell>
                        <Table.Cell>{item.label}</Table.Cell>
                        <Table.Cell>{item.value ?? m.notProvided}</Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </div>
            </Section.Body>
          </>
        ) : null}
      </div>
    </>
  );
}
function RolesStep({ controller: c }: ConnectionProps) {
  const m = useMessages('organizationProfile').access;
  const roles = [
    { value: 'member', label: m.member },
    { value: 'admin', label: m.admin },
    { value: 'none', label: m.none },
  ];
  return (
    <>
      <StepTitle>{m.roles}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        <Section.Description>{m.roleDescription}</Section.Description>
        <AccessSelect
          label={m.defaultRole}
          value={c.form.values.defaultRole}
          items={roles}
          onChange={value => c.form.setValue('defaultRole', value)}
          disabled={c.pending}
        />
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
        {c.form.values.syncGroups
          ? c.result?.groups?.map(group => (
              <AccessSelect
                key={group}
                label={group}
                value={c.form.values.groupRoles[group] ?? 'member'}
                items={roles}
                onChange={value => c.form.setValue('groupRoles', { ...c.form.values.groupRoles, [group]: value })}
                disabled={c.pending}
              />
            ))
          : null}
      </div>
    </>
  );
}
function SavedStep({ controller: c }: Pick<ConnectionProps, 'controller'>) {
  const m = useMessages('organizationProfile').access;
  const focus = useFlowAutoFocus<HTMLDivElement>();
  return (
    <EmptyState.Root
      ref={focus}
      tabIndex={-1}
      xstyle={styles.savedState}
    >
      <EmptyState.Icon glyph={ShieldCheck} />
      <EmptyState.Label>
        {c.editing ? m.connectionUpdated : c.kind === 'sso' ? m.ssoSaved : m.directorySaved}
      </EmptyState.Label>
      <EmptyState.Description>{m.savedDescription}</EmptyState.Description>
    </EmptyState.Root>
  );
}
