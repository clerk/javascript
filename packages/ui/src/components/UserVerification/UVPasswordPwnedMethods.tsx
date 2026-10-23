import type {
  ResetPasswordEmailCodeFactor,
  ResetPasswordPhoneCodeFactor,
  SessionVerificationFirstFactor,
  SignInFactor,
} from '@clerk/shared/types';
import React from 'react';

import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { Divider } from '@/ui/elements/Divider';
import { Header } from '@/ui/elements/Header';
import { formatSafeIdentifier } from '@/ui/utils/formatSafeIdentifier';

import { Button, Col, descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { getButtonIcon, getButtonLabel } from './AlternativeMethods';
import { useReverificationAlternativeStrategies } from './useReverificationAlternativeStrategies';
import type { PasswordErrorReason } from './UserVerificationFactorOnePassword';

type UVPasswordPwnedMethodsProps = {
  reason: PasswordErrorReason;
  resetPasswordFactor: ResetPasswordEmailCodeFactor | ResetPasswordPhoneCodeFactor;
  /**
   * The caller already has the new password, so the user only confirms it's
   * them with the code. Without it, the user resets the password here.
   */
  hasNewPassword: boolean;
  /** The factors this modal can verify with; others aren't offered. */
  supportedFirstFactors: SessionVerificationFirstFactor[] | null;
  onResetPasswordClick: () => void;
  onFactorSelected: (factor: SignInFactor) => void;
  onBackLinkClick: React.MouseEventHandler;
};

/**
 * Shown when the password is rejected as breached or compromised: the user
 * can reset it, or verify with another method.
 */
export const UVPasswordPwnedMethods = (props: UVPasswordPwnedMethodsProps) => {
  const {
    reason,
    resetPasswordFactor,
    hasNewPassword,
    supportedFirstFactors,
    onResetPasswordClick,
    onFactorSelected,
    onBackLinkClick,
  } = props;
  const identifier = formatSafeIdentifier(resetPasswordFactor.safeIdentifier) || '';
  const card = useCardState();
  const { firstPartyFactors: alternativeFactors } =
    useReverificationAlternativeStrategies<SessionVerificationFirstFactor>({
      filterOutFactor: { strategy: 'password' } as SignInFactor,
      supportedFirstFactors,
    });
  // With a new password already chosen, the reset is just a code to the same
  // address as the plain code method, so listing both would show the same button twice.
  const firstPartyFactors = hasNewPassword
    ? alternativeFactors.filter(f => !sendsCodeToSameIdentification(f, resetPasswordFactor))
    : alternativeFactors;
  const hasAlternativeStrategies = firstPartyFactors.length > 0;
  const copy = reason === 'pwned' ? 'passwordPwned' : 'passwordCompromised';

  return (
    <Flow.Part part={`${copy}Methods`}>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys(`reverification.${copy}.title`)} />
            {hasNewPassword && (
              <Header.Subtitle localizationKey={localizationKeys(`reverification.${copy}.subtitle__saveNewPassword`)} />
            )}
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <Button
              localizationKey={
                !hasNewPassword
                  ? localizationKeys('reverification.passwordPwned.blockButton__resetPassword')
                  : resetPasswordFactor.strategy === 'reset_password_email_code'
                    ? localizationKeys('reverification.alternativeMethods.blockButton__emailCode', { identifier })
                    : localizationKeys('reverification.alternativeMethods.blockButton__phoneCode', { identifier })
              }
              elementDescriptor={descriptors.alternativeMethodsBlockButton}
              isDisabled={card.isLoading}
              onClick={() => {
                card.setError(undefined);
                onResetPasswordClick();
              }}
            />
            {hasAlternativeStrategies && (
              <Divider dividerText={localizationKeys('reverification.passwordPwned.label__alternativeMethods')} />
            )}
            <Col gap={4}>
              {hasAlternativeStrategies && (
                <Flex
                  elementDescriptor={descriptors.alternativeMethods}
                  direction='col'
                  gap={2}
                >
                  {firstPartyFactors.map((factor, i) => (
                    <ArrowBlockButton
                      leftIcon={getButtonIcon(factor)}
                      textLocalizationKey={getButtonLabel(factor)}
                      elementDescriptor={descriptors.alternativeMethodsBlockButton}
                      textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
                      arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
                      key={i}
                      textVariant='buttonLarge'
                      isDisabled={card.isLoading}
                      onClick={() => {
                        card.setError(undefined);
                        onFactorSelected(factor);
                      }}
                    />
                  ))}
                </Flex>
              )}
              <BackLink
                boxElementDescriptor={descriptors.backRow}
                linkElementDescriptor={descriptors.backLink}
                onClick={onBackLinkClick}
              />
            </Col>
          </Flex>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};

function sendsCodeToSameIdentification(
  factor: SessionVerificationFirstFactor,
  resetPasswordFactor: ResetPasswordEmailCodeFactor | ResetPasswordPhoneCodeFactor,
) {
  if (factor.strategy === 'email_code' && resetPasswordFactor.strategy === 'reset_password_email_code') {
    return factor.emailAddressId === resetPasswordFactor.emailAddressId;
  }
  if (factor.strategy === 'phone_code' && resetPasswordFactor.strategy === 'reset_password_phone_code') {
    return factor.phoneNumberId === resetPasswordFactor.phoneNumberId;
  }
  return false;
}
