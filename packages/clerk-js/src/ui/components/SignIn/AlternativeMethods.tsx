import type { SignInFactor } from '@clerk/types';
import React from 'react';

import type { LocalizationKey } from '../../customizables';
import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { ArrowBlockButton, Card, CardAlert, Footer, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { formatSafeIdentifier } from '../../utils';
import { SignInSocialButtons } from './SignInSocialButtons';
import { withHavingTrouble } from './withHavingTrouble';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
  currentFactor: SignInFactor | undefined | null;
};

export type AlternativeMethodListProps = AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler };

export const AlternativeMethods = (props: AlternativeMethodsProps) => {
  return withHavingTrouble(AlternativeMethodsList, {
    ...props,
  });
};

const AlternativeMethodsList = (props: AlternativeMethodListProps) => {
  const { onBackLinkClick, onHavingTroubleClick, onFactorSelected } = props;
  const card = useCardState();
  const { firstPartyFactors } = useAlternativeStrategies({
    filterOutFactor: props?.currentFactor,
  });
  return (
    <Flow.Part part='alternativeMethods'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          {onBackLinkClick && <Header.BackLink onClick={onBackLinkClick} />}
          <Header.Title localizationKey={localizationKeys('signIn.alternativeMethods.title')} />
        </Header.Root>
        {/*TODO: extract main in its own component */}
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <SignInSocialButtons
            enableWeb3Providers
            enableOAuthProviders
          />
          <Flex
            elementDescriptor={descriptors.alternativeMethods}
            direction='col'
            gap={2}
          >
            {firstPartyFactors.map((factor, i) => (
              <ArrowBlockButton
                textLocalizationKey={getButtonLabel(factor)}
                elementDescriptor={descriptors.alternativeMethodsBlockButton}
                textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
                arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
                key={i}
                isDisabled={card.isLoading}
                onClick={() => onFactorSelected(factor)}
              />
            ))}
          </Flex>
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
