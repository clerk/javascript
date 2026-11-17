import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Button } from '../../../components/button';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Menu } from '../../../components/menu';
import { Radio } from '../../../components/radio';
import { Section } from '../../../components/section';
import { Separator } from '../../../components/separator';
import { Switch } from '../../../components/switch';
import { CheckmarkCircle } from '../../../icons/glyphs/checkmark-circle';
import { Cog6Teeth } from '../../../icons/glyphs/cog-6-teeth';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { Trash } from '../../../icons/glyphs/trash';
import { XCircle } from '../../../icons/glyphs/x-circle';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { mergeStyleProps, themeProps } from '../../../props';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import { AccessRadio, AccessSelect } from './access-fields.view';

export function AccessPolicyView({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const focus = useFlowAutoFocus<HTMLHeadingElement>();
  const { form, data, registerAddDomain } = c;
  const p = form.values;
  const usesSso = p.authentication === 'sso';
  return (
    <Form
      id={form.id}
      onSubmit={form.handleSubmit}
      {...mergeStyleProps(themeProps('access-policy'), stylex.props(styles.stack))}
    >
      <Section.Error>{form.error}</Section.Error>
      {p.id && (!data.live || usesSso) ? (
        <Section.Root>
          <Section.Group>
            <Section.Header>
              <Section.Title>{m.status}</Section.Title>
            </Section.Header>
            <Section.Body>
              <Section.Row>
                <Field.Root
                  orientation='horizontal'
                  disabled={form.isSubmitting}
                >
                  <Switch
                    checked={p.status === 'active'}
                    onChange={event => form.setValue('status', event.target.checked ? 'active' : 'inactive')}
                  />
                  <Field.Label>{p.status === 'active' ? m.active : m.inactive}</Field.Label>
                </Field.Root>
              </Section.Row>
            </Section.Body>
          </Section.Group>
        </Section.Root>
      ) : null}
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Title
              ref={focus}
              tabIndex={-1}
            >
              {m.domains}
            </Section.Title>
            <Section.Actions xstyle={styles.headerActions}>
              <Button
                ref={registerAddDomain}
                variant='outline'
                color='neutral'
                onClick={c.onAddDomain}
                disabled={form.isSubmitting}
              >
                <Icon glyph={Plus} />
                {m.add}
              </Button>
            </Section.Actions>
          </Section.Header>
          <Section.Body xstyle={styles.domainBody}>
            {!p.domains.length ? (
              <Section.Row xstyle={styles.domainRow}>
                <Section.Description>{m.noDomains}</Section.Description>
              </Section.Row>
            ) : (
              p.domains.map(domain => (
                <div key={domain.name}>
                  <Section.Row xstyle={styles.domainRow}>
                    <Section.Item xstyle={styles.domainItem}>
                      <Section.Label>{domain.name}</Section.Label>
                      <Section.Actions xstyle={[styles.headerActions, styles.domainActions]}>
                        <span {...stylex.props(styles.domainStatus)}>
                          <Icon
                            glyph={domain.affiliationVerified ? CheckmarkCircle : XCircle}
                            xstyle={domain.affiliationVerified && styles.verified}
                          />
                          {domain.affiliationVerified ? m.association : m.associationUnverified}
                        </span>
                        {usesSso ? (
                          <span {...stylex.props(styles.domainStatus)}>
                            <Icon
                              glyph={domain.verified ? CheckmarkCircle : XCircle}
                              xstyle={domain.verified && styles.verified}
                            />
                            {domain.verified ? m.verified : m.unverified}
                          </span>
                        ) : null}
                        <ActionMenu
                          label={m.actions}
                          triggerRef={c.domainRemoval.registerTrigger(domain.name)}
                          disabled={form.isSubmitting}
                          actions={[
                            ...(usesSso && !domain.verified && c.canVerifyDomain
                              ? [{ label: m.verify, onClick: () => c.onVerifyDomain(domain.name) }]
                              : []),
                            {
                              label: m.remove,
                              icon: Trash,
                              color: 'negative',
                              onClick: () => {
                                void c.domainRemoval
                                  .remove(domain.name)
                                  .then(() => c.domainRemoval.finalFocus()?.focus());
                              },
                            },
                          ]}
                        />
                      </Section.Actions>
                    </Section.Item>
                  </Section.Row>
                  {usesSso && !domain.verified && c.canVerifyDomain ? (
                    <div {...mergeStyleProps(themeProps('access-domain-notice'), stylex.props(styles.notice))}>
                      <Icon glyph={InformationCircle} />
                      <Section.Description>{m.verifyNotice}</Section.Description>
                      <Button
                        variant='outline'
                        color='neutral'
                        xstyle={styles.headerActions}
                        disabled={form.isSubmitting}
                        onClick={() => c.onVerifyDomain(domain.name)}
                      >
                        {m.verify}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </Section.Body>
        </Section.Group>
      </Section.Root>
      <PolicyAuthentication controller={c} />
      <PolicyEnrollment controller={c} />
    </Form>
  );
}

function PolicyAuthentication({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data } = c;
  const p = form.values;
  const usesSso = p.authentication === 'sso';
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>{m.authentication}</Section.Title>
        </Section.Header>
        <Section.Body>
          <div {...mergeStyleProps(themeProps('access-authentication'), stylex.props(styles.fields))}>
            {data.live && !data.canEditPolicyAuthentication ? (
              <>
                <Section.Label>{usesSso ? m.sso : m.defaultAuthentication}</Section.Label>
                {p.ssoConnectionIds.map(id => (
                  <Section.Description key={id}>{p.connectionNames?.[id] ?? id}</Section.Description>
                ))}
              </>
            ) : (
              <>
                <Radio.Group
                  aria-label={m.authentication}
                  value={p.authentication}
                  disabled={form.isSubmitting}
                  onValueChange={c.onAuthenticationChange}
                >
                  <AccessRadio
                    value='default'
                    label={m.defaultAuthentication}
                    description={m.defaultDescription}
                  />
                  <AccessRadio
                    value='sso'
                    label={m.sso}
                    description={m.ssoDescription}
                  />
                </Radio.Group>
                {usesSso ? <PolicySsoConnections controller={c} /> : !data.live ? <PolicyMfa controller={c} /> : null}
                {!data.live ? (
                  <>
                    <Separator />
                    <AccessSelect
                      label={m.reverification}
                      value={p.reverification}
                      items={[
                        { value: '1', label: m.hour },
                        { value: '12', label: m.twelveHours },
                        { value: '24', label: m.hours },
                      ]}
                      onChange={value => form.setValue('reverification', value)}
                      disabled={form.isSubmitting}
                    />
                  </>
                ) : null}
              </>
            )}
          </div>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

function PolicyEnrollment({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data } = c;
  const p = form.values;
  const usesSso = p.authentication === 'sso';
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>{m.enrollment}</Section.Title>
        </Section.Header>
        <Section.Body>
          <div {...mergeStyleProps(themeProps('access-enrollment'), stylex.props(styles.fields))}>
            {data.live && usesSso ? (
              <>
                <AccessSelect
                  label={m.enrollment}
                  value={p.enrollment === 'directory' ? 'directory' : 'automatic'}
                  items={[
                    { value: 'automatic', label: m.automatic },
                    ...(data.connections.some(item => item.kind === 'directory')
                      ? [{ value: 'directory', label: m.directory }]
                      : []),
                  ]}
                  onChange={c.onEnrollmentChange}
                  disabled={form.isSubmitting}
                />
                {p.enrollment === 'directory' ? (
                  <Section.Description>
                    {p.directoryConnectionId
                      ? (p.connectionNames?.[p.directoryConnectionId] ?? p.directoryConnectionId)
                      : null}
                  </Section.Description>
                ) : null}
              </>
            ) : (
              <Radio.Group
                aria-label={m.enrollment}
                value={p.enrollment}
                onValueChange={c.onEnrollmentChange}
                disabled={form.isSubmitting}
              >
                <AccessRadio
                  value='invitation'
                  label={m.invitation}
                  description={m.invitationDescription}
                />
                <AccessRadio
                  value='automatic'
                  label={m.automatic}
                  description={m.automaticDescription}
                />
                <AccessRadio
                  value='request'
                  label={m.request}
                  description={m.requestDescription}
                />
                {!data.live ? (
                  <AccessRadio
                    value='directory'
                    label={m.directory}
                    description={m.directoryDescription}
                  />
                ) : null}
              </Radio.Group>
            )}
            {p.enrollment === 'directory' && (!data.live || usesSso) ? <PolicyDirectory controller={c} /> : null}
          </div>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

function PolicySsoConnections({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data, registerAddSso } = c;
  const p = form.values;
  return (
    <div {...stylex.props(styles.inset)}>
      {p.ssoConnectionIds.map(id => (
        <div
          key={id}
          {...stylex.props(styles.connectionRow)}
        >
          <div {...stylex.props(styles.connectionControl)}>
            <AccessSelect
              label={m.connections}
              hideLabel={id !== p.ssoConnectionIds[0]}
              provider={data.connections.find(item => item.id === id)?.configuration.provider}
              value={id}
              items={data.connections
                .filter(item => item.kind === 'sso' && (item.id === id || !p.ssoConnectionIds.includes(item.id)))
                .map(item => ({ value: item.id, label: item.configuration.name }))}
              onChange={next =>
                form.setValue(
                  'ssoConnectionIds',
                  p.ssoConnectionIds.map(value => (value === id ? next : value)),
                )
              }
              disabled={form.isSubmitting}
            />
          </div>
          <Button
            variant='outline'
            color='neutral'
            shape='square'
            aria-label={m.manage}
            onClick={() => c.onManage(id)}
            disabled={form.isSubmitting}
          >
            <Icon glyph={Cog6Teeth} />
          </Button>
          <Button
            ref={c.ssoRemoval.registerTrigger(id)}
            shape='square'
            aria-label={m.remove}
            variant='outline'
            color='neutral'
            disabled={form.isSubmitting}
            onClick={() => {
              void c.ssoRemoval.remove(id).then(() => c.ssoRemoval.finalFocus()?.focus());
            }}
          >
            <Icon glyph={Trash} />
          </Button>
        </div>
      ))}
      {c.availableSsoConnections.length ? (
        <Menu.Root>
          <Menu.Trigger
            ref={registerAddSso}
            render={
              <Button
                variant='outline'
                color='neutral'
                xstyle={styles.fit}
              />
            }
            disabled={form.isSubmitting}
          >
            <Icon glyph={Plus} />
            {m.addConnection}
          </Menu.Trigger>
          <Menu.Popup>
            {c.availableSsoConnections.map(connection => (
              <Menu.Item
                key={connection.id}
                label={connection.configuration.name}
                onClick={() => c.onAttachSso(connection.id)}
              >
                <Menu.Label>{connection.configuration.name}</Menu.Label>
              </Menu.Item>
            ))}
            <Menu.Item
              label={m.ssoTitle}
              onClick={() => c.onSetup('sso')}
            >
              <Menu.Label>{m.ssoTitle}</Menu.Label>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      ) : (
        <Button
          xstyle={styles.fit}
          ref={registerAddSso}
          variant='outline'
          color='neutral'
          onClick={() => c.onSetup('sso')}
          disabled={form.isSubmitting}
        >
          <Icon glyph={Plus} />
          {m.addConnection}
        </Button>
      )}
    </div>
  );
}

function PolicyDirectory({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data } = c;
  const p = form.values;
  return (
    <div {...stylex.props(styles.inset)}>
      {p.directoryConnectionId || data.live ? (
        <div {...stylex.props(styles.connectionRow)}>
          <AccessSelect
            label={m.directory}
            value={p.directoryConnectionId}
            provider={data.connections.find(item => item.id === p.directoryConnectionId)?.configuration.provider}
            items={data.connections
              .filter(item => item.kind === 'directory')
              .map(item => ({ value: item.id, label: item.configuration.name }))}
            onChange={id => form.setValue('directoryConnectionId', id)}
            disabled={form.isSubmitting}
          />
          <Button
            variant='outline'
            color='neutral'
            shape='square'
            aria-label={m.manage}
            disabled={form.isSubmitting || !p.directoryConnectionId}
            onClick={() => c.onManage(p.directoryConnectionId ?? '')}
          >
            <Icon glyph={Cog6Teeth} />
          </Button>
        </div>
      ) : (
        <Button
          variant='outline'
          color='neutral'
          xstyle={styles.fit}
          onClick={() => c.onSetup('directory')}
          disabled={form.isSubmitting}
        >
          <Icon glyph={Plus} />
          {m.addDirectory}
        </Button>
      )}
    </div>
  );
}

function PolicyMfa({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form } = c;
  const p = form.values;
  return (
    <>
      <Separator />
      <Field.Root
        orientation='horizontal'
        disabled={form.isSubmitting}
      >
        <Field.Content>
          <Field.Label>{m.mfa}</Field.Label>
        </Field.Content>
        <Switch
          checked={p.mfaEnabled}
          onChange={event => form.setValue('mfaEnabled', event.target.checked)}
        />
        <span>{p.mfaEnabled ? m.enabled : m.disabled}</span>
      </Field.Root>
      {p.mfaEnabled ? (
        <Radio.Group
          aria-label={m.mfa}
          value={p.mfa}
          onValueChange={c.onMfaChange}
          disabled={form.isSubmitting}
        >
          <AccessRadio
            value='optional'
            label={m.optional}
            description={m.optionalDescription}
          />
          <AccessRadio
            value='required'
            label={m.required}
            description={m.requiredDescription}
          />
        </Radio.Group>
      ) : null}
    </>
  );
}
