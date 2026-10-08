import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import { ProviderIcon } from '../../common';
import { Button, Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { CaptchaElement } from '../../elements/CaptchaElement';
import type { useAlternativePhoneCodeCardModel } from './alternative-phone-code-card.model';
import type { SignInAlternativePhoneCodePhoneNumberCardProps } from './SignInAlternativePhoneCodePhoneNumberCard';

export const AlternativePhoneCodeCardView = ({
  provider,
  channel,
  iconUrl,
  hasProvider,
  name,
  error,
  handleSubmit,
  phoneNumberFormState,
  onUseAnotherMethod,
}: ReturnType<typeof useAlternativePhoneCodeCardModel> & SignInAlternativePhoneCodePhoneNumberCardProps) => {
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root
          showLogo
          showDivider
        >
          <Col center>
            {hasProvider && (
              <ProviderIcon
                id={channel}
                iconUrl={iconUrl}
                name={name}
                alt={`${name} logo`}
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
