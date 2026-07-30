import { Badge, Col, Flex, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { usePrototype } from '../prototype';

const FAKE_DOMAINS = ['acme.com', 'acme.dev'];

export const ConnectionStep = (): JSX.Element => {
  const { goNext } = useWizard();
  const { providerMeta, isSetupComplete } = usePrototype();

  return (
    <>
      <Step.Header
        title='Identity provider'
        description='Directory Sync provisions organization members through the identity provider you selected.'
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          {isSetupComplete ? (
            <>
              <Text
                as='p'
                colorScheme='secondary'
              >
                Your verified domains and selected identity provider come from the setup flows — you won&apos;t be asked
                for them again.
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
                  <Badge colorScheme='success'>Selected</Badge>
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

              <Text
                as='p'
                colorScheme='secondary'
                sx={t => ({ fontSize: t.fontSizes.$sm })}
              >
                Directory Sync does not require Single Sign-On to be active — provisioning and sign-in are configured
                independently.
              </Text>
            </>
          ) : (
            <Alert
              variant='warning'
              title='No identity provider selected'
              subtitle='Directory Sync requires a selected identity provider. Verify your domains and select a provider from the Security page, then return here.'
            />
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={!isSetupComplete}
        />
      </Step.Footer>
    </>
  );
};
