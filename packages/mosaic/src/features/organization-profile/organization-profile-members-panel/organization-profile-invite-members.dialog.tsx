import { useId, useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogFocusTarget } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import type { SelectItem } from '../../../components/select';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { canSendInvitations, InviteMembersFields } from './organization-profile-invite-members.fields';

export interface OrganizationProfileInviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: DialogFocusTarget;
  emailAddresses: string[];
  onEmailAddressesChange: (emailAddresses: string[]) => void;
  rejectedEmailAddresses?: string[];
  roles: SelectItem[];
  role: string | null;
  onRoleChange: (role: string | null) => void;
  isRoleDisabled?: boolean;
  isPending: boolean;
  error: string | null;
  onSubmit: () => void | Promise<void>;
}

export function OrganizationProfileInviteMembersDialog({
  open,
  onOpenChange,
  finalFocus,
  emailAddresses,
  onEmailAddressesChange,
  rejectedEmailAddresses = [],
  roles,
  role,
  onRoleChange,
  isRoleDisabled = false,
  isPending,
  error,
  onSubmit,
}: OrganizationProfileInviteMembersDialogProps) {
  const m = useMessages('organizationProfileInviteMembers');
  const formId = useId();
  const emailInput = useRef<HTMLInputElement>(null);
  const canSubmit = canSendInvitations({ emailAddresses, rejectedEmailAddresses, role });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        if (!isPending) {
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
            {error}
          </Card.Banner>
          <Card.Content
            render={
              <Form
                id={formId}
                onSubmit={event => {
                  event.preventDefault();
                  if (canSubmit && !isPending) {
                    void onSubmit();
                  }
                }}
              />
            }
          >
            <InviteMembersFields
              emailInputRef={emailInput}
              emailAddresses={emailAddresses}
              onEmailAddressesChange={onEmailAddressesChange}
              rejectedEmailAddresses={rejectedEmailAddresses}
              roles={roles}
              role={role}
              onRoleChange={onRoleChange}
              isRoleDisabled={isRoleDisabled}
              isPending={isPending}
            />
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              disabled={isPending}
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                >
                  {m.cancel}
                </Button>
              }
            />
            <SubmitButton
              form={formId}
              fullWidth
              isPending={isPending}
              disabled={!canSubmit}
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
