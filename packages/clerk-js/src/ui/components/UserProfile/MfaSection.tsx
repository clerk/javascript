import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';

import { useEnvironment } from '../../contexts';
import { Badge, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { FormattedPhoneNumberText, ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { AuthApp, DotCircle, Mobile } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { handleError } from '../../utils';
import { MfaBackupCodeCreateScreen, MfaScreen, RemoveMfaPhoneCodeScreen, RemoveMfaTOTPScreen } from './MfaScreens';
import { defaultFirst, getSecondFactors, getSecondFactorsAvailableToAdd } from './utils';

export const MfaSection = () => {
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const secondFactors = getSecondFactors(attributes);
  const secondFactorsAvailableToAdd = getSecondFactorsAvailableToAdd(attributes, user);

  const showTOTP = secondFactors.includes('totp') && user.totpEnabled;
  const showBackupCode = secondFactors.includes('backup_code') && user.backupCodeEnabled;

  const mfaPhones = user.phoneNumbers
    .filter(ph => ph.verification.status === 'verified')
    .filter(ph => ph.reservedForSecondFactor)
    .sort(defaultFirst);

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.security.mfaSection.title')}
      id='mfa'
    >
      <Action.Root>
        <ProfileSection.ItemList id='mfa'>
          {showTOTP && (
            <Action.Root>
              <ProfileSection.Item id='mfa'>
                <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                  <Icon
                    icon={AuthApp}
                    sx={theme => ({ color: theme.colors.$blackAlpha700 })}
                  />

                  <Text localizationKey={localizationKeys('userProfile.security.mfaSection.totp.headerTitle')} />

                  <Badge localizationKey={localizationKeys('badge__default')} />
                </Flex>

                <MfaTOTPMenu />
              </ProfileSection.Item>

              <Action.Open value='remove'>
                <Action.Card variant='destructive'>
                  <RemoveMfaTOTPScreen />
                </Action.Card>
              </Action.Open>
            </Action.Root>
          )}

          {secondFactors.includes('phone_code') &&
            mfaPhones.map(phone => {
              const isDefault = !showTOTP && phone.defaultSecondFactor;
              return (
                <Action.Root key={phone.id}>
                  <ProfileSection.Item id='mfa'>
                    <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                      <Icon
                        icon={Mobile}
                        sx={theme => ({ color: theme.colors.$blackAlpha700 })}
                      />
                      <Text>
                        SMS Code <FormattedPhoneNumberText value={phone.phoneNumber} />
                      </Text>
                      {isDefault && <Badge localizationKey={localizationKeys('badge__default')} />}
                    </Flex>

                    <MfaPhoneCodeMenu
                      phone={phone}
                      showTOTP={showTOTP}
                    />
                  </ProfileSection.Item>

                  <Action.Open value='remove'>
                    <Action.Card variant='destructive'>
                      <RemoveMfaPhoneCodeScreen phoneId={phone.id} />
                    </Action.Card>
                  </Action.Open>
                </Action.Root>
              );
            })}

          {showBackupCode && (
            <Action.Root>
              <ProfileSection.Item id='mfa'>
                <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                  <Icon
                    icon={DotCircle}
                    sx={theme => ({ color: theme.colors.$blackAlpha700 })}
                  />

                  <Text localizationKey={localizationKeys('userProfile.security.mfaSection.backupCodes.headerTitle')} />
                </Flex>

                <MfaBackupCodeMenu />
              </ProfileSection.Item>

              <Action.Open value='regenerate'>
                <Action.Card>
                  <MfaBackupCodeCreateScreen />
                </Action.Card>
              </Action.Open>
            </Action.Root>
          )}

          {secondFactorsAvailableToAdd.length > 0 && (
            <>
              <Action.Trigger value='multi-factor'>
                <ProfileSection.Button
                  id='mfa'
                  localizationKey={localizationKeys('userProfile.security.mfaSection.primaryButton')}
                />
              </Action.Trigger>

              <Action.Open value='multi-factor'>
                <Action.Card>
                  <MfaScreen />
                </Action.Card>
              </Action.Open>
            </>
          )}
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
};

type MfaPhoneCodeMenuProps = {
  phone: PhoneNumberResource;
  showTOTP: boolean;
};

const MfaPhoneCodeMenu = ({ phone, showTOTP }: MfaPhoneCodeMenuProps) => {
  const { open } = useActionContext();
  const card = useCardState();

  const actions = (
    [
      showTOTP
        ? {
            label: localizationKeys('userProfile.security.mfaSection.phoneCode.actionLabel__setDefault'),
            onClick: () => phone.makeDefaultSecondFactor().catch(err => handleError(err, [], card.setError)),
          }
        : null,
      {
        label: localizationKeys('userProfile.security.mfaSection.phoneCode.destructiveActionLabel'),
        isDestructive: true,
        onClick: () => open('remove'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

const MfaBackupCodeMenu = () => {
  const { open } = useActionContext();

  const actions = (
    [
      {
        label: localizationKeys('userProfile.security.mfaSection.backupCodes.actionLabel__regenerate'),
        onClick: () => open('regenerate'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

const MfaTOTPMenu = () => {
  const { open } = useActionContext();

  const actions = (
    [
      {
        label: localizationKeys('userProfile.security.mfaSection.totp.destructiveActionTitle'),
        onClick: () => open('remove'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};
