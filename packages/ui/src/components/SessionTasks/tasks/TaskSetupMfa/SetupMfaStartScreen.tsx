import type { VerificationStrategy } from '@clerk/shared/types';
import { useEffect, useState } from 'react';

import { Actions } from '@/elements/Actions';
import { useCardState } from '@/elements/contexts';
import { PreviewButton } from '@/elements/PreviewButton';
import { ArrowRightIcon, AuthApp, Mobile } from '@/icons';
import { useRouter } from '@/router';
import { Col, Flex, Flow, Icon, localizationKeys, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import { MFA_METHODS_TO_ROUTES_PATH } from './constants';
import { SharedFooterActionForSignOut } from './shared';

type SetupMfaStartScreenProps = {
  availableMethods: VerificationStrategy[];
};

const getMethodIconAndLabel = (method: VerificationStrategy) => {
  switch (method) {
    case 'totp':
      return { icon: <Icon icon={AuthApp} />, label: localizationKeys('taskSetupMfa.start.methodSelection.totp') };
    case 'phone_code':
      return {
        icon: <Icon icon={Mobile} />,
        label: localizationKeys('taskSetupMfa.start.methodSelection.phoneCode'),
      };
    default:
      return { icon: null, label: null };
  }
};

export const SetupMfaStartScreen = (props: SetupMfaStartScreenProps) => {
  const { availableMethods } = props;
  const { navigate } = useRouter();
  const card = useCardState();
  const [isLoading, setIsLoading] = useState<VerificationStrategy | null>(null);

  useEffect(() => {
    const autoSelectedMethod = availableMethods.length === 1;
    if (autoSelectedMethod) {
      void navigate(`./${MFA_METHODS_TO_ROUTES_PATH[availableMethods[0]]}`);
    }
  }, [availableMethods, navigate]);

  return (
    <Flow.Part part='methodSelection'>
      <Card.Root>
        <Card.Content sx={t => ({ padding: t.space.$none })}>
          <Header.Root
            showLogo
            sx={t => ({
              paddingTop: t.space.$8,
              paddingLeft: t.space.$8,
              paddingRight: t.space.$8,
            })}
          >
            <Header.Title localizationKey={localizationKeys('taskSetupMfa.start.title')} />
            <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.start.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {/* TODO: add element descriptor */}
          <Col>
            <Actions
              role='menu'
              sx={t => ({
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$borderAlpha100,
              })}
            >
              {availableMethods.map(method => {
                const { icon, label } = getMethodIconAndLabel(method);

                if (!icon || !label) {
                  return null;
                }

                {
                  /* TODO: add element descriptor for the button */
                }
                return (
                  <PreviewButton
                    isLoading={isLoading === method}
                    hoverAsFocus
                    block
                    key={method}
                    onClick={() => {
                      setIsLoading(method);
                      void navigate(`./${MFA_METHODS_TO_ROUTES_PATH[method]}`).finally(() => {
                        setIsLoading(null);
                      });
                      return;
                    }}
                    icon={ArrowRightIcon}
                  >
                    <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                      <Flex
                        sx={t => ({
                          borderRadius: t.radii.$circle,
                          borderWidth: t.borderWidths.$normal,
                          borderStyle: t.borderStyles.$solid,
                          borderColor: t.colors.$avatarBorder,
                          padding: t.space.$2,
                          backgroundColor: t.colors.$neutralAlpha50,
                        })}
                      >
                        {icon}
                      </Flex>
                      <Text
                        variant='buttonLarge'
                        localizationKey={label}
                      />
                    </Flex>
                  </PreviewButton>
                );
              })}
            </Actions>
          </Col>
        </Card.Content>

        <Card.Footer>
          <SharedFooterActionForSignOut />
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
};
