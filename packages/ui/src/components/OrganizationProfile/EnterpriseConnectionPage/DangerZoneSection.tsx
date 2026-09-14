import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { useState } from 'react';

import { Card } from '@/elements/Card';
import { CardStateProvider, useCardState } from '@/elements/contexts';
import { ProfileSection } from '@/elements/Section';
import { handleError } from '@/utils/errorHandler';

import { localizationKeys } from '../../../customizables';
import type { ThemableCssProp } from '../../../styledSystem';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { ResetConnectionDialog } from '../../ConfigureSSO/ResetConnectionDialog';

type DangerZoneSectionProps = {
  connection: EnterpriseConnectionResource;
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onBack: () => void;
};

export const DangerZoneSection = (props: DangerZoneSectionProps): JSX.Element => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.connectionPage.dangerZone.title')}
    id='sso'
  >
    {/* Own card state so a failed deactivation reports here instead of in the page header. */}
    <CardStateProvider>
      <DangerZoneActions {...props} />
    </CardStateProvider>
  </ProfileSection.Root>
);

const itemSx: ThemableCssProp = t => ({
  paddingTop: 0,
  paddingBottom: 0,
  paddingInlineStart: t.space.$1,
});

const DangerZoneActions = ({
  connection,
  enterpriseConnectionMutations: { setConnectionActive, deleteConnection },
  organizationName,
  contentRef,
  onBack,
}: DangerZoneSectionProps): JSX.Element => {
  const card = useCardState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onDeactivate = async () => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await setConnectionActive(connection.id, false);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <ProfileSection.ItemList id='sso'>
        {connection.active && (
          <ProfileSection.Item
            id='sso'
            sx={itemSx}
          >
            <ProfileSection.Button
              id='sso'
              variant='ghost'
              colorScheme='danger'
              textVariant='buttonLarge'
              isDisabled={card.isLoading}
              onClick={() => void onDeactivate()}
              localizationKey={localizationKeys(
                'organizationProfile.securityPage.connectionPage.dangerZone.deactivateButton',
              )}
            />
          </ProfileSection.Item>
        )}

        <ProfileSection.Item
          id='sso'
          sx={itemSx}
        >
          <ProfileSection.Button
            id='sso'
            variant='ghost'
            colorScheme='danger'
            textVariant='buttonLarge'
            onClick={() => setIsDialogOpen(true)}
            localizationKey={localizationKeys(
              'organizationProfile.securityPage.connectionPage.dangerZone.removeButton',
            )}
          />
        </ProfileSection.Item>
      </ProfileSection.ItemList>

      <Card.Alert>{card.error}</Card.Alert>

      <ResetConnectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        confirmationValue={organizationName}
        title={localizationKeys('organizationProfile.securityPage.removeDialog.title')}
        subtitle={localizationKeys('organizationProfile.securityPage.removeDialog.subtitle', {
          name: connection.name,
        })}
        confirmButtonLabel={localizationKeys('organizationProfile.securityPage.removeDialog.confirmButton')}
        onDelete={async () => {
          await deleteConnection(connection.id);
          onBack();
        }}
        contentRef={contentRef}
      />
    </>
  );
};
