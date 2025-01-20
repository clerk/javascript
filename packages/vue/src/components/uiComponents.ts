import type {
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
  Without,
} from '@clerk/types';
import { computed, defineComponent, h, inject, onScopeDispose, provide, ref, watchEffect } from 'vue';

import { useClerk } from '../composables/useClerk';
import { errorThrower } from '../errors/errorThrower';
import {
  organizationProfileLinkRenderedError,
  organizationProfilePageRenderedError,
  userButtonMenuActionRenderedError,
  userButtonMenuItemsRenderedError,
  userButtonMenuLinkRenderedError,
  userProfileLinkRenderedError,
  userProfilePageRenderedError,
} from '../errors/messages';
import {
  OrganizationProfileInjectionKey,
  UserButtonInjectionKey,
  UserButtonMenuItemsInjectionKey,
  UserProfileInjectionKey,
} from '../keys';
import type {
  CustomPortalsRendererProps,
  OrganizationLinkProps,
  OrganizationProfilePageProps,
  UserButtonActionProps,
  UserButtonLinkProps,
  UserProfileLinkProps,
  UserProfilePageProps,
} from '../types';
import { useUserButtonCustomMenuItems } from '../utils/useCustomMenuItems';
import { useOrganizationProfileCustomPages, useUserProfileCustomPages } from '../utils/useCustomPages';
import { ClerkLoaded } from './controlComponents';

type AnyObject = Record<string, any>;

interface MountProps {
  mount: ((node: HTMLDivElement, props: AnyObject) => void) | undefined;
  unmount: ((node: HTMLDivElement) => void) | undefined;
  updateProps?: (props: { node: HTMLDivElement; props: AnyObject | undefined }) => void;
  props?: AnyObject;
}

const CustomPortalsRenderer = defineComponent((props: CustomPortalsRendererProps) => {
  return () => [...(props?.customPagesPortals ?? []), ...(props?.customMenuItemsPortals ?? [])];
});

/**
 * A utility component that handles mounting and unmounting of Clerk UI components.
 * The component only mounts when Clerk is fully loaded and automatically
 * handles cleanup on unmount.
 */
export const Portal = defineComponent((props: MountProps) => {
  const portalRef = ref<HTMLDivElement | null>(null);
  const isPortalMounted = ref(false);
  // Make the props reactive so the watcher can react to changes
  const componentProps = computed(() => ({ ...props.props }));

  watchEffect(() => {
    if (!portalRef.value) {
      return;
    }

    if (isPortalMounted.value) {
      props.updateProps?.({ node: portalRef.value, props: componentProps.value });
    } else {
      props.mount?.(portalRef.value, componentProps.value);
      isPortalMounted.value = true;
    }
  });

  onScopeDispose(() => {
    if (isPortalMounted.value && portalRef.value) {
      props.unmount?.(portalRef.value);
    }
  });

  return () => h(ClerkLoaded, () => h('div', { ref: portalRef }));
});

const _UserProfile = defineComponent((props: UserProfileProps, { slots }) => {
  const clerk = useClerk();
  const { customPages, customPagesPortals, addCustomPage } = useUserProfileCustomPages();

  const finalProps = computed(() => ({
    ...props,
    customPages: customPages.value,
  }));

  provide(UserProfileInjectionKey, {
    addCustomPage,
  });

  return () => [
    h(Portal, {
      mount: clerk.value?.mountUserProfile,
      unmount: clerk.value?.unmountUserProfile,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props: finalProps.value,
    }),
    h(CustomPortalsRenderer, { customPagesPortals: customPagesPortals.value }),
    slots.default?.(),
  ];
});

export const UserProfilePage = defineComponent(
  (props: UserProfilePageProps, { slots }) => {
    const ctx = inject(UserProfileInjectionKey);
    if (!ctx) {
      return errorThrower.throw(userProfilePageRenderedError);
    }

    ctx.addCustomPage({
      props,
      slots,
      component: UserProfilePage,
    });

    return () => null;
  },
  { name: 'UserProfilePage' },
);

export const UserProfileLink = defineComponent(
  (props: UserProfileLinkProps, { slots }) => {
    const ctx = inject(UserProfileInjectionKey);
    if (!ctx) {
      return errorThrower.throw(userProfileLinkRenderedError);
    }

    ctx.addCustomPage({
      props,
      slots,
      component: UserProfileLink,
    });

    return () => null;
  },
  { name: 'UserProfileLink' },
);

export const UserProfile = Object.assign(_UserProfile, {
  Page: UserProfilePage,
  Link: UserProfileLink,
});

type UserButtonPropsWithoutCustomMenuItems = Without<UserButtonProps, 'customMenuItems'>;

