export const createOrganizationMessages = {
  create: {
    title: 'Create organization',
    logoLabel: 'Logo',
    logoDescription: 'Recommended size 1:1, up to 10MB.',
    uploadLogo: 'Upload',
    removeLogo: 'Remove',
    nameLabel: 'Name',
    namePlaceholder: 'Organization name',
    slugLabel: 'Slug',
    slugPlaceholder: 'my-org',
    slugInvalid: 'Use lowercase letters, numbers and hyphens only.',
    submit: 'Create organization',
    error: 'Unable to create the organization. Please try again.',
  },
  invite: {
    title: 'Invite new members',
    skip: 'Skip',
    submit: 'Send invitations',
    error: 'Unable to send invitations. Please try again.',
  },
  sent: {
    title: 'Invitations sent',
    description: 'Invitations successfully sent',
    finish: 'Finish',
  },
} as const;
