export const taskChooseOrganizationMessages = {
  title: 'Choose an organization',
  joinTitle: 'Join your team',
  joinSubtitle: 'Your team is already using {applicationName}. Join them or create a new organization.',
  joinSubtitleWithoutCreate: 'Your team is already using {applicationName}. Join them to continue.',
  subtitle: 'Join an existing organization or create a new one.',
  subtitleWithoutCreate: 'Join an existing organization.',
  subtitleWithMemberships: 'Select an organization to continue.',
  createOrganization: 'Create an organization',
  skip: 'Skip for now',
  requestPendingShort: 'We’ll email you once an admin approves your request.',
  requestPending: 'We’ll email you once an admin approves your request. You can sign out until then.',
  requestPendingWithCreate:
    'We’ll email you once an admin approves your request. In the meantime, you can create your own organization or sign out.',
  organizationAlreadyExists:
    '{organizationName} ({organizationDomain}) already has an organization. Ask an admin to invite you.',
  unavailable: {
    title: 'You need an organization to continue',
    description: 'Contact your organization admin for an invitation.',
  },
  signOut: {
    signedInAs: 'Signed in as {identifier}',
    action: 'Sign out',
  },
} as const;
