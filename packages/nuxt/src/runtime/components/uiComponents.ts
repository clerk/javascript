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
import { defineComponent, h } from 'vue';

import { usePathnameWithoutSplatRouteParams } from '../composables/usePathnameWithoutSplatRouteParams';
import { useRoutingProps } from '../composables/useRoutingProps';

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
// Also the `typeof BaseUserProfile` is used to resolved the following error:
// "The inferred type of 'UserProfile' cannot be named without a reference to ..."
export const UserProfile = Object.assign(
  defineComponent((props: UserProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps('UserProfile', props, () => ({ path: path.value }));
    return () => h(BaseUserProfile, routingProps.value);
  }),
  { ...BaseUserProfile },
) as typeof BaseUserProfile;

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
// Also the `typeof BaseOrganizationProfile` is used to resolved the following error:
// "The inferred type of 'OrganizationProfile' cannot be named without a reference to ..."
export const OrganizationProfile = Object.assign(
  defineComponent((props: OrganizationProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    const routingProps = useRoutingProps('OrganizationProfile', props, () => ({ path: path.value }));
    return () => h(BaseOrganizationProfile, routingProps.value);
  }),
  { ...BaseOrganizationProfile },
) as typeof BaseOrganizationProfile;

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
