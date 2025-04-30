import { Button, Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { Card, Form, Header, LegalCheckbox, useCardState } from '../../elements';
import { CaptchaElement } from '../../elements/CaptchaElement';
import type { FormControlState } from '../../utils';
import type { Fields } from './signUpFormHelpers';

type SignUpFormProps = {
  handleSubmit: React.FormEventHandler;
  fields: Fields;
  formState: Record<Exclude<keyof Fields, 'ticket'>, FormControlState<any>>;
  onUseAnotherMethod: () => void;
};

export const SignUpAlternativePhoneCodePhoneNumberCard = (props: SignUpFormProps) => {
  const { handleSubmit, fields, formState, onUseAnotherMethod } = props;
  const card = useCardState();

  const shouldShow = (name: keyof typeof fields) => {
    return !!fields[name] && fields[name]?.required;
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title>Sign in to Suno with WhatsApp</Header.Title>
          <Header.Subtitle>Enter your phone number to get a verification code on WhatsApp.</Header.Subtitle>
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={6}
        >
          <Form.Root
            onSubmit={handleSubmit}
            gap={8}
          >
            <Col gap={6}>
              <Form.ControlRow elementId='phoneNumber'>
                <Form.PhoneInput
                  {...formState.phoneNumber.props}
                  label='WhatsApp phone number'
                  isRequired
                  isOptional={false}
                  actionLabel={undefined}
                  onActionClicked={undefined}
                />
              </Form.ControlRow>
            </Col>
            <Col center>
              <CaptchaElement />
              <Col
                gap={6}
                sx={{
                  width: '100%',
                }}
              >
                {shouldShow('legalAccepted') && (
                  <Form.ControlRow elementId='legalAccepted'>
                    <LegalCheckbox
                      {...formState.legalAccepted.props}
                      isRequired={fields.legalAccepted?.required}
                    />
                  </Form.ControlRow>
                )}
                <Form.SubmitButton
                  hasArrow
                  localizationKey={localizationKeys('formButtonPrimary')}
                />
              </Col>
            </Col>
            <Col center>
              <Button
                variant='link'
                colorScheme='neutral'
                onClick={onUseAnotherMethod}
              >
                Use another method
              </Button>
            </Col>
          </Form.Root>
        </Flex>
      </Card.Content>
    </Card.Root>
  );
};
