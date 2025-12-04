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
import { type Component, computed, defineComponent, h } from 'vue';

const usePathnameWithoutSplatRouteParams = () => {
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
 * Helper function to wrap a Vue component with routing logic while preserving the base component's type.
 * The type assertion is hidden inside the function, so the public API can use `typeof BaseComponent`.
 */
const wrapComponentWithRouting = <T extends Component>(baseComponent: T, componentName: string): T => {
  return defineComponent((_, { attrs, slots }) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps(
      componentName,
      () => attrs,
      () => ({ path: path.value }),
    );
    return () => h(baseComponent, routingProps.value, slots);
  }) as T;
};

const _UserProfile = wrapComponentWithRouting(BaseUserProfile, 'UserProfile');
export const UserProfile = Object.assign(_UserProfile, {
  Page: BaseUserProfile.Page,
  Link: BaseUserProfile.Link,
});

const _OrganizationProfile = wrapComponentWithRouting(BaseOrganizationProfile, 'OrganizationProfile');
export const OrganizationProfile = Object.assign(_OrganizationProfile, {
  Page: BaseOrganizationProfile.Page,
  Link: BaseOrganizationProfile.Link,
});

export const CreateOrganization = wrapComponentWithRouting(BaseCreateOrganization, 'CreateOrganization');

export const OrganizationList = wrapComponentWithRouting(BaseOrganizationList, 'OrganizationList');

export const SignIn = wrapComponentWithRouting(BaseSignIn, 'SignIn');

export const SignUp = wrapComponentWithRouting(BaseSignUp, 'SignUp');
