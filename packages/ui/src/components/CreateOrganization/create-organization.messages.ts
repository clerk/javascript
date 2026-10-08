import { localizationKeys } from '../../localization';

export const createOrganizationMessages = {
  title: localizationKeys('createOrganization.title'),
  fields: {
    name: {
      label: localizationKeys('formFieldLabel__organizationName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
    },
    slug: {
      label: localizationKeys('formFieldLabel__organizationSlug'),
      placeholder: localizationKeys('formFieldInputPlaceholder__organizationSlug'),
    },
  },
  actions: {
    submit: localizationKeys('createOrganization.formButtonSubmit'),
    reset: localizationKeys('userProfile.formButtonReset'),
  },
  invitation: {
    title: localizationKeys('organizationProfile.invitePage.title'),
    reset: localizationKeys('createOrganization.invitePage.formButtonReset'),
  },
} as const;
