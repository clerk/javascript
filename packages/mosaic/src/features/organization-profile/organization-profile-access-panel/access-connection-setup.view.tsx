import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Icon, IconFrame } from '../../../components/icon';
import { Section } from '../../../components/section';
import { ChevronDown } from '../../../icons/glyphs/chevron-down';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { RotateAntiClockwise } from '../../../icons/glyphs/rotate-anti-clockwise';
import { useMessages } from '../../../localization';
import { Collapsible } from '../../../primitives/collapsible';
import { Form } from '../../../primitives/form';
import { mergeStyleProps, themeProps } from '../../../props';
import { styles } from './access.styles';
import type { AccessProvider } from './access.types';
import type { AccessConnectionStepProps } from './access-connection.controller';
import { ConnectionInput, GoogleDirectoryCredentials, SsoConnectValues } from './access-connection-fields.view';
import { AccessCopyField, AccessProviderIcon, AccessSelect, StepTitle } from './access-fields.view';

export function ProviderStep({ controller }: AccessConnectionStepProps) {
  const m = useMessages('organizationProfile').access;
  const groups: AccessProvider[][] =
    controller.kind === 'directory'
      ? [['okta', 'entra', 'google', 'saml']]
      : [['okta', 'entra', 'google', 'saml'], ['oidc']];
  return (
    <>
      <StepTitle>{m.chooseProvider}</StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        {groups.map(group => (
          <div
            key={group[0]}
            {...mergeStyleProps(themeProps('access-provider-group'), stylex.props(styles.providerGroupStack))}
          >
            {controller.kind === 'sso' ? (
              <Section.Description>{group[0] === 'oidc' ? m.oidc : m.saml}</Section.Description>
            ) : null}
            <div {...mergeStyleProps(themeProps('access-providers'), stylex.props(styles.grid))}>
              {group.map(provider => (
                <Button
                  key={provider}
                  variant='outline'
                  color='neutral'
                  aria-pressed={controller.form.values.provider === provider}
                  xstyle={[styles.provider, controller.form.values.provider === provider && styles.selectedProvider]}
                  onClick={() => controller.onProvider(provider)}
                >
                  <IconFrame
                    filled={controller.form.values.provider !== provider}
                    size='sm'
                  >
                    <AccessProviderIcon provider={provider} />
                  </IconFrame>
                  {controller.kind === 'directory' && provider === 'saml' ? m.customDirectory : m.providers[provider]}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function ConfigureStep({ controller, data }: AccessConnectionStepProps) {
  const m = useMessages('organizationProfile').access;
  const directory = controller.kind === 'directory';
  const provider = controller.form.values.provider;
  const ssoInstructions = {
    okta: m.oktaSamlInstructions,
    oidc: m.oidcInstructions,
    saml: m.samlInstructions,
    entra: m.samlInstructions,
    google: m.samlInstructions,
  };
  return (
    <>
      <StepTitle description={directory ? m.directoryConfigureDescription : ssoInstructions[provider]}>
        {directory || provider === 'oidc' ? m.configure : m.createSamlApp}
      </StepTitle>
      <Form
        id={controller.form.id}
        onSubmit={controller.form.handleSubmit}
        {...mergeStyleProps(themeProps('access-connection-form'), stylex.props(styles.stepContent))}
      >
        {controller.kind === 'directory' ? (
          <>
            <div {...mergeStyleProps(themeProps('access-selected-provider'), stylex.props(styles.providerGroup))}>
              <div {...stylex.props(styles.providerSummary)}>
                <AccessProviderIcon provider={controller.form.values.provider} />
                <Section.Label>{provider === 'saml' ? m.customDirectory : m.providers[provider]}</Section.Label>
                <Button
                  variant='outline'
                  color='neutral'
                  xstyle={styles.headerActions}
                  onClick={controller.onBack}
                  disabled={controller.pending || !controller.canChangeProvider}
                >
                  {m.change}
                </Button>
              </div>
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
                        {controller.form.values.provider === 'google' ? m.googleInstructions : m.directoryInstructions}
                      </Section.Description>
                    </div>
                  </Collapsible.Panel>
                </Collapsible.Root>
              </div>
            </div>
            <ConnectionInput
              controller={controller}
              name='name'
              readOnly={Boolean(controller.configured)}
              label={m.name}
            />
            <DirectoryConfiguration
              controller={controller}
              data={data}
            />
          </>
        ) : (
          <SsoConfiguration
            controller={controller}
            data={data}
          />
        )}
      </Form>
    </>
  );
}

function SsoConfiguration({ controller, data }: AccessConnectionStepProps) {
  const m = useMessages('organizationProfile').access;
  const oidc = controller.form.values.provider === 'oidc';
  return (
    <>
      {data.live ? (
        controller.configured || data.eligibleSsoDomains?.length ? (
          <AccessSelect
            label={m.domain}
            value={controller.form.values.domains?.[0] ?? null}
            items={(controller.configured?.configuration.domains ?? data.eligibleSsoDomains ?? []).map(domain => ({
              value: domain,
              label: domain,
            }))}
            onChange={domain => controller.form.setValue('domains', [domain])}
            disabled={controller.pending || Boolean(controller.configured)}
          />
        ) : (
          <Section.Note>{m.ssoRequiresVerifiedDomain}</Section.Note>
        )
      ) : (
        <SsoConnectValues
          oidc={oidc}
          serviceProvider={data.serviceProvider}
        />
      )}
      {controller.form.values.provider === 'okta' ? (
        <div {...stylex.props(styles.headingGroup)}>
          <Section.Label>{m.completeSamlIntegration}</Section.Label>
          <ul {...stylex.props(styles.instructionsList, styles.instructionsBullets)}>
            <li>{m.oktaCompleteStepOne}</li>
            <li>{m.oktaCompleteStepTwo}</li>
          </ul>
        </div>
      ) : null}
    </>
  );
}

function DirectoryConfiguration({ controller, data }: AccessConnectionStepProps) {
  const m = useMessages('organizationProfile').access;
  return (
    <>
      <Section.Error>{controller.directoryError}</Section.Error>
      {controller.matchingSsoConnections.length > 1 ? (
        <AccessSelect
          label={m.ssoConnection}
          value={controller.form.values.ssoConnectionId || null}
          items={controller.matchingSsoConnections.map(item => ({ value: item.id, label: item.configuration.name }))}
          onChange={id => controller.form.setValue('ssoConnectionId', id)}
          disabled={controller.pending || Boolean(controller.configured)}
        />
      ) : null}
      {!controller.matchingSsoConnections.length ? <Section.Note>{m.missingSso}</Section.Note> : null}
      {controller.form.values.provider === 'google' ? (
        <GoogleDirectoryCredentials controller={controller} />
      ) : (
        <>
          <AccessCopyField
            label={m.scimEndpoint}
            value={controller.configured?.endpointUrl ?? data.serviceProvider?.scimUrl ?? ''}
          />
          <div {...stylex.props(styles.connectionRow)}>
            <div {...stylex.props(styles.grow)}>
              <AccessCopyField
                label={m.bearerToken}
                value={
                  controller.tokenVisible ? (controller.configured?.token ?? data.serviceProvider?.token ?? '') : ''
                }
              />
            </div>
            <Button
              variant='outline'
              color='neutral'
              disabled={
                controller.tokenVisible || controller.pending || (data.live && !controller.form.values.ssoConnectionId)
              }
              onClick={controller.onCreateDirectory ?? controller.onRevealToken}
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
