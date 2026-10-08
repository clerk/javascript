import type { ReactNode } from 'react';

import { ProviderIcon } from '@/ui/common';
import { descriptors, localizationKeys } from '@/ui/customizables';
import { ProfileSection } from '@/ui/elements/Section';

import type { useConnectMenuButtonModel } from './connected-accounts-menu.model';
import type { useProfileConnectionController } from './profile-connection.controller';

export const AddConnectedAccountView = ({ onClick, buttons }: { onClick?: () => void; buttons: ReactNode }) => (
  <ProfileSection.ActionMenu
    triggerLocalizationKey={localizationKeys('userProfile.start.connectedAccountsSection.primaryButton')}
    id='connectedAccounts'
    onClick={onClick}
  >
    {buttons}
  </ProfileSection.ActionMenu>
);

export const ConnectMenuButtonView = ({
  controller,
}: {
  controller: ReturnType<typeof useProfileConnectionController> &
    Pick<ReturnType<typeof useConnectMenuButtonModel>, 'strategy' | 'display'>;
}) => (
  <ProfileSection.ActionMenuItem
    key={controller.strategy}
    id={controller.display.id}
    onClick={() => void controller.connect()}
    isDisabled={controller.isDisabled}
    variant='ghost'
    isLoading={controller.isLoading}
    focusRing={false}
    closeAfterClick={false}
    localizationKey={localizationKeys('userProfile.connectedAccountPage.socialButtonsBlockButton', {
      provider: controller.display.name,
    })}
    sx={theme => ({
      justifyContent: 'start',
      gap: theme.space.$2,
    })}
    leftIcon={
      <ProviderIcon
        id={controller.display.id}
        iconUrl={controller.display.iconUrl}
        name={controller.display.name}
        isLoading={controller.isLoading}
        isDisabled={controller.isDisabled}
        alt={`Connect ${controller.display.name} account`}
        elementDescriptor={descriptors.providerIcon}
        elementId={descriptors.providerIcon.setId(controller.display.id)}
      />
    }
  />
);
