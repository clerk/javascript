import { useClerk } from '@clerk/shared/react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useCreateOrganizationContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { useDevMode } from '../../hooks/useDevMode';
import { CreateOrganizationForm } from './CreateOrganizationForm';

export const CreateOrganizationPage = withCardStateProvider(() => {
  const { closeCreateOrganization } = useClerk();

  const { mode, navigateAfterCreateOrganization, skipInvitationScreen, hideSlug } = useCreateOrganizationContext();
  const card = useCardState();
  const { showDevModeNotice } = useDevMode();

  return (
    <Card.Root sx={t => ({ width: t.sizes.$108 })}>
      <Card.Content
        sx={t => ({
          padding: `${t.space.$4} ${t.space.$5} ${showDevModeNotice ? t.space.$12 : t.space.$6}`,
        })}
      >
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
          hideSlug={hideSlug}
        />
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
});
