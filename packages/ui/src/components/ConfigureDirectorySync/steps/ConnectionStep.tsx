import { Badge, Col, Flex, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { usePrototype } from '../prototype';

const FAKE_DOMAINS = ['acme.com', 'acme.dev'];

export const ConnectionStep = (): JSX.Element => {
  const { goNext } = useWizard();
  const { providerMeta, ssoStatus, hasSsoConnection } = usePrototype();

  return (
    <>
      <Step.Header
        title='Linked SSO connection'
        description='Directory Sync provisions organization members through your existing SSO connection.'
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          {hasSsoConnection ? (
            <>
              <Text
                as='p'
                colorScheme='secondary'
              >
                Your identity provider and verified domains are inherited from the SSO connection — you won&apos;t be
                asked for them again.
              </Text>

              <Col
                sx={t => ({
                  gap: t.space.$3,
                  padding: t.space.$4,
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$solid,
                  borderColor: t.colors.$borderAlpha150,
                })}
              >
                <Flex
                  align='center'
                  justify='between'
                >
                  <Text
                    as='span'
                    sx={t => ({ fontWeight: t.fontWeights.$medium })}
                  >
                    {providerMeta.name}
                  </Text>
                  <Badge colorScheme={ssoStatus === 'active' ? 'success' : 'danger'}>
                    {ssoStatus === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </Flex>

                <Flex
                  align='center'
                  wrap='wrap'
                  sx={t => ({ gap: t.space.$1x5 })}
                >
                  <Text
                    as='span'
                    colorScheme='secondary'
                    sx={t => ({ fontSize: t.fontSizes.$sm })}
                  >
                    Domains:
                  </Text>
                  {FAKE_DOMAINS.map(domain => (
                    <Badge key={domain}>{domain}</Badge>
                  ))}
                </Flex>
              </Col>

              {ssoStatus === 'inactive' && (
                <Alert
                  variant='warning'
                  title='Your SSO connection is configured but not active. Members can be provisioned now, but they can only sign in once SSO is activated.'
                />
              )}
            </>
          ) : (
            <Alert
              variant='warning'
              title='Single Sign-On is not configured yet'
              subtitle='Directory Sync requires an SSO connection. Configure and verify your SSO connection first, then return here to set up provisioning.'
            />
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={!hasSsoConnection}
        />
      </Step.Footer>
    </>
  );
};
