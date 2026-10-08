import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { LegalCheckbox } from '@/ui/elements/LegalConsentCheckbox';

import { ProviderIcon } from '../../common';
import { Button, Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { CaptchaElement } from '../../elements/CaptchaElement';
import type { useSignUpStartAlternativePhoneCodePhoneNumberCardModel } from './sign-up-start-alternative-phone-code-phone-number-card.model';
import type { SignUpStartAlternativePhoneCodePhoneNumberCardProps } from './SignUpStartAlternativePhoneCodePhoneNumberCard';

export const SignUpStartAlternativePhoneCodePhoneNumberCardView = ({
  handleSubmit,
  fields,
  formState,
  onUseAnotherMethod,
  provider,
  channel,
  hasProviderDisplayData,
  providerIconUrl,
  displayName,
  error,
}: SignUpStartAlternativePhoneCodePhoneNumberCardProps &
  ReturnType<typeof useSignUpStartAlternativePhoneCodePhoneNumberCardModel>): JSX.Element => {
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root
          showLogo
          showDivider
        >
          <Col center>
            {hasProviderDisplayData && (
              <ProviderIcon
                id={channel}
                iconUrl={providerIconUrl}
                name={displayName}
                alt={`${displayName} logo`}
                size='$7'
                sx={theme => ({
                  marginBottom: theme.sizes.$6,
                })}
              />
            )}
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
        <Card.Alert>{error}</Card.Alert>
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
                  label={localizationKeys('signUp.start.alternativePhoneCodeProvider.label', {
                    provider: provider || '',
                  })}
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
                {fields.legalAccepted?.required && (
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
