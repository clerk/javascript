import type { PhoneCodeChannelData } from '@clerk/shared/types';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import type { FormControlState } from '@/ui/utils/useFormControl';

import { ProviderIcon } from '../../common';
import { Button, Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { CaptchaElement } from '../../elements/CaptchaElement';
import { useEnabledThirdPartyProviders } from '../../hooks';

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
            {providerToDisplayData[channel] && (
              <ProviderIcon
                id={channel}
                iconUrl={providerToDisplayData[channel].iconUrl}
                name={strategyToDisplayData[channel].name}
                alt={`${strategyToDisplayData[channel].name} logo`}
                size='$7'
                sx={theme => ({
                  marginBottom: theme.sizes.$6,
                })}
              />
            )}
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
