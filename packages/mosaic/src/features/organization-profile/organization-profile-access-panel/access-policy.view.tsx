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
  const { form, data, registerAddDomain, registerAddSso } = c;
  const p = form.values;
  return (
    <Form
      id={form.id}
      onSubmit={form.handleSubmit}
      {...mergeStyleProps(themeProps('access-policy'), stylex.props(styles.stack))}
    >
      <Section.Error>{form.error}</Section.Error>
      {p.id ? (
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
                            glyph={CheckmarkCircle}
                            xstyle={styles.verified}
                          />
                          {m.association}
                        </span>
                        <span {...stylex.props(styles.domainStatus)}>
                          <Icon
                            glyph={domain.verified ? CheckmarkCircle : XCircle}
                            xstyle={domain.verified && styles.verified}
                          />
                          {domain.verified ? m.verified : m.unverified}
                        </span>
                        <ActionMenu
                          label={m.actions}
                          triggerRef={c.domainRemoval.registerTrigger(domain.name)}
                          disabled={form.isSubmitting}
                          actions={[
                            ...(!domain.verified
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
                  {p.authentication === 'sso' && !domain.verified ? (
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
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Title>{m.authentication}</Section.Title>
          </Section.Header>
          <Section.Body>
            <div {...mergeStyleProps(themeProps('access-authentication'), stylex.props(styles.fields))}>
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
              {p.authentication === 'sso' ? (
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
                            .filter(
                              item => item.kind === 'sso' && (item.id === id || !p.ssoConnectionIds.includes(item.id)),
                            )
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
                        onClick={() =>
                          c.onSetup(
                            'sso',
                            data.connections.find(item => item.id === id),
                          )
                        }
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
              ) : (
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
              )}
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
            </div>
          </Section.Body>
        </Section.Group>
      </Section.Root>
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Title>{m.enrollment}</Section.Title>
          </Section.Header>
          <Section.Body>
            <div {...mergeStyleProps(themeProps('access-enrollment'), stylex.props(styles.fields))}>
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
                <AccessRadio
                  value='directory'
                  label={m.directory}
                  description={m.directoryDescription}
                />
              </Radio.Group>
              {p.enrollment === 'directory' ? (
                <div {...stylex.props(styles.inset)}>
                  {p.directoryConnectionId ? (
                    <div {...stylex.props(styles.connectionRow)}>
                      <AccessSelect
                        label={m.directory}
                        value={p.directoryConnectionId}
                        provider={
                          data.connections.find(item => item.id === p.directoryConnectionId)?.configuration.provider
                        }
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
                        disabled={form.isSubmitting}
                        onClick={() =>
                          c.onSetup(
                            'directory',
                            data.connections.find(item => item.id === p.directoryConnectionId),
                          )
                        }
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
              ) : null}
            </div>
          </Section.Body>
        </Section.Group>
      </Section.Root>
    </Form>
  );
}
