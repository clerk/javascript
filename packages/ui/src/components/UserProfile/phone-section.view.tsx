import { Fragment } from 'react';

import { Badge, Box, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { stringToFormattedPhoneString } from '@/ui/utils/phoneUtils';

import type { usePhoneMenuController, usePhoneSectionController } from './phone-section.controller';
import { PhoneMenu, PhoneScreen, RemovePhoneScreen } from './phone-section.screens';

type Controller = Extract<ReturnType<typeof usePhoneSectionController>, { status: 'ready' }>;
type MenuController = Extract<ReturnType<typeof usePhoneMenuController>, { status: 'ready' }>;

export const PhoneMenuView = ({ controller }: { controller: MenuController }) => {
  if (controller.actions.length === 0) {
    return null;
  }
  return <ThreeDotsMenu actions={controller.actions} />;
};

export const PhoneSectionView = ({ controller }: { controller: Controller }) => (
  <ProfileSection.Root
    centered={false}
    title={localizationKeys('userProfile.start.phoneNumbersSection.title')}
    id='phoneNumbers'
  >
    <Action.Root>
      <ProfileSection.ItemList id='phoneNumbers'>
        {controller.phones.map(phone => (
          <Fragment key={phone.id}>
            <ProfileSection.Item id='phoneNumbers'>
              <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <Flex
                  gap={2}
                  center
                >
                  <Text sx={t => ({ color: t.colors.$colorForeground })}>
                    {stringToFormattedPhoneString(phone.phoneNumber)}
                  </Text>
                  {phone.isPrimary && <Badge localizationKey={localizationKeys('badge__primary')} />}
                  {!phone.isVerified && <Badge localizationKey={localizationKeys('badge__unverified')} />}
                </Flex>
              </Box>

              <PhoneMenu
                phoneId={phone.id}
                isVerified={phone.isVerified}
                shouldAllowDeletion={controller.shouldAllowDeletion}
              />
            </ProfileSection.Item>

            <Action.Open value={`remove-${phone.id}`}>
              <Action.Card variant='destructive'>
                <RemovePhoneScreen phoneId={phone.id} />
              </Action.Card>
            </Action.Open>

            <Action.Open value={`verify-${phone.id}`}>
              <Action.Card>
                <PhoneScreen phoneId={phone.id} />
              </Action.Card>
            </Action.Open>
          </Fragment>
        ))}
        {controller.shouldAllowCreation && (
          <>
            <Action.Trigger value='add'>
              <ProfileSection.ArrowButton
                id='phoneNumbers'
                localizationKey={localizationKeys('userProfile.start.phoneNumbersSection.primaryButton')}
              />
            </Action.Trigger>
            <Action.Open value='add'>
              <Action.Card>
                <PhoneScreen />
              </Action.Card>
            </Action.Open>
          </>
        )}
      </ProfileSection.ItemList>
    </Action.Root>
  </ProfileSection.Root>
);
