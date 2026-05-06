import { Col, descriptors, Flow, Text } from '@/customizables';

export const ConfirmationStep = (): JSX.Element => {
  return (
    <Flow.Part part='sso-confirmation'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('confirmation')}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <Col
          sx={theme => ({
            flex: 1,
            paddingInline: theme.space.$5,
            paddingTop: theme.space.$5,
            overflowY: 'auto',
          })}
        >
          <Text>UI goes here</Text>
        </Col>
      </Col>
    </Flow.Part>
  );
};
