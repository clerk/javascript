import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog, type DialogProps } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import type { UserProfileDeviceDetailsFlowState } from './dialogs/flow.types';
import { deviceDialogStyles as styles } from './user-profile-device-dialog.styles';

export interface UserProfileDeviceDialogViewProps extends Pick<DialogProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  state: UserProfileDeviceDetailsFlowState;
  /** A verification prompt rendered inside the device dialog's stacking context. */
  verificationDialog?: ReactNode;
  onRequestSignOut: () => void;
  onCancelSignOut: () => void;
  onSignOut: () => void;
}

export function UserProfileDeviceDialogView({
  state,
  verificationDialog,
  onRequestSignOut,
  onCancelSignOut,
  onSignOut,
  ...dialogProps
}: UserProfileDeviceDialogViewProps) {
  const { device, isSubmitting, errors } = state;
  const details = [
    { label: 'Device', value: device.deviceName },
    { label: 'Browser', value: device.browserName },
    { label: 'IP address', value: device.ipAddress },
    { label: 'Last location', value: device.location, flag: device.locationFlag },
    { label: 'Original sign in', value: device.originalSignInAtLabel },
  ] as const;

  return (
    <Dialog.Root
      size='card'
      closedBy='closerequest'
      {...dialogProps}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            {...stylex.props(styles.popup)}
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
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
            <Card.Footer
              {...mergeStyleProps(themeProps('user-profile-device-dialog-actions'), stylex.props(styles.footer))}
            >
              <Button
                type='button'
                color='negative'
                onClick={onRequestSignOut}
              >
                Sign out
              </Button>
            </Card.Footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
      <AlertDialog
        open={state.step === 'confirm'}
        onOpenChange={open => {
          if (!open) {
            onCancelSignOut();
          }
        }}
      >
        <AlertDialog.Title render={<Heading size='sm' />}>Sign out of this device?</AlertDialog.Title>
        <AlertDialog.Description render={<Text />}>
          You will need to sign in again to use your account on this device.
        </AlertDialog.Description>
        {errors.form ? (
          <Text
            color='negative'
            role='alert'
            {...stylex.props(styles.error)}
          >
            {errors.form}
          </Text>
        ) : null}
        <AlertDialog.Actions>
          <AlertDialog.Close render={<Button variant='outline' />}>Cancel</AlertDialog.Close>
          <SubmitButton
            type='button'
            color='negative'
            isPending={isSubmitting}
            pendingLabel='Signing out device'
            onClick={onSignOut}
          >
            Sign out
          </SubmitButton>
        </AlertDialog.Actions>
        {verificationDialog}
      </AlertDialog>
    </Dialog.Root>
  );
}
