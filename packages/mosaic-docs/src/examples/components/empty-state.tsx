'use client';

import { Button } from '@clerk/mosaic/components/button';
import { EmptyState } from '@clerk/mosaic/components/empty-state';
import { UsersAddRight } from '@clerk/mosaic/icons/glyphs/users-add-right';

export default function EmptyStateExample() {
  return (
    <EmptyState.Root>
      <EmptyState.Icon glyph={UsersAddRight} />
      <EmptyState.Label>No invitations</EmptyState.Label>
      <EmptyState.Description>Invite people to join your organization.</EmptyState.Description>
      <EmptyState.Actions>
        <Button>Invite members</Button>
      </EmptyState.Actions>
    </EmptyState.Root>
  );
}
