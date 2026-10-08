import { Action, Actions } from '@/elements/Actions';
import { PreviewButton } from '@/elements/PreviewButton';
import { Plus } from '@/icons';
import { Button, Col, descriptors, Flex, Flow, localizationKeys, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import type { useSmsPhoneSelectionController } from './sms-phone-selection.controller';

export const SmsPhoneSelectionView = ({
  controller,
}: {
  controller: ReturnType<typeof useSmsPhoneSelectionController>;
}) => {
  if (!controller.hasUser) {
    return null;
  }

  return (
    <Flow.Part part='phoneCode'>
      <Card.Content sx={t => ({ padding: t.space.$none })}>
        <Header.Root
          showLogo
          badgeText={localizationKeys('taskSetupMfa.badge')}
          sx={t => ({
            paddingTop: t.space.$8,
            paddingInline: t.space.$8,
          })}
        >
          <Header.Title localizationKey={localizationKeys('taskSetupMfa.smsCode.title')} />
          <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.smsCode.subtitle')} />
        </Header.Root>
        {controller.error && (
          <Flex sx={t => ({ paddingInline: t.space.$8 })}>
            <Card.Alert>{controller.error}</Card.Alert>
          </Flex>
        )}
        <Col>
          <Actions
            elementDescriptor={descriptors.taskSetupMfaPhoneSelectionItems}
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
            })}
          >
            {controller.phones.map(phone => (
              <PreviewButton
                key={phone.id}
                isLoading={phone.isLoading}
                hoverAsFocus
                block
                elementDescriptor={descriptors.taskSetupMfaPhoneSelectionItem}
                sx={t => ({
                  padding: `${t.space.$4} ${t.space.$6}`,
                })}
                onClick={() => void controller.onSelect(phone.id)}
              >
                <Flex sx={t => ({ gap: t.space.$4, alignItems: 'center' })}>
                  <Text sx={t => ({ fontSize: t.fontSizes.$lg })}>{phone.flag}</Text>
                  <Text variant='buttonLarge'>{phone.formattedPhone}</Text>
                </Flex>
              </PreviewButton>
            ))}
            <Action
              hoverAsFocus
              label={localizationKeys('taskSetupMfa.smsCode.addPhoneNumber')}
              block
              onClick={controller.onAddPhoneClick}
              icon={Plus}
              elementDescriptor={descriptors.taskSetupMfaPhoneSelectionAddPhoneAction}
              sx={t => ({
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$borderAlpha100,
                padding: `${t.space.$4} ${t.space.$4}`,
                gap: t.space.$2,
              })}
              iconSx={t => ({
                width: t.sizes.$8,
                height: t.sizes.$6,
              })}
            />
          </Actions>
          <Flex
            justify='center'
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
              padding: t.space.$4,
            })}
          >
            <Button
              variant='ghost'
              onClick={controller.onReset}
              block
              elementDescriptor={descriptors.formButtonReset}
              localizationKey={localizationKeys('taskSetupMfa.smsCode.cancel')}
            />
          </Flex>
        </Col>
      </Card.Content>
    </Flow.Part>
  );
};
