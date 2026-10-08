import { Actions } from '@/elements/Actions';
import { PreviewButton } from '@/elements/PreviewButton';
import { AuthApp, Mobile } from '@/icons';
import { descriptors, Flex, Icon, type LocalizationKey, localizationKeys, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import type { useSetupMfaStartScreenController } from './setup-mfa-start-screen.controller';
import type { useSetupMfaStartScreenModel } from './setup-mfa-start-screen.model';
import { SharedFooterActionForSignOut } from './shared';

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

export const SetupMfaStartScreenView = ({
  availableMethods,
  error,
  selectMethod,
}: ReturnType<typeof useSetupMfaStartScreenModel> & ReturnType<typeof useSetupMfaStartScreenController>) => {
  return (
    <Card.Root>
      <Card.Content sx={t => ({ padding: t.space.$none })}>
        <Header.Root
          showLogo
          sx={t => ({
            paddingTop: t.space.$8,
            paddingInline: t.space.$8,
          })}
        >
          <Header.Title localizationKey={localizationKeys('taskSetupMfa.start.title')} />
          <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.start.subtitle')} />
        </Header.Root>
        {error && (
          <Flex sx={t => ({ paddingInline: t.space.$8 })}>
            <Card.Alert>{error}</Card.Alert>
          </Flex>
        )}
        <Actions
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
                  selectMethod(method);
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
};
