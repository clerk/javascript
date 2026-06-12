import { useState } from 'react';

import { Button } from '../components/button';
import { Destructive } from '../block/destructive';

interface DeleteOrganizationProps {
  organizationName: string;
}

export function DeleteOrganization({ organizationName }: DeleteOrganizationProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
      <h2 style={{ fontWeight: 700 }}>Delete organization</h2>
      <p>Your organization will be permanently deleted and all members will lose access</p>
      <Destructive
        trigger={props => (
          <Button
            color='destructive'
            {...props}
          >
            Delete organization
          </Button>
        )}
        open={open}
        onOpenChange={setOpen}
        resourceType='organization'
        resourceName={organizationName}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
