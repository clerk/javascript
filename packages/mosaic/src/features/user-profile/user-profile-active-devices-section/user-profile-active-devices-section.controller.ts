import type { Ref } from 'react';
import { useRef, useState } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import { useConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import type { UserProfileDevice } from './user-profile-active-devices.types';

export interface UserProfileActiveDevicesControllerOptions {
  devices: UserProfileDevice[];
  revoke?: (id: string) => Promise<void>;
  revokeAll?: () => Promise<void>;
  reverification?: ReverificationController;
}

export interface UserProfileActiveDevicesController {
  devices: UserProfileDevice[];
  currentDeviceTriggerRef: Ref<HTMLButtonElement>;
  signOutAllTriggerRef: Ref<HTMLButtonElement>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  finalFocus: DialogFocusTarget;
  details: ConfirmController<UserProfileDevice>;
  signOutFromDetails: ((device: UserProfileDevice) => void) | undefined;
  signOut: ConfirmController<UserProfileDevice> | undefined;
  signOutAll: ConfirmController | undefined;
  signOutAllFinalFocus: DialogFocusTarget;
}

export function useUserProfileActiveDevicesController({
  devices,
  revoke,
  revokeAll,
  reverification,
}: UserProfileActiveDevicesControllerOptions): UserProfileActiveDevicesController {
  const m = useMessages('userProfileActiveDevices');
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const visibleDevices = devices.filter(device => !removedIds.includes(device.id));
  const currentDeviceTriggerRef = useRef<HTMLButtonElement>(null);
  const signOutAllTriggerRef = useRef<HTMLButtonElement>(null);
  const signedOutAll = useRef(false);
  const removalFocus = useListRemovalFocus({
    ids: visibleDevices.filter(device => !device.isCurrent).map(device => device.id),
    onRemove: revoke
      ? async id => {
          await revoke(id);
          setRemovedIds(ids => [...ids, id]);
        }
      : undefined,
    fallback: () => currentDeviceTriggerRef.current,
  });
  const signOutDevice = (device: UserProfileDevice) => removalFocus.remove(device.id);
  const signOut = useConfirmController<UserProfileDevice>({
    onConfirm: signOutDevice,
    reverification,
    errorFallback: m.detailsDialog.signOutError,
  });
  const details = useConfirmController<UserProfileDevice>({
    onConfirm: signOutDevice,
    reverification,
    errorFallback: m.detailsDialog.signOutError,
  });
  const signOutAll = useConfirmController({
    onConfirm: async () => {
      await revokeAll?.();
      signedOutAll.current = true;
    },
    errorFallback: m.signOutAllError,
  });

  return {
    devices: visibleDevices,
    currentDeviceTriggerRef,
    signOutAllTriggerRef,
    registerTrigger: removalFocus.registerTrigger,
    finalFocus: removalFocus.finalFocus,
    details,
    signOutFromDetails: revoke ? device => details.confirm(device) : undefined,
    signOut: revoke ? signOut : undefined,
    signOutAll: revokeAll ? signOutAll : undefined,
    // Confirming removes the other devices and the trigger with them — hence the dialog mounted
    // outside the card, and the current device as the place focus lands. Cancelling keeps the
    // trigger, so focus goes back to it.
    signOutAllFinalFocus: () => {
      const signedOut = signedOutAll.current;
      signedOutAll.current = false;
      return signedOut ? currentDeviceTriggerRef.current : signOutAllTriggerRef.current;
    },
  };
}
