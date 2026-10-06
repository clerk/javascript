import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { DataList } from '../../components/data-list';
import type { DialogFocusTarget, DialogHandle } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { usePendingAction } from '../../hooks/use-pending-action';
import { fill, useMessages } from '../../localization';
import type { UserProfileDevice } from './user-profile-active-devices.types';

export interface UserProfileDeviceDetailsDialogProps {
  handle: DialogHandle<UserProfileDevice>;
  finalFocus?: DialogFocusTarget;
  onSignOut?: (device: UserProfileDevice) => void | Promise<void>;
}

export function UserProfileDeviceDetailsDialog({ handle, finalFocus, onSignOut }: UserProfileDeviceDetailsDialogProps) {
  return (
    <Dialog.Root handle={handle}>
      {({ payload: device }) =>
        device === undefined ? null : (
          <Dialog.Popup
            variant='card'
            finalFocus={finalFocus}
          >
            <DeviceDetailsCard
              device={device}
              handle={handle}
              onSignOut={onSignOut}
            />
          </Dialog.Popup>
        )
      }
    </Dialog.Root>
  );
}

function DeviceDetailsCard({
  device,
  handle,
  onSignOut,
}: {
  device: UserProfileDevice;
  handle: DialogHandle<UserProfileDevice>;
  onSignOut: UserProfileDeviceDetailsDialogProps['onSignOut'];
}) {
  const m = useMessages('userProfileActiveDevices');
  const signOut = usePendingAction({ errorFallback: m.detailsDialog.signOutError });

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
        {signOut.error}
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
            isPending={signOut.isPending}
            onClick={() =>
              void signOut.run('sign-out', async () => {
                await onSignOut?.(device);
                handle.close();
              })
            }
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
