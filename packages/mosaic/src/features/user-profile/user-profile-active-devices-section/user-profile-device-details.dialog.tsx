import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { DataList } from '../../../components/data-list';
import type { DialogFocusTarget, DialogHandle } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { fill, useMessages } from '../../../localization';
import type { UserProfileDevice } from './user-profile-active-devices.types';
import { useUserProfileDeviceDetailsController } from './user-profile-device-details.controller';

export interface UserProfileDeviceDetailsDialogProps {
  handle: DialogHandle<UserProfileDevice>;
  finalFocus?: DialogFocusTarget;
  onSignOut?: (device: UserProfileDevice) => void | Promise<void>;
}

export function UserProfileDeviceDetailsDialog({ handle, finalFocus, onSignOut }: UserProfileDeviceDetailsDialogProps) {
  const m = useMessages('userProfileActiveDevices');
  const controller = useUserProfileDeviceDetailsController({ onSignOut, fallbackError: m.detailsDialog.signOutError });

  return (
    <Dialog.Root
      handle={handle}
      open={controller.open}
      onOpenChange={controller.onOpenChange}
    >
      {({ payload: device }) =>
        device === undefined ? null : (
          <Dialog.Popup
            variant='card'
            finalFocus={finalFocus}
          >
            <DeviceDetailsCard
              device={device}
              onSignOut={controller.onSignOut}
              isSigningOut={controller.isSigningOut}
              errorMessage={controller.errorMessage}
            />
          </Dialog.Popup>
        )
      }
    </Dialog.Root>
  );
}

function DeviceDetailsCard({
  device,
  onSignOut,
  isSigningOut,
  errorMessage,
}: {
  device: UserProfileDevice;
  onSignOut?: (device: UserProfileDevice) => void;
  isSigningOut: boolean;
  errorMessage: string | undefined;
}) {
  const m = useMessages('userProfileActiveDevices');
  const fields: { label: string; value: string | undefined }[] = [
    { label: m.detailsDialog.model, value: device.model },
    { label: m.detailsDialog.browser, value: device.browser },
    { label: m.detailsDialog.ipAddress, value: device.ipAddress },
    { label: m.detailsDialog.location, value: device.location },
    { label: m.detailsDialog.signedInAt, value: device.signedInAt },
  ];
  const details = fields.filter((field): field is { label: string; value: string } => Boolean(field.value));

  return (
    <Card.Root
      elevation='overlay'
      renderBranding={false}
    >
      <Card.Header>
        <Card.Title>{device.name}</Card.Title>
        {device.lastActive ? (
          <Card.Description>{fill(m.detailsDialog.lastActive, { lastActive: device.lastActive })}</Card.Description>
        ) : null}
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {errorMessage}
      </Card.Banner>
      {details.length > 0 ? (
        <Card.Content>
          <DataList.Root>
            {details.map(detail => (
              <DataList.Item key={detail.label}>
                <DataList.Label>{detail.label}</DataList.Label>
                <DataList.Value title={detail.value}>{detail.value}</DataList.Value>
              </DataList.Item>
            ))}
          </DataList.Root>
        </Card.Content>
      ) : null}
      <Card.Footer>
        {onSignOut && !device.isCurrent ? (
          <SubmitButton
            type='button'
            fullWidth
            isPending={isSigningOut}
            onClick={() => onSignOut(device)}
          >
            {m.detailsDialog.signOut}
          </SubmitButton>
        ) : (
          <Dialog.Close
            render={
              <Button
                color='neutral'
                fullWidth
                variant='outline'
              />
            }
          >
            {m.detailsDialog.close}
          </Dialog.Close>
        )}
      </Card.Footer>
    </Card.Root>
  );
}
