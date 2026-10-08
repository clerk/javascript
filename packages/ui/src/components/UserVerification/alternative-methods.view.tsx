import type { SessionVerificationFirstFactor } from '@clerk/shared/types';
import type React from 'react';

import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { formatSafeIdentifier } from '@/ui/utils/formatSafeIdentifier';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { Building, Envelope, Fingerprint, Lock, SpeechBubble } from '../../icons';
import type { useAlternativeMethodsController } from './alternative-methods.controller';
import type { useAlternativeMethodsModel } from './alternative-methods.model';

export const AlternativeMethodsView = ({
  firstPartyFactors,
  hasAlternativeStrategies,
  error,
  isLoading,
  selectFactor,
  onBackLinkClick,
  onHavingTroubleClick,
}: ReturnType<typeof useAlternativeMethodsModel> &
  ReturnType<typeof useAlternativeMethodsController> & {
    onBackLinkClick: React.MouseEventHandler | undefined;
    onHavingTroubleClick: React.MouseEventHandler;
  }) => {
  return (
    <Flow.Part part={'alternativeMethods'}>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('reverification.alternativeMethods.title')} />
            <Header.Subtitle localizationKey={localizationKeys('reverification.alternativeMethods.subtitle')} />
          </Header.Root>
          <Card.Alert>{error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <Col gap={4}>
              {hasAlternativeStrategies && (
                <Flex
                  elementDescriptor={descriptors.alternativeMethods}
                  direction='col'
                  gap={2}
                >
                  {firstPartyFactors.map((factor, i) => (
                    <ArrowBlockButton
                      leftIcon={getButtonIcon(factor)}
                      textLocalizationKey={getButtonLabel(factor)}
                      elementDescriptor={descriptors.alternativeMethodsBlockButton}
                      textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
                      arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
                      key={i}
                      textVariant='buttonLarge'
                      isDisabled={isLoading}
                      onClick={() => selectFactor(factor)}
                    />
                  ))}
                </Flex>
              )}
              {onBackLinkClick && (
                <BackLink
                  boxElementDescriptor={descriptors.backRow}
                  linkElementDescriptor={descriptors.backLink}
                  onClick={onBackLinkClick}
                />
              )}
            </Col>
          </Flex>
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

export function getButtonLabel(factor: SessionVerificationFirstFactor): LocalizationKey {
  switch (factor.strategy) {
    case 'email_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__emailCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'phone_code':
      return localizationKeys('reverification.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'password':
      return localizationKeys('reverification.alternativeMethods.blockButton__password');
    case 'passkey':
      return localizationKeys('reverification.alternativeMethods.blockButton__passkey');
    default:
      throw new Error(`Invalid sign in strategy: "${(factor as any).strategy}"`);
  }
}

export function getButtonIcon(factor: SessionVerificationFirstFactor) {
  const icons = {
    email_code: Envelope,
    phone_code: SpeechBubble,
    password: Lock,
    passkey: Fingerprint,
    enterprise_sso: Building,
  } as const;

  return icons[factor.strategy];
}
