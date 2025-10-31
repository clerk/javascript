import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { backupCodePrefFactorComparator } from '@/ui/utils/factorSorting';
import { formatSafeIdentifier } from '@/ui/utils/formatSafeIdentifier';

import { useCoreSignIn } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { useCardState } from '../../elements/contexts';
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
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.alternativeMethods.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.alternativeMethods.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Col
            elementDescriptor={descriptors.main}
            gap={3}
          >
            <Col gap={2}>
              {supportedSecondFactors &&
                supportedSecondFactors.sort(backupCodePrefFactorComparator).map((factor, i) => (
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
    case 'email_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__emailCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    default:
      throw new Error(`Invalid sign in strategy: "${factor.strategy}"`);
  }
}
