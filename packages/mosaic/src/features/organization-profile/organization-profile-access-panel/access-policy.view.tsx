import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Button } from '../../../components/button';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Radio } from '../../../components/radio';
import { Section } from '../../../components/section';
import { Separator } from '../../../components/separator';
import { Switch } from '../../../components/switch';
import { CheckmarkCircle } from '../../../icons/glyphs/checkmark-circle';
import { ExclamationCircle } from '../../../icons/glyphs/exclamation-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { Trash } from '../../../icons/glyphs/trash';
import { XCircle } from '../../../icons/glyphs/x-circle';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { mergeStyleProps, themeProps } from '../../../props';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import { AccessRadio, AccessSelect } from './access-fields.view';
import { PolicyDirectory, PolicySsoConnections } from './access-policy-connections.view';

export function AccessPolicyView({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const focus = useFlowAutoFocus<HTMLHeadingElement>();
  const { form, data, registerAddDomain } = controller;
  const policy = form.values;
  const usesSso = policy.authentication === 'sso';
  return (
    <Form
      id={form.id}
      onSubmit={form.handleSubmit}
      {...mergeStyleProps(themeProps('access-policy'), stylex.props(styles.stack))}
    >
      <Section.Error>{form.error}</Section.Error>
      {policy.id && (!data.live || usesSso) ? (
        <Section.Root>
          <Section.Group>
            <Section.Header>
              <Section.Title>{m.status}</Section.Title>
            </Section.Header>
            <Section.Body>
              <Section.Row xstyle={styles.statusRow}>
                <Field.Root
                  orientation='horizontal'
                  disabled={form.isSubmitting}
                >
                  <Switch
                    checked={policy.status === 'active'}
                    onChange={event => form.setValue('status', event.target.checked ? 'active' : 'inactive')}
                  />
                  <Field.Label>{policy.status === 'active' ? m.active : m.inactive}</Field.Label>
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
              {policy.domains.length ? m.domains : m.target}
            </Section.Title>
            <Section.Actions xstyle={styles.headerActions}>
              <Button
                ref={registerAddDomain}
                variant='outline'
                color='neutral'
                onClick={controller.onAddDomain}
                disabled={form.isSubmitting}
              >
                <Icon glyph={Plus} />
                {m.add}
              </Button>
            </Section.Actions>
          </Section.Header>
          <Section.Body xstyle={styles.domainBody}>
            {!policy.domains.length ? (
              <Section.Row xstyle={styles.domainRow}>
                <Section.Description>{m.noDomains}</Section.Description>
              </Section.Row>
            ) : (
              policy.domains.map(domain => (
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
                          triggerRef={controller.domainRemoval.registerTrigger(domain.name)}
                          disabled={form.isSubmitting}
                          actions={[
                            ...(usesSso && !domain.verified && controller.canVerifyDomain
                              ? [{ label: m.verify, onClick: () => controller.onVerifyDomain(domain.name) }]
                              : []),
                            {
                              label: m.remove,
                              icon: Trash,
                              color: 'negative',
                              onClick: () => {
                                void controller.domainRemoval
                                  .remove(domain.name)
                                  .then(() => controller.domainRemoval.finalFocus()?.focus());
                              },
                            },
                          ]}
                        />
                      </Section.Actions>
                    </Section.Item>
                  </Section.Row>
                  {usesSso && !domain.verified && controller.canVerifyDomain ? (
                    <div {...mergeStyleProps(themeProps('access-domain-notice'), stylex.props(styles.notice))}>
                      <Icon
                        glyph={ExclamationCircle}
                        xstyle={styles.noticeIcon}
                      />
                      <Section.Description xstyle={styles.noticeText}>{m.verifyNotice}</Section.Description>
                      <Button
                        variant='outline'
                        color='neutral'
                        size='sm'
                        xstyle={styles.headerActions}
                        disabled={form.isSubmitting}
                        onClick={() => controller.onVerifyDomain(domain.name)}
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
      <PolicyAuthentication controller={controller} />
      <PolicyEnrollment controller={controller} />
    </Form>
  );
}

function PolicyAuthentication({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data } = controller;
  const policy = form.values;
  const usesSso = policy.authentication === 'sso';
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>{m.authentication}</Section.Title>
        </Section.Header>
        <Section.Body>
          <div {...mergeStyleProps(themeProps('access-authentication'), stylex.props(styles.fields))}>
            {data.live && !data.canEditPolicyAuthentication ? (
              <Section.Label>{usesSso ? m.sso : m.defaultAuthentication}</Section.Label>
            ) : (
              <Radio.Group
                aria-label={m.authentication}
                value={policy.authentication}
                disabled={form.isSubmitting}
                onValueChange={controller.onAuthenticationChange}
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
            )}
            {usesSso ? <PolicySsoConnections controller={controller} /> : null}
            {!data.live ? <PolicyMfa controller={controller} /> : null}
            {!data.live ? (
              <>
                <Separator />
                <AccessSelect
                  label={m.reverification}
                  value={policy.reverification}
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
          </div>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

function PolicyEnrollment({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data } = controller;
  const policy = form.values;
  const usesSso = policy.authentication === 'sso';
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
                  value={policy.enrollment === 'directory' ? 'directory' : 'automatic'}
                  items={[
                    { value: 'automatic', label: m.automatic },
                    ...(policy.enrollment === 'directory' ||
                    data.canCreateDirectory ||
                    data.connections.some(item => item.kind === 'directory')
                      ? [{ value: 'directory', label: m.directory }]
                      : []),
                  ]}
                  onChange={controller.onEnrollmentChange}
                  disabled={form.isSubmitting}
                />
                {policy.enrollment === 'directory' ? (
                  <Section.Description>
                    {policy.directoryConnectionId
                      ? (policy.connectionNames?.[policy.directoryConnectionId] ?? policy.directoryConnectionId)
                      : null}
                  </Section.Description>
                ) : null}
              </>
            ) : (
              <Radio.Group
                aria-label={m.enrollment}
                value={policy.enrollment}
                onValueChange={controller.onEnrollmentChange}
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
            {policy.enrollment === 'directory' && (!data.live || usesSso) ? (
              <PolicyDirectory controller={controller} />
            ) : null}
          </div>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

function PolicyMfa({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form } = controller;
  const policy = form.values;
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
          checked={policy.mfaEnabled}
          onChange={event => form.setValue('mfaEnabled', event.target.checked)}
        />
        <span>{policy.mfaEnabled ? m.enabled : m.disabled}</span>
      </Field.Root>
      {policy.mfaEnabled ? (
        <Radio.Group
          aria-label={m.mfa}
          value={policy.mfa}
          onValueChange={controller.onMfaChange}
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
