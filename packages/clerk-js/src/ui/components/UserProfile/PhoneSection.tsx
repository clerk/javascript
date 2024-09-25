import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';

import { Badge, Box, Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { handleError, stringToFormattedPhoneString } from '../../utils';
import { PhoneForm } from './PhoneForm';
import { RemovePhoneForm } from './RemoveResourceForm';
import { sortIdentificationBasedOnVerification } from './utils';

type RemovePhoneScreenProps = { phoneId: string };
const RemovePhoneScreen = (props: RemovePhoneScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemovePhoneForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

type PhoneScreenProps = { phoneId?: string };
const PhoneScreen = (props: PhoneScreenProps) => {
  const { close } = useActionContext();
  return (
    <PhoneForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

export const PhoneSection = ({ shouldAllowCreation = true }: { shouldAllowCreation?: boolean }) => {
  const { user } = useUser();
  const hasPhoneNumbers = Boolean(user?.phoneNumbers?.length);

  if (!shouldAllowCreation && !hasPhoneNumbers) {
    return null;
  }

  return (
    <ProfileSection.Root
      centered={false}
      title={localizationKeys('userProfile.start.phoneNumbersSection.title')}
      id='phoneNumbers'
    >
      <Action.Root>
        <ProfileSection.ItemList id='phoneNumbers'>
          {sortIdentificationBasedOnVerification(user?.phoneNumbers, user?.primaryPhoneNumberId).map(phone => (
            <Action.Root key={phone.id}>
              <Action.Closed value=''>
                <ProfileSection.Item id='phoneNumbers'>
                  <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <Flex
                      gap={2}
                      center
                    >
                      <Text sx={t => ({ color: t.colors.$colorText })}>
                        {stringToFormattedPhoneString(phone.phoneNumber)}
                      </Text>
                      {user?.primaryPhoneNumberId === phone.id && (
                        <Badge localizationKey={localizationKeys('badge__primary')} />
                      )}
                      {phone.verification.status !== 'verified' && (
                        <Badge localizationKey={localizationKeys('badge__unverified')} />
                      )}
                    </Flex>
                  </Box>

                  <PhoneMenu phone={phone} />
                </ProfileSection.Item>
              </Action.Closed>

              <Action.Open value='remove'>
                <Action.Card variant='destructive'>
                  <RemovePhoneScreen phoneId={phone.id} />
                </Action.Card>
              </Action.Open>

              <Action.Open value='verify'>
                <Action.Card>
                  <PhoneScreen phoneId={phone.id} />
                </Action.Card>
              </Action.Open>
            </Action.Root>
          ))}
          {shouldAllowCreation && (
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
};

const PhoneMenu = ({ phone }: { phone: PhoneNumberResource }) => {
  const card = useCardState();
  const { open } = useActionContext();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const isPrimary = user.primaryPhoneNumberId === phone.id;
  const isVerified = phone.verification.status === 'verified';
  const setPrimary = () => {
    return user.update({ primaryPhoneNumberId: phone.id }).catch(e => handleError(e, [], card.setError));
  };

  const actions = (
    [
      isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__primary'),
            onClick: () => open('verify'),
          }
        : null,
      !isPrimary && isVerified
        ? {
            label: localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__nonPrimary'),
            onClick: setPrimary,
          }
        : null,
      !isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__unverified'),
            onClick: () => open('verify'),
          }
        : null,
      {
        label: localizationKeys('userProfile.start.phoneNumbersSection.destructiveAction'),
        isDestructive: true,
        onClick: () => open('remove'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};
