'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { ModalContentProps } from '@clerk/mosaic/modals/modal.types';

import { InviteFlow } from './invite-flow';

export default function InviteModalContent({ close, path, routing }: ModalContentProps<undefined>) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Invite a teammate</Card.Title>
        <Card.Description>
          The same invite flow as on the page, mounted in a modal. It routes under {path} in {routing} mode, so its step
          is part of the modal&apos;s entry.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <InviteFlow
          label='Invite'
          routing={routing}
          path={path}
        />
      </Card.Content>
      <Card.Footer>
        <Button
          variant='ghost'
          onClick={close}
        >
          Close
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
