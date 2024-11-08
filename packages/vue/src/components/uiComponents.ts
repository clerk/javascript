import type {
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
} from '@clerk/types';
import { computed, defineComponent, h, onScopeDispose, ref, watchEffect } from 'vue';

import { useClerk } from '../composables/useClerk';
import { ClerkLoaded } from './controlComponents';

type AnyObject = Record<string, any>;

interface MountProps {
  mount: ((node: HTMLDivElement, props: AnyObject) => void) | undefined;
  unmount: ((node: HTMLDivElement) => void) | undefined;
  updateProps?: (props: { node: HTMLDivElement; props: AnyObject | undefined }) => void;
  props?: AnyObject;
}

/**
 * A utility component that handles mounting and unmounting of Clerk UI components.
 * The component only mounts when Clerk is fully loaded and automatically
 * handles cleanup on unmount.
 */
const Portal = defineComponent((props: MountProps) => {
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

export const UserProfile = defineComponent((props: UserProfileProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountUserProfile,
      unmount: clerk.value?.unmountUserProfile,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
});

export const UserButton = defineComponent((props: UserButtonProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountUserButton,
      unmount: clerk.value?.unmountUserButton,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
});

export const GoogleOneTap = defineComponent((props: GoogleOneTapProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: () => clerk.value?.openGoogleOneTap(props),
      unmount: clerk.value?.closeGoogleOneTap,
    });
});

export const SignIn = defineComponent((props: SignInProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountSignIn,
      unmount: clerk.value?.unmountSignIn,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
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

export const OrganizationProfile = defineComponent((props: OrganizationProfileProps) => {
  const clerk = useClerk();

  return () =>
    h(Portal, {
      mount: clerk.value?.mountOrganizationProfile,
      unmount: clerk.value?.unmountOrganizationProfile,
      updateProps: (clerk.value as any)?.__unstable__updateProps,
      props,
    });
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
