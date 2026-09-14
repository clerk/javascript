import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { useState } from 'react';

import { ProfileSection } from '@/elements/Section';

import { localizationKeys } from '../../../customizables';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { ResetConnectionDialog } from '../../ConfigureSSO/ResetConnectionDialog';

type RemoveSectionProps = {
  connection: EnterpriseConnectionResource;
  deleteConnection: EnterpriseConnectionMutations['deleteConnection'];
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onBack: () => void;
};

export const RemoveSection = ({
  connection,
  deleteConnection,
  organizationName,
  contentRef,
  onBack,
}: RemoveSectionProps): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.remove.title')}
      id='sso'
    >
      <ProfileSection.Item
        id='sso'
        sx={t => ({
          paddingTop: 0,
          paddingBottom: 0,
          paddingInlineStart: t.space.$1,
        })}
      >
        <ProfileSection.Button
          id='sso'
          variant='ghost'
          colorScheme='danger'
          textVariant='buttonLarge'
          onClick={() => setIsDialogOpen(true)}
          localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.remove.button')}
        />
      </ProfileSection.Item>

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
    </ProfileSection.Root>
  );
};
