import { useClerk } from '@clerk/shared/react';

import { useCreateOrganizationContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Card, Header, withCardStateProvider } from '../../elements';
import { CreateOrganizationForm } from './CreateOrganizationForm';

export const CreateOrganizationPage = withCardStateProvider(() => {
  const title = localizationKeys('createOrganization.title');
  const { closeCreateOrganization } = useClerk();

  const { mode, navigateAfterCreateOrganization, skipInvitationScreen } = useCreateOrganizationContext();

  return (
    <Card.Root sx={t => ({ width: t.sizes.$120 })}>
      <Header.Root
        sx={t => ({
          padding: `${t.space.$4} ${t.space.$5}`,
        })}
      >
        <Header.Title localizationKey={title} />
      </Header.Root>
      <Card.Content sx={t => ({ padding: `${t.space.$5}` })}>
        <CreateOrganizationForm
          skipInvitationScreen={skipInvitationScreen}
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
