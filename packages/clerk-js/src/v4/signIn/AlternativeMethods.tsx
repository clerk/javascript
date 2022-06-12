import { SignInFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../ui/contexts/';
import { factorHasLocalStrategy } from '../../ui/signIn/utils';
import { descriptors, Flex, Grid } from '../customizables';
import { BackLink, BlockButtonWithArrow, CardAlert, FlowCard, Footer, Header, withFlowCardContext } from '../elements';
import { useCardState } from '../elements/contexts';
import { allStrategiesButtonsComparator } from '../utils';
import { HavingTrouble } from './HavingTrouble.';
import { SignInSocialButtons } from './SignInSocialButtons';

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

const AlternativeMethodsList = withFlowCardContext(
  (props: AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler }) => {
    const { onBackLinkClick, onHavingTroubleClick, onFactorSelected } = props;
    const card = useCardState();
    const { supportedFirstFactors } = useCoreSignIn();
    const firstPartyFactors = supportedFirstFactors.filter(f => !f.strategy.startsWith('oauth_'));
    const validFactors = firstPartyFactors
      .filter(factor => factorHasLocalStrategy(factor))
      .sort(allStrategiesButtonsComparator);

    return (
      <FlowCard.OuterContainer>
        <FlowCard.Content>
          <CardAlert>{card.error}</CardAlert>
          {onBackLinkClick && <BackLink onClick={onBackLinkClick} />}
          <Header.Root>
            <Header.Title>Try another method</Header.Title>
          </Header.Root>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={8}
            sx={theme => ({ marginTop: theme.space.$8 })}
          >
            <SignInSocialButtons />
            <Grid
              columns={1}
              gap={2}
            >
              {validFactors.map((factor, i) => (
                <BlockButtonWithArrow
                  key={i}
                  isDisabled={card.isLoading}
                  onClick={() => onFactorSelected(factor)}
                >
                  {getButtonLabel(factor)}
                </BlockButtonWithArrow>
              ))}
            </Grid>
          </Flex>
          <Footer.Root>
            <Footer.Action>
              <Footer.ActionLink
                isExternal
                onClick={onHavingTroubleClick}
              >
                I'm having trouble
              </Footer.ActionLink>
            </Footer.Action>
            <Footer.Links />
          </Footer.Root>
        </FlowCard.Content>
      </FlowCard.OuterContainer>
    );
  },
  { flow: 'signIn', page: 'alternativeMethods' },
);

export function getButtonLabel(factor: SignInFactor): string {
  switch (factor.strategy) {
    case 'email_link':
      return `Send verification link to ${factor.safeIdentifier}`;
    case 'email_code':
      return `Send verification code to ${factor.safeIdentifier}`;
    case 'phone_code':
      return `Send verification code to ${factor.safeIdentifier}`;
    case 'password':
      return 'Sign in with your password';
    default:
      throw `Invalid sign in strategy: "${factor.strategy}"`;
  }
}
