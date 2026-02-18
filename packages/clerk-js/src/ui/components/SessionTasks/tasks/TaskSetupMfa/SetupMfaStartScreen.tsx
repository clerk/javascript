import type { VerificationStrategy } from '@clerk/shared/types';

import { descriptors, Flex, Icon, type LocalizationKey, localizationKeys, Text } from '@/ui/customizables';
import { Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { AuthApp, Mobile } from '@/ui/icons';

import { MFA_METHODS_TO_STEP } from './constants';
import { SharedFooterActionForSignOut } from './shared';

type SetupMfaStartScreenProps = {
  availableMethods: VerificationStrategy[];
  goToStep: (step: number) => void;
};

const METHOD_CONFIG: Record<'totp' | 'phone_code', { icon: JSX.Element; label: LocalizationKey }> = {
  totp: {
    icon: <Icon icon={AuthApp} />,
    label: localizationKeys('taskSetupMfa.start.methodSelection.totp'),
  },
  phone_code: {
    icon: <Icon icon={Mobile} />,
    label: localizationKeys('taskSetupMfa.start.methodSelection.phoneCode'),
  },
};

export const SetupMfaStartScreen = withCardStateProvider((props: SetupMfaStartScreenProps) => {
  const { availableMethods, goToStep } = props;
  const card = useCardState();

  return (
    <Card.Root>
      <Card.Content sx={t => ({ padding: t.space.$none })}>
        <Header.Root
          showLogo
          gap={4}
          sx={t => ({
            paddingTop: t.space.$8,
            paddingLeft: t.space.$8,
            paddingRight: t.space.$8,
          })}
        >
          <Header.Title localizationKey={localizationKeys('taskSetupMfa.start.title')} />
          <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.start.subtitle')} />
        </Header.Root>
        {card.error && (
          <Flex sx={t => ({ paddingInline: t.space.$8 })}>
            <Card.Alert>{card.error}</Card.Alert>
          </Flex>
        )}
        <Actions
          role='menu'
          elementDescriptor={descriptors.taskSetupMfaMethodSelectionItems}
          sx={t => ({
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$borderAlpha100,
          })}
        >
          {availableMethods.map(method => {
            const methodConfig = METHOD_CONFIG[method as keyof typeof METHOD_CONFIG] ?? null;

            if (!methodConfig) {
              return null;
            }

            return (
              <PreviewButton
                elementDescriptor={descriptors.taskSetupMfaMethodSelectionItem}
                hoverAsFocus
                block
                key={method}
                onClick={() => {
                  goToStep(MFA_METHODS_TO_STEP[method as keyof typeof MFA_METHODS_TO_STEP]);
                }}
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
                    {methodConfig.icon}
                  </Flex>
                  <Text
                    variant='buttonLarge'
                    localizationKey={methodConfig.label}
                  />
                </Flex>
              </PreviewButton>
            );
          })}
        </Actions>
      </Card.Content>

      <Card.Footer>
        <SharedFooterActionForSignOut />
      </Card.Footer>
    </Card.Root>
  );
});
