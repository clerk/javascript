import { Col, descriptors, Flex, Flow, Heading, Text } from '@/customizables';

import { useRegisterContinueAction, useWizard } from '../elements/Wizard';

export const VerifyDomainStep = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
    // TODO: Implement verification
    // isDisabled: true,
  });

  return (
    <Flow.Part part='verifyDomain'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('verify-domain')}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <Flex
          align='center'
          justify='between'
          sx={theme => ({ gap: theme.space.$4, padding: theme.space.$5 })}
        >
          <Col sx={theme => ({ gap: theme.space.$1, minWidth: 0 })}>
            <Heading
              textVariant='h3'
              sx={theme => ({ color: theme.colors.$colorForeground, fontSize: theme.fontSizes.$lg })}
            >
              Verify your domain
            </Heading>

            <Text
              as='p'
              variant='body'
              sx={theme => ({ color: theme.colors.$colorMutedForeground })}
            >
              Verify the domain you want to enable the enterprise connection on.
            </Text>
          </Col>
        </Flex>
        <Col sx={theme => ({ flex: 1, paddingInline: theme.space.$5, overflowY: 'auto' })}>
          <Text>UI goes here</Text>
        </Col>
      </Col>
    </Flow.Part>
  );
};
