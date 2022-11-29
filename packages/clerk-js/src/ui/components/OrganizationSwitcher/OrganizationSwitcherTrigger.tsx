import React from 'react';

import { useCoreOrganization, useCoreUser, useOrganizationSwitcherContext } from '../../contexts';
import { Button, descriptors, Icon, localizationKeys } from '../../customizables';
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
        elementDescriptor={descriptors.organizationSwitcherTrigger}
        variant='ghost'
        colorScheme='neutral'
        sx={t => ({ minHeight: 0, padding: `0 ${t.space.$2} 0 0` })}
        {...props}
        ref={ref}
      >
        {organization && (
          <OrganizationPreview
            gap={3}
            size={'sm'}
            organization={organization}
            sx={{ maxWidth: '30ch' }}
          />
        )}
        {!organization && (
          <PersonalWorkspacePreview
            size={'sm'}
            gap={3}
            user={{ profileImageUrl: user.profileImageUrl }}
            title={
              hidePersonal
                ? localizationKeys('organizationSwitcher.notSelected')
                : localizationKeys('organizationSwitcher.personalWorkspace')
            }
          />
        )}
        <Icon
          icon={Selector}
          sx={t => ({ color: t.colors.$blackAlpha400, marginLeft: `${t.space.$2}` })}
        />
      </Button>
    );
  },
);
