import { defineComponent, inject } from 'vue';

import { errorThrower } from '../../../errors/errorThrower';
import { userProfileLinkRenderedError, userProfilePageRenderedError } from '../../../errors/messages';
import { UserProfileInjectionKey } from '../../../keys';
import type { UserProfileLinkProps, UserProfilePageProps } from '../../../types';
import _UserProfile from './UserProfile.vue';

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
