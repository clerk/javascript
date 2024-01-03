import { useClerk } from '@clerk/shared/react';

import { useCreateOrganizationContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Card, useCardState, withCardStateProvider } from '../../elements';
import { CreateOrganizationForm } from './CreateOrganizationForm';

export const CreateOrganizationPage = withCardStateProvider(() => {
  const { closeCreateOrganization } = useClerk();

  const { mode, navigateAfterCreateOrganization, skipInvitationScreen } = useCreateOrganizationContext();
  const card = useCardState();

  return (
    <Card.Root sx={t => ({ width: t.sizes.$120 })}>
      <Card.Content sx={t => ({ padding: `${t.space.$5}` })}>
        <Card.Alert>{card.error}</Card.Alert>
        <CreateOrganizationForm
          skipInvitationScreen={skipInvitationScreen}
          startPage={{ headerTitle: localizationKeys('createOrganization.title') }}
          navigateAfterCreateOrganization={navigateAfterCreateOrganization}
          flow={'default'}
          onComplete={() => {
            if (mode === 'modal') {
              closeCreateOrganization();
            }
          }}
        />
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
});
