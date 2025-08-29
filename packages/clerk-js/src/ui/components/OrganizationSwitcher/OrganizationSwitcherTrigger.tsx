import { useRender } from '@base-ui-components/react/use-render';
import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import type { OrganizationResource, UserResource } from '@clerk/types';
import { forwardRef } from 'react';

import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { withAvatarShimmer } from '@/ui/elements/withAvatarShimmer';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import { Button, descriptors, Icon, localizationKeys } from '../../customizables';
import { ChevronDown } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { organizationListParams } from './utils';

type OrganizationSwitcherTriggerState = {
  loading: boolean;
  isOpen: boolean;
  organization: OrganizationResource | null;
  user: UserResource | null;
  image: string | null;
  name: string | null;
  notificationCount: number;
};

type OrganizationSwitcherTriggerProps = {
  isOpen: boolean;
  sx?: ThemableCssProp;
} & useRender.ComponentProps<'button', OrganizationSwitcherTriggerState>;

export const OrganizationSwitcherTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>((props, ref) => {
    const { render = <button type='button' />, sx, ...rest } = props;

    // All hooks must be called at the top level
    const { user } = useUser();
    const { organization } = useOrganization();
    const { hidePersonal } = useOrganizationSwitcherContext();
    const { userInvitations, userSuggestions } = useOrganizationList(organizationListParams);
    const { organizationSettings } = useEnvironment();
    const canAcceptRequests = useProtect({
      permission: 'org:sys_memberships:manage',
    });
    const isDomainsEnabled = organizationSettings?.domains?.enabled;
    const { membershipRequests } = useOrganization({
      membershipRequests: (isDomainsEnabled && canAcceptRequests) || undefined,
    });

    const notificationCount =
      (userInvitations.count || 0) + (userSuggestions.count || 0) + (membershipRequests?.count || 0);

    // Prepare state for render function
    const triggerState: OrganizationSwitcherTriggerState = {
      loading: false, // TODO: We might want to track loading state from the organization/user hooks
      isOpen: props.isOpen,
      organization: organization || null,
      user: user || null,
      image: organization?.imageUrl || null,
      name: organization?.name || user?.fullName || user?.primaryEmailAddress?.emailAddress || null,
      notificationCount,
    };

    // Default button props - these will be merged with any props from the render function
    const defaultButtonProps: useRender.ElementProps<'button'> = {
      type: 'button',
      'aria-label': `${props.isOpen ? 'Close' : 'Open'} organization switcher`,
      'aria-expanded': props.isOpen,
      'aria-haspopup': 'dialog',
      ...rest,
    };

    // Check if this is the default button (no custom render provided)
    const isDefaultRender = typeof render === 'object' && render.type === 'button' && !render.props.children;

    // Always call useRender hook - it will handle both default and custom cases
    const element = useRender({
      render: isDefaultRender
        ? // For default case, create a render function that returns our styled Button
          (props, state) => {
            if (!state.user) {
              return (
                <button
                  type='button'
                  {...props}
                  style={{ display: 'none' }}
                />
              );
            }

            const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = state.user;

            return (
              <Button
                elementDescriptor={descriptors.organizationSwitcherTrigger}
                elementId={descriptors.organizationSwitcherTrigger.setId(
                  state.organization ? 'organization' : 'personal',
                )}
                variant='ghost'
                colorScheme='neutral'
                hoverAsFocus
                focusRing={false}
                sx={[
                  t => ({
                    padding: `${t.space.$1} ${t.space.$2}`,
                    position: 'relative',
                  }),
                  sx,
                ]}
                {...props}
              >
                {state.organization && (
                  <OrganizationPreview
                    elementId={'organizationSwitcherTrigger'}
                    gap={3}
                    size='xs'
                    fetchRoles
                    organization={state.organization}
                    sx={{ maxWidth: '30ch' }}
                  />
                )}
                {!state.organization && (
                  <PersonalWorkspacePreview
                    size='xs'
                    gap={3}
                    user={userWithoutIdentifiers}
                    showAvatar={!hidePersonal}
                    sx={t => ({ color: t.colors.$colorMutedForeground })}
                    title={
                      hidePersonal
                        ? localizationKeys('organizationSwitcher.notSelected')
                        : localizationKeys('organizationSwitcher.personalWorkspace')
                    }
                  />
                )}

                {state.notificationCount > 0 && (
                  <NotificationCountBadge
                    containerSx={t => ({
                      position: 'absolute',
                      top: `calc(${t.space.$2} * -1)`,
                      right: `calc(${t.space.$2} * -1)`,
                    })}
                    notificationCount={state.notificationCount}
                  />
                )}

                <Icon
                  elementDescriptor={descriptors.organizationSwitcherTriggerIcon}
                  icon={ChevronDown}
                  sx={t => ({ marginLeft: `${t.space.$2}` })}
                />
              </Button>
            );
          }
        : render,
      props: defaultButtonProps,
      ref,
      state: triggerState,
    });

    return element;
  }),
);
