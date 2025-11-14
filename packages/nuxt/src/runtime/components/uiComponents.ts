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

const usePathnameWithoutSplatRouteParams = () => {
  const route = useRoute();

  // Get the pathname that includes any named or catch all params
  // eg:
  // the filesystem route /profile/[[...slug]]/page.vue
  // could give us the following pathname /profile/security/x/y
  // if the user navigates to the security section with additional segments
  return computed(() => {
    const pathname = route.path || '';
    const pathParts = pathname.split('/').filter(Boolean);

    // In Nuxt, catch-all routes use [...slug] syntax
    // route.params.slug is an array containing the catch-all segments
    // Example: /profile/security/x/y -> params.slug = ["security", "x", "y"]
    const slug = route.params.slug;
    const catchAllSegments = Array.isArray(slug) ? slug : [];

    // Remove catch-all segments from the pathname
    // so we end up with the pathname where the components are mounted at
    // eg /profile/security/x/y will return /profile as the path
    const path = `/${pathParts.slice(0, pathParts.length - catchAllSegments.length).join('/')}`;

    return path;
  });
};

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
export const UserProfile = Object.assign(
  defineComponent((props: UserProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps(
      'UserProfile',
      () => props,
      () => ({ path: path.value }),
    );
    return () => h(BaseUserProfile, routingProps.value);
  }),
  { ...BaseUserProfile },
) as typeof BaseUserProfile;

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
export const OrganizationProfile = Object.assign(
  defineComponent((props: OrganizationProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps(
      'OrganizationProfile',
      () => props,
      () => ({ path: path.value }),
    );
    return () => h(BaseOrganizationProfile, routingProps.value);
  }),
  { ...BaseOrganizationProfile },
) as typeof BaseOrganizationProfile;

export const CreateOrganization = defineComponent((props: CreateOrganizationProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps(
    'CreateOrganization',
    () => props,
    () => ({ path: path.value }),
  );
  return () => h(BaseCreateOrganization, routingProps.value);
});

export const OrganizationList = defineComponent((props: OrganizationListProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps(
    'OrganizationList',
    () => props as RoutingOptions,
    () => ({ path: path.value }),
  );
  return () => h(BaseOrganizationList, routingProps.value);
});

export const SignIn = defineComponent((props: SignInProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps(
    'SignIn',
    () => props,
    () => ({ path: path.value }),
  );
  return () => h(BaseSignIn, routingProps.value);
});

export const SignUp = defineComponent((props: SignUpProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  const routingProps = useRoutingProps(
    'SignUp',
    () => props,
    () => ({ path: path.value }),
  );
  return () => h(BaseSignUp, routingProps.value);
});
