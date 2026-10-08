import { ArrowBlockButton } from '@/ui/elements/ArrowBlockButton';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { Divider } from '@/ui/elements/Divider';
import { Header } from '@/ui/elements/Header';

import { Button, Col, descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import type { useAlternativeMethodsController } from './alternative-methods.controller';
import {
  determineFlowPart,
  determineIsReset,
  determineTitle,
  getButtonIcon,
  getButtonLabel,
} from './alternative-methods.layout';
import { SignInSocialButtons } from './SignInSocialButtons';

export type AlternativeMethodsViewProps = ReturnType<typeof useAlternativeMethodsController>;

export function AlternativeMethodsView(props: AlternativeMethodsViewProps) {
  const flowPart = determineFlowPart(props.mode);
  const cardTitleKey = determineTitle(props.mode);
  const isReset = determineIsReset(props.mode);
  const resetPasswordFactor = props.resetPasswordFactor;

  return (
    <Flow.Part part={flowPart}>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={cardTitleKey} />
            {!isReset && props.mode !== 'passwordCompromised' && (
              <Header.Subtitle localizationKey={localizationKeys('signIn.alternativeMethods.subtitle')} />
            )}
          </Header.Root>
          <Card.Alert>{props.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            {isReset && resetPasswordFactor && (
              <Button
                localizationKey={getButtonLabel(resetPasswordFactor)}
                elementDescriptor={descriptors.alternativeMethodsBlockButton}
                isDisabled={props.isLoading}
                onClick={() => props.selectFactor(resetPasswordFactor)}
              />
            )}
            {isReset && props.hasAnyStrategy && (
              <Divider
                dividerText={localizationKeys('signIn.forgotPasswordAlternativeMethods.label__alternativeMethods')}
              />
            )}
            <Col gap={4}>
              {props.hasAnyStrategy && (
                <Flex
                  elementDescriptor={descriptors.alternativeMethods}
                  direction='col'
                  gap={2}
                >
                  <SignInSocialButtons
                    enableWeb3Providers
                    enableOAuthProviders
                    enableAlternativePhoneCodeProviders={false}
                  />
                  {props.firstPartyFactors &&
                    props.firstPartyFactors.map((factor, i) => (
                      <ArrowBlockButton
                        leftIcon={getButtonIcon(factor)}
                        textLocalizationKey={getButtonLabel(factor)}
                        elementDescriptor={descriptors.alternativeMethodsBlockButton}
                        textElementDescriptor={descriptors.alternativeMethodsBlockButtonText}
                        arrowElementDescriptor={descriptors.alternativeMethodsBlockButtonArrow}
                        key={i}
                        textVariant='buttonLarge'
                        isDisabled={props.isLoading}
                        onClick={() => props.selectFactor(factor)}
                      />
                    ))}
                </Flex>
              )}
              {props.onBackLinkClick && (
                <BackLink
                  boxElementDescriptor={descriptors.backRow}
                  linkElementDescriptor={descriptors.backLink}
                  onClick={props.onBackLinkClick}
                />
              )}
            </Col>
          </Flex>
        </Card.Content>
        <Card.Footer>
          <Card.Action elementId='havingTrouble'>
            <Card.ActionText localizationKey={localizationKeys('signIn.alternativeMethods.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('signIn.alternativeMethods.actionLink')}
              onClick={props.onHavingTroubleClick}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
}
