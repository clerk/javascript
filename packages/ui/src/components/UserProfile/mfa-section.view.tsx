import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { Badge, Flex, Icon, localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { FormattedPhoneNumberText } from '@/ui/elements/FormattedPhoneNumber';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { AuthApp, Mobile, ThreeDotsCircle } from '@/ui/icons';

import type {
  useMfaAddMenuController,
  useMfaMenuController,
  useMfaPhoneCodeController,
  useMfaSectionController,
} from './mfa-section.controller';

export const MfaSectionView = ({
  controller,
  showTOTP,
  showBackupCode,
  showPhoneCode,
  hideTOTPDeleteAction,
  totpMenu,
  totpRemoveScreen,
  backupCodeMenu,
  backupCodeCreateScreen,
  phones,
  addMenu,
}: {
  controller: ReturnType<typeof useMfaSectionController>;
  showTOTP: boolean;
  showBackupCode: boolean;
  showPhoneCode: boolean;
  hideTOTPDeleteAction: boolean;
  totpMenu: ReactNode;
  totpRemoveScreen: ReactNode;
  backupCodeMenu: ReactNode;
  backupCodeCreateScreen: ReactNode;
  phones: ReactNode;
  addMenu: ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.mfaSection.title')}
    centered={false}
    id='mfa'
  >
    <Action.Root
      value={controller.actionValue}
      onChange={controller.setActionValue}
    >
      <ProfileSection.ItemList id='mfa'>
        {showTOTP && (
          <>
            <ProfileSection.Item
              id='mfa'
              hoverable
            >
              <Flex sx={theme => ({ gap: theme.space.$2, alignItems: 'center' })}>
                <Icon
                  icon={AuthApp}
                  sx={theme => ({ color: theme.colors.$neutralAlpha700 })}
                />
                <Text localizationKey={localizationKeys('userProfile.start.mfaSection.totp.headerTitle')} />
                <Badge localizationKey={localizationKeys('badge__default')} />
              </Flex>
              {!hideTOTPDeleteAction && totpMenu}
            </ProfileSection.Item>
            <Action.Open value='remove-totp'>
              <Action.Card variant='destructive'>{totpRemoveScreen}</Action.Card>
            </Action.Open>
          </>
        )}

        {showPhoneCode && phones}

        {showBackupCode && (
          <>
            <ProfileSection.Item
              id='mfa'
              hoverable
            >
              <Flex sx={theme => ({ gap: theme.space.$2, alignItems: 'center' })}>
                <Icon
                  icon={ThreeDotsCircle}
                  sx={theme => ({ color: theme.colors.$neutralAlpha700 })}
                />
                <Text localizationKey={localizationKeys('userProfile.start.mfaSection.backupCodes.headerTitle')} />
              </Flex>
              {backupCodeMenu}
            </ProfileSection.Item>
            <Action.Open value='regenerate'>
              <Action.Card>{backupCodeCreateScreen}</Action.Card>
            </Action.Open>
          </>
        )}

        {addMenu}
      </ProfileSection.ItemList>
    </Action.Root>
  </ProfileSection.Root>
);

export const MfaPhoneCodeView = ({
  controller,
  removeScreen,
}: {
  controller: ReturnType<typeof useMfaPhoneCodeController>;
  removeScreen: ReactNode;
}) => (
  <Fragment key={controller.id}>
    <ProfileSection.Item
      id='mfa'
      hoverable
    >
      <Flex sx={theme => ({ gap: theme.space.$2, alignItems: 'center' })}>
        <Icon
          icon={Mobile}
          sx={theme => ({ color: theme.colors.$neutralAlpha700 })}
        />
        <Text>
          SMS Code <FormattedPhoneNumberText value={controller.phoneNumber} />
        </Text>
        {controller.isDefault && <Badge localizationKey={localizationKeys('badge__default')} />}
      </Flex>
      {controller.actions.length > 0 && <ThreeDotsMenu actions={controller.actions} />}
    </ProfileSection.Item>
    <Action.Open value={`remove-${controller.id}`}>
      <Action.Card variant='destructive'>{removeScreen}</Action.Card>
    </Action.Open>
  </Fragment>
);

export const MfaSimpleMenuView = ({ controller }: { controller: ReturnType<typeof useMfaMenuController> }) => (
  <ThreeDotsMenu actions={controller.actions} />
);

const strategiesMap = {
  phone_code: {
    icon: Mobile,
    text: 'SMS code',
    key: 'phone_code',
  },
  totp: {
    icon: AuthApp,
    text: 'Authenticator application',
    key: 'totp',
  },
  backup_code: {
    icon: ThreeDotsCircle,
    text: 'Backup code',
    key: 'backup_code',
  },
} as const;

export const MfaAddMenuView = ({
  controller,
  strategies,
  onClick,
  screen,
}: {
  controller: ReturnType<typeof useMfaAddMenuController>;
  strategies: string[];
  onClick: () => void;
  screen: ReactNode;
}) => {
  const methods = strategies
    .map(key => strategiesMap[key as keyof typeof strategiesMap] || null)
    .filter(method => method !== null);

  return (
    <>
      {strategies.length > 0 && (
        <Action.Closed value='multi-factor'>
          <ProfileSection.ActionMenu
            id='mfa'
            triggerLocalizationKey={localizationKeys('userProfile.start.mfaSection.primaryButton')}
            onClick={onClick}
          >
            {methods.map(method => (
              <ProfileSection.ActionMenuItem
                key={method.key}
                id={method.key}
                localizationKey={method.text}
                leftIcon={method.icon}
                onClick={() => controller.selectStrategy(method.key)}
              />
            ))}
          </ProfileSection.ActionMenu>
        </Action.Closed>
      )}
      <Action.Open value='multi-factor'>
        <Action.Card>{screen}</Action.Card>
      </Action.Open>
    </>
  );
};
