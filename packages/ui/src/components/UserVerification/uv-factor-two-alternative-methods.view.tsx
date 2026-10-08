import type { SessionVerificationSecondFactor } from '@clerk/shared/types';
import type React from 'react';

import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { formatSafeIdentifier } from '@/ui/utils/formatSafeIdentifier';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';

type UVFactorTwoAlternativeMethodsViewProps = {
  supportedSecondFactors: SessionVerificationSecondFactor[] | null;
  error: string | undefined;
  isLoading: boolean;
  selectFactor: (factor: SessionVerificationSecondFactor) => void;
  onBackLinkClick: React.MouseEventHandler | undefined;
  onHavingTroubleClick: React.MouseEventHandler;
};

export const UVFactorTwoAlternativeMethodsView = ({
  supportedSecondFactors,
  error,
  isLoading,
  selectFactor,
  onBackLinkClick,
  onHavingTroubleClick,
}: UVFactorTwoAlternativeMethodsViewProps) => {
  return (
    <Flow.Part part='alternativeMethods'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('reverification.alternativeMethods.title')} />
            <Header.Subtitle localizationKey={localizationKeys('reverification.alternativeMethods.subtitle')} />
          </Header.Root>
          <Card.Alert>{error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Col
            elementDescriptor={descriptors.main}
            gap={3}
          >
            <Col gap={2}>
              {supportedSecondFactors?.map(factor => (
                <ArrowBlockButton
                  textLocalizationKey={getButtonLabel(factor)}
                  elementDescriptor={descriptors.alternativeMethodsBlockButton}
                  textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
                  arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
                  key={
                    factor.strategy === 'phone_code'
                      ? JSON.stringify([factor.strategy, factor.phoneNumberId])
                      : factor.strategy
                  }
                  isDisabled={isLoading}
                  onClick={() => selectFactor(factor)}
                />
              ))}
            </Col>
            <Card.Action elementId='alternativeMethods'>
              {onBackLinkClick && (
                <Card.ActionLink
                  localizationKey={localizationKeys('backButton')}
                  onClick={onBackLinkClick}
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
