import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource, VerificationStrategy } from '@clerk/types';
import React, { Fragment, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { FormattedPhoneNumberText } from '@/ui/elements/FormattedPhoneNumber';
import type { ProfileSectionActionMenuItemProps } from '@/ui/elements/Section';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';

import { useEnvironment } from '../../contexts';
import { Badge, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { AuthApp, DotCircle, Mobile } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { MfaBackupCodeCreateScreen, MfaScreen, RemoveMfaPhoneCodeScreen, RemoveMfaTOTPScreen } from './MfaScreens';
import { defaultFirst, getSecondFactors, getSecondFactorsAvailableToAdd } from './utils';

export const MfaSection = () => {
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { user } = useUser();
  const [actionValue, setActionValue] = useState<string | null>(null);

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
      title={localizationKeys('userProfile.start.mfaSection.title')}
      centered={false}
      id='mfa'
    >
      <Action.Root
        value={actionValue}
        onChange={setActionValue}
      >
        <ProfileSection.ItemList id='mfa'>
          {showTOTP && (
            <>
              <ProfileSection.Item
                id='mfa'
                hoverable
              >
                <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                  <Icon
                    icon={AuthApp}
                    sx={theme => ({ color: theme.colors.$neutralAlpha700 })}
                  />

                  <Text localizationKey={localizationKeys('userProfile.start.mfaSection.totp.headerTitle')} />

                  <Badge localizationKey={localizationKeys('badge__default')} />
                </Flex>

                <MfaTOTPMenu />
              </ProfileSection.Item>

              <Action.Open value='remove-totp'>
                <Action.Card variant='destructive'>
                  <RemoveMfaTOTPScreen />
                </Action.Card>
              </Action.Open>
            </>
          )}

          {secondFactors.includes('phone_code') &&
            mfaPhones.map(phone => {
              const isDefault = !showTOTP && phone.defaultSecondFactor;
              const phoneId = phone.id;
              return (
                <Fragment key={phoneId}>
                  <ProfileSection.Item
                    id='mfa'
                    hoverable
                  >
                    <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                      <Icon
                        icon={Mobile}
                        sx={theme => ({ color: theme.colors.$neutralAlpha700 })}
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

                  <Action.Open value={`remove-${phoneId}`}>
                    <Action.Card variant='destructive'>
                      <RemoveMfaPhoneCodeScreen phoneId={phoneId} />
                    </Action.Card>
                  </Action.Open>
                </Fragment>
              );
            })}

          {showBackupCode && (
            <>
              <ProfileSection.Item
                id='mfa'
                hoverable
              >
                <Flex sx={t => ({ gap: t.space.$2, alignItems: 'center' })}>
                  <Icon
                    icon={DotCircle}
                    sx={theme => ({ color: theme.colors.$neutralAlpha700 })}
                  />

                  <Text localizationKey={localizationKeys('userProfile.start.mfaSection.backupCodes.headerTitle')} />
                </Flex>

                <MfaBackupCodeMenu />
              </ProfileSection.Item>

              <Action.Open value='regenerate'>
                <Action.Card>
                  <MfaBackupCodeCreateScreen />
                </Action.Card>
              </Action.Open>
            </>
          )}

          <MfaAddMenu
            secondFactorsAvailableToAdd={secondFactorsAvailableToAdd}
            onClick={() => setActionValue(null)}
          />
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
  const phoneId = phone.id;

  const actions = (
    [
      !showTOTP && !phone.defaultSecondFactor
        ? {
            label: localizationKeys('userProfile.start.mfaSection.phoneCode.actionLabel__setDefault'),
            onClick: () => phone.makeDefaultSecondFactor().catch(err => handleError(err, [], card.setError)),
          }
        : null,
      {
        label: localizationKeys('userProfile.start.mfaSection.phoneCode.destructiveActionLabel'),
        isDestructive: true,
        onClick: () => open(`remove-${phoneId}`),
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
        label: localizationKeys('userProfile.start.mfaSection.backupCodes.actionLabel__regenerate'),
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
        label: localizationKeys('userProfile.start.mfaSection.totp.destructiveActionTitle'),
        isDestructive: true,
        onClick: () => open('remove-totp'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

type MfaAddMenuProps = ProfileSectionActionMenuItemProps & {
  secondFactorsAvailableToAdd: string[];
  onClick?: () => void;
};

const MfaAddMenu = (props: MfaAddMenuProps) => {
  const { open } = useActionContext();
  const { secondFactorsAvailableToAdd, onClick } = props;
  const [selectedStrategy, setSelectedStrategy] = useState<VerificationStrategy>();

  const strategies = React.useMemo(
    () =>
      secondFactorsAvailableToAdd
        .map(key => {
          if (key === 'phone_code') {
            return {
              icon: Mobile,
              text: 'SMS code',
              key: 'phone_code',
            } as const;
          } else if (key === 'totp') {
            return {
              icon: AuthApp,
              text: 'Authenticator application',
              key: 'totp',
            } as const;
          } else if (key === 'backup_code') {
            return {
              icon: DotCircle,
              text: 'Backup code',
              key: 'backup_code',
            } as const;
          }

          return null;
        })
        .filter(element => element !== null),
    [secondFactorsAvailableToAdd],
  );

  return (
    <>
      {secondFactorsAvailableToAdd.length > 0 && (
        <Action.Closed value='multi-factor'>
          <ProfileSection.ActionMenu
            id='mfa'
            triggerLocalizationKey={localizationKeys('userProfile.start.mfaSection.primaryButton')}
            onClick={onClick}
          >
            {strategies.map(
              method =>
                method && (
                  <ProfileSection.ActionMenuItem
                    key={method.key}
                    id={method.key}
                    localizationKey={method.text}
                    leftIcon={method.icon}
                    onClick={() => {
                      setSelectedStrategy(method.key);
                      open('multi-factor');
                    }}
                  />
                ),
            )}
          </ProfileSection.ActionMenu>
        </Action.Closed>
      )}
      <Action.Open value='multi-factor'>
        <Action.Card>{selectedStrategy && <MfaScreen selectedStrategy={selectedStrategy} />}</Action.Card>
      </Action.Open>
    </>
  );
};
