import { Col, descriptors, Flex, Flow, Heading, Text } from '@/customizables';

export const TestConfigurationStep = (): JSX.Element => {
  return (
    <Flow.Part part='test-sso'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('test')}
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
              Test your SSO connection
            </Heading>
            <Text
              as='p'
              variant='body'
              sx={theme => ({ color: theme.colors.$colorMutedForeground })}
            >
              Test your SSO configuration to verify you can successfully authenticate via your identity provider
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
