import { SignInFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../ui/contexts/';
import { descriptors, Flex, Flow } from '../customizables';
import { ArrowBlockButton, Card, CardAlert, Footer, Header } from '../elements';
import { useCardState } from '../elements/contexts';
import { formatSafeIdentifier } from '../utils';
import { HavingTrouble } from './HavingTrouble';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
};

export const SignInFactorTwoAlternativeMethods = (props: AlternativeMethodsProps) => {
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
  const { supportedSecondFactors } = useCoreSignIn();

  return (
    <Flow.Part part='alternativeMethods'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          {onBackLinkClick && <Header.BackLink onClick={onBackLinkClick} />}
          <Header.Title>Use another method</Header.Title>
        </Header.Root>
        {/*TODO: extract main in its own component */}
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Flex
            direction='col'
            gap={2}
          >
            {supportedSecondFactors.map((factor, i) => (
              <ArrowBlockButton
                key={i}
                isDisabled={card.isLoading}
                onClick={() => onFactorSelected(factor)}
              >
                {getButtonLabel(factor)}
              </ArrowBlockButton>
            ))}
          </Flex>
        </Flex>
        <Footer.Root>
          <Footer.Action>
            <Footer.ActionLink onClick={onHavingTroubleClick}>Get help</Footer.ActionLink>
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};

export function getButtonLabel(factor: SignInFactor): string {
  switch (factor.strategy) {
    case 'phone_code':
      return `Send code to ${formatSafeIdentifier(factor.safeIdentifier)}`;
    case 'totp':
      return 'Use your authenticator app';
    default:
      throw `Invalid sign in strategy: "${factor.strategy}"`;
  }
}
