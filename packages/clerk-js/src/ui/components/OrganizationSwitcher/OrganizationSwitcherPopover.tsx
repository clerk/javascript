import { OrganizationResource } from '@clerk/types';
import React from 'react';

import {
  useCoreClerk,
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Action, OrganizationPreview, PersonalWorkspacePreview, PopoverCard, useCardState } from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { CogFilled } from '../../icons';
import { PropsOfComponent } from '../../styledSystem';
import { OrganizationActionList } from './OtherOrganizationActions';

type OrganizationSwitcherPopoverProps = { isOpen: boolean; close: () => void } & PropsOfComponent<
  typeof PopoverCard.Root
>;

export const OrganizationSwitcherPopover = React.forwardRef<HTMLDivElement, OrganizationSwitcherPopoverProps>(
  (props, ref) => {
    const { isOpen, close, ...rest } = props;
    const card = useCardState();
    const { openOrganizationProfile } = useCoreClerk();
    const { organization: currentOrg } = useCoreOrganization();
    const { createOrganization, isLoaded, setActive } = useCoreOrganizationList();
    const { showPersonalAccount } = useOrganizationSwitcherContext();

    const user = useCoreUser();

    if (!isLoaded) {
      return null;
    }

    const handleOrganizationClicked = (organization: OrganizationResource) => {
      return card.runAsync(() => setActive({ organization })).then(close);
    };

    const handlePersonalWorkspaceClicked = () => {
      return card.runAsync(() => setActive({ organization: null })).then(close);
    };

    const handleCreateOrganizationClicked = () => {
      openOrganizationProfile({ createOrganization: true });
      close();
    };

    const handleManageOrganizationClicked = () => {
      openOrganizationProfile();
      close();
    };

    if (!isOpen) {
      return null;
    }

    const manageOrganizationButton = (
      <Action
        icon={CogFilled}
        label={localizationKeys('organizationSwitcher.action__manageOrganization')}
        onClick={handleManageOrganizationClicked}
        sx={t => ({ margin: `${t.space.$2} 0` })}
      />
    );

    return (
      <RootBox>
        <PopoverCard.Root
          ref={ref}
          {...rest}
        >
          <PopoverCard.Main>
            {currentOrg ? (
              <>
                <OrganizationPreview
                  organization={currentOrg}
                  user={user}
                  sx={theme => ({ padding: `0 ${theme.space.$6}` })}
                />
                {manageOrganizationButton}
              </>
            ) : (
              showPersonalAccount && (
                <PersonalWorkspacePreview
                  user={user}
                  sx={theme => ({ padding: `0 ${theme.space.$6}`, marginBottom: theme.space.$6 })}
                />
              )
            )}
            <OrganizationActionList
              onCreateOrganizationClick={handleCreateOrganizationClicked}
              onPersonalWorkspaceClick={handlePersonalWorkspaceClicked}
              onOrganizationClick={handleOrganizationClicked}
            />
          </PopoverCard.Main>
          <PopoverCard.Footer />
        </PopoverCard.Root>
      </RootBox>
    );
  },
);
