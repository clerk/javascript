import type {
  CreateOrganizationProps,
  OrganizationListProps,
  OrganizationProfileProps,
  RoutingOptions,
  SignInProps,
  SignUpProps,
  UserProfileProps,
} from '@clerk/shared/types';
import {
  CreateOrganization as BaseCreateOrganization,
  OrganizationList as BaseOrganizationList,
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile,
} from '@clerk/vue';
import { useRoutingProps } from '@clerk/vue/internal';
import { useRoute } from 'nuxt/app';
import { computed, defineComponent, h } from 'vue';

export const usePathnameWithoutSplatRouteParams = () => {
  const route = useRoute();

  // Get the pathname without catch-all route params
  return computed(() => {
    const pathname = route.path || '';

    // Find catch-all params (they are arrays in Nuxt)
    const catchAllSegments = Object.values(route.params || {})
      .filter((v): v is string[] => Array.isArray(v))
      .flat();

    // If no catch-all segments, return the pathname as-is
    if (catchAllSegments.length === 0) {
      return pathname || '/';
    }

    // Get the splat route param (join array segments into a string)
    // eg ["world"] becomes "/world"
    const splatRouteParam = '/' + catchAllSegments.join('/');

    // Remove the splat route param from the pathname
    // so we end up with the pathname where the components are mounted at
    // eg /hello/world with slug=["world"] returns /hello
    const path = pathname.replace(splatRouteParam, '').replace(/\/$/, '').replace(/^\//, '').trim();

    return `/${path}`;
  });
};

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
export const UserProfile = Object.assign(
  defineComponent((props: UserProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps('UserProfile', props, () => ({ path: path.value }));
    return () => h(BaseUserProfile, routingProps.value);
  }),
  { Page: BaseUserProfile.Page, Link: BaseUserProfile.Link },
) as unknown as typeof BaseUserProfile;

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
export const OrganizationProfile = Object.assign(
  defineComponent((props: OrganizationProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps('OrganizationProfile', props, () => ({ path: path.value }));
    return () => h(BaseOrganizationProfile, routingProps.value);
  }),
  { Page: BaseOrganizationProfile.Page, Link: BaseOrganizationProfile.Link },
) as unknown as typeof BaseOrganizationProfile;

export const CreateOrganization = defineComponent((props: CreateOrganizationProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('CreateOrganization', props, () => ({ path: path.value }));
  return () => h(BaseCreateOrganization, routingProps.value);
});

export const OrganizationList = defineComponent((props: OrganizationListProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('OrganizationList', props as RoutingOptions, () => ({ path: path.value }));
  return () => h(BaseOrganizationList, routingProps.value);
});

export const SignIn = defineComponent((props: SignInProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('SignIn', props, () => ({ path: path.value }));
  return () => h(BaseSignIn, routingProps.value);
});

export const SignUp = defineComponent((props: SignUpProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('SignUp', props, () => ({ path: path.value }));
  return () => h(BaseSignUp, routingProps.value);
});
