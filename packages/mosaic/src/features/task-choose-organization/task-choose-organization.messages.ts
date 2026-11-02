export const taskChooseOrganizationMessages = {
  title: 'Choose an organization',
  subtitle: 'Join an existing organization or create a new one',
  subtitleWithoutCreate: 'Join an existing organization',
  createOrganization: 'Create new organization',
  organizationAlreadyExists:
    'An organization already exists for the detected company name ({organizationName}) and {organizationDomain}. Join by invitation.',
  unavailable: {
    title: 'You must belong to an organization',
    description: 'Contact your organization admin for an invitation.',
  },
  signOut: {
    signedInAs: 'Signed in as {identifier}',
    action: 'Sign out',
  },
} as const;
