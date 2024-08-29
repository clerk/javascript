import type { SignInFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { ArrowBlockButton, BackLink, Card, Divider, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { ChatAltIcon, Email, Fingerprint, LinkIcon, LockClosedIcon, RequestAuthIcon } from '../../icons';
import { formatSafeIdentifier } from '../../utils';
import { SignInSocialButtons } from './SignInSocialButtons';
import { useResetPasswordFactor } from './useResetPasswordFactor';
import { withHavingTrouble } from './withHavingTrouble';

type AlternativeMethodsMode = 'forgot' | 'pwned' | 'default';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
  currentFactor: SignInFactor | undefined | null;
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
  const { supportedFirstFactors } = useCoreSignIn();
  const { firstPartyFactors, hasAnyStrategy } = useAlternativeStrategies({
    filterOutFactor: props?.currentFactor,
    supportedFirstFactors: supportedFirstFactors,
  });

  const flowPart = determineFlowPart(mode);
  const cardTitleKey = determineTitle(mode);
  const isReset = determineIsReset(mode);

  return (
    <Flow.Part part={flowPart}>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={cardTitleKey} />
            {!isReset && <Header.Subtitle localizationKey={localizationKeys('signIn.alternativeMethods.subtitle')} />}
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            {isReset && resetPasswordFactor && (
              <Button
                localizationKey={getButtonLabel(resetPasswordFactor)}
                elementDescriptor={descriptors.alternativeMethodsBlockButton}
                isDisabled={card.isLoading}
                onClick={() => {
                  card.setError(undefined);
                  onFactorSelected(resetPasswordFactor);
                }}
              />
            )}
            {isReset && hasAnyStrategy && (
              <Divider
                dividerText={localizationKeys('signIn.forgotPasswordAlternativeMethods.label__alternativeMethods')}
              />
            )}
            <Col gap={4}>
              {hasAnyStrategy && (
                <Flex
                  elementDescriptor={descriptors.alternativeMethods}
                  direction='col'
                  gap={2}
                >
                  <SignInSocialButtons
                    enableWeb3Providers
                    enableOAuthProviders
                  />
                  {firstPartyFactors &&
                    firstPartyFactors.map((factor, i) => (
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
            <Card.ActionText localizationKey={localizationKeys('signIn.alternativeMethods.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('signIn.alternativeMethods.actionLink')}
              onClick={onHavingTroubleClick}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
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
    // @ts-ignore
    case 'passkey':
      return localizationKeys('signIn.alternativeMethods.blockButton__passkey');
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
    passkey: Fingerprint,
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
