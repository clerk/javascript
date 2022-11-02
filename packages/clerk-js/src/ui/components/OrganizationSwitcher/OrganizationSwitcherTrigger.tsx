import React from 'react';

import { useCoreOrganization, useCoreUser, useOrganizationSwitcherContext } from '../../contexts';
import { Button, Flex, Icon, localizationKeys } from '../../customizables';
import { OrganizationPreview, PersonalWorkspacePreview } from '../../elements';
import { Selector } from '../../icons';
import { PropsOfComponent } from '../../styledSystem';

type OrganizationSwitcherTriggerProps = PropsOfComponent<typeof Button> & { isOpen: boolean };

export const OrganizationSwitcherTrigger = React.forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>(
  (props, ref) => {
    const user = useCoreUser();
    const { organization } = useCoreOrganization();
    const { hidePersonal } = useOrganizationSwitcherContext();

    return (
      <Button
        variant='ghost'
        colorScheme='neutral'
        sx={t => ({ borderRadius: t.radii.$lg })}
        {...props}
        ref={ref}
      >
        <Flex
          gap={4}
          center
          align='start'
        >
          {organization && (
            <OrganizationPreview
              size={'sm'}
              organization={organization}
              user={user}
              sx={{ maxWidth: '30ch' }}
            />
          )}
          {!organization && (
            <PersonalWorkspacePreview
              user={user}
              rounded={false}
              size={'sm'}
              subtitle={
                hidePersonal
                  ? localizationKeys('organizationSwitcher.notSelected')
                  : localizationKeys('organizationSwitcher.personalWorkspace')
              }
            />
          )}
          <Icon
            icon={Selector}
            sx={t => ({ color: t.colors.$blackAlpha400 })}
          />
        </Flex>
      </Button>
    );
  },
);
