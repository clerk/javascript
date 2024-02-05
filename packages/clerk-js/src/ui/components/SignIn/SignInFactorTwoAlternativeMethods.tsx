import type { SignInFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { ArrowBlockButton, Card, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { backupCodePrefFactorComparator, formatSafeIdentifier } from '../../utils';
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
  const { onHavingTroubleClick, onFactorSelected, onBackLinkClick } = props;
  const card = useCardState();
  const { supportedSecondFactors } = useCoreSignIn();

  return (
    <Flow.Part part='alternativeMethods'>
      <Card.Root>
        <Card.Content gap={6}>
          <Card.Alert>{card.error}</Card.Alert>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('signIn.alternativeMethods.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.alternativeMethods.subtitle')} />
          </Header.Root>
          {/*TODO: extract main in its own component */}
          <Col
            elementDescriptor={descriptors.main}
            gap={4}
          >
            <Col gap={2}>
              {supportedSecondFactors.sort(backupCodePrefFactorComparator).map((factor, i) => (
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
            </Col>
            <Card.Action elementId='alternativeMethods'>
              {onBackLinkClick && (
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
    case 'phone_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'totp':
      return localizationKeys('signIn.alternativeMethods.blockButton__totp');
    case 'backup_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__backupCode');
    default:
      throw `Invalid sign in strategy: "${factor.strategy}"`;
  }
}
