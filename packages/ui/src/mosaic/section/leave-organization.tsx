import { useState } from 'react';

import { Button } from '../components/button';
import { Destructive } from '../block/destructive';

interface LeaveOrganizationProps {
  organizationName: string;
}

export function LeaveOrganization({ organizationName }: LeaveOrganizationProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <>
      <h2>Leave organization</h2>
      <Destructive
        trigger={props => <Button {...props}>Leave organization</Button>}
        open={open}
        onOpenChange={setOpen}
        resourceType='organization'
        resourceName={organizationName}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
