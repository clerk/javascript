import type { ReactNode } from 'react';

import type { CardProps } from '../../../components/card';
import { Card } from '../../../components/card';
import type { DialogFocusTarget } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { useMessages } from '../../../localization';

export interface SSOBypassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: DialogFocusTarget;
  children: ReactNode;
}

export function SSOBypassDialog({ open, onOpenChange, finalFocus, children }: SSOBypassDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup finalFocus={finalFocus}>
        <SSOBypassCard elevation='overlay'>{children}</SSOBypassCard>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

export function SSOBypassCard({ elevation, children }: { elevation?: CardProps['elevation']; children: ReactNode }) {
  const m = useMessages('organizationProfile').security.ssoBypassPage;
  return (
    <Card.Root
      elevation={elevation}
      size='lg'
      renderBranding={false}
    >
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>{m.description}</Card.Description>
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card.Root>
  );
}