const _UserButton = defineComponent((props: UserButtonPropsWithoutCustomMenuItems, { slots }) => {
  const clerk = useClerk();

  const { customMenuItems, customMenuItemsPortals, addCustomMenuItem } = useUserButtonCustomMenuItems();
  const { customPages, customPagesPortals, addCustomPage } = useUserProfileCustomPages();

  const finalProps = computed<UserButtonProps>(() => ({
    ...props,
    userProfileProps: {
      ...(props.userProfileProps || {}),
      customPages: customPages.value,
    },
    customMenuItems: customMenuItems.value,
  }));

  provide(UserButtonInjectionKey, {
    addCustomMenuItem,
  });
  provide(UserProfileInjectionKey, {
    addCustomPage,
  });

  return () => [
    h(Portal, {
      mount: clerk.value?.mountUserButton,
      unmount: clerk.value?.unmountUserButton,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props: finalProps.value,
    }),
    h(CustomPortalsRenderer, {
      customPagesPortals: customPagesPortals.value,
      customMenuItemsPortals: customMenuItemsPortals.value,
    }),
    slots.default?.(),
  ];
});

const MenuItems = defineComponent((_, { slots }) => {
  const ctx = inject(UserButtonInjectionKey);

  if (!ctx) {
    return errorThrower.throw(userButtonMenuItemsRenderedError);
  }

  provide(UserButtonMenuItemsInjectionKey, ctx);
  return () => slots.default?.();
});

export const MenuAction = defineComponent(
  (props: UserButtonActionProps, { slots }) => {
    const ctx = inject(UserButtonMenuItemsInjectionKey);
    if (!ctx) {
      return errorThrower.throw(userButtonMenuActionRenderedError);
    }

    ctx.addCustomMenuItem({
      props,
      slots,
      component: MenuAction,
    });

    return () => null;
  },
  { name: 'MenuAction' },
);

export const MenuLink = defineComponent(
  (props: UserButtonLinkProps, { slots }) => {
    const ctx = inject(UserButtonMenuItemsInjectionKey);
    if (!ctx) {
      return errorThrower.throw(userButtonMenuLinkRenderedError);
    }

    ctx.addCustomMenuItem({
      props,
      slots,
      component: MenuLink,
    });

    return () => null;
  },
  { name: 'MenuLink' },
);

export const UserButton = Object.assign(_UserButton, {
  MenuItems,
  Action: MenuAction,
  Link: MenuLink,
  UserProfilePage,
});

export const GoogleOneTap = defineComponent((props: GoogleOneTapProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: () => clerk.value?.openGoogleOneTap(props),
      unmount: clerk.value?.closeGoogleOneTap,
    });
});

export const SignUp = defineComponent((props: SignUpProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountSignUp,
      unmount: clerk.value?.unmountSignUp,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
});

export const CreateOrganization = defineComponent((props: CreateOrganizationProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountCreateOrganization,
      unmount: clerk.value?.unmountCreateOrganization,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
});

export const OrganizationSwitcher = defineComponent((props: OrganizationSwitcherProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountOrganizationSwitcher,
      unmount: clerk.value?.unmountOrganizationSwitcher,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
});

export const OrganizationList = defineComponent((props: OrganizationListProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountOrganizationList,
      unmount: clerk.value?.unmountOrganizationList,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
});

export const OrganizationProfilePage = defineComponent(
  (props: OrganizationProfilePageProps, { slots }) => {
    const ctx = inject(OrganizationProfileInjectionKey);
    if (!ctx) {
      return errorThrower.throw(organizationProfilePageRenderedError);
    }

    ctx.addCustomPage({
      props,
      slots,
      component: OrganizationProfilePage,
    });

    return () => null;
  },
  { name: 'OrganizationProfilePage' },
);

export const OrganizationProfileLink = defineComponent(
  (props: OrganizationLinkProps, { slots }) => {
    const ctx = inject(OrganizationProfileInjectionKey);
    if (!ctx) {
      return errorThrower.throw(organizationProfileLinkRenderedError);
    }

    ctx.addCustomPage({
      props,
      slots,
      component: OrganizationProfileLink,
    });

    return () => null;
  },
  { name: 'OrganizationProfileLink' },
);

const _OrganizationProfile = defineComponent((props: OrganizationProfileProps, { slots }) => {
  const clerk = useClerk();
  const { customPages, customPagesPortals, addCustomPage } = useOrganizationProfileCustomPages();

  const finalProps = computed(() => ({
    ...props,
    customPages: customPages.value,
  }));

  provide(OrganizationProfileInjectionKey, {
    addCustomPage,
  });

  return () => [
    h(Portal, {
      mount: clerk.value?.mountOrganizationProfile,
      unmount: clerk.value?.unmountOrganizationProfile,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props: finalProps.value,
    }),
    h(CustomPortalsRenderer, { customPagesPortals: customPagesPortals.value }),
    slots.default?.(),
  ];
});

export const OrganizationProfile = Object.assign(_OrganizationProfile, {
  Page: OrganizationProfilePage,
  Link: OrganizationProfileLink,
});

export const Waitlist = defineComponent((props: WaitlistProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountWaitlist,
      unmount: clerk.value?.unmountWaitlist,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
});
