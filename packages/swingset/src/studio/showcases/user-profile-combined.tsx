'use client';

import { Dialog } from '@clerk/mosaic/components/dialog';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { PortalProvider } from '@clerk/mosaic/primitives/portal';
import { useContext, useState } from 'react';

import { useOrganizationProfileFixture } from '@/stories/fixtures/organization-profile';
import { usePrototype } from '@/stories/fixtures/switcher';
import { useUserProfileFixture } from '@/stories/fixtures/user-profile';

import { StageOverlayContext } from '../Stage';
import type { Showcase } from '../types';

type State = Record<string, never>;

const trigger = '[data-studio="user-button"] button';
const profile = '[data-studio="user-profile"]';

function View() {
  const prototype = usePrototype({ hidePersonal: true });
  const overlay = useContext(StageOverlayContext);
  const [open, setOpen] = useState(false);
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  const organization = useOrganizationProfileFixture();

  return (
    <div
      data-studio='user-button'
      data-studio-surface
    >
      <SwitcherView
        {...prototype}
        mode='combined'
        triggerVariant='full'
        onManageAccount={() => {
          prototype.onManageAccount?.();
          setOpen(true);
        }}
      />
      <PortalProvider container={overlay}>
        <Dialog.Root
          open={open}
          onOpenChange={setOpen}
        >
          <Dialog.Popup variant='profile'>
            <div
              data-studio='user-profile'
              style={{ display: 'contents' }}
            >
              <UserProfileView
                activePage={activePage}
                pages={pages}
                organization={{ pages: organization.pages }}
                onPageChange={setActivePage}
              />
            </div>
          </Dialog.Popup>
        </Dialog.Root>
      </PortalProvider>
    </div>
  );
}

export const userProfileCombined: Showcase<State> = {
  slug: 'user-profile-combined',
  title: 'UserProfile from the UserButton',
  summary: 'Open the UserButton, manage the account, and add a second factor in the profile.',
  focus: { width: 350, height: 450 },
  initialState: {},
  View,
  steps: [
    {
      label: 'Open the menu',
      layout: 'component',
      duration: 2.5,
      cursor: [{ at: 0.5, target: trigger, click: true }],
    },
    {
      label: 'Settings',
      layout: 'component',
      duration: 1.8,
      cursor: [{ at: 0.1, target: 'button', text: 'Settings' }],
    },
    {
      label: 'Manage profile',
      layout: 'component',
      duration: 2.5,
      cursor: [{ at: 0.1, target: '[role="menuitem"]', text: 'Manage profile', click: true }],
    },
    {
      label: 'Security',
      layout: 'component',
      duration: 2.2,
      cursor: [{ at: 0.1, target: `${profile} [role="tab"]`, text: 'Security', click: true }],
    },
    {
      label: 'Scroll to 2-step verification',
      layout: 'component',
      duration: 2,
      cursor: [{ at: 0.1, target: `${profile} [role="tabpanel"]`, scroll: 320 }],
    },
    {
      label: 'Add a verification method',
      layout: 'component',
      duration: 2,
      cursor: [{ at: 0.1, target: '[aria-label="Add verification method"]', click: true }],
    },
    {
      label: 'Authenticator app',
      layout: 'component',
      duration: 2.2,
      cursor: [{ at: 0.1, target: 'button', text: 'Authenticator app', click: true }],
    },
    {
      label: 'Enter the code',
      layout: 'component',
      duration: 2.8,
      cursor: [{ at: 0.1, type: '284913' }],
    },
    {
      label: 'Save backup codes',
      layout: 'component',
      duration: 2.2,
      cursor: [{ at: 0.1, target: 'button', text: 'Copy and close', click: true }],
    },
    {
      label: 'Close the profile',
      layout: 'component',
      duration: 2,
      hold: 1,
      cursor: [
        { at: 0.25, target: '.studio-overlay button[aria-label="Close"]', click: true },
        { at: 1.2, hide: true },
      ],
    },
  ],
};
