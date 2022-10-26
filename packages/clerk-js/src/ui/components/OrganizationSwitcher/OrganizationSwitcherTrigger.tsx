import React from 'react';

import { useCoreOrganization, useCoreUser } from '../../contexts';
import { Button, Flex, Icon, localizationKeys } from '../../customizables';
import { OrganizationPreview, PersonalWorkspacePreview } from '../../elements';
import { Selector } from '../../icons';
import { PropsOfComponent } from '../../styledSystem';

type OrganizationSwitcherTriggerProps = PropsOfComponent<typeof Button> & { isOpen: boolean };

export const OrganizationSwitcherTrigger = React.forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>(
  (props, ref) => {
    const user = useCoreUser();
    const { organization } = useCoreOrganization();

    const showPersonalAccount = true;

    return (
      <Button
        variant='ghost'
        colorScheme='neutral'
        sx={theme => ({
          borderRadius: theme.radii.$lg,
        })}
        {...props}
        ref={ref}
      >
        <Flex
          gap={4}
          center
        >
          {organization && (
            <OrganizationPreview
              size={'sm'}
              organization={organization}
              user={user}
            />
          )}
          {!organization && (
            <PersonalWorkspacePreview
              user={user}
              rounded={false}
              size={'sm'}
              subtitle={
                showPersonalAccount
                  ? localizationKeys('organizationSwitcher.personalWorkspace')
                  : localizationKeys('organizationSwitcher.notSelected')
              }
            />
          )}
          <Icon icon={Selector} />
        </Flex>
      </Button>
    );
  },
);
