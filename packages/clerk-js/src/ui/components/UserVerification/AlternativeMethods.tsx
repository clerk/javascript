import type { SessionVerificationFirstFactor, SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { formatSafeIdentifier } from '@/ui/utils/formatSafeIdentifier';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { ChatAltIcon, Email, Fingerprint, LockClosedIcon, Organization } from '../../icons';
import { useReverificationAlternativeStrategies } from './useReverificationAlternativeStrategies';
import { useUserVerificationSession } from './useUserVerificationSession';
import { withHavingTrouble } from './withHavingTrouble';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInFactor) => void;
  currentFactor: SignInFactor | undefined | null;
};

export type AlternativeMethodListProps = AlternativeMethodsProps & { onHavingTroubleClick: React.MouseEventHandler };

export const AlternativeMethods = (props: AlternativeMethodsProps) => {
  return withHavingTrouble(AlternativeMethodsList, {
    ...props,
  });
};

const AlternativeMethodsList = (props: AlternativeMethodListProps) => {
  const { onBackLinkClick, onHavingTroubleClick, onFactorSelected } = props;
  const card = useCardState();
  const { data } = useUserVerificationSession();
  const { firstPartyFactors, hasAnyStrategy } = useReverificationAlternativeStrategies<SessionVerificationFirstFactor>({
    filterOutFactor: props?.currentFactor,
    supportedFirstFactors: data?.supportedFirstFactors,
  });

  return (
    <Flow.Part part={'alternativeMethods'}>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('reverification.alternativeMethods.title')} />
            <Header.Subtitle localizationKey={localizationKeys('reverification.alternativeMethods.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <Col gap={4}>
              {hasAnyStrategy && (
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
                      isDisabled={card.isLoading}
                      onClick={() => {
                        card.setError(undefined);
                        onFactorSelected(factor);
                      }}
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
    email_code: Email,
    phone_code: ChatAltIcon,
    password: LockClosedIcon,
    passkey: Fingerprint,
    enterprise_sso: Organization,
  } as const;

  return icons[factor.strategy];
}
