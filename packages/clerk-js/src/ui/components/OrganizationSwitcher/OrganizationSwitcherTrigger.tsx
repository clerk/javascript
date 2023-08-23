import { forwardRef, useCallback } from 'react';

import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { Button, descriptors, Icon, localizationKeys, NotificationBadge } from '../../customizables';
import { OrganizationPreview, PersonalWorkspacePreview, withAvatarShimmer } from '../../elements';
import { useDelayedVisibility, usePrefersReducedMotion } from '../../hooks';
import { Selector } from '../../icons';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { animations } from '../../styledSystem';
import { organizationListParams } from './utils';

type OrganizationSwitcherTriggerProps = PropsOfComponent<typeof Button> & {
  isOpen: boolean;
};

function useEnterAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const getFormTextAnimation = useCallback(
    (enterAnimation: boolean, delay?: number): ThemableCssProp => {
      if (prefersReducedMotion) {
        return {
          animation: 'none',
        };
      }
      return t => ({
        animation: `${animations.notificationAnimation} ${t.transitionDuration.$textField} ${
          t.transitionTiming.$slowBezier
        } ${delay ?? 0}ms 1 ${enterAnimation ? 'normal' : 'reverse'} forwards`,
      });
    },
    [prefersReducedMotion],
  );

  return {
    getFormTextAnimation,
  };
}

export const OrganizationSwitcherTrigger = withAvatarShimmer(
  forwardRef<HTMLButtonElement, OrganizationSwitcherTriggerProps>((props, ref) => {
    const { getFormTextAnimation } = useEnterAnimation();
    const { sx, ...rest } = props;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = useCoreUser();
    const { organization } = useCoreOrganization();
    const { hidePersonal } = useOrganizationSwitcherContext();

    /**
     * Prefetch user invitations and suggestions
     */
    const { userInvitations, userSuggestions } = useCoreOrganizationList(organizationListParams);

    const notificationCount = (userInvitations.count ?? 0) + (userSuggestions.count ?? 0);

    const notificationCountAnimated = useDelayedVisibility(notificationCount, 100);

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
        {(notificationCountAnimated ?? 0) > 0 ? (
          <NotificationBadge
            sx={[
              t => ({
                // marginLeft: `${t.space.$2}`,
                position: 'absolute',
                // top: -8,
                right: 8,
                lineHeight: 0,
                border: t.borders.$normal,
                opacity: 0,
              }),
              getFormTextAnimation(!!notificationCountAnimated, 500),
            ]}
          >
            {notificationCountAnimated}
          </NotificationBadge>
        ) : null}

        <Icon
          elementDescriptor={descriptors.organizationSwitcherTriggerIcon}
          icon={Selector}
          sx={[
            t => ({
              marginLeft: `${t.space.$2}`,
              '--organization-switcher-icon-opacity': t.opacity.$sm,
              opacity: 'var(--organization-switcher-icon-opacity)',
            }),
            !!notificationCountAnimated && getFormTextAnimation(!notificationCountAnimated),
          ]}
        />

        {/*{(notificationCountAnimated ?? 0) > 0 ? (*/}
        {/*  <NotificationBadge*/}
        {/*    sx={[*/}
        {/*      t => ({*/}
        {/*        // marginLeft: `${t.space.$2}`,*/}
        {/*        position: 'absolute',*/}
        {/*        top: -8,*/}
        {/*        left: -8,*/}
        {/*        border: t.borders.$normal,*/}
        {/*      }),*/}
        {/*      getFormTextAnimation(!!notificationCountAnimated),*/}
        {/*    ]}*/}
        {/*  >*/}
        {/*    {notificationCountAnimated}*/}
        {/*  </NotificationBadge>*/}
        {/*) : null}*/}
      </Button>
    );
  }),
);
