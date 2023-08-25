import { forwardRef } from 'react';

import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { Box, Button, descriptors, Icon, localizationKeys, NotificationBadge } from '../../customizables';
import { OrganizationPreview, PersonalWorkspacePreview, withAvatarShimmer } from '../../elements';
import { useDelayedVisibility, usePrefersReducedMotion } from '../../hooks';
import { Selector } from '../../icons';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { animations } from '../../styledSystem';
import { organizationListParams } from './utils';

type OrganizationSwitcherTriggerProps = PropsOfComponent<typeof Button> & {
  isOpen: boolean;
};

export const OrganizationSwitcherTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>((props, ref) => {
    const { sx, ...rest } = props;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = useCoreUser();
    const { organization } = useCoreOrganization();
    const { hidePersonal } = useOrganizationSwitcherContext();

    return (
      <Button
        elementDescriptor={descriptors.organizationSwitcherTrigger}
        variant='ghost'
        colorScheme='neutral'
        sx={[t => ({ minHeight: 0, padding: `0 ${t.space.$2} 0 0`, position: 'relative' }), sx]}
        ref={ref}
        {...rest}
      >
        {organization && (
          <OrganizationPreview
            elementId={'organizationSwitcher'}
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
            user={userWithoutIdentifiers}
            showAvatar={!hidePersonal}
            title={
              hidePersonal
                ? localizationKeys('organizationSwitcher.notSelected')
                : localizationKeys('organizationSwitcher.personalWorkspace')
            }
          />
        )}

        <NotificationCountBadge />

        <Icon
          elementDescriptor={descriptors.organizationSwitcherTriggerIcon}
          icon={Selector}
          sx={t => ({ opacity: t.opacity.$sm, marginLeft: `${t.space.$2}` })}
        />
      </Button>
    );
  }),
);

const NotificationCountBadge = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  /**
   * Prefetch user invitations and suggestions
   */
  const { userInvitations, userSuggestions } = useCoreOrganizationList(organizationListParams);
  const notificationCount = (userInvitations.count || 0) + (userSuggestions.count || 0);
  const showNotification = useDelayedVisibility(notificationCount > 0, 350) || false;

  const enterExitAnimation: ThemableCssProp = t => ({
    animation: prefersReducedMotion
      ? 'none'
      : `${notificationCount ? animations.notificationAnimation : animations.outAnimation} ${
          t.transitionDuration.$textField
        } ${t.transitionTiming.$slowBezier} 0s 1 normal forwards`,
  });

  return (
    <Box
      sx={t => ({
        position: 'relative',
        width: t.sizes.$4,
        height: t.sizes.$4,
        marginLeft: `${t.space.$2}`,
      })}
    >
      {showNotification && <NotificationBadge sx={enterExitAnimation}>{notificationCount}</NotificationBadge>}
    </Box>
  );
};
