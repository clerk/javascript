import type { PhoneCodeChannelData } from '@clerk/types';

import { Button, Col, descriptors, Flex, Image, localizationKeys } from '../../customizables';
import { Card, Form, Header, LegalCheckbox, useCardState } from '../../elements';
import { CaptchaElement } from '../../elements/CaptchaElement';
import { useEnabledThirdPartyProviders } from '../../hooks';
import type { FormControlState } from '../../utils';
import type { Fields } from './signUpFormHelpers';

type SignUpFormProps = {
  handleSubmit: React.FormEventHandler;
  fields: Fields;
  formState: Record<Exclude<keyof Fields, 'ticket'>, FormControlState<any>>;
  onUseAnotherMethod: () => void;
  phoneCodeProvider: PhoneCodeChannelData;
};

export const SignUpAlternativePhoneCodePhoneNumberCard = (props: SignUpFormProps) => {
  const { handleSubmit, fields, formState, onUseAnotherMethod, phoneCodeProvider } = props;
  const { providerToDisplayData, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const provider = phoneCodeProvider.name;
  const channel = phoneCodeProvider.channel;
  const card = useCardState();

  const shouldShow = (name: keyof typeof fields) => {
    return !!fields[name] && fields[name]?.required;
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root
          showLogo
          showDivider
        >
          <Col
            center
            sx={t => ({ height: t.sizes.$7 })}
          >
            <Image
              src={providerToDisplayData[phoneCodeProvider.channel]?.iconUrl}
              alt={`${strategyToDisplayData[channel].name} logo`}
              sx={theme => ({
                width: theme.sizes.$7,
                height: theme.sizes.$7,
                maxWidth: '100%',
                marginBottom: theme.sizes.$6,
              })}
            />
          </Col>
          <Header.Title
            localizationKey={localizationKeys('signUp.start.alternativePhoneCodeProvider.title', {
              provider,
            })}
          />
          <Header.Subtitle
            localizationKey={localizationKeys('signUp.start.alternativePhoneCodeProvider.subtitle', {
              provider,
            })}
          />
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
                  label={localizationKeys('signUp.start.alternativePhoneCodeProvider.label', { provider })}
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
                localizationKey={localizationKeys('signUp.start.alternativePhoneCodeProvider.actionLink')}
              />
            </Col>
          </Form.Root>
        </Flex>
      </Card.Content>
    </Card.Root>
  );
};
