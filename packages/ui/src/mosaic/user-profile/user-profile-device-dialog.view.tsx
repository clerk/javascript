import * as stylex from '@stylexjs/stylex';

import { SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import type { UserProfileDeviceDetailsFlowActions, UserProfileDeviceDetailsFlowState } from './dialogs/flow.types';
import { deviceDialogStyles as styles } from './user-profile-device-dialog.styles';
import { userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileDeviceDialogViewProps extends UserProfileDeviceDetailsFlowActions {
  state: UserProfileDeviceDetailsFlowState;
  isInterrupted?: boolean;
}

export function UserProfileDeviceDialogView({
  state,
  isInterrupted = false,
  onSignOut,
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
        {state.errors.form ? (
          <Text
            color='negative'
            role='alert'
            {...stylex.props(styles.error)}
          >
            {state.errors.form}
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer {...mergeStyleProps(themeProps('user-profile-device-dialog-actions'), stylex.props(styles.footer))}>
        <SubmitButton
          type='button'
          color='negative'
          isPending={state.isSubmitting}
          pendingLabel={m.devices.signOutPending}
          onClick={onSignOut}
        >
          {m.common.signOut}
        </SubmitButton>
      </Card.Footer>
    </div>
  );
}
