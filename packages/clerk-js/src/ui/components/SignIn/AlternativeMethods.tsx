import type { SignInFactor } from '@clerk/types';
import React from 'react';

import type { LocalizationKey } from '../../customizables';
import { descriptors, Flex, Flow, localizationKeys, Text } from '../../customizables';
import { ArrowBlockButton, Card, CardAlert, Footer, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { ChatAltIcon, Email, LinkIcon, LockClosedIcon, RequestAuthIcon } from '../../icons';
import { formatSafeIdentifier } from '../../utils';
import { SignInSocialButtons } from './SignInSocialButtons';
import { useResetPasswordFactor } from './useResetPasswordFactor';
import { withHavingTrouble } from './withHavingTrouble';

type AlternativeMethodsMode = 'forgot' | 'pwned' | 'default';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
  currentFactor: SignInFactor | undefined | null;
  asForgotPassword?: boolean;
  mode?: AlternativeMethodsMode;
};

export type AlternativeMethodListProps = AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler };

export const AlternativeMethods = (props: AlternativeMethodsProps) => {
  return withHavingTrouble(AlternativeMethodsList, {
    ...props,
  });
};

const AlternativeMethodsList = (props: AlternativeMethodListProps) => {
  const { onBackLinkClick, onHavingTroubleClick, onFactorSelected, mode = 'default' } = props;
  const card = useCardState();
  const resetPasswordFactor = useResetPasswordFactor();
  const { firstPartyFactors, hasAnyStrategy } = useAlternativeStrategies({
    filterOutFactor: props?.currentFactor,
  });

  const flowPart = determineFlowPart(mode);
  const cardTitleKey = determineTitle(mode);
  const isReset = determineIsReset(mode);

  return (
    <Flow.Part part={flowPart}>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          {onBackLinkClick && <Header.BackLink onClick={onBackLinkClick} />}
          <Header.Title localizationKey={cardTitleKey} />
        </Header.Root>
        {/*TODO: extract main in its own component */}
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={6}
        >
          {isReset && resetPasswordFactor && (
            <ArrowBlockButton
              leftIcon={getButtonIcon(resetPasswordFactor)}
              textLocalizationKey={getButtonLabel(resetPasswordFactor)}
              elementDescriptor={descriptors.alternativeMethodsBlockButton}
              textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
              arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
              isDisabled={card.isLoading}
              onClick={() => {
                card.setError(undefined);
                onFactorSelected(resetPasswordFactor);
              }}
            />
          )}
          {hasAnyStrategy && (
            <>
              {isReset && (
                <Text
                  localizationKey={localizationKeys(
                    'signIn.forgotPasswordAlternativeMethods.label__alternativeMethods',
                  )}
                />
              )}
              <Flex
                elementDescriptor={descriptors.alternativeMethods}
                direction='col'
                gap={2}
              >
                <SignInSocialButtons
                  enableWeb3Providers
                  enableOAuthProviders
                />
                {firstPartyFactors.map((factor, i) => (
                  <ArrowBlockButton
                    leftIcon={getButtonIcon(factor)}
                    textLocalizationKey={getButtonLabel(factor)}
                    elementDescriptor={descriptors.alternativeMethodsBlockButton}
                    textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
                    arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
                    key={i}
                    isDisabled={card.isLoading}
                    onClick={() => {
                      card.setError(undefined);
                      onFactorSelected(factor);
                    }}
                  />
                ))}
              </Flex>
            </>
          )}
        </Flex>
        <Footer.Root>
          <Footer.Action elementId='havingTrouble'>
            <Footer.ActionLink
              localizationKey={localizationKeys('signIn.alternativeMethods.actionLink')}
              onClick={onHavingTroubleClick}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};

export function getButtonLabel(factor: SignInFactor): LocalizationKey {
  switch (factor.strategy) {
    case 'email_link':
      return localizationKeys('signIn.alternativeMethods.blockButton__emailLink', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'email_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__emailCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'phone_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'password':
      return localizationKeys('signIn.alternativeMethods.blockButton__password');
    case 'reset_password_email_code':
      return localizationKeys('signIn.forgotPasswordAlternativeMethods.blockButton__resetPassword');
    case 'reset_password_phone_code':
      return localizationKeys('signIn.forgotPasswordAlternativeMethods.blockButton__resetPassword');
    default:
      throw `Invalid sign in strategy: "${factor.strategy}"`;
  }
}

export function getButtonIcon(factor: SignInFactor) {
  const icons = {
    email_link: LinkIcon,
    email_code: Email,
    phone_code: ChatAltIcon,
    reset_password_email_code: RequestAuthIcon,
    reset_password_phone_code: RequestAuthIcon,
    password: LockClosedIcon,
  } as const;

  return icons[factor.strategy as keyof typeof icons];
}

function determineFlowPart(mode: AlternativeMethodsMode) {
  switch (mode) {
    case 'forgot':
      return 'forgotPasswordMethods';
    case 'pwned':
      return 'passwordPwnedMethods';
    default:
      return 'alternativeMethods';
  }
}

function determineTitle(mode: AlternativeMethodsMode): LocalizationKey {
  switch (mode) {
    case 'forgot':
      return localizationKeys('signIn.forgotPasswordAlternativeMethods.title');
    case 'pwned':
      return localizationKeys('signIn.passwordPwned.title');
    default:
      return localizationKeys('signIn.alternativeMethods.title');
  }
}

function determineIsReset(mode: AlternativeMethodsMode): boolean {
  switch (mode) {
    case 'forgot':
    case 'pwned':
      return true;
    default:
      return false;
  }
}
