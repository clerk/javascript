import { SignInFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../contexts';
import { descriptors, Flex, Flow, LocalizationKey, localizationKeys } from '../../customizables';
import { ArrowBlockButton, Card, CardAlert, Footer, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { allStrategiesButtonsComparator, formatSafeIdentifier } from '../../utils';
import { HavingTrouble } from './HavingTrouble';
import { SignInSocialButtons } from './SignInSocialButtons';
import { factorHasLocalStrategy } from './utils';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
};

export const AlternativeMethods = (props: AlternativeMethodsProps) => {
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);

  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <AlternativeMethodsList
      onBackLinkClick={props.onBackLinkClick}
      onFactorSelected={props.onFactorSelected}
      onHavingTroubleClick={toggleHavingTrouble}
    />
  );
};

const AlternativeMethodsList = (props: AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler }) => {
  const { onBackLinkClick, onHavingTroubleClick, onFactorSelected } = props;
  const card = useCardState();
  const { supportedFirstFactors } = useCoreSignIn();
  const firstPartyFactors = supportedFirstFactors.filter(f => !f.strategy.startsWith('oauth_'));
  const validFactors = firstPartyFactors
    .filter(factor => factorHasLocalStrategy(factor))
    .sort(allStrategiesButtonsComparator);

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
            {validFactors.map((factor, i) => (
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
          <Footer.Action elementId='help'>
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
    default:
      throw `Invalid sign in strategy: "${factor.strategy}"`;
  }
}
