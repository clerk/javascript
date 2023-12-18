import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';

import { Badge, Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { handleError, stringToFormattedPhoneString } from '../../utils';
import { PhoneForm } from './PhoneForm';
import { RemovePhoneForm } from './RemoveResourceForm';
import { primaryIdentificationFirst } from './utils';

export const PhoneSection = () => {
  const { user } = useUser();

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.phoneNumbersSection.title')}
      id='phoneNumbers'
    >
      <Action.Root>
        <ProfileSection.ItemList id='phoneNumbers'>
          {user?.phoneNumbers.sort(primaryIdentificationFirst(user.primaryPhoneNumberId)).map(phone => (
            <Action.Root key={phone.id}>
              <Action.Closed value=''>
                <ProfileSection.Item id='phoneNumbers'>
                  <Text sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <Flex
                      gap={2}
                      center
                    >
                      {stringToFormattedPhoneString(phone.phoneNumber)}{' '}
                      {user?.primaryPhoneNumberId === phone.id && (
                        <Badge localizationKey={localizationKeys('badge__primary')} />
                      )}
                      {phone.verification.status !== 'verified' && (
                        <Badge localizationKey={localizationKeys('badge__unverified')} />
                      )}
                    </Flex>
                  </Text>

                  <PhoneMenu phone={phone} />
                </ProfileSection.Item>
              </Action.Closed>

              <Action.Open value='remove'>
                <Action.Card>
                  <RemovePhoneForm phoneId={phone.id} />
                </Action.Card>
              </Action.Open>

              <Action.Open value='verify'>
                <Action.Card>
                  <PhoneForm phoneId={phone.id} />
                </Action.Card>
              </Action.Open>
            </Action.Root>
          ))}

          <Action.Trigger value='add'>
            <ProfileSection.Button
              id='phoneNumbers'
              localizationKey={localizationKeys('userProfile.start.phoneNumbersSection.primaryButton')}
            />
          </Action.Trigger>
        </ProfileSection.ItemList>

        <Action.Open value='add'>
          <Action.Card>
            <PhoneForm />
          </Action.Card>
        </Action.Open>
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
