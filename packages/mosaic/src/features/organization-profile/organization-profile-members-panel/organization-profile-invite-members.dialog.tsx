import { useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogFocusTarget } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import type { InviteMembersForm } from './organization-profile-invite-members.controller';
import { InviteMembersFields } from './organization-profile-invite-members.fields';

export interface OrganizationProfileInviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: DialogFocusTarget;
  invite: InviteMembersForm;
}

export function OrganizationProfileInviteMembersDialog({
  open,
  onOpenChange,
  finalFocus,
  invite,
}: OrganizationProfileInviteMembersDialogProps) {
  const m = useMessages('organizationProfile').members.invite;
  const emailInput = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        if (!invite.isPending) {
          onOpenChange(next);
        }
      }}
    >
      <Dialog.Popup
        initialFocus={emailInput}
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          size='lg'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.title}</Card.Title>
          </Card.Header>
          <Card.Banner
            role='alert'
            color='negative'
          >
            {invite.error}
          </Card.Banner>
          <Card.Content
            render={
              <Form
                id={invite.formId}
                onSubmit={invite.onSubmit}
              />
            }
          >
            <InviteMembersFields
              emailInputRef={emailInput}
              invite={invite}
            />
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              disabled={invite.isPending}
              render={
                <Button
                  variant='outline'
                  color='neutral'
                >
                  {m.cancel}
                </Button>
              }
            />
            <SubmitButton
              form={invite.formId}
              isPending={invite.isPending}
              disabled={!invite.canSubmit}
              focusableWhenDisabled
            >
              {m.submit}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
