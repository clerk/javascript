import { Col, descriptors, Flow, localizationKeys } from '@/customizables';
import { ArrowBlockButton } from '@/elements/ArrowBlockButton';
import { Card } from '@/elements/Card';
import { Header } from '@/elements/Header';
import { backupCodePrefFactorComparator } from '@/utils/factorSorting';

import { HavingTrouble } from './HavingTrouble';
import type { useSignInFactorTwoAlternativeMethodsController } from './sign-in-factor-two-alternative-methods.controller';
import { getButtonLabel } from './sign-in-factor-two-alternative-methods.layout';

export type SignInFactorTwoAlternativeMethodsViewProps = ReturnType<
  typeof useSignInFactorTwoAlternativeMethodsController
>;

export function SignInFactorTwoAlternativeMethodsView(props: SignInFactorTwoAlternativeMethodsViewProps) {
  if (props.showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={props.toggleHavingTrouble} />;
  }

  return (
    <Flow.Part part='alternativeMethods'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.alternativeMethods.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.alternativeMethods.subtitle')} />
          </Header.Root>
          <Card.Alert>{props.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Col
            elementDescriptor={descriptors.main}
            gap={3}
          >
            <Col gap={2}>
              {props.supportedSecondFactors &&
                props.supportedSecondFactors.sort(backupCodePrefFactorComparator).map((factor, i) => (
                  <ArrowBlockButton
                    textLocalizationKey={getButtonLabel(factor)}
                    elementDescriptor={descriptors.alternativeMethodsBlockButton}
                    textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
                    arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
                    key={i}
                    isDisabled={props.isLoading}
                    onClick={() => props.onFactorSelected(factor)}
                  />
                ))}
            </Col>
            <Card.Action elementId='alternativeMethods'>
              {props.onBackLinkClick && (
                <Card.ActionLink
                  localizationKey={localizationKeys('backButton')}
                  onClick={props.onBackLinkClick}
                />
              )}
            </Card.Action>
          </Col>
        </Card.Content>
        <Card.Footer>
          <Card.Action elementId='havingTrouble'>
            <Card.ActionText localizationKey={localizationKeys('signIn.alternativeMethods.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('signIn.alternativeMethods.actionLink')}
              onClick={props.toggleHavingTrouble}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
}
