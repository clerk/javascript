import type { PhoneCodeChannelData } from '@clerk/types';

import { Button, Col, descriptors, Flex, Image, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import { CaptchaElement } from '../../elements/CaptchaElement';
import { useEnabledThirdPartyProviders } from '../../hooks';
import type { FormControlState } from '../../utils';

type SignUpAlternativePhoneCodePhoneNumberCardProps = {
  handleSubmit: React.FormEventHandler;
  phoneNumberFormState: FormControlState<any>;
  onUseAnotherMethod: () => void;
  phoneCodeProvider: PhoneCodeChannelData;
};

export const SignInAlternativePhoneCodePhoneNumberCard = (props: SignUpAlternativePhoneCodePhoneNumberCardProps) => {
  const { handleSubmit, phoneNumberFormState, onUseAnotherMethod, phoneCodeProvider } = props;
  const { providerToDisplayData, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const provider = phoneCodeProvider.name;
  const channel = phoneCodeProvider.channel;
  const card = useCardState();

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root
          showLogo
          showDivider
        >
          <Col center>
            <Image
              src={providerToDisplayData[channel]?.iconUrl}
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
            localizationKey={localizationKeys('signIn.start.alternativePhoneCodeProvider.title', {
              provider,
            })}
          />
          <Header.Subtitle
            localizationKey={localizationKeys('signIn.start.alternativePhoneCodeProvider.subtitle', {
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
                  {...phoneNumberFormState.props}
                  label={localizationKeys('signIn.start.alternativePhoneCodeProvider.label', { provider })}
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
                localizationKey={localizationKeys('signIn.start.alternativePhoneCodeProvider.actionLink')}
              />
            </Col>
          </Form.Root>
        </Flex>
      </Card.Content>
    </Card.Root>
  );
};
