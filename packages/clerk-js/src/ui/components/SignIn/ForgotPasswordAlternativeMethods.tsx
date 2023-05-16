import { descriptors, Flex, Flow, localizationKeys, Text } from '../../customizables';
import { ArrowBlockButton, Card, CardAlert, Footer, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import type { AlternativeMethodListProps, AlternativeMethodsProps } from './AlternativeMethods';
import { getButtonLabel } from './AlternativeMethods';
import { SignInSocialButtons } from './SignInSocialButtons';
import { useResetPasswordFactor } from './useResetPasswordFactor';
import { withHavingTrouble } from './withHavingTrouble';

export const ForgotPasswordAlternativeMethods = (props: AlternativeMethodsProps) => {
  return withHavingTrouble(ForgotPasswordAlternativeMethodsList, {
    ...props,
  });
};

const ForgotPasswordAlternativeMethodsList = (props: AlternativeMethodListProps) => {
  const { onBackLinkClick, onHavingTroubleClick, onFactorSelected } = props;
  const card = useCardState();

  const resetPasswordFactor = useResetPasswordFactor();

  const { firstPartyFactors, hasAnyStrategy } = useAlternativeStrategies({
    filterOutFactor: props.currentFactor,
  });

  if (!resetPasswordFactor) {
    // Make TS happy, we are handling this logic further up in the tree already,
    // so we will never return null here.
    return null;
  }

  return (
    <Flow.Part part='alternativeMethods'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          {onBackLinkClick && <Header.BackLink onClick={onBackLinkClick} />}
          <Header.Title localizationKey={localizationKeys('signIn.forgotPasswordAlternativeMethods.title')} />
        </Header.Root>

        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={6}
        >
          <ArrowBlockButton
            textLocalizationKey={getButtonLabel(resetPasswordFactor)}
            elementDescriptor={descriptors.alternativeMethodsBlockButton}
            textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
            arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
            isDisabled={card.isLoading}
            onClick={() => onFactorSelected(resetPasswordFactor)}
          />
          {hasAnyStrategy && (
            <>
              <Text
                localizationKey={localizationKeys('signIn.forgotPasswordAlternativeMethods.label__alternativeMethods')}
              />
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
