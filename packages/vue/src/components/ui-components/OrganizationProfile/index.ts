import { defineComponent, inject } from 'vue';

import { errorThrower } from '../../../errors/errorThrower';
import { organizationProfileLinkRenderedError, organizationProfilePageRenderedError } from '../../../errors/messages';
import { OrganizationProfileInjectionKey } from '../../../keys';
import type { OrganizationLinkProps, OrganizationProfilePageProps } from '../../../types';
import _OrganizationProfile from './OrganizationProfile.vue';

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

export const OrganizationProfile = Object.assign(_OrganizationProfile, {
  Page: OrganizationProfilePage,
  Link: OrganizationProfileLink,
});
