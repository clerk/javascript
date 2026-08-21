import * as stylex from '@stylexjs/stylex';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import type {
  UserProfileDeviceDetailsFlowActions,
  UserProfileDeviceDetailsFlowState,
  UserProfileDeviceSignOutFlowActions,
} from './dialogs/flow.types';
import { deviceDialogStyles as styles } from './user-profile-device-dialog.styles';
import { userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileDeviceDialogViewProps extends UserProfileDeviceDetailsFlowActions {
  state: UserProfileDeviceDetailsFlowState;
  isInterrupted?: boolean;
}

export function UserProfileDeviceDialogView({
  state,
  isInterrupted = false,
  onRequestSignOut,
}: UserProfileDeviceDialogViewProps) {
  const { device, isSubmitting } = state;
  const details = [
    { label: m.devices.details.device, value: device.deviceName },
    { label: m.devices.details.browser, value: device.browserName },
    { label: m.devices.details.ipAddress, value: device.ipAddress },
    { label: m.devices.details.lastLocation, value: device.location, flag: device.locationFlag },
    { label: m.devices.details.originalSignIn, value: device.originalSignInAtLabel },
  ] as const;

  return (
    <div aria-hidden={isInterrupted || undefined}>
      <Dialog.CloseButton disabled={isSubmitting} />
      <Card.Header>
        <Dialog.Title render={<Heading size='sm' />}>{device.title}</Dialog.Title>
        <Dialog.Description
          render={<Text />}
          {...stylex.props(styles.muted)}
        >
          {device.lastActiveAtLabel}
        </Dialog.Description>
      </Card.Header>
      <Card.Content {...stylex.props(styles.content)}>
        <dl {...stylex.props(styles.details)}>
          {details.map(({ label, value, ...detail }) => (
            <div
              key={label}
              {...stylex.props(styles.detailRow)}
            >
              <Text render={<dt />}>{label}</Text>
              <Text
                render={<dd />}
                {...stylex.props(styles.detailValue, styles.muted)}
              >
                {'flag' in detail && detail.flag ? <span aria-hidden>{detail.flag}</span> : null}
                <span>{value}</span>
              </Text>
            </div>
          ))}
        </dl>
      </Card.Content>
      <Card.Footer {...mergeStyleProps(themeProps('user-profile-device-dialog-actions'), stylex.props(styles.footer))}>
        <Button
          type='button'
          disabled={state.isSubmitting}
          color='negative'
          onClick={onRequestSignOut}
        >
          {m.common.signOut}
        </Button>
      </Card.Footer>
    </div>
  );
}

export interface UserProfileDeviceSignOutDialogViewProps extends UserProfileDeviceSignOutFlowActions {
  state: UserProfileDeviceDetailsFlowState;
  isInterrupted?: boolean;
}

export function UserProfileDeviceSignOutDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onSignOut,
}: UserProfileDeviceSignOutDialogViewProps) {
  return (
    <div aria-hidden={isInterrupted || undefined}>
      <AlertDialog.Title render={<Heading size='sm' />}>{m.devices.confirmTitle}</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>{m.devices.confirmDescription}</AlertDialog.Description>
      {state.errors.form ? (
        <Text
          color='negative'
          role='alert'
          {...stylex.props(styles.error)}
        >
          {state.errors.form}
        </Text>
      ) : null}
      <AlertDialog.Actions>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
        >
          {m.common.cancel}
        </Button>
        <SubmitButton
          type='button'
          color='negative'
          isPending={state.isSubmitting}
          pendingLabel={m.devices.signOutPending}
          onClick={onSignOut}
        >
          {m.common.signOut}
        </SubmitButton>
      </AlertDialog.Actions>
    </div>
  );
}
