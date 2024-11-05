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
import { defineComponent, h, ref, watchEffect } from 'vue';

import { useClerk } from '../composables/useClerk';
import { ClerkLoaded } from './controlComponents';

type AnyObject = Record<string, any>;

interface MountProps {
  mount: ((node: HTMLDivElement, props: AnyObject) => void) | undefined;
  unmount: ((node: HTMLDivElement) => void) | undefined;
  props?: AnyObject;
}

/**
 * A utility component that handles mounting and unmounting of Clerk UI components.
 * The component only mounts when Clerk is fully loaded and automatically
 * handles cleanup on unmount.
 */
const Portal = defineComponent((props: MountProps) => {
  const el = ref<HTMLDivElement | null>(null);

  watchEffect(onInvalidate => {
    if (el.value) {
      props.mount?.(el.value, props.props || {});
    }

    onInvalidate(() => {
      if (el.value) {
        props.unmount?.(el.value);
      }
    });
  });

  return () => h(ClerkLoaded, () => h('div', { ref: el }));
});

export const UserProfile = defineComponent((props: UserProfileProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountUserProfile,
      unmount: clerk.value?.unmountUserProfile,
      props,
    });
});

export const UserButton = defineComponent((props: UserButtonProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountUserButton,
      unmount: clerk.value?.unmountUserButton,
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
      props,
    });
});

export const SignUp = defineComponent((props: SignUpProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountSignUp,
      unmount: clerk.value?.unmountSignUp,
      props,
    });
});

export const CreateOrganization = defineComponent((props: CreateOrganizationProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountCreateOrganization,
      unmount: clerk.value?.unmountCreateOrganization,
      props,
    });
});

export const OrganizationSwitcher = defineComponent((props: OrganizationSwitcherProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountOrganizationSwitcher,
      unmount: clerk.value?.unmountOrganizationSwitcher,
      props,
    });
});

export const OrganizationList = defineComponent((props: OrganizationListProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountOrganizationList,
      unmount: clerk.value?.unmountOrganizationList,
      props,
    });
});

export const OrganizationProfile = defineComponent((props: OrganizationProfileProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountOrganizationProfile,
      unmount: clerk.value?.unmountOrganizationProfile,
      props,
    });
});

export const Waitlist = defineComponent((props: WaitlistProps) => {
  const clerk = useClerk();
  return () =>
    h(Portal, {
      mount: clerk.value?.mountWaitlist,
      unmount: clerk.value?.unmountWaitlist,
      props,
    });
});
