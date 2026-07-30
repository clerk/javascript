import { Badge, Button, Col, Flex, Heading, Icon, Text } from '@/customizables';
import { DuotoneShieldCheck } from '@/icons';

import { useConfigureSSO } from '../ConfigureSSO/ConfigureSSOContext';
import { Step } from '../ConfigureSSO/elements/Step';
import { useWizard } from '../ConfigureSSO/elements/Wizard';

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  saml_okta: 'Okta Workforce',
  saml_microsoft: 'Microsoft Entra ID',
  saml_google: 'Google Workspace',
  saml_custom: 'Custom SAML provider',
  oidc_custom: 'OIDC provider',
};

const providerDisplayName = (provider: string | undefined): string => {
  if (!provider) {
    return 'your identity provider';
  }
  return PROVIDER_DISPLAY_NAMES[provider] ?? 'your identity provider';
};

/**
 * PROTOTYPE ONLY — terminal summary of the identity-provider setup flow,
 * pointing the admin at the SSO / Directory Sync flows this setup unlocks.
 */
export const SetupCompleteStep = (): JSX.Element => {
  const { goPrev } = useWizard();
  const { enterpriseConnection, organizationEnterpriseConnection: c, onExit } = useConfigureSSO();

  const domains = enterpriseConnection?.domains ?? [];

  return (
    <>
      <Step.Body>
        <Step.Section
          fill
          gap={5}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Col
            align='center'
            sx={t => ({ textAlign: 'center', maxWidth: '24rem', gap: t.space.$3x5 })}
          >
            <Icon
              icon={DuotoneShieldCheck}
              colorScheme='neutral'
              sx={t => ({ width: t.sizes.$8, height: t.sizes.$8 })}
            />

            <Col
              align='center'
              gap={2}
            >
              <Heading textVariant='h2'>Identity provider setup complete</Heading>
              <Text
                as='p'
                colorScheme='secondary'
              >
                Your domains are verified and {providerDisplayName(c.provider)} is connected. You can now set up Single
                Sign-On or Directory Sync from the Security page.
              </Text>
            </Col>

            {domains.length > 0 && (
              <Flex
                align='center'
                justify='center'
                wrap='wrap'
                sx={t => ({ gap: t.space.$1x5 })}
              >
                {domains.map(domain => (
                  <Badge key={domain}>{domain}</Badge>
                ))}
              </Flex>
            )}
          </Col>

          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            onClick={() => onExit?.()}
          >
            Done
          </Button>
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
      </Step.Footer>
    </>
  );
};
