'use client';
import { Button } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { usePrototype } from '@swingset/stories/fixtures/switcher';
import * as React from 'react';

import { OrganizationProfileModal, UserProfileModal } from '@/components/gallery/embed-modal';
type Example = () => React.ReactElement;
function UserButtonCondensed() {
  const prototype = usePrototype();
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      triggerVariant='condensed'
    />
  );
}
function UserButtonIconOnly() {
  const prototype = usePrototype();
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      showTriggerLabel={false}
    />
  );
}
function UserButtonUserOnly() {
  const prototype = usePrototype();
  return (
    <SwitcherView
      {...prototype}
      mode='user'
    />
  );
}
function UserButtonSingleSession() {
  const prototype = usePrototype({ singleSession: true });
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
    />
  );
}
function ProfileDialog({
  label,
  variant,
  children,
}: {
  label: string;
  variant: 'profile' | 'fullscreen';
  children: React.ReactElement;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Dialog.Root
        open={open}
        onOpenChange={setOpen}
      >
        <Dialog.Popup
          variant={variant}
          initialFocus={false}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Root>
    </>
  );
}
function UserProfileOverlay() {
  return (
    <ProfileDialog
      label='Manage account'
      variant='profile'
    >
      <UserProfileModal />
    </ProfileDialog>
  );
}
function UserProfileFullscreen() {
  return (
    <ProfileDialog
      label='Open full screen'
      variant='fullscreen'
    >
      <UserProfileModal />
    </ProfileDialog>
  );
}
function OrganizationProfileOverlay() {
  return (
    <ProfileDialog
      label='Manage organization'
      variant='profile'
    >
      <OrganizationProfileModal />
    </ProfileDialog>
  );
}
function OrganizationProfileFullscreen() {
  return (
    <ProfileDialog
      label='Open full screen'
      variant='fullscreen'
    >
      <OrganizationProfileModal />
    </ProfileDialog>
  );
}
export const EXAMPLES: Record<string, Record<string, Example>> = {
  'user-button': {
    condensed: UserButtonCondensed,
    iconOnly: UserButtonIconOnly,
    userOnly: UserButtonUserOnly,
    singleSession: UserButtonSingleSession,
  },
  'user-profile': { overlay: UserProfileOverlay, fullscreen: UserProfileFullscreen },
  'organization-profile': { overlay: OrganizationProfileOverlay, fullscreen: OrganizationProfileFullscreen },
};
