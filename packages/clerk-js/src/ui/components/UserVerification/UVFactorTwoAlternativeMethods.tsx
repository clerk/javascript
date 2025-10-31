import type { SessionVerificationSecondFactor } from '@clerk/shared/types';
import React from 'react';

import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { backupCodePrefFactorComparator } from '@/ui/utils/factorSorting';
import { formatSafeIdentifier } from '@/ui/utils/formatSafeIdentifier';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { HavingTrouble } from './HavingTrouble';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SessionVerificationSecondFactor) => void;
  supportedSecondFactors: SessionVerificationSecondFactor[] | null;
};

export const UVFactorTwoAlternativeMethods = (props: AlternativeMethodsProps) => {
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);

  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <AlternativeMethodsList
      supportedSecondFactors={props.supportedSecondFactors}
      onBackLinkClick={props.onBackLinkClick}
      onFactorSelected={props.onFactorSelected}
      onHavingTroubleClick={toggleHavingTrouble}
    />
  );
};

const AlternativeMethodsList = (props: AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler }) => {
  const { supportedSecondFactors, onHavingTroubleClick, onFactorSelected, onBackLinkClick } = props;
  const card = useCardState();

  return (
    <Flow.Part part='alternativeMethods'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('reverification.alternativeMethods.title')} />
            <Header.Subtitle localizationKey={localizationKeys('reverification.alternativeMethods.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Col
            elementDescriptor={descriptors.main}
            gap={3}
          >
            <Col gap={2}>
              {supportedSecondFactors?.sort(backupCodePrefFactorComparator).map((factor, i) => (
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
            <Card.ActionText localizationKey={localizationKeys('reverification.alternativeMethods.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('reverification.alternativeMethods.actionLink')}
              onClick={onHavingTroubleClick}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
};

export function getButtonLabel(factor: SessionVerificationSecondFactor): LocalizationKey {
  switch (factor.strategy) {
    case 'phone_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'totp':
      return localizationKeys('reverification.alternativeMethods.blockButton__totp');
    case 'backup_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__backupCode');
    default:
      throw new Error(`Invalid verification strategy: "${(factor as any).strategy}"`);
  }
}
