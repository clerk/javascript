import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../contexts';
import { Button, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { OrganizationPreview, PersonalWorkspacePreview } from '../../elements';
import { Selector } from '../../icons';
import { PropsOfComponent } from '../../styledSystem';

type OrganizationSwitcherTriggerProps = PropsOfComponent<typeof Button> & { isOpen: boolean };

export const OrganizationSwitcherTrigger = React.forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>(
  (props, ref) => {
    // const organization = useCoreOrganization();
    const user = useCoreUser();

    //Mocks
    const hidePersonal = false;
    const organization = { name: 'Test Org', logoUrl: user.profileImageUrl } as OrganizationResource;

    const personalWorkspace = hidePersonal ? (
      <Text localizationKey={localizationKeys('organizationSwitcher.notSelected')} />
    ) : (
      <PersonalWorkspacePreview
        user={user}
        rounded={false}
      />
    );

    return (
      <Button
        // elementDescriptor={descriptors.organizationSwitcherTrigger}
        variant='ghost'
        colorScheme='neutral'
        sx={theme => ({
          borderRadius: theme.radii.$lg,
        })}
        {...props}
        ref={ref}
      >
        <Flex
          // elementDescriptor={descriptors.organizationSwitcherTriggerBox}
          gap={4}
          center
        >
          {organization ? <OrganizationPreview organization={organization} /> : personalWorkspace}

          <Icon
            // do we need a descriptor here?
            icon={Selector}
          />
        </Flex>
      </Button>
    );
  },
);
