import { Badge, Button, Col, Flex, Heading, Icon, Text } from '@/customizables';
import { DuotoneShieldCheck } from '@/icons';

import { useConfigureSSO } from '../ConfigureSSO/ConfigureSSOContext';
import { Step } from '../ConfigureSSO/elements/Step';
import { useWizard } from '../ConfigureSSO/elements/Wizard';

/**
 * PROTOTYPE ONLY — terminal summary of the domain setup flow, pointing the
 * admin at identity-provider selection next.
 */
export const DomainsCompleteStep = (): JSX.Element => {
  const { goPrev } = useWizard();
  const { organizationDomains, onExit } = useConfigureSSO();

  const verifiedDomains = (organizationDomains ?? []).filter(
    domain => domain.ownershipVerification?.status === 'verified',
  );

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
              <Heading textVariant='h2'>Domains verified</Heading>
              <Text
                as='p'
                colorScheme='secondary'
              >
                Ownership of your organization&apos;s domains is verified. Next, select your identity provider from the
                Security page.
              </Text>
            </Col>

            {verifiedDomains.length > 0 && (
              <Flex
                align='center'
                justify='center'
                wrap='wrap'
                sx={t => ({ gap: t.space.$1x5 })}
              >
                {verifiedDomains.map(domain => (
                  <Badge
                    key={domain.id}
                    colorScheme='success'
                  >
                    {domain.name}
                  </Badge>
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
