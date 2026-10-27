import type { ResetPasswordCodeFactor, SessionVerificationFirstFactor, SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { formatSafeIdentifier } from '@/ui/utils/formatSafeIdentifier';

import type { LocalizationKey } from '../../customizables';
import { Button, Col, descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { Divider } from '../../elements/Divider';
import { Building, Envelope, Fingerprint, Lock, LockArrow, SpeechBubble } from '../../icons';
import { useReverificationAlternativeStrategies } from './useReverificationAlternativeStrategies';
import { useUserVerificationSession } from './useUserVerificationSession';
import { withHavingTrouble } from './withHavingTrouble';

/**
 * 'pwned' and 'passwordCompromised' follow a rejected password: the list leads
 * with resetting it.
 */
export type AlternativeMethodsMode = 'default' | 'pwned' | 'passwordCompromised';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
  currentFactor: SignInFactor | undefined | null;
  mode?: AlternativeMethodsMode;
  /** Required by the password modes. */
  resetPassword?: {
    factor: ResetPasswordCodeFactor;
    /**
     * The caller already has the new password, so the user only confirms it's
     * them with the code.
     */
    hasNewPassword: boolean;
    onClick: () => void;
  };
};

export type AlternativeMethodListProps = AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler };

export const AlternativeMethods = (props: AlternativeMethodsProps) => {
  return withHavingTrouble(AlternativeMethodsList, {
    ...props,
  });
};

const AlternativeMethodsList = (props: AlternativeMethodListProps) => {
  const { onBackLinkClick, onHavingTroubleClick, onFactorSelected, mode = 'default', resetPassword } = props;
  const card = useCardState();
  const { data } = useUserVerificationSession();
  const { firstPartyFactors: alternativeFactors } =
    useReverificationAlternativeStrategies<SessionVerificationFirstFactor>({
      filterOutFactor: props?.currentFactor,
      supportedFirstFactors: data?.supportedFirstFactors,
    });
  const reset = mode !== 'default' ? resetPassword : undefined;
  // With a new password already chosen, the reset is just a code to the same
  // address as the plain code method, so listing both would show the same button twice.
  const firstPartyFactors = reset?.hasNewPassword
    ? alternativeFactors.filter(f => !sendsCodeToSameIdentification(f, reset.factor))
    : alternativeFactors;
  const hasAlternativeStrategies = firstPartyFactors.length > 0;

  return (
    <Flow.Part part={determineFlowPart(mode)}>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={determineTitle(mode)} />
            {mode === 'default' && (
              <Header.Subtitle localizationKey={localizationKeys('reverification.alternativeMethods.subtitle')} />
            )}
            {mode !== 'default' && reset?.hasNewPassword && (
              <Header.Subtitle
                localizationKey={
                  mode === 'pwned'
                    ? localizationKeys('reverification.passwordPwned.subtitle__saveNewPassword')
                    : localizationKeys('reverification.passwordCompromised.subtitle__saveNewPassword')
                }
              />
            )}
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            {reset && (
              <Button
                localizationKey={
                  reset.hasNewPassword
                    ? getButtonLabel(reset.factor)
                    : localizationKeys('reverification.resetPasswordAlternativeMethods.blockButton__resetPassword')
                }
                elementDescriptor={descriptors.alternativeMethodsBlockButton}
                isDisabled={card.isLoading}
                onClick={() => {
                  card.setError(undefined);
                  reset.onClick();
                }}
              />
            )}
            {reset && hasAlternativeStrategies && (
              <Divider
                dividerText={localizationKeys(
                  'reverification.resetPasswordAlternativeMethods.label__alternativeMethods',
                )}
              />
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
              {onBackLinkClick && (
                <BackLink
                  boxElementDescriptor={descriptors.backRow}
                  linkElementDescriptor={descriptors.backLink}
                  onClick={onBackLinkClick}
                />
              )}
            </Col>
          </Flex>
        </Card.Content>

        <Card.Footer>
          <Card.Action elementId='havingTrouble'>
            <Card.ActionText localizationKey={localizationKeys('reverification.alternativeMethods.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('reverification.alternativeMethods.actionLink')}
              onClick={onHavingTroubleClick}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
};

export function getButtonLabel(factor: SessionVerificationFirstFactor): LocalizationKey {
  switch (factor.strategy) {
    case 'email_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__emailCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'phone_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'password':
      return localizationKeys('reverification.alternativeMethods.blockButton__password');
    case 'passkey':
      return localizationKeys('reverification.alternativeMethods.blockButton__passkey');
    // A reset password code is offered when the new password is already chosen:
    // to the user it's a code, like the plain code methods.
    case 'reset_password_email_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__emailCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'reset_password_phone_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    default:
      throw new Error(`Invalid sign in strategy: "${(factor as any).strategy}"`);
  }
}

export function getButtonIcon(factor: SessionVerificationFirstFactor) {
  const icons = {
    email_code: Envelope,
    phone_code: SpeechBubble,
    password: Lock,
    passkey: Fingerprint,
    enterprise_sso: Building,
    reset_password_email_code: LockArrow,
    reset_password_phone_code: LockArrow,
  } as const;

  return icons[factor.strategy];
}

function determineFlowPart(mode: AlternativeMethodsMode) {
  switch (mode) {
    case 'pwned':
      return 'passwordPwnedMethods';
    case 'passwordCompromised':
      return 'passwordCompromisedMethods';
    default:
      return 'alternativeMethods';
  }
}

function determineTitle(mode: AlternativeMethodsMode): LocalizationKey {
  switch (mode) {
    case 'pwned':
      return localizationKeys('reverification.passwordPwned.title');
    case 'passwordCompromised':
      return localizationKeys('reverification.passwordCompromised.title');
    default:
      return localizationKeys('reverification.alternativeMethods.title');
  }
}

function sendsCodeToSameIdentification(factor: SessionVerificationFirstFactor, resetFactor: ResetPasswordCodeFactor) {
  if (factor.strategy === 'email_code' && resetFactor.strategy === 'reset_password_email_code') {
    return factor.emailAddressId === resetFactor.emailAddressId;
  }
  if (factor.strategy === 'phone_code' && resetFactor.strategy === 'reset_password_phone_code') {
    return factor.phoneNumberId === resetFactor.phoneNumberId;
  }
  return false;
}
