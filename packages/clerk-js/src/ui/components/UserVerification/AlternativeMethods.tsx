import type { SessionVerificationFirstFactor, SignInFactor } from '@clerk/types';
import React from 'react';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { ArrowBlockButton, BackLink, Card, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useReverificationAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { ChatAltIcon, Email, LockClosedIcon } from '../../icons';
import { formatSafeIdentifier } from '../../utils';
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

  console.log('currentFactor -fa', firstPartyFactors);

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
    default:
      throw new Error(`Invalid sign in strategy: "${(factor as any).strategy}"`);
  }
}

export function getButtonIcon(factor: SessionVerificationFirstFactor) {
  const icons = {
    email_code: Email,
    phone_code: ChatAltIcon,
    password: LockClosedIcon,
  } as const;

  return icons[factor.strategy];
}
