'use client';

import { ActionMenu } from '@clerk/mosaic/components/action-menu';
import { Entity } from '@clerk/mosaic/components/entity';

export default function ActionMenuExample() {
  return (
    <>
      <Entity.Root>
        <Entity.Content>
          <Entity.Label>grace@example.com</Entity.Label>
          <Entity.Description>Invited 2 days ago</Entity.Description>
        </Entity.Content>
      </Entity.Root>
      <ActionMenu
        label='Manage grace@example.com'
        actions={[
          { label: 'Resend invitation', onClick: () => {} },
          { label: 'Revoke invitation', color: 'negative', onClick: () => {} },
        ]}
      />
    </>
  );
}
