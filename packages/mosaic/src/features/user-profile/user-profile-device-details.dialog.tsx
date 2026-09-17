import { useRef, useState } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { DataList } from '../../components/data-list';
import type { DialogFocusTarget, DialogHandle } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const signingOut = useRef(false);

  const signOut = async () => {
    if (!onSignOut || signingOut.current) {
      return;
    }
    signingOut.current = true;
    setIsSigningOut(true);
    setErrorMessage(undefined);
    try {
      await onSignOut(device);
      handle.close();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : m.detailsDialog.signOutError);
    } finally {
      signingOut.current = false;
      setIsSigningOut(false);
    }
  };

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
      {errorMessage || details.length > 0 ? (
        <Card.Content>
          {errorMessage ? (
            <Banner.Root
              role='alert'
              color='negative'
            >
              <Banner.Label>{errorMessage}</Banner.Label>
            </Banner.Root>
          ) : null}
          {details.length > 0 ? (
            <DataList.Root>
              {details.map(detail => (
                <DataList.Item key={detail.label}>
                  <DataList.Label>{detail.label}</DataList.Label>
                  <DataList.Value title={detail.value}>{detail.value}</DataList.Value>
                </DataList.Item>
              ))}
            </DataList.Root>
          ) : null}
        </Card.Content>
      ) : null}
      <Card.Footer>
        {onSignOut && !device.isCurrent ? (
          <SubmitButton
            type='button'
            fullWidth
            isPending={isSigningOut}
            onClick={() => void signOut()}
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
