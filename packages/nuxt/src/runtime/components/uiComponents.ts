import type {
  CreateOrganizationProps,
  OrganizationListProps,
  OrganizationProfileProps,
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

/**
 * In the components below, we don't use the props object directly.
 * Instead, we use `attrs` to pass-through props to the base components.
 * We're declaring the type of props just to type the component for TypeScript,
 * but all actual prop values come from `attrs`.
 */

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
export const UserProfile = Object.assign(
  defineComponent((_props: UserProfileProps, { attrs, slots }) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps('UserProfile', attrs, () => ({ path: path.value }));
    return () => h(BaseUserProfile, routingProps.value, slots);
  }),
  { Page: BaseUserProfile.Page, Link: BaseUserProfile.Link },
) as unknown as typeof BaseUserProfile;

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
export const OrganizationProfile = Object.assign(
  defineComponent((_props: OrganizationProfileProps, { attrs, slots }) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps('OrganizationProfile', attrs, () => ({ path: path.value }));
    return () => h(BaseOrganizationProfile, routingProps.value, slots);
  }),
  { Page: BaseOrganizationProfile.Page, Link: BaseOrganizationProfile.Link },
) as unknown as typeof BaseOrganizationProfile;

export const CreateOrganization = defineComponent((_props: CreateOrganizationProps, { attrs }) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('CreateOrganization', attrs, () => ({ path: path.value }));
  return () => h(BaseCreateOrganization, routingProps.value);
});

export const OrganizationList = defineComponent((_props: OrganizationListProps, { attrs }) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('OrganizationList', attrs, () => ({ path: path.value }));
  return () => h(BaseOrganizationList, routingProps.value);
});

export const SignIn = defineComponent((_props: SignInProps, { attrs }) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('SignIn', attrs, () => ({ path: path.value }));
  return () => h(BaseSignIn, routingProps.value);
});

export const SignUp = defineComponent((_props: SignUpProps, { attrs }) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps('SignUp', attrs, () => ({ path: path.value }));
  return () => h(BaseSignUp, routingProps.value);
});
