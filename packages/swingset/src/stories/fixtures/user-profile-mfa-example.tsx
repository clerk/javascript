import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Flow } from '@clerk/mosaic/components/flow';
import { Icon } from '@clerk/mosaic/components/icon';
import { UserProfileAddAuthenticatorView } from '@clerk/mosaic/features/user-profile/user-profile-add-authenticator.view';
import { UserProfileAddMfaView } from '@clerk/mosaic/features/user-profile/user-profile-add-mfa.view';
import { UserProfileAddSmsView } from '@clerk/mosaic/features/user-profile/user-profile-add-sms.view';
import { UserProfileBackupCodesView } from '@clerk/mosaic/features/user-profile/user-profile-backup-codes.view';
import type { UserProfileSecurityPanelViewProps } from '@clerk/mosaic/features/user-profile/user-profile-security-panel.view';
import { useRef } from 'react';

import { useAuthenticatorCopy } from './user-profile-authenticator';
import { useUserProfileMfaFixture } from './user-profile-mfa';

export function useUserProfileMfaExample() {
  const fixture = useUserProfileMfaFixture();
  const addControl = <UserProfileMfaSetupExample fixture={fixture} />;
  const section = { ...fixture.section, addControl };
  const security: Pick<
    UserProfileSecurityPanelViewProps,
    | 'mfaMethods'
    | 'addableMfaMethods'
    | 'mfaAddControl'
    | 'onAddMfaMethod'
    | 'onSetDefaultMfaMethod'
    | 'onRemoveMfaMethod'
    | 'onRegenerateBackupCodes'
  > = {
    mfaMethods: section.methods,
    addableMfaMethods: section.addableMethods,
    mfaAddControl: addControl,
    onAddMfaMethod: section.onAdd,
    onSetDefaultMfaMethod: section.onSetDefault,
    onRemoveMfaMethod: section.onRemove,
    onRegenerateBackupCodes: section.onRegenerateBackupCodes,
  };
  return { section, security };
}

function UserProfileMfaSetupExample({ fixture }: { fixture: ReturnType<typeof useUserProfileMfaFixture> }) {
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const authenticatorCopy = useAuthenticatorCopy();
  return (
    <Dialog.Root
      open={fixture.setup.open}
      onOpenChange={fixture.setup.onOpenChange}
    >
      <Dialog.Trigger
        ref={addButtonRef}
        aria-label='Add verification method'
        render={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          />
        }
      >
        <Icon
          name='plus'
          placement='inline-start'
          size='sm'
        />
        Add
      </Dialog.Trigger>
      <Dialog.Popup
        variant='card'
        finalFocus={addButtonRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Flow.Root
            value={fixture.setup.step}
            state={fixture}
          >
            {current => (
              <>
                <Flow.Step ids={['select']}>
                  <UserProfileAddMfaView
                    methods={current.section.addableMethods ?? []}
                    onSelect={type => current.section.onAdd?.(type)}
                  />
                </Flow.Step>
                <Flow.Step ids={['sms']}>
                  <UserProfileAddSmsView
                    {...current.sms}
                    onCancel={() => current.setup.onOpenChange(false)}
                  />
                </Flow.Step>
                <Flow.Step ids={['authenticator']}>
                  <UserProfileAddAuthenticatorView
                    {...current.authenticator}
                    {...authenticatorCopy}
                    onCancel={() => current.setup.onOpenChange(false)}
                  />
                </Flow.Step>
                <Flow.Step ids={['backup-codes']}>
                  <UserProfileBackupCodesView
                    {...current.backupCodes}
                    onCancel={() => current.setup.onOpenChange(false)}
                  />
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
